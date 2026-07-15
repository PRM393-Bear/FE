/**
 * EcoCycle Web - Profile Donations Tab
 * Renders real donation requests from backend without mock fallbacks.
 */

import { acceptDonationRequest, rejectDonationRequest, receivedDonationRequest, cancelDonationRequest } from "../../services/profile.service.js";
import { showToast } from "../../utils/ui.js";

function getDonationStatusBadge(status) {
  const st = String(status || "PENDING").toUpperCase();
  if (st === "PENDING") return `<span class="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">Chờ tiếp nhận</span>`;
  if (st === "ACCEPTED" || st === "SHIPPING") return `<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Đang vận chuyển</span>`;
  if (st === "RECEIVED" || st === "COMPLETED") return `<span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">Đã tiếp nhận</span>`;
  if (st === "REJECTED" || st === "CANCELLED") return `<span class="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-semibold">Đã hủy/từ chối</span>`;
  return `<span class="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-xs font-semibold">${st}</span>`;
}

export function renderDonationsTab(container, { profile, requests = [], onRefresh, onOpenModal }) {
  const isOrg = profile?.role === "org";

  let html = `
    <div class="donations-tab flex flex-col gap-8">
      <!-- Banner -->
      <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex justify-between items-center">
        <div>
          <h3 class="text-headline-sm font-bold text-on-surface mb-1">${isOrg ? "Quản lý Tiếp nhận Quyên góp" : "Hành trình Quyên góp của bạn"}</h3>
          <p class="text-body-md text-on-surface-variant">${isOrg ? "Danh sách các yêu cầu gửi tặng vật phẩm đến tổ chức của bạn." : "Mỗi vật phẩm được trao đi là một vòng đời mới được thắp sáng."}</p>
        </div>
        ${
          !isOrg
            ? `<button id="btn-open-donate-modal" class="px-4 py-2.5 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm">
                 <span class="material-symbols-outlined text-sm">volunteer_activism</span> Tạo quyên góp mới
               </button>`
            : ""
        }
      </div>
  `;

  html += `
    <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
      <h4 class="text-title-lg font-bold text-on-surface mb-6">Danh sách Quyên góp (${requests.length})</h4>
  `;

  if (requests.length === 0) {
    html += `
      <div class="flex flex-col items-center justify-center py-12 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest/50">
        <span class="material-symbols-outlined text-5xl text-outline mb-3">clean_hands</span>
        <p class="font-bold text-on-surface text-lg">Chưa có yêu cầu quyên góp nào</p>
        <p class="text-body-sm text-on-surface-variant max-w-md mt-1">Hệ thống hiển thị dữ liệu thực tế từ máy chủ. Hãy tạo yêu cầu quyên góp để trao gửi yêu thương.</p>
      </div>
    `;
  } else {
    html += `<div class="flex flex-col gap-4">`;
    requests.forEach((req) => {
      const st = String(req.status || "PENDING").toUpperCase();
      html += `
        <div class="p-5 rounded-xl border border-outline-variant/30 hover:border-primary/40 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-2xl">favorite</span>
            </div>
            <div>
              <div class="flex items-center gap-3">
                <h5 class="font-bold text-on-surface text-base">${req.title || req.items || "Vật phẩm quyên góp"}</h5>
                ${getDonationStatusBadge(req.status)}
              </div>
              <p class="text-body-sm text-on-surface-variant mt-1">${req.description || "Tặng cho tổ chức từ thiện"}</p>
              <div class="flex items-center gap-4 mt-2 text-xs text-outline">
                <span>Ngày tạo: ${req.createdAt || req.date || "Gần đây"}</span>
                ${req.organizationName || req.org ? `<span>• Tổ chức: <strong class="text-on-surface-variant">${req.organizationName || req.org}</strong></span>` : ""}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 self-end md:self-center">
            ${
              isOrg && st === "PENDING"
                ? `
              <button class="btn-accept-req px-3.5 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors" data-id="${req.id}">Tiếp nhận</button>
              <button class="btn-reject-req px-3.5 py-2 bg-error text-on-error rounded-lg text-xs font-semibold hover:bg-error/90 transition-colors" data-id="${req.id}">Từ chối</button>
            `
                : ""
            }
            ${
              !isOrg && st === "PENDING"
                ? `<button class="btn-cancel-req px-3.5 py-2 bg-surface-variant text-on-surface-variant rounded-lg text-xs font-medium hover:bg-outline-variant transition-colors" data-id="${req.id}">Hủy yêu cầu</button>`
                : ""
            }
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }

  html += `</div></div>`;
  container.innerHTML = html;

  const openModalBtn = container.querySelector("#btn-open-donate-modal");
  if (openModalBtn && onOpenModal) {
    openModalBtn.addEventListener("click", () => onOpenModal());
  }

  // Bind org actions
  container.querySelectorAll(".btn-accept-req").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!id) return;
      btn.disabled = true;
      try {
        await acceptDonationRequest(id);
        showToast("Đã tiếp nhận yêu cầu quyên góp!", "success");
        if (onRefresh) onRefresh();
      } catch (err) {
        showToast("Lỗi: " + err.message, "error");
        btn.disabled = false;
      }
    });
  });

  container.querySelectorAll(".btn-reject-req").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!id) return;
      btn.disabled = true;
      try {
        await rejectDonationRequest(id, "Tổ chức tạm ngừng nhận vật phẩm này");
        showToast("Đã từ chối yêu cầu quyên góp.", "info");
        if (onRefresh) onRefresh();
      } catch (err) {
        showToast("Lỗi: " + err.message, "error");
        btn.disabled = false;
      }
    });
  });

  container.querySelectorAll(".btn-cancel-req").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!id) return;
      btn.disabled = true;
      try {
        await cancelDonationRequest(id, "Người dùng hủy");
        showToast("Đã hủy yêu cầu quyên góp.", "info");
        if (onRefresh) onRefresh();
      } catch (err) {
        showToast("Lỗi: " + err.message, "error");
        btn.disabled = false;
      }
    });
  });
}
