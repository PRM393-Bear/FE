/**
 * EcoCycle Web - Staff Pending Products Tab
 * Displays pending approval product listings with Approve / Reject actions + reason modal.
 */

import { getPendingProducts, approveProduct, rejectProduct } from "../../services/staff.service.js";
import { showToast } from "../../utils/ui.js";

function formatPrice(num) {
  if (num === undefined || num === null || isNaN(num)) return "0đ";
  return Number(num).toLocaleString("vi-VN") + "đ";
}

export async function renderPendingProductsTab(container) {
  container.innerHTML = `
    <div class="flex flex-col gap-6 animate-fade-in relative">
      <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex justify-between items-center">
        <div>
          <h3 class="text-headline-sm font-bold text-on-surface">Duyệt bài đăng sản phẩm bán/trao đổi</h3>
          <p class="text-body-md text-on-surface-variant">Kiểm duyệt các bài đăng mới từ cộng đồng trước khi hiển thị công khai trên chợ EcoCycle.</p>
        </div>
        <button id="btn-refresh-pending" class="px-4 py-2 rounded-xl bg-surface-variant text-primary font-bold text-sm hover:bg-primary/10 transition-colors flex items-center gap-1.5">
          <span class="material-symbols-outlined text-base">refresh</span> Làm mới
        </button>
      </div>

      <!-- Reject Modal (Hidden by default) -->
      <div id="reject-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="bg-surface border border-outline-variant rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-up">
          <h4 class="text-title-lg font-bold text-error flex items-center gap-2">
            <span class="material-symbols-outlined">warning</span> Từ chối bài đăng
          </h4>
          <p class="text-body-sm text-on-surface-variant mt-1">Vui lòng nhập rõ lý do từ chối bài đăng này để người bán nắm thông tin và chỉnh sửa phù hợp.</p>
          
          <input type="hidden" id="reject-product-id" value="" />
          <textarea id="reject-reason-input" rows="4" placeholder="VD: Hình ảnh mờ nhạt không rõ chi tiết, thông tin không chính xác hoặc vi phạm chính sách cộng đồng..." class="w-full mt-4 p-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:border-error"></textarea>
          
          <div class="flex justify-end gap-3 mt-5">
            <button id="btn-close-reject-modal" class="px-4 py-2 rounded-xl border border-outline-variant text-on-surface-variant text-sm font-semibold hover:bg-surface-variant transition-colors">Hủy</button>
            <button id="btn-confirm-reject" class="px-5 py-2 rounded-xl bg-error text-on-error text-sm font-bold shadow hover:bg-error/90 transition-colors">Xác nhận Từ Chối</button>
          </div>
        </div>
      </div>

      <!-- Pending List Grid / Table -->
      <div id="pending-list-wrapper" class="min-h-[300px]">
        <div class="p-12 text-center"><span class="material-symbols-outlined text-4xl animate-spin text-primary">progress_activity</span></div>
      </div>
    </div>
  `;

  const rejectModal = container.querySelector("#reject-modal");
  const rejectIdInput = container.querySelector("#reject-product-id");
  const rejectReasonInput = container.querySelector("#reject-reason-input");
  const listWrapper = container.querySelector("#pending-list-wrapper");

  container.querySelector("#btn-refresh-pending")?.addEventListener("click", () => {
    loadPendingProducts();
  });

  container.querySelector("#btn-close-reject-modal")?.addEventListener("click", () => {
    rejectModal.classList.add("hidden");
  });

  container.querySelector("#btn-confirm-reject")?.addEventListener("click", async () => {
    const id = rejectIdInput.value;
    const reason = rejectReasonInput.value.trim();
    if (!reason) {
      showToast("Vui lòng nhập lý do từ chối!", "warning");
      return;
    }

    const confirmBtn = container.querySelector("#btn-confirm-reject");
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Đang xử lý...";

    try {
      await rejectProduct(id, reason);
      showToast("Đã từ chối bài đăng!", "info");
      rejectModal.classList.add("hidden");
      await loadPendingProducts();
    } catch (err) {
      showToast("Lỗi: " + err.message, "error");
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Xác nhận Từ Chối";
    }
  });

  async function loadPendingProducts() {
    listWrapper.innerHTML = `<div class="p-12 text-center"><span class="material-symbols-outlined text-4xl animate-spin text-primary">progress_activity</span></div>`;
    const products = await getPendingProducts();

    if (products.length === 0) {
      listWrapper.innerHTML = `
        <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-16 text-center flex flex-col items-center justify-center">
          <span class="material-symbols-outlined text-5xl text-emerald-600 mb-3">task_alt</span>
          <h4 class="text-title-lg font-bold text-on-surface">Không có bài đăng chờ duyệt nào!</h4>
          <p class="text-body-sm text-on-surface-variant mt-1">Toàn bộ danh sách bài đăng từ cộng đồng đều đã được kiểm duyệt xong.</p>
        </div>
      `;
      return;
    }

    listWrapper.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${products.map(prod => {
          const img = prod.images && prod.images.length > 0 ? prod.images[0] : (prod.imageUrl || "https://placehold.co/400x300/E4EBE4/6E7B6C?text=No+Image");
          return `
            <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div class="aspect-[4/3] w-full bg-surface-variant relative overflow-hidden">
                  <img src="${img}" alt="${prod.title}" class="w-full h-full object-cover" loading="lazy" />
                  <span class="absolute top-2.5 right-2.5 bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">Chờ kiểm duyệt</span>
                </div>
                <div class="p-5">
                  <div class="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                    <span>Người bán: <strong>${prod.sellerName || "Thành viên"}</strong></span>
                    <span>${prod.category || "Chung"}</span>
                  </div>
                  <h4 class="text-title-md font-bold text-on-surface line-clamp-1" title="${prod.title}">${prod.title || "Không tên"}</h4>
                  <p class="text-primary font-bold text-base mt-1">${formatPrice(prod.price)}</p>
                  <div class="mt-3 p-3 bg-surface rounded-xl border border-outline-variant/20 text-xs text-on-surface-variant max-h-24 overflow-y-auto">
                    <p class="font-bold text-on-surface mb-1">Mô tả sản phẩm:</p>
                    ${prod.description || "Người bán không để lại mô tả chi tiết."}
                  </div>
                </div>
              </div>
              <div class="p-5 pt-0 flex items-center gap-3">
                <button class="btn-approve-prod flex-1 py-2.5 px-4 bg-primary text-on-primary rounded-xl font-bold text-xs shadow hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5" data-id="${prod.id}" data-title="${encodeURIComponent(prod.title || '')}">
                  <span class="material-symbols-outlined text-base">check_circle</span> Duyệt ngay
                </button>
                <button class="btn-open-reject flex-1 py-2.5 px-4 bg-error/10 text-error border border-error/20 rounded-xl font-bold text-xs hover:bg-error/20 transition-colors flex items-center justify-center gap-1.5" data-id="${prod.id}" data-title="${encodeURIComponent(prod.title || '')}">
                  <span class="material-symbols-outlined text-base">cancel</span> Từ chối
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    // Bind Approve buttons
    listWrapper.querySelectorAll(".btn-approve-prod").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const title = decodeURIComponent(btn.getAttribute("data-title") || "Sản phẩm");
        if (!confirm(`Xác nhận duyệt cho phép hiển thị bài đăng "${title}"?`)) return;

        btn.disabled = true;
        const origText = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">progress_activity</span>';

        try {
          await approveProduct(id);
          showToast(`Đã duyệt thành công bài đăng "${title}"!`, "success");
          await loadPendingProducts();
        } catch (err) {
          showToast("Lỗi duyệt: " + err.message, "error");
          btn.disabled = false;
          btn.innerHTML = origText;
        }
      });
    });

    // Bind Reject buttons
    listWrapper.querySelectorAll(".btn-open-reject").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        rejectIdInput.value = id;
        rejectReasonInput.value = "";
        rejectModal.classList.remove("hidden");
        rejectReasonInput.focus();
      });
    });
  }

  await loadPendingProducts();
}
