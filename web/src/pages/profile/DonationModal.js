/**
 * EcoCycle Web - Profile Donation Creation Modal
 * Modal UI to submit new donation request with 2 tabs:
 * 1. Select from user's existing owned wardrobe items (DonationRequestReq)
 * 2. Quick create custom new item with image upload (DonationRequestCustomReq)
 * Supports mandatory DonationEvent selection.
 */

import {
  createDonationRequestApi,
  createDonationRequestCustomApi,
  getAllDonationEventsApi,
  getMyWardrobeItemsApi
} from "../../services/profile.service.js";
import { showToast } from "../../utils/ui.js";

export async function renderDonationModal(container, { organizations = [], onSuccess, onClose }) {
  // Show loading spinner while fetching active events & user wardrobe
  const loadingOverlay = document.createElement("div");
  loadingOverlay.id = "modal-backdrop-loading";
  loadingOverlay.className = "fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn";
  loadingOverlay.innerHTML = `
    <div class="bg-surface-container-lowest rounded-2xl p-6 shadow-xl border border-outline-variant/30 flex flex-col items-center gap-3">
      <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm font-semibold text-on-surface">Đang tải dữ liệu chiến dịch & tủ đồ...</p>
    </div>
  `;
  document.body.appendChild(loadingOverlay);

  let activeEvents = [];
  let wardrobeItems = [];

  try {
    const [eventsData, wardrobeData] = await Promise.all([
      getAllDonationEventsApi(),
      getMyWardrobeItemsApi()
    ]);
    if (Array.isArray(eventsData)) {
      activeEvents = eventsData.filter(ev => {
        const st = String(ev.status || "").toUpperCase();
        return st === "ONGOING" || st === "UPCOMING" || !st; // active campaigns
      });
    }
    if (Array.isArray(wardrobeData)) {
      wardrobeItems = wardrobeData.filter(w => String(w.status || "").toUpperCase() === "OWNED" || !w.status);
    }
  } catch (err) {
    console.warn("Lỗi tải dữ liệu cho Modal quyên góp:", err);
  } finally {
    loadingOverlay.remove();
  }

  // Build event options dropdown
  let eventOptions = `<option value="">-- Chọn Chiến dịch Quyên góp (Bắt buộc) --</option>`;
  activeEvents.forEach(ev => {
    const orgLabel = ev.orgName ? ` • ${ev.orgName}` : "";
    const statusLabel = String(ev.status || "").toUpperCase() === "ONGOING" ? " [Đang diễn ra]" : "";
    eventOptions += `<option value="${ev.id || ev.donationEventId}">${ev.title || "Chiến dịch quyên góp"}${orgLabel}${statusLabel}</option>`;
  });

  // Build wardrobe checklist HTML
  let wardrobeChecklistHtml = "";
  if (wardrobeItems.length === 0) {
    wardrobeChecklistHtml = `
      <div class="p-6 text-center border border-dashed border-outline-variant rounded-xl bg-surface-variant/20 flex flex-col items-center gap-2">
        <span class="material-symbols-outlined text-3xl text-outline">checkroom</span>
        <p class="text-xs font-semibold text-on-surface">Tủ đồ cá nhân đang trống hoặc không có món đồ nào ở trạng thái "Đã sở hữu".</p>
        <p class="text-[11px] text-on-surface-variant">Hãy chuyển sang tab "⚡ Quyên góp món đồ mới nhanh" để thêm trực tiếp vật phẩm kèm ảnh chụp nhé!</p>
      </div>
    `;
  } else {
    wardrobeChecklistHtml = `<div class="max-h-56 overflow-y-auto flex flex-col gap-2.5 pr-1 border border-outline-variant/30 p-3 rounded-xl bg-surface/50">`;
    wardrobeItems.forEach(item => {
      const imgUrl = item.imageUrl || item.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=150&q=80";
      wardrobeChecklistHtml += `
        <label class="flex items-center gap-3 p-2.5 rounded-lg border border-outline-variant/30 hover:border-primary/50 bg-surface-container-lowest cursor-pointer transition-all hover:shadow-xs group">
          <input type="checkbox" name="wardrobeItemIds" value="${item.id}" class="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary focus:ring-2 cursor-pointer" />
          <img src="${imgUrl}" class="w-11 h-11 object-cover rounded-lg bg-surface-variant flex-shrink-0" onerror="this.src='https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=150&q=80'" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">${item.name || "Vật phẩm thời trang"}</p>
            <p class="text-xs text-on-surface-variant truncate">${item.category || "Quần áo"} • ${item.condition || "Tốt"}</p>
          </div>
        </label>
      `;
    });
    wardrobeChecklistHtml += `</div>`;
  }

  let activeTab = wardrobeItems.length > 0 ? "wardrobe" : "custom";

  const html = `
    <div id="modal-backdrop" class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div class="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-outline-variant/30 relative flex flex-col gap-5 max-h-[92vh] overflow-hidden">
        
        <!-- Modal Header -->
        <div class="flex justify-between items-center pb-3 border-b border-outline-variant/30">
          <div>
            <h4 class="text-title-lg font-bold text-on-surface flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">volunteer_activism</span> Đăng ký Quyên góp Vật phẩm
            </h4>
            <p class="text-xs text-on-surface-variant mt-0.5">Chọn vật phẩm từ tủ đồ hoặc tải lên đồ mới để gửi tới các chiến dịch từ thiện.</p>
          </div>
          <button id="btn-close-modal" class="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-outline-variant transition-colors">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <!-- Tab Switcher -->
        <div class="flex border border-outline-variant/30 rounded-xl p-1 bg-surface-variant/30 gap-1">
          <button type="button" class="tab-switch-btn flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'wardrobe' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}" data-tab="wardrobe">
            <span class="material-symbols-outlined text-sm">checkroom</span> Chọn từ Tủ đồ (${wardrobeItems.length})
          </button>
          <button type="button" class="tab-switch-btn flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'custom' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}" data-tab="custom">
            <span class="material-symbols-outlined text-sm">add_circle</span> Quyên góp Đồ mới nhanh
          </button>
        </div>

        <div class="overflow-y-auto pr-1 flex-1">
          <!-- Tab 1 Form: From Wardrobe (DonationRequestReq) -->
          <form id="form-tab-wardrobe" class="flex flex-col gap-4 ${activeTab === 'wardrobe' ? '' : 'hidden'}" novalidate>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface uppercase tracking-wider">Chiến dịch Quyên góp <span class="text-error">*</span></label>
              <select name="donationEventId" required class="px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-colors">
                ${eventOptions}
              </select>
              <p class="error-inline text-xs font-semibold text-error mt-1 hidden"></p>
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex justify-between items-center">
                <label class="text-xs font-bold text-on-surface uppercase tracking-wider">Chọn vật phẩm từ Tủ đồ <span class="text-error">*</span></label>
                <span class="text-[11px] text-primary font-semibold" id="selected-count-label">Đã chọn: 0 món</span>
              </div>
              <div id="wardrobe-list-container" class="rounded-xl transition-colors">
                ${wardrobeChecklistHtml}
              </div>
              <p class="error-inline text-xs font-semibold text-error mt-1 hidden"></p>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface uppercase tracking-wider">Mô tả / Lời nhắn tới Tổ chức</label>
              <textarea name="description" rows="2" placeholder="Chia sẻ lời chúc hoặc lưu ý khi nhận đồ..." class="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-outline-variant/30 mt-1">
              <button type="button" class="btn-cancel-modal px-4 py-2 rounded-xl bg-surface-variant text-on-surface-variant font-medium text-xs hover:bg-outline-variant transition-colors">Hủy</button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">send</span> Gửi yêu cầu quyên góp
              </button>
            </div>
          </form>

          <!-- Tab 2 Form: Quick Custom Item (DonationRequestCustomReq) -->
          <form id="form-tab-custom" class="flex flex-col gap-4 ${activeTab === 'custom' ? '' : 'hidden'}" novalidate>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface uppercase tracking-wider">Chiến dịch Quyên góp <span class="text-error">*</span></label>
              <select name="donationEventId" required class="px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-colors">
                ${eventOptions}
              </select>
              <p class="error-inline text-xs font-semibold text-error mt-1 hidden"></p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-on-surface uppercase tracking-wider">Tên vật phẩm <span class="text-error">*</span></label>
                <input type="text" name="itemName" required placeholder="VD: Áo khoác mùa đông..." class="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-colors" />
                <p class="error-inline text-xs font-semibold text-error mt-1 hidden"></p>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-on-surface uppercase tracking-wider">Danh mục</label>
                <select name="category" class="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                  <option value="Quần áo">Quần áo</option>
                  <option value="Giày dép">Giày dép</option>
                  <option value="Phụ kiện">Phụ kiện</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-on-surface uppercase tracking-wider">Tình trạng đồ</label>
                <select name="condition" class="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                  <option value="Mới 100%">Mới 100% (Chưa qua sử dụng)</option>
                  <option value="Gần như mới (90-95%)">Gần như mới (90-95%)</option>
                  <option value="Đã qua sử dụng (Tốt)">Đã qua sử dụng (Tốt)</option>
                  <option value="Cần tân trang nhẹ">Cần tân trang nhẹ</option>
                </select>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-on-surface uppercase tracking-wider">Ghi chú tình trạng</label>
                <input type="text" name="conditionNote" placeholder="VD: Hơi sờn nhẹ ở tay áo..." class="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface uppercase tracking-wider">Ảnh chụp thực tế <span class="text-error">*</span></label>
              <div id="custom-image-dropzone" class="border-2 border-dashed border-outline-variant rounded-xl p-4 text-center bg-surface hover:bg-surface-variant/20 transition-all cursor-pointer relative">
                <input type="file" name="image" accept="image/*" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" id="custom-image-input" />
                <div id="custom-image-preview" class="flex flex-col items-center pointer-events-none transition-all">
                  <span class="material-symbols-outlined text-3xl text-primary mb-1">add_a_photo</span>
                  <p class="text-xs font-bold text-on-surface">Nhấn hoặc kéo thả file ảnh vật phẩm vào đây</p>
                  <p class="text-[11px] text-on-surface-variant mt-0.5">Hỗ trợ PNG, JPG (Tối đa 5MB)</p>
                </div>
              </div>
              <p class="error-inline text-xs font-semibold text-error mt-1 hidden"></p>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface uppercase tracking-wider">Mô tả / Lời nhắn</label>
              <textarea name="description" rows="2" placeholder="Gửi lời chúc tốt đẹp tới cộng đồng..." class="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-outline-variant/30 mt-1">
              <button type="button" class="btn-cancel-modal px-4 py-2 rounded-xl bg-surface-variant text-on-surface-variant font-medium text-xs hover:bg-outline-variant transition-colors">Hủy</button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">send</span> Gửi yêu cầu quyên góp
              </button>
            </div>
          </form>
        </div>
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

  // Close triggers
  modalContainer.querySelector("#btn-close-modal")?.addEventListener("click", closeDialog);
  modalContainer.querySelectorAll(".btn-cancel-modal").forEach(btn => btn.addEventListener("click", closeDialog));
  modalContainer.querySelector("#modal-backdrop")?.addEventListener("click", (e) => {
    if (e.target.id === "modal-backdrop") closeDialog();
  });

  // Tab switching logic
  const formWardrobe = modalContainer.querySelector("#form-tab-wardrobe");
  const formCustom = modalContainer.querySelector("#form-tab-custom");
  const tabButtons = modalContainer.querySelectorAll(".tab-switch-btn");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      activeTab = btn.getAttribute("data-tab");
      tabButtons.forEach(b => {
        if (b.getAttribute("data-tab") === activeTab) {
          b.className = "tab-switch-btn flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-surface-container-lowest text-primary shadow-sm";
        } else {
          b.className = "tab-switch-btn flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-on-surface-variant hover:text-on-surface";
        }
      });
      if (activeTab === "wardrobe") {
        formWardrobe?.classList.remove("hidden");
        formCustom?.classList.add("hidden");
      } else {
        formWardrobe?.classList.add("hidden");
        formCustom?.classList.remove("hidden");
      }
    });
  });

  // Helper to reset error styling
  const clearInlineErrors = (form) => {
    form?.querySelectorAll(".error-inline").forEach(el => {
      el.textContent = "";
      el.classList.add("hidden");
    });
    form?.querySelectorAll("select, input, textarea").forEach(el => {
      el.classList.remove("border-error", "bg-error/5");
    });
    form?.querySelector("#wardrobe-list-container")?.classList.remove("border", "border-error", "bg-error/5");
    form?.querySelector("#custom-image-dropzone")?.classList.remove("border-error", "bg-error/5");
  };

  // Live clear inline errors when user inputs data
  modalContainer.querySelectorAll("select, input, textarea").forEach(input => {
    input.addEventListener("input", () => {
      input.classList.remove("border-error", "bg-error/5");
      const err = input.parentElement?.querySelector(".error-inline");
      if (err) {
        err.textContent = "";
        err.classList.add("hidden");
      }
    });
  });

  // Update selected checkbox count & clear error
  const checkboxes = formWardrobe?.querySelectorAll("input[name='wardrobeItemIds']");
  const countLabel = formWardrobe?.querySelector("#selected-count-label");
  const wardrobeListContainer = formWardrobe?.querySelector("#wardrobe-list-container");
  checkboxes?.forEach(chk => {
    chk.addEventListener("change", () => {
      const checkedCount = formWardrobe?.querySelectorAll("input[name='wardrobeItemIds']:checked").length || 0;
      if (countLabel) countLabel.textContent = `Đã chọn: ${checkedCount} món`;
      if (checkedCount > 0 && wardrobeListContainer) {
        wardrobeListContainer.classList.remove("border", "border-error", "bg-error/5");
        const err = wardrobeListContainer.parentElement?.querySelector(".error-inline");
        if (err) {
          err.textContent = "";
          err.classList.add("hidden");
        }
      }
    });
  });

  // Custom image input preview & enhanced dropzone experience
  const customImgInput = formCustom?.querySelector("#custom-image-input");
  const customImgPreview = formCustom?.querySelector("#custom-image-preview");
  const customDropzone = formCustom?.querySelector("#custom-image-dropzone");

  const resetDropzonePreview = () => {
    if (customImgPreview) {
      customImgPreview.innerHTML = `
        <span class="material-symbols-outlined text-3xl text-primary mb-1">add_a_photo</span>
        <p class="text-xs font-bold text-on-surface">Nhấn hoặc kéo thả file ảnh vật phẩm vào đây</p>
        <p class="text-[11px] text-on-surface-variant mt-0.5">Hỗ trợ PNG, JPG (Tối đa 5MB)</p>
      `;
    }
  };

  customDropzone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    customDropzone.classList.add("border-primary", "bg-primary/5");
  });
  customDropzone?.addEventListener("dragleave", () => {
    customDropzone.classList.remove("border-primary", "bg-primary/5");
  });
  customDropzone?.addEventListener("drop", (e) => {
    e.preventDefault();
    customDropzone.classList.remove("border-primary", "bg-primary/5");
    if (e.dataTransfer?.files?.length && customImgInput) {
      customImgInput.files = e.dataTransfer.files;
      customImgInput.dispatchEvent(new Event("change"));
    }
  });

  customImgInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    customDropzone?.classList.remove("border-error", "bg-error/5");
    const err = customDropzone?.parentElement?.querySelector(".error-inline");
    if (err) {
      err.textContent = "";
      err.classList.add("hidden");
    }

    if (file && customImgPreview) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Kích thước ảnh vượt quá giới hạn 5MB!", "warning");
        customImgInput.value = "";
        resetDropzonePreview();
        return;
      }
      const imgUrl = URL.createObjectURL(file);
      customImgPreview.innerHTML = `
        <div class="flex items-center gap-3 w-full p-2.5 bg-surface-container-lowest rounded-xl border border-emerald-500/30 text-left shadow-xs">
          <img src="${imgUrl}" class="w-14 h-14 object-cover rounded-lg border border-outline-variant/30 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-on-surface truncate">${file.name}</p>
            <p class="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <span class="material-symbols-outlined text-xs">check_circle</span> Đã chọn ảnh (${(file.size / 1024).toFixed(1)} KB)
            </p>
          </div>
          <button type="button" id="btn-remove-custom-image" class="p-1.5 rounded-lg text-error hover:bg-error/10 transition-colors pointer-events-auto z-20 relative" title="Chọn ảnh khác">
            <span class="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      `;
      const removeBtn = customImgPreview.querySelector("#btn-remove-custom-image");
      removeBtn?.addEventListener("click", (evt) => {
        evt.stopPropagation();
        evt.preventDefault();
        customImgInput.value = "";
        resetDropzonePreview();
      });
    } else {
      resetDropzonePreview();
    }
  });

  // Submit Tab 1: From Wardrobe (DonationRequestReq)
  formWardrobe?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearInlineErrors(formWardrobe);

    const eventSelect = formWardrobe.querySelector("select[name='donationEventId']");
    const eventId = eventSelect?.value;
    const desc = formWardrobe.querySelector("textarea[name='description']")?.value?.trim() || "";
    const selectedIds = Array.from(formWardrobe.querySelectorAll("input[name='wardrobeItemIds']:checked")).map(c => c.value);

    let hasError = false;
    if (!eventId) {
      eventSelect?.classList.add("border-error", "bg-error/5");
      const err = eventSelect?.parentElement?.querySelector(".error-inline");
      if (err) {
        err.textContent = "Vui lòng chọn Chiến dịch Quyên góp để tiếp nhận vật phẩm!";
        err.classList.remove("hidden");
      }
      hasError = true;
    }

    if (selectedIds.length === 0) {
      wardrobeListContainer?.classList.add("border", "border-error", "bg-error/5");
      const err = wardrobeListContainer?.parentElement?.querySelector(".error-inline");
      if (err) {
        err.textContent = "Vui lòng tích chọn ít nhất 1 vật phẩm từ Tủ đồ của bạn!";
        err.classList.remove("hidden");
      }
      hasError = true;
    }

    if (hasError) {
      showToast("Vui lòng kiểm tra và điền đầy đủ thông tin bắt buộc trên form!", "warning");
      return;
    }

    const submitBtn = formWardrobe.querySelector("button[type='submit']");
    const originalHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Đang gửi...`;
    }

    try {
      await createDonationRequestApi({
        donationEventId: eventId,
        description: desc,
        wardrobeItemIds: selectedIds
      });
      showToast("Gửi yêu cầu quyên góp thành công! Cảm ơn tấm lòng của bạn.", "success");
      closeDialog();
      if (onSuccess) {
        onSuccess();
        setTimeout(() => { if (onSuccess) onSuccess(); }, 800);
      }
    } catch (err) {
      showToast("Lỗi khi gửi quyên góp: " + err.message, "error");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
      }
    }
  });

  // Submit Tab 2: Quick Custom Item (DonationRequestCustomReq via FormData)
  formCustom?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearInlineErrors(formCustom);

    const eventSelect = formCustom.querySelector("select[name='donationEventId']");
    const eventId = eventSelect?.value;
    const itemNameInput = formCustom.querySelector("input[name='itemName']");
    const itemName = itemNameInput?.value?.trim() || "";
    const file = customImgInput?.files?.[0];

    let hasError = false;
    if (!eventId) {
      eventSelect?.classList.add("border-error", "bg-error/5");
      const err = eventSelect?.parentElement?.querySelector(".error-inline");
      if (err) {
        err.textContent = "Vui lòng chọn Chiến dịch Quyên góp để tiếp nhận vật phẩm!";
        err.classList.remove("hidden");
      }
      hasError = true;
    }

    if (!itemName) {
      itemNameInput?.classList.add("border-error", "bg-error/5");
      const err = itemNameInput?.parentElement?.querySelector(".error-inline");
      if (err) {
        err.textContent = "Tên vật phẩm không được để trống!";
        err.classList.remove("hidden");
      }
      hasError = true;
    }

    if (!file) {
      customDropzone?.classList.add("border-error", "bg-error/5");
      const err = customDropzone?.parentElement?.querySelector(".error-inline");
      if (err) {
        err.textContent = "Vui lòng đính kèm ảnh chụp thực tế của vật phẩm!";
        err.classList.remove("hidden");
      }
      hasError = true;
    }

    if (hasError) {
      showToast("Vui lòng kiểm tra và điền đầy đủ thông tin bắt buộc trên form!", "warning");
      return;
    }

    const submitBtn = formCustom.querySelector("button[type='submit']");
    const originalHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Đang tạo & gửi...`;
    }

    try {
      const fd = new FormData(formCustom);
      await createDonationRequestCustomApi(fd);
      showToast("Tạo & quyên góp món đồ mới thành công!", "success");
      closeDialog();
      if (onSuccess) {
        onSuccess();
        setTimeout(() => { if (onSuccess) onSuccess(); }, 800);
      }
    } catch (err) {
      showToast("Lỗi khi tạo quyên góp: " + err.message, "error");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
      }
    }
  });
}
