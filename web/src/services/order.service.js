/**
 * EcoCycle – Order API Service
 * Integrates with backend OrderController
 */

import { apiFetch } from "../utils/api.js";
import { getProductById } from "./product.service.js";
import { getUser, getUserIdFromToken } from "./auth.service.js";

export async function createOrder(productId) {
  try {
    const product = await getProductById(productId);
    if (product) {
      const localUser = getUser() || {};
      const tokenUserId = getUserIdFromToken();
      const myUsername = localUser.username || localUser.userName;
      const myUserId = tokenUserId || localUser.id || localUser.userId;
      const isOwner = Boolean(
        (myUserId && (String(product.sellerId) === String(myUserId) || String(product.sellerUserId) === String(myUserId) || String(product.userId) === String(myUserId))) ||
        (myUsername && (String(product.sellerName || "").toLowerCase() === String(myUsername).toLowerCase() || String(product.sellerUsername || "").toLowerCase() === String(myUsername).toLowerCase() || String(product.username || "").toLowerCase() === String(myUsername).toLowerCase()))
      );
      if (isOwner) {
        throw new Error("Sản phẩm do chính bạn đăng bán nên không thể đặt hàng.");
      }
    }
  } catch (err) {
    if (err.message && err.message.includes("đăng bán")) throw err;
  }
  return await apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}

export async function confirmOrder(orderId) {
  return await apiFetch(`/api/orders/confirm?orderId=${orderId}`, {
    method: "PUT",
  });
}

export async function shipOrder(orderId, trackingCode) {
  return await apiFetch(`/api/orders/${orderId}/ship?trackingCode=${encodeURIComponent(trackingCode)}`, {
    method: "PUT",
  });
}

export async function confirmReceived(orderId) {
  return await apiFetch(`/api/orders/${orderId}/receive`, {
    method: "PUT",
  });
}

export async function getOrdersByBuyer() {
  return await apiFetch("/api/orders/history/all");
}

export async function getOrdersBySeller() {
  return await apiFetch("/api/orders/seller");
}

export async function getOrderById(orderId) {
  return await apiFetch(`/api/orders/${orderId}`);
}

export async function getOrderHistory(status) {
  const query = status ? `?status=${status}` : "";
  return await apiFetch(`/api/orders/history${query}`);
}

export async function updatePickupPhoto(orderId, photoUrl) {
  return await apiFetch(`/api/orders/${orderId}/pickup-photo?photoUrl=${encodeURIComponent(photoUrl)}`, {
    method: "PUT",
  });
}

