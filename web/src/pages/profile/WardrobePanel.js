/**
 * EcoCycle Web - Profile Wardrobe Panel
 * Renders personal wardrobe items and buying orders.
 */

import { confirmOrder, confirmReceived } from "../../services/order.service.js";
import { showToast } from "../../utils/ui.js";

function formatPrice(num) {
  if (num === undefined || num === null || isNaN(num)) return "0đ";
  return Number(num).toLocaleString("vi-VN") + "đ";
}

function getConditionPercentage(condition) {
  if (!condition) return "Mới 90%";
  const str = String(condition).toLowerCase();
  if (str.includes("mới 100") || str.includes("new")) return "Mới 100%";
  if (str.includes("như mới") || str.includes("like new")) return "Mới 95%";
  if (str.includes("tốt") || str.includes("good")) return "Cũ 80%";
  return "Cũ 70%";
}

export function renderWardrobePanel(container, { orders = [], wardrobe = [], profile, onRefresh }) {
  const isMember = profile?.role !== "org" && profile?.role !== "admin";

  let html = `
    <div class="wardrobe-panel flex flex-col gap-8">
      <!-- Header banner -->
      <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <h3 class="text-headline-sm font-bold text-on-surface mb-1">Tủ đồ và Đơn mua của bạn</h3>
        <p class="text-body-md text-on-surface-variant">Quản lý các món đồ thời trang cá nhân và theo dõi tình trạng đơn hàng đã đặt mua.</p>
      </div>
  `;

  // Section 1: Personal Wardrobe
  if (isMember) {
    html += `
      <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h4 class="text-title-lg font-bold text-on-surface">Món đồ trong tủ (${wardrobe.length})</h4>
            <p class="text-body-sm text-on-surface-variant">Những sản phẩm bạn đang sở hữu sẵn sàng chia sẻ hoặc tái sử dụng</p>
          </div>
          <a href="#/create-listing" class="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-medium hover:bg-primary/90 transition-colors">
            <span class="material-symbols-outlined text-sm">add</span> Thêm món đồ
          </a>
        </div>
    `;

    if (wardrobe.length === 0) {
      html += `
        <div class="flex flex-col items-center justify-center py-12 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest/50">
          <span class="material-symbols-outlined text-4xl text-outline mb-2">checkroom</span>
          <p class="font-medium text-on-surface">Tủ đồ của bạn đang trống</p>
          <p class="text-body-sm text-on-surface-variant mt-1">Đăng bán hoặc trao đổi quần áo cũ để góp phần bảo vệ môi trường.</p>
        </div>
      `;
    } else {
      html += `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;
      wardrobe.forEach((item) => {
        const condText = getConditionPercentage(item.condition);
        html += `
          <div class="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface flex flex-col justify-between hover:shadow-md transition-shadow">
            <div class="aspect-[4/3] w-full bg-surface-variant overflow-hidden relative">
              <img src="${item.imageUrl || 'https://placehold.co/400x300/E4EBE4/6E7B6C?text=No+Image'}" alt="${item.title}" class="w-full h-full object-cover" loading="lazy" />
              <span class="absolute top-2 right-2 bg-surface/90 backdrop-blur text-on-surface px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">${condText}</span>
            </div>
            <div class="p-4 flex flex-col gap-2 flex-1 justify-between">
              <div>
                <h5 class="font-bold text-on-surface line-clamp-1">${item.title || "Không tên"}</h5>
                <p class="text-primary font-semibold mt-1">${formatPrice(item.price)}</p>
              </div>
              <div class="flex items-center justify-between pt-3 border-t border-outline-variant/20 text-xs text-on-surface-variant">
                <span>Danh mục: ${item.category || "Chung"}</span>
                <span class="px-2 py-0.5 rounded bg-surface-variant font-medium">${item.status || "Có sẵn"}</span>
              </div>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }
    html += `</div>`;
  }

  // Section 2: Buyer Orders
  html += `
    <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
      <h4 class="text-title-lg font-bold text-on-surface mb-4">Đơn hàng đã mua (${orders.length})</h4>
  `;

  if (orders.length === 0) {
    html += `
      <div class="flex flex-col items-center justify-center py-12 text-center border border-dashed border-outline-variant rounded-xl">
        <span class="material-symbols-outlined text-4xl text-outline mb-2">shopping_bag</span>
        <p class="font-medium text-on-surface">Bạn chưa có đơn mua hàng nào</p>
        <a href="#/products" class="mt-3 px-4 py-2 bg-surface-variant text-on-surface-variant rounded-lg text-sm font-medium hover:bg-outline-variant transition-colors">Khám phá sản phẩm</a>
      </div>
    `;
  } else {
    html += `<div class="flex flex-col gap-4">`;
    orders.forEach((ord) => {
      const statusStr = String(ord.status || "PENDING").toUpperCase();
      let statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-surface-variant text-on-surface-variant">${statusStr}</span>`;
      if (statusStr === "CONFIRMED" || statusStr === "SHIPPING") {
        statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Đang giao hàng</span>`;
      } else if (statusStr === "RECEIVED" || statusStr === "COMPLETED") {
        statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Đã nhận hàng</span>`;
      } else if (statusStr === "PENDING") {
        statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Chờ xác nhận</span>`;
      }

      html += `
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-outline-variant/30 hover:border-primary/40 transition-colors gap-4">
          <div class="flex items-center gap-4">
            <img src="${ord.productImage || 'https://placehold.co/100x100/E4EBE4/6E7B6C?text=Order'}" class="w-16 h-16 rounded-lg object-cover border border-outline-variant/30" />
            <div>
              <p class="text-xs text-on-surface-variant">Mã đơn: #${ord.id?.slice(0, 8) || "N/A"}</p>
              <h5 class="font-bold text-on-surface mt-0.5">${ord.productTitle || ord.item || "Sản phẩm không có tên"}</h5>
              <p class="text-primary font-semibold text-sm mt-1">${formatPrice(ord.price || ord.totalAmount)}</p>
            </div>
          </div>
          <div class="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            ${statusBadge}
            <span class="text-xs text-on-surface-variant">${ord.createdAt || ord.date || ""}</span>
            ${
              statusStr === "CONFIRMED" || statusStr === "SHIPPING"
                ? `<button class="btn-confirm-received px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors" data-orderid="${ord.id}">Xác nhận đã nhận hàng</button>`
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

  // Bind confirmation actions
  container.querySelectorAll(".btn-confirm-received").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const orderId = btn.getAttribute("data-orderid");
      if (!orderId) return;
      btn.disabled = true;
      btn.textContent = "Đang xử lý...";
      try {
        await confirmReceived(orderId);
        showToast("Xác nhận nhận hàng thành công!", "success");
        if (onRefresh) onRefresh();
      } catch (err) {
        showToast("Lỗi khi xác nhận đơn hàng: " + err.message, "error");
        btn.disabled = false;
        btn.textContent = "Xác nhận đã nhận hàng";
      }
    });
  });
}
