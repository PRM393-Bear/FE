/**
 * EcoCycle Web - Profile Donation Creation Modal
 * Modal UI to submit new donation request.
 */

import { createDonationRequestApi } from "../../services/profile.service.js";
import { showToast } from "../../utils/ui.js";

export function renderDonationModal(container, { organizations = [], onSuccess, onClose }) {
  let orgOptions = `<option value="">-- Chọn tổ chức từ thiện (Tùy chọn) --</option>`;
  organizations.forEach((org) => {
    orgOptions += `<option value="${org.id || org.orgId}">${org.fullName || org.organizationName || org.name}</option>`;
  });

  const html = `
    <div id="modal-backdrop" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div class="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-xl border border-outline-variant/30 relative flex flex-col gap-4">
        <div class="flex justify-between items-center pb-3 border-b border-outline-variant/30">
          <h4 class="text-title-lg font-bold text-on-surface">Tạo Yêu cầu Quyên góp</h4>
          <button id="btn-close-modal" class="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-outline-variant transition-colors">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <form id="form-create-donation" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-label-md font-semibold text-on-surface">Tên vật phẩm quyên góp <span class="text-error">*</span></label>
            <input type="text" name="items" placeholder="VD: 5 bộ quần áo ấm, 3 cuốn sách" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-label-md font-semibold text-on-surface">Tổ chức tiếp nhận</label>
            <select name="organizationId" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
              ${orgOptions}
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-label-md font-semibold text-on-surface">Mô tả chi tiết / Lời nhắn</label>
            <textarea name="description" rows="3" placeholder="Tình trạng đồ, kích cỡ hoặc lời chúc..." class="px-4 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button type="button" id="btn-cancel-modal" class="px-4 py-2 rounded-xl bg-surface-variant text-on-surface-variant font-medium text-sm hover:bg-outline-variant transition-colors">Hủy</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm">Gửi yêu cầu</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = html;
  document.body.appendChild(modalContainer);

  const closeDialog = () => {
    modalContainer.remove();
    if (onClose) onClose();
  };

  modalContainer.querySelector("#btn-close-modal")?.addEventListener("click", closeDialog);
  modalContainer.querySelector("#btn-cancel-modal")?.addEventListener("click", closeDialog);
  modalContainer.querySelector("#modal-backdrop")?.addEventListener("click", (e) => {
    if (e.target.id === "modal-backdrop") closeDialog();
  });

  const form = modalContainer.querySelector("#form-create-donation");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Đang gửi...";

    const formData = new FormData(form);
    const items = formData.get("items")?.trim();
    const orgId = formData.get("organizationId")?.trim() || null;
    const desc = formData.get("description")?.trim() || "";

    try {
      await createDonationRequestApi({
        title: items,
        items: items,
        description: desc,
        organizationId: orgId,
      });
      showToast("Tạo yêu cầu quyên góp thành công!", "success");
      closeDialog();
      if (onSuccess) onSuccess();
    } catch (err) {
      showToast("Lỗi khi tạo quyên góp: " + err.message, "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Gửi yêu cầu";
    }
  });
}
