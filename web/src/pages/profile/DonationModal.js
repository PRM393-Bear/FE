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
          <form id="form-tab-wardrobe" class="flex flex-col gap-4 ${activeTab === 'wardrobe' ? '' : 'hidden'}">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface uppercase tracking-wider">Chiến dịch Quyên góp <span class="text-error">*</span></label>
              <select name="donationEventId" required class="px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                ${eventOptions}
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex justify-between items-center">
                <label class="text-xs font-bold text-on-surface uppercase tracking-wider">Chọn vật phẩm từ Tủ đồ <span class="text-error">*</span></label>
                <span class="text-[11px] text-primary font-semibold" id="selected-count-label">Đã chọn: 0 món</span>
              </div>
              ${wardrobeChecklistHtml}
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
          <form id="form-tab-custom" class="flex flex-col gap-4 ${activeTab === 'custom' ? '' : 'hidden'}">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface uppercase tracking-wider">Chiến dịch Quyên góp <span class="text-error">*</span></label>
              <select name="donationEventId" required class="px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                ${eventOptions}
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-on-surface uppercase tracking-wider">Tên vật phẩm <span class="text-error">*</span></label>
                <input type="text" name="itemName" required placeholder="VD: Áo khoác mùa đông, Sách giáo khoa" class="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-on-surface uppercase tracking-wider">Danh mục</label>
                <select name="category" class="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                  <option value="Quần áo">Quần áo</option>
                  <option value="Giày dép">Giày dép</option>
                  <option value="Sách vở">Sách vở</option>
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
              <div class="border-2 border-dashed border-outline-variant rounded-xl p-4 text-center bg-surface hover:bg-surface-variant/20 transition-colors cursor-pointer relative">
                <input type="file" name="image" accept="image/*" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" id="custom-image-input" />
                <div id="custom-image-preview" class="flex flex-col items-center pointer-events-none">
                  <span class="material-symbols-outlined text-3xl text-primary mb-1">add_a_photo</span>
                  <p class="text-xs font-bold text-on-surface">Nhấn hoặc kéo thả file ảnh vật phẩm vào đây</p>
                  <p class="text-[11px] text-on-surface-variant mt-0.5">Hỗ trợ PNG, JPG (Tối đa 5MB)</p>
                </div>
              </div>
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
        formWardrobe.classList.remove("hidden");
        formCustom.classList.add("hidden");
      } else {
        formWardrobe.classList.add("hidden");
        formCustom.classList.remove("hidden");
      }
    });
  });

  // Update selected checkbox count
  const checkboxes = formWardrobe?.querySelectorAll("input[name='wardrobeItemIds']");
  const countLabel = formWardrobe?.querySelector("#selected-count-label");
  checkboxes?.forEach(chk => {
    chk.addEventListener("change", () => {
      const checkedCount = formWardrobe.querySelectorAll("input[name='wardrobeItemIds']:checked").length;
      if (countLabel) countLabel.textContent = `Đã chọn: ${checkedCount} món`;
    });
  });

  // Custom image input preview
  const customImgInput = formCustom?.querySelector("#custom-image-input");
  const customImgPreview = formCustom?.querySelector("#custom-image-preview");
  customImgInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file && customImgPreview) {
      customImgPreview.innerHTML = `
        <span class="material-symbols-outlined text-3xl text-emerald-600 mb-1">check_circle</span>
        <p class="text-xs font-bold text-on-surface truncate max-w-[220px]">${file.name}</p>
        <p class="text-[11px] text-emerald-600 font-semibold mt-0.5">Đã đính kèm ảnh thành công</p>
      `;
    }
  });

  // Submit Tab 1: From Wardrobe (DonationRequestReq)
  formWardrobe?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const eventId = formWardrobe.querySelector("select[name='donationEventId']")?.value;
    const desc = formWardrobe.querySelector("textarea[name='description']")?.value?.trim() || "";
    const selectedIds = Array.from(formWardrobe.querySelectorAll("input[name='wardrobeItemIds']:checked")).map(c => c.value);

    if (!eventId) {
      showToast("Vui lòng chọn Chiến dịch Quyên góp!", "warning");
      return;
    }
    if (selectedIds.length === 0) {
      showToast("Vui lòng tích chọn ít nhất 1 vật phẩm từ Tủ đồ của bạn!", "warning");
      return;
    }

    const submitBtn = formWardrobe.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang gửi...`;

    try {
      await createDonationRequestApi({
        donationEventId: eventId,
        description: desc,
        wardrobeItemIds: selectedIds
      });
      showToast("Gửi yêu cầu quyên góp thành công! Cảm ơn tấm lòng của bạn.", "success");
      closeDialog();
      if (onSuccess) onSuccess();
    } catch (err) {
      showToast("Lỗi khi gửi quyên góp: " + err.message, "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span class="material-symbols-outlined text-sm">send</span> Gửi yêu cầu quyên góp`;
    }
  });

  // Submit Tab 2: Quick Custom Item (DonationRequestCustomReq via FormData)
  formCustom?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const eventId = formCustom.querySelector("select[name='donationEventId']")?.value;
    if (!eventId) {
      showToast("Vui lòng chọn Chiến dịch Quyên góp!", "warning");
      return;
    }

    const submitBtn = formCustom.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang tạo & gửi...`;

    try {
      const fd = new FormData(formCustom);
      await createDonationRequestCustomApi(fd);
      showToast("Tạo & quyên góp món đồ mới thành công!", "success");
      closeDialog();
      if (onSuccess) onSuccess();
    } catch (err) {
      showToast("Lỗi khi tạo quyên góp: " + err.message, "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span class="material-symbols-outlined text-sm">send</span> Gửi yêu cầu quyên góp`;
    }
  });
}
