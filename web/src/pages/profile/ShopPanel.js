/**
 * EcoCycle Web - Profile Shop Panel
 * Renders seller order management with full history status filtering, active products (with Edit & Hide/Unhide), and draft products.
 */

import { confirmOrder, shipOrder } from "../../services/order.service.js";
import { hideProduct, unhideProduct } from "../../services/product.service.js";
import { showToast } from "../../utils/ui.js";

function formatPrice(num) {
  if (num === undefined || num === null || isNaN(num)) return "0đ";
  return Number(num).toLocaleString("vi-VN") + "đ";
}

let currentShopFilter = "ALL";

export function renderShopPanel(container, { sellerOrders = [], myDrafts = [], myProducts = [], onRefresh }) {
  const filteredOrders = currentShopFilter === "ALL"
    ? sellerOrders
    : sellerOrders.filter(ord => {
        const st = String(ord.status || "PENDING").toUpperCase();
        if (currentShopFilter === "COMPLETED") {
          return st === "COMPLETED" || st === "RECEIVED";
        }
        return st === currentShopFilter;
      });

  let html = `
    <div class="shop-panel flex flex-col gap-8">
      <!-- Header banner -->
      <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 class="text-headline-sm font-bold text-on-surface mb-1">Quản lý Bán hàng</h3>
          <p class="text-body-md text-on-surface-variant">Xử lý toàn bộ đơn đặt mua, theo dõi lịch sử bán, chỉnh sửa/ẩn hiện bài đăng và quản lý bản nháp.</p>
        </div>
        <a href="#/create-listing" class="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-medium shadow hover:bg-primary/90 transition-colors flex items-center gap-2">
          <span class="material-symbols-outlined text-base">add_circle</span> Đăng bán mới
        </a>
      </div>
  `;

  // Section 1: Seller Orders & History
  html += `
    <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h4 class="text-title-lg font-bold text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">local_shipping</span>
          Lịch sử và Đơn hàng bán (${sellerOrders.length})
        </h4>

        <!-- Status Filter Tabs -->
        <div class="flex flex-wrap gap-2 bg-surface-variant/40 p-1 rounded-xl">
          <button class="btn-shop-filter px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentShopFilter === 'ALL' ? 'bg-surface shadow-sm text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-filter="ALL">Tất cả (${sellerOrders.length})</button>
          <button class="btn-shop-filter px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentShopFilter === 'PENDING' ? 'bg-surface shadow-sm text-blue-700 font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-filter="PENDING">Chờ duyệt</button>
          <button class="btn-shop-filter px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentShopFilter === 'CONFIRMED' ? 'bg-surface shadow-sm text-amber-700 font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-filter="CONFIRMED">Chờ gửi hàng</button>
          <button class="btn-shop-filter px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentShopFilter === 'SHIPPING' ? 'bg-surface shadow-sm text-purple-700 font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-filter="SHIPPING">Đang giao</button>
          <button class="btn-shop-filter px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentShopFilter === 'COMPLETED' ? 'bg-surface shadow-sm text-emerald-700 font-bold' : 'text-on-surface-variant hover:text-on-surface'}" data-filter="COMPLETED">Hoàn tất</button>
        </div>
      </div>
  `;

  if (filteredOrders.length === 0) {
    html += `
      <div class="flex flex-col items-center justify-center py-12 text-center border border-dashed border-outline-variant rounded-xl">
        <span class="material-symbols-outlined text-4xl text-outline mb-2">storefront</span>
        <p class="font-medium text-on-surface">Chưa có đơn hàng nào ở trạng thái này</p>
        <p class="text-body-sm text-on-surface-variant mt-1">Khi khách hàng đặt mua món đồ của bạn, thông tin và lịch sử xử lý sẽ hiển thị tại đây.</p>
      </div>
    `;
  } else {
    html += `<div class="flex flex-col gap-4">`;
    filteredOrders.forEach((ord) => {
      const statusStr = String(ord.status || "PENDING").toUpperCase();
      let statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-surface-variant text-on-surface-variant">${statusStr}</span>`;
      if (statusStr === "PENDING") {
        statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>Chờ duyệt</span>`;
      } else if (statusStr === "CONFIRMED") {
        statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>Chờ gửi hàng</span>`;
      } else if (statusStr === "SHIPPING") {
        statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>Đang giao</span>`;
      } else if (statusStr === "RECEIVED" || statusStr === "COMPLETED") {
        statusBadge = `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>Hoàn tất</span>`;
      }

      html += `
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-outline-variant/30 gap-4 hover:border-primary/40 transition-colors">
          <div class="flex items-center gap-4">
            <img src="${ord.productImage || 'https://placehold.co/100x100/E4EBE4/6E7B6C?text=Order'}" class="w-16 h-16 rounded-lg object-cover border border-outline-variant/30 shrink-0" />
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded">#${ord.id?.slice(0, 8) || "N/A"}</span>
                <span class="text-xs text-on-surface-variant">${ord.createdAt || ord.date ? new Date(ord.createdAt || ord.date).toLocaleDateString("vi-VN") : "Gần đây"}</span>
              </div>
              <h5 class="font-bold text-on-surface mt-1">${ord.productTitle || ord.productName || "Sản phẩm không có tên"}</h5>
              <p class="text-primary font-semibold text-sm mt-1">${formatPrice(ord.price || ord.totalAmount)}</p>
            </div>
          </div>
          <div class="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            ${statusBadge}
            <div class="flex gap-2 mt-1">
              ${
                statusStr === "PENDING"
                  ? `<button class="btn-confirm-order px-3.5 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1" data-orderid="${ord.id}">
                       <span class="material-symbols-outlined text-sm">check</span> Xác nhận bán
                     </button>`
                  : ""
              }
              ${
                statusStr === "CONFIRMED"
                  ? `<button class="btn-ship-order px-3.5 py-1.5 bg-secondary text-on-secondary rounded-lg text-xs font-semibold hover:bg-secondary/90 transition-colors shadow-sm flex items-center gap-1" data-orderid="${ord.id}">
                       <span class="material-symbols-outlined text-sm">local_shipping</span> Gửi cho shipper
                     </button>`
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

  // Section 2: My Products (Active, Hidden, Pending)
  html += `
    <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
      <h4 class="text-title-lg font-bold text-on-surface mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined text-primary">inventory_2</span>
        Sản phẩm đã đăng bán (${myProducts.length})
      </h4>
  `;

  if (myProducts.length === 0) {
    html += `
      <div class="flex flex-col items-center justify-center py-12 text-center border border-dashed border-outline-variant rounded-xl">
        <span class="material-symbols-outlined text-4xl text-outline mb-2">checkroom</span>
        <p class="font-medium text-on-surface">Bạn chưa có sản phẩm đăng bán nào</p>
        <p class="text-body-sm text-on-surface-variant mt-1">Nhấn "Đăng bán mới" để bắt đầu bán hoặc trao đổi quần áo.</p>
      </div>
    `;
  } else {
    html += `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;
    myProducts.forEach((prod) => {
      const isHidden = (prod.status || '').toUpperCase() === 'HIDDEN';
      const statusBadge = isHidden
        ? `<span class="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>Đã ẩn</span>`
        : `<span class="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>Đang hiển thị</span>`;

      html += `
        <div class="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface flex flex-col justify-between hover:shadow-md transition-all group ${isHidden ? 'opacity-75 bg-surface-variant/20' : ''}">
          <div>
            <div class="aspect-[4/3] w-full bg-surface-variant relative overflow-hidden">
              <img src="${prod.imageUrl || 'https://placehold.co/400x300/E4EBE4/6E7B6C?text=Product'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div class="absolute top-2.5 right-2.5">
                ${statusBadge}
              </div>
            </div>
            <div class="p-4">
              <h5 class="font-bold text-on-surface text-base truncate" title="${prod.title}">${prod.title || "Không tên"}</h5>
              <p class="text-primary font-bold text-sm mt-1">${formatPrice(prod.price)}</p>
              <p class="text-xs text-on-surface-variant mt-2 line-clamp-2">${prod.description || 'Không có mô tả'}</p>
            </div>
          </div>
          <div class="px-4 pb-4 pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-2">
            <a href="#/edit-listing?id=${prod.id}" class="flex-1 py-2 px-3 text-center rounded-lg border border-outline-variant text-on-surface font-semibold text-xs hover:bg-surface-variant hover:border-primary/50 transition-colors flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-sm">edit</span>
              Sửa
            </a>
            <button class="btn-toggle-hide flex-1 py-2 px-3 text-center rounded-lg border ${isHidden ? 'border-primary text-primary hover:bg-primary/10' : 'border-error/50 text-error hover:bg-error/10'} font-semibold text-xs transition-colors flex items-center justify-center gap-1.5" data-id="${prod.id}" data-hidden="${isHidden}">
              <span class="material-symbols-outlined text-sm">${isHidden ? 'visibility' : 'visibility_off'}</span>
              ${isHidden ? 'Hiện' : 'Ẩn'}
            </button>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }
  html += `</div>`;

  // Section 3: Drafts
  if (myDrafts.length > 0) {
    html += `
      <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <h4 class="text-title-lg font-bold text-on-surface mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-600">drafts</span>
          Sản phẩm Bản nháp (${myDrafts.length})
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    `;
    myDrafts.forEach((draft) => {
      html += `
        <div class="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity">
          <div>
            <div class="aspect-[4/3] w-full bg-surface-variant relative">
              <img src="${draft.imageUrl || 'https://placehold.co/400x300/E4EBE4/6E7B6C?text=Draft'}" class="w-full h-full object-cover" />
              <span class="absolute top-2 right-2 bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">Bản nháp</span>
            </div>
            <div class="p-4">
              <h5 class="font-bold text-on-surface">${draft.title || "Không tên"}</h5>
              <p class="text-primary font-semibold text-sm mt-1">${formatPrice(draft.price)}</p>
            </div>
          </div>
          <div class="p-4 pt-0">
            <a href="#/edit-listing?id=${draft.id}" class="w-full py-2 block text-center rounded-lg bg-surface-variant text-on-surface-variant font-semibold text-xs hover:bg-primary hover:text-on-primary transition-colors">
              Tiếp tục chỉnh sửa
            </a>
          </div>
        </div>
      `;
    });
    html += `</div></div>`;
  }

  html += `</div>`;
  container.innerHTML = html;

  // Bind filter tab buttons
  container.querySelectorAll(".btn-shop-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentShopFilter = btn.getAttribute("data-filter") || "ALL";
      renderShopPanel(container, { sellerOrders, myDrafts, myProducts, onRefresh });
    });
  });

  // Bind buttons: Orders
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

  // Bind buttons: Toggle Hide / Unhide
  container.querySelectorAll(".btn-toggle-hide").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const productId = btn.getAttribute("data-id");
      const isHidden = btn.getAttribute("data-hidden") === "true";
      if (!productId) return;

      btn.disabled = true;
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">progress_activity</span>';

      try {
        if (isHidden) {
          await unhideProduct(productId);
          showToast("Đã hiển thị lại bài đăng sản phẩm!", "success");
        } else {
          await hideProduct(productId);
          showToast("Đã ẩn bài đăng sản phẩm khỏi cửa hàng!", "info");
        }
        if (onRefresh) onRefresh();
      } catch (err) {
        showToast("Lỗi khi thao tác bài đăng: " + (err.message || 'Xin thử lại'), "error");
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    });
  });
}
