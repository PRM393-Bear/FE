/**
 * EcoCycle Web - Profile Shop Panel
 * Renders seller order management and draft products.
 */

import { confirmOrder, shipOrder } from "../../services/order.service.js";
import { showToast } from "../../utils/ui.js";

function formatPrice(num) {
  if (num === undefined || num === null || isNaN(num)) return "0đ";
  return Number(num).toLocaleString("vi-VN") + "đ";
}

export function renderShopPanel(container, { sellerOrders = [], myDrafts = [], onRefresh }) {
  let html = `
    <div class="shop-panel flex flex-col gap-8">
      <!-- Header banner -->
      <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex justify-between items-center">
        <div>
          <h3 class="text-headline-sm font-bold text-on-surface mb-1">Quản lý Bán hàng</h3>
          <p class="text-body-md text-on-surface-variant">Xử lý các đơn hàng được đặt mua và các sản phẩm bản nháp.</p>
        </div>
        <a href="#/create-listing" class="px-4 py-2 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
          <span class="material-symbols-outlined text-sm">add</span> Đăng bán mới
        </a>
      </div>
  `;

  // Section 1: Seller Orders
  html += `
    <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
      <h4 class="text-title-lg font-bold text-on-surface mb-4">Đơn hàng cần xử lý (${sellerOrders.length})</h4>
  `;

  if (sellerOrders.length === 0) {
    html += `
      <div class="flex flex-col items-center justify-center py-12 text-center border border-dashed border-outline-variant rounded-xl">
        <span class="material-symbols-outlined text-4xl text-outline mb-2">storefront</span>
        <p class="font-medium text-on-surface">Chưa có đơn đặt mua sản phẩm nào</p>
        <p class="text-body-sm text-on-surface-variant mt-1">Khi khách hàng đặt mua món đồ của bạn, đơn hàng sẽ hiển thị tại đây.</p>
      </div>
    `;
  } else {
    html += `<div class="flex flex-col gap-4">`;
    sellerOrders.forEach((ord) => {
      const statusStr = String(ord.status || "PENDING").toUpperCase();
      let statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-surface-variant text-on-surface-variant">${statusStr}</span>`;
      if (statusStr === "PENDING") {
        statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Chờ duyệt</span>`;
      } else if (statusStr === "CONFIRMED") {
        statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Chờ gửi hàng</span>`;
      } else if (statusStr === "SHIPPING") {
        statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Đang giao</span>`;
      } else if (statusStr === "RECEIVED" || statusStr === "COMPLETED") {
        statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Hoàn tất</span>`;
      }

      html += `
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-outline-variant/30 gap-4">
          <div class="flex items-center gap-4">
            <img src="${ord.productImage || 'https://placehold.co/100x100/E4EBE4/6E7B6C?text=Order'}" class="w-16 h-16 rounded-lg object-cover border border-outline-variant/30" />
            <div>
              <p class="text-xs text-on-surface-variant">Đơn hàng: #${ord.id?.slice(0, 8) || "N/A"}</p>
              <h5 class="font-bold text-on-surface mt-0.5">${ord.productTitle || "Sản phẩm không có tên"}</h5>
              <p class="text-primary font-semibold text-sm mt-1">${formatPrice(ord.price || ord.totalAmount)}</p>
            </div>
          </div>
          <div class="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            ${statusBadge}
            <div class="flex gap-2 mt-1">
              ${
                statusStr === "PENDING"
                  ? `<button class="btn-confirm-order px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors" data-orderid="${ord.id}">Xác nhận bán</button>`
                  : ""
              }
              ${
                statusStr === "CONFIRMED"
                  ? `<button class="btn-ship-order px-3 py-1.5 bg-secondary text-on-secondary rounded-lg text-xs font-semibold hover:bg-secondary/90 transition-colors" data-orderid="${ord.id}">Gửi hàng cho shipper</button>`
                  : ""
              }
            </div>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }
  html += `</div>`;

  // Section 2: Drafts
  if (myDrafts.length > 0) {
    html += `
      <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <h4 class="text-title-lg font-bold text-on-surface mb-4">Sản phẩm Bản nháp (${myDrafts.length})</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    `;
    myDrafts.forEach((draft) => {
      html += `
        <div class="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity">
          <div class="aspect-[4/3] w-full bg-surface-variant relative">
            <img src="${draft.imageUrl || 'https://placehold.co/400x300/E4EBE4/6E7B6C?text=Draft'}" class="w-full h-full object-cover" />
            <span class="absolute top-2 right-2 bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-bold">Bản nháp</span>
          </div>
          <div class="p-4 flex justify-between items-center">
            <div>
              <h5 class="font-bold text-on-surface">${draft.title || "Không tên"}</h5>
              <p class="text-primary font-semibold text-sm mt-1">${formatPrice(draft.price)}</p>
            </div>
          </div>
        </div>
      `;
    });
    html += `</div></div>`;
  }

  html += `</div>`;
  container.innerHTML = html;

  // Bind buttons
  container.querySelectorAll(".btn-confirm-order").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const orderId = btn.getAttribute("data-orderid");
      if (!orderId) return;
      btn.disabled = true;
      try {
        await confirmOrder(orderId);
        showToast("Xác nhận bán hàng thành công!", "success");
        if (onRefresh) onRefresh();
      } catch (err) {
        showToast("Lỗi khi duyệt đơn: " + err.message, "error");
        btn.disabled = false;
      }
    });
  });

  container.querySelectorAll(".btn-ship-order").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const orderId = btn.getAttribute("data-orderid");
      if (!orderId) return;
      btn.disabled = true;
      try {
        await shipOrder(orderId);
        showToast("Đã cập nhật trạng thái đang giao hàng!", "success");
        if (onRefresh) onRefresh();
      } catch (err) {
        showToast("Lỗi cập nhật: " + err.message, "error");
        btn.disabled = false;
      }
    });
  });
}
