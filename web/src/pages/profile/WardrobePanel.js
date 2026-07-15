/**
 * EcoCycle Web - Profile Wardrobe Panel
 * Renders personal wardrobe items and buying orders with status filtering.
 */

import { confirmReceived, getOrderHistory } from "../../services/order.service.js";
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

// Module-level active status filter for Wardrobe orders
let currentWardrobeFilter = "ALL";

export function renderWardrobePanel(container, { orders = [], wardrobe = [], profile, onRefresh }) {
  const isMember = profile?.role !== "org" && profile?.role !== "admin";

  // Filter orders by currentWardrobeFilter
  const filteredOrders = currentWardrobeFilter === "ALL"
    ? orders
    : orders.filter((o) => {
        const st = String(o.status || "PENDING").toUpperCase();
        if (currentWardrobeFilter === "COMPLETED") {
          return st === "COMPLETED" || st === "RECEIVED";
        }
        return st === currentWardrobeFilter;
      });

  let html = `
    <div class="wardrobe-panel flex flex-col gap-8">
      <!-- Header banner -->
      <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <h3 class="text-headline-sm font-bold text-on-surface mb-1">Tủ đồ và Lịch sử đơn mua của bạn</h3>
        <p class="text-body-md text-on-surface-variant">Quản lý các món đồ thời trang cá nhân và theo dõi toàn bộ trạng thái đơn hàng đã đặt mua.</p>
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

  // Section 2: Buyer Orders & Status Filters
  html += `
    <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h4 class="text-title-lg font-bold text-on-surface">Lịch sử đơn mua hàng (${orders.length})</h4>
          <p class="text-body-sm text-on-surface-variant">Theo dõi chi tiết trạng thái từng đơn bạn đã đặt mua</p>
        </div>
        
        <!-- Status Filter Tabs -->
        <div class="flex flex-wrap gap-2 bg-surface-variant/40 p-1 rounded-xl">
          <button class="btn-wardrobe-filter px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentWardrobeFilter === 'ALL' ? 'bg-surface shadow-sm text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-filter="ALL">Tất cả (${orders.length})</button>
          <button class="btn-wardrobe-filter px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentWardrobeFilter === 'PENDING' ? 'bg-surface shadow-sm text-blue-700 font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-filter="PENDING">Chờ duyệt</button>
          <button class="btn-wardrobe-filter px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentWardrobeFilter === 'CONFIRMED' ? 'bg-surface shadow-sm text-amber-700 font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-filter="CONFIRMED">Chờ giao</button>
          <button class="btn-wardrobe-filter px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentWardrobeFilter === 'SHIPPING' ? 'bg-surface shadow-sm text-purple-700 font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-filter="SHIPPING">Đang giao</button>
          <button class="btn-wardrobe-filter px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentWardrobeFilter === 'COMPLETED' ? 'bg-surface shadow-sm text-emerald-700 font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-filter="COMPLETED">Hoàn tất</button>
        </div>
      </div>
  `;

  if (filteredOrders.length === 0) {
    html += `
      <div class="flex flex-col items-center justify-center py-12 text-center border border-dashed border-outline-variant rounded-xl">
        <span class="material-symbols-outlined text-4xl text-outline mb-2">shopping_bag</span>
        <p class="font-medium text-on-surface">Không có đơn mua hàng nào ở trạng thái này</p>
        <a href="#/products" class="mt-3 px-4 py-2 bg-surface-variant text-on-surface-variant rounded-lg text-sm font-medium hover:bg-outline-variant transition-colors">Khám phá cửa hàng</a>
      </div>
    `;
  } else {
    html += `<div class="flex flex-col gap-4">`;
    filteredOrders.forEach((ord) => {
      const statusStr = String(ord.status || "PENDING").toUpperCase();
      let statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-surface-variant text-on-surface-variant">${statusStr}</span>`;
      if (statusStr === "CONFIRMED") {
        statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>Chờ gửi hàng</span>`;
      } else if (statusStr === "SHIPPING") {
        statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>Đang giao hàng</span>`;
      } else if (statusStr === "RECEIVED" || statusStr === "COMPLETED") {
        statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>Hoàn tất</span>`;
      } else if (statusStr === "PENDING") {
        statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>Chờ xác nhận</span>`;
      }

      html += `
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-outline-variant/30 hover:border-primary/40 transition-colors gap-4">
          <div class="flex items-center gap-4">
            <img src="${ord.productImage || 'https://placehold.co/100x100/E4EBE4/6E7B6C?text=Order'}" class="w-16 h-16 rounded-lg object-cover border border-outline-variant/30 shrink-0" />
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded">#${ord.id?.slice(0, 8) || "N/A"}</span>
                <span class="text-xs text-on-surface-variant">${ord.createdAt || ord.date ? new Date(ord.createdAt || ord.date).toLocaleDateString("vi-VN") : "Vừa đặt"}</span>
              </div>
              <h5 class="font-bold text-on-surface mt-1">${ord.productTitle || ord.productName || "Sản phẩm thời trang"}</h5>
              <p class="text-primary font-semibold text-sm mt-1">${formatPrice(ord.price || ord.totalAmount)}</p>
            </div>
          </div>
          <div class="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            ${statusBadge}
            ${
              statusStr === "CONFIRMED" || statusStr === "SHIPPING"
                ? `<button class="btn-confirm-received px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold shadow hover:bg-primary/90 transition-all flex items-center gap-1 mt-1" data-orderid="${ord.id}">
                     <span class="material-symbols-outlined text-sm">check_circle</span> Xác nhận đã nhận hàng
                   </button>`
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

  // Bind filter tab buttons
  container.querySelectorAll(".btn-wardrobe-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentWardrobeFilter = btn.getAttribute("data-filter") || "ALL";
      renderWardrobePanel(container, { orders, wardrobe, profile, onRefresh });
    });
  });

  // Bind confirmation actions
  container.querySelectorAll(".btn-confirm-received").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const orderId = btn.getAttribute("data-orderid");
      if (!orderId) return;
      btn.disabled = true;
      const origText = btn.innerHTML;
      btn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> Đang xử lý...';
      try {
        await confirmReceived(orderId);
        showToast("Xác nhận nhận hàng thành công!", "success");
        if (onRefresh) onRefresh();
      } catch (err) {
        showToast("Lỗi cập nhật: " + err.message, "error");
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    });
  });
}
