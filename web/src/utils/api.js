/**
 * EcoCycle - Global API Fetch & Response Parsing Utility
 * Standardizes backend response parsing across JSON, text, form-data, and empty payloads.
 * Provides clear, localized error messages and fallback handling for unexpected HTTP or network errors.
 */
import { getToken, refreshTokenApi, removeToken } from "../services/auth.service.js";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * Helper: Get default Vietnamese fallback message for HTTP status code when backend message is missing or raw HTML/Java stacktrace.
 */
function getFallbackForStatus(status, action = "thực hiện thao tác") {
  switch (status) {
    case 400:
      return `Dữ liệu yêu cầu không hợp lệ khi ${action}. Vui lòng kiểm tra lại thông tin gửi đi (HTTP 400).`;
    case 401:
      return `Phiên đăng nhập đã hết hạn hoặc chưa xác thực. Vui lòng đăng nhập lại (HTTP 401).`;
    case 403:
      return `Bạn không có quyền hoặc không đủ quyền hạn để ${action} (HTTP 403).`;
    case 404:
      return `Không tìm thấy dữ liệu, chiến dịch hoặc yêu cầu quyên góp này trên hệ thống (HTTP 404).`;
    case 408:
      return `Yêu cầu kết nối quá hạn (Timeout). Vui lòng thử lại sau (HTTP 408).`;
    case 409:
      return `Trạng thái dữ liệu đang bị xung đột hoặc đã được thao tác trước đó (HTTP 409).`;
    case 413:
      return `File đính kèm hoặc ảnh upload vượt quá dung lượng cho phép (Tối đa 5MB) (HTTP 413).`;
    case 422:
      return `Dữ liệu gửi đi không thể xử lý do sai định dạng nghiệp vụ (HTTP 422).`;
    case 500:
    case 502:
    case 503:
    case 504:
      return `Hệ thống máy chủ tạm thời gặp sự cố khi ${action}. Vui lòng thử lại sau ít phút (HTTP ${status}).`;
    default:
      return `Đã xảy ra lỗi không mong đợi khi ${action} (HTTP ${status}).`;
  }
}

/**
 * Global API Error Formatter:
 * Transforms raw errors, Java stack traces, network timeouts, and JSON error objects into clean, user-friendly Vietnamese text.
 */
export function formatApiError(err, action = "thực hiện thao tác") {
  if (!err) return getFallbackForStatus(500, action);

  // Network / Fetch disconnection / Offline error fallback
  if (err.name === "TypeError" && (err.message?.includes("fetch") || err.message?.includes("network") || err.message?.includes("Failed to fetch"))) {
    return `Không thể kết nối đến máy chủ khi ${action}. Vui lòng kiểm tra lại kết nối mạng hoặc đường truyền Internet của bạn.`;
  }

  const status = Number(err.status) || 0;
  const rawMsg = typeof err.userMessage === "string" ? err.userMessage : (typeof err.message === "string" ? err.message : "");

  // Detect Spring MaxUploadSizeExceededException
  if (rawMsg.includes("MaxUploadSizeExceededException") || rawMsg.includes("vượt quá dung lượng")) {
    return `File minh chứng upload vượt quá giới hạn dung lượng cho phép (Tối đa 5MB). Vui lòng chọn file hoặc ảnh nhẹ hơn.`;
  }

  // Detect MissingServletRequestPartException
  if (rawMsg.includes("MissingServletRequestPartException") || rawMsg.includes("Thiếu file upload")) {
    return `Vui lòng đính kèm đầy đủ file ảnh minh chứng trước khi xác nhận!`;
  }

  // If status code exists and message looks like Java/Tomcat internal class trace or raw HTML or default HTTP x
  if (status > 0) {
    if (!rawMsg || rawMsg.includes("java.") || rawMsg.includes(".Exception") || rawMsg.startsWith("HTTP ") || rawMsg.includes("<!DOCTYPE") || rawMsg.includes("<html")) {
      return getFallbackForStatus(status, action);
    }
    // Clean Vietnamese or readable English message from controller
    return rawMsg;
  }

  return rawMsg && !rawMsg.includes("[object Object]") && !rawMsg.includes("java.") ? rawMsg : getFallbackForStatus(500, action);
}
import axios from "axios";

export async function apiFetch(path, options = {}, _isRetry = false) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res;
  try {
    res = await axios({
      url: `${BASE_URL}${path}`,
      method: options.method || "GET",
      headers,
      data: options.body,
      validateStatus: () => true, // resolve all statuses so we handle 401 manually
    });
  } catch (networkErr) {
    const err = new Error("Failed to fetch");
    err.name = "TypeError";
    err.originalError = networkErr;
    err.isNetworkError = true;
    throw err;
  }

  // Tự động làm mới token nếu gặp 401
  if (res.status === 401 && !_isRetry && !path.includes("/api/auth/")) {
    const newToken = await refreshTokenApi();
    if (newToken) {
      return await apiFetch(path, options, true);
    } else {
      removeToken();
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
  }

  const body = res.data;
  const isHtml = typeof body === "string" && (body.includes("<!DOCTYPE") || body.includes("<html"));

  if (res.status >= 200 && res.status < 300) {
    if (res.status === 204 || res.status === 205 || body === "") {
      return { success: true, status: res.status, message: "Thao tác thành công" };
    }
    return body;
  } else {
    let message = `HTTP ${res.status}`;
    if (typeof body === "object" && body !== null) {
      message = body.message || body.error || body.details || JSON.stringify(body);
    } else if (typeof body === "string" && body.trim() !== "") {
      if (isHtml || body.includes("java.")) {
        message = getFallbackForStatus(res.status, "xử lý yêu cầu");
      } else {
        message = body;
      }
    } else {
      message = getFallbackForStatus(res.status, "xử lý yêu cầu");
    }

    const err = new Error(message);
    err.status = res.status;
    err.body = body;
    err.userMessage = message;
    err.isNetworkError = false;
    throw err;
  }
}
