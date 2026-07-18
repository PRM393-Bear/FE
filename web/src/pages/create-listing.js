/**
 * EcoCycle Web - Create Product Listing Page
 * Handles manual listing flow, client-side image compression, preview, publish, and exception draft flow.
 */

import "../styles/create-listing.css";
import {
  createProduct,
  updateProduct,
  getProductById,
  markDraftProductId,
  unmarkDraftProductId,
  isDraftProduct,
  uploadProductImage,
} from "../services/product.service.js";
import { isAuthenticated } from "../services/auth.service.js";
import { getAllCategories } from "../services/staff.service.js";
import { compressImage } from "../utils/image.js";

export function renderCreateListingPage(container) {
  // 1. Auth Guard
  if (!isAuthenticated()) {
    window.location.hash = "#/login";
    return;
  }

  // 2. Page State & Edit Mode Check
  let selectedImages = []; // Array of objects: { file, compressedFile, previewUrl, uploadUrl }
  let isDirty = false;
  let isSubmitting = false;

  const hashParts = window.location.hash.split("?");
  const queryParams = new URLSearchParams(hashParts[1] || "");
  const editId = queryParams.get("id");
  const isEditMode = Boolean(editId);

  // 3. Render HTML Layout
  container.innerHTML = `
    <div class="cl-wrapper">
      <div class="cl-container">
        <div class="cl-card">
          <!-- Loading Overlay -->
          <div class="cl-loading-overlay" id="cl-loading" style="display: none;">
            <div class="cl-spinner"></div>
            <p id="cl-loading-text" style="font-weight: 600; color: #006B2C;">Đang xử lý...</p>
          </div>

          <!-- Header -->
          <header class="cl-header">
            <h1 class="cl-title">${isEditMode ? 'Cập Nhật Listing' : 'Tạo Listing Mới'}</h1>
            <p class="cl-subtitle">${isEditMode ? 'Chỉnh sửa thông tin bài đăng bán hoặc bản nháp của bạn.' : 'Đăng tải sản phẩm thời trang, phụ kiện cũ của bạn để tái sinh chúng.'}</p>
          </header>

          <form id="cl-form" novalidate>
            <!-- SECTION 1: Image Upload -->
            <div class="cl-form-section">
              <h3 class="cl-section-title">
                <span class="material-symbols-outlined icon">add_a_photo</span>
                Hình ảnh sản phẩm (1 - 10 ảnh)
              </h3>
              
              <div class="cl-dropzone" id="cl-dropzone">
                <span class="material-symbols-outlined cl-dropzone-icon">cloud_upload</span>
                <p class="cl-dropzone-text">Kéo thả ảnh vào đây hoặc click để chọn ảnh</p>
                <p class="cl-dropzone-sub">Hỗ trợ định dạng JPG, PNG. Dung lượng tối đa 10MB. Hệ thống sẽ tự động tối ưu hóa chất lượng ảnh.</p>
                <input type="file" id="cl-file-input" multiple accept="image/*" style="display: none;" />
              </div>

              <div class="cl-image-grid" id="cl-image-grid">
                <!-- Image thumbnails will render dynamically -->
              </div>
            </div>

            <!-- SECTION 2: Details -->
            <div class="cl-form-section">
              <h3 class="cl-section-title">
                <span class="material-symbols-outlined icon">description</span>
                Thông tin chi tiết sản phẩm
              </h3>

              <div class="cl-row-2col">
                <div class="cl-group">
                  <label class="cl-label" for="cl-type">Phân loại đăng bán</label>
                  <select class="cl-select bg-surface-variant/40 cursor-not-allowed" id="cl-type" disabled>
                    <option value="ITEM" selected>Sản phẩm đơn lẻ (Item)</option>
                  </select>
                  <span class="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm text-primary">info</span>
                    Hệ thống chỉ hỗ trợ đăng bán sản phẩm đơn lẻ
                  </span>
                </div>

                <div class="cl-group">
                  <label class="cl-label">Danh mục</label>
                  <input type="hidden" id="cl-category" required />
                  <input type="hidden" id="cl-category-id" />
                  <div id="cl-category-bubbles" class="cl-bubble-container">
                    <span class="text-xs text-on-surface-variant flex items-center gap-1.5 py-2">
                      <span class="material-symbols-outlined text-sm animate-spin text-primary">progress_activity</span>
                      Đang tải danh mục từ hệ thống...
                    </span>
                  </div>
                </div>
              </div>

              <div class="cl-row-2col">
                <div class="cl-group">
                  <label class="cl-label" for="cl-brand">Thương hiệu</label>
                  <input type="text" class="cl-input" id="cl-brand" placeholder="Ví dụ: Nike, Uniqlo, No Brand..." required />
                </div>

                <div class="cl-group">
                  <label class="cl-label" for="cl-condition">Tình trạng độ mới</label>
                  <select class="cl-select" id="cl-condition" required>
                    <option value="" disabled selected>Chọn độ mới</option>
                    <option value="1">Mới 100% (Chưa qua sử dụng, còn tag)</option>
                    <option value="2">Mới 99% (Như mới, dùng thử 1-2 lần)</option>
                    <option value="3">Mới 95% (Hao mòn cực ít, chất lượng tốt)</option>
                    <option value="4">Cũ 80% (Hao mòn vừa phải, không lỗi rách)</option>
                    <option value="5">Cũ 60% (Cũ nhiều, giá rẻ)</option>
                  </select>
                </div>
              </div>

              <div class="cl-row-2col">
                <div class="cl-group">
                  <label class="cl-label" for="cl-color">Màu sắc</label>
                  <input type="text" class="cl-input" id="cl-color" placeholder="Ví dụ: Đen, Trắng sọc xanh..." required />
                </div>

                <div class="cl-group">
                  <label class="cl-label">Kích cỡ (Size)</label>
                  <input type="hidden" id="cl-size" required />
                  <div id="cl-size-bubbles" class="cl-bubble-container">
                    <button type="button" class="cl-bubble-chip" data-size="XS">XS</button>
                    <button type="button" class="cl-bubble-chip" data-size="S">S</button>
                    <button type="button" class="cl-bubble-chip" data-size="M">M</button>
                    <button type="button" class="cl-bubble-chip" data-size="L">L</button>
                    <button type="button" class="cl-bubble-chip" data-size="XL">XL</button>
                    <button type="button" class="cl-bubble-chip" data-size="Khác">khác</button>
                  </div>
                  <div id="cl-size-custom-container" class="hidden mt-3 animate-fade-in">
                    <input type="text" class="cl-input" id="cl-size-custom-input" placeholder="Nhập kích cỡ mong muốn (ví dụ: XXL, 39, 40, Free Size...)" />
                  </div>
                </div>
              </div>

              <div class="cl-group">
                <label class="cl-label" for="cl-tags">Tags sản phẩm (cách nhau bằng dấu phẩy)</label>
                <input type="text" class="cl-input" id="cl-tags" placeholder="Ví dụ: vintage, summer, y2k, denim..." />
              </div>
            </div>

            <!-- SECTION 3: Pricing & Delivery -->
            <div class="cl-form-section">
              <h3 class="cl-section-title">
                <span class="material-symbols-outlined icon">local_shipping</span>
                Giá bán & Giao nhận
              </h3>

              <div class="cl-row-2col">
                <div class="cl-group">
                  <label class="cl-label" for="cl-price">Giá bán (VNĐ)</label>
                  <input type="number" class="cl-input" id="cl-price" min="0" placeholder="Ví dụ: 150000" required />
                  <div id="cl-price-preview" class="text-primary font-bold text-sm mt-1.5 min-h-[20px] transition-all"></div>
                </div>

                <div class="cl-group">
                  <label class="cl-label" for="cl-delivery">Phương thức giao hàng gợi ý</label>
                  <select class="cl-select" id="cl-delivery">
                    <option value="Giao hàng nhanh (GHN)">Giao hàng nhanh (GHN)</option>
                    <option value="Giao hàng tiết kiệm (GHTK)">Giao hàng tiết kiệm (GHTK)</option>
                    <option value="Tự thỏa thuận">Người mua tự liên hệ thỏa thuận</option>
                  </select>
                </div>
              </div>

              <div class="cl-group">
                <label class="cl-label" for="cl-title-input">Tên sản phẩm (Tiêu đề tin đăng)</label>
                <input type="text" class="cl-input" id="cl-title-input" placeholder="Ví dụ: Áo khoác Blazer dáng rộng màu đen tuyền" required />
              </div>

              <div class="cl-group">
                <label class="cl-label" for="cl-description">Mô tả sản phẩm chi tiết</label>
                <textarea class="cl-textarea" id="cl-description" rows="5" placeholder="Hãy mô tả chi tiết độ mới, chất liệu vải, kích thước cụ thể hoặc các lỗi nhỏ nếu có để người mua dễ hình dung..." required></textarea>
              </div>
            </div>

            <!-- Actions Row -->
            <div class="cl-actions">
              <button type="button" class="cl-btn cl-btn--outline" id="cl-btn-preview">
                <span class="material-symbols-outlined">visibility</span> Xem trước
              </button>
              <button type="button" class="cl-btn cl-btn--secondary" id="cl-btn-draft">
                <span class="material-symbols-outlined">save</span> Lưu bản nháp
              </button>
              <button type="submit" class="cl-btn cl-btn-primary" id="cl-submit-btn">
                ${isEditMode ? 'Lưu Thay Đổi' : 'Đăng Bán Ngay'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Preview Modal Structure -->
    <div class="cl-modal-overlay" id="cl-preview-modal" style="display: none;">
      <div class="cl-modal-card">
        <div class="cl-modal-header">
          <h2 class="cl-modal-title">Xem trước tin đăng</h2>
          <button type="button" class="cl-modal-close" id="cl-modal-close-btn">&times;</button>
        </div>
        <div class="cl-modal-body" id="cl-preview-body">
          <!-- Content will load dynamically -->
        </div>
      </div>
    </div>
  `;

  // 4. Element Selectors
  const form = container.querySelector("#cl-form");
  const dropzone = container.querySelector("#cl-dropzone");
  const fileInput = container.querySelector("#cl-file-input");
  const imageGrid = container.querySelector("#cl-image-grid");
  const loadingOverlay = container.querySelector("#cl-loading");
  const loadingText = container.querySelector("#cl-loading-text");
  const previewModal = container.querySelector("#cl-preview-modal");
  const previewBody = container.querySelector("#cl-preview-body");
  const btnPreview = container.querySelector("#cl-btn-preview");
  const btnDraft = container.querySelector("#cl-btn-draft");
  const btnCloseModal = container.querySelector("#cl-modal-close-btn");

  // Dynamic Categories from Staff Service & Bubble Selection
  const categoryBubblesContainer = container.querySelector("#cl-category-bubbles");
  const hiddenCategoryInput = container.querySelector("#cl-category");
  const hiddenCategoryIdInput = container.querySelector("#cl-category-id");

  async function initCategories(initialCatName = "", initialCatId = "") {
    if (!categoryBubblesContainer) return;
    try {
      let categories = await getAllCategories();
      if (!Array.isArray(categories) || categories.length === 0) {
        categories = [
          { id: "c1", name: "Quần áo" },
          { id: "c2", name: "Áo thun / Sơ mi" },
          { id: "c3", name: "Quần dài / Short" },
          { id: "c4", name: "Váy & Đầm" },
          { id: "c5", name: "Áo khoác / Blazer" },
          { id: "c6", name: "Đồ thể thao" },
          { id: "c7", name: "Đồ ngủ / Mặc nhà" },
        ];
      }
      categoryBubblesContainer.innerHTML = categories.map((cat) => {
        const catName = cat.name || "Không tên";
        const isSelected = Boolean(
          (initialCatName && catName.toLowerCase() === initialCatName.toLowerCase()) ||
          (initialCatId && cat.id && String(cat.id).trim() === String(initialCatId).trim())
        );
        if (isSelected && hiddenCategoryInput) {
          hiddenCategoryInput.value = catName;
          if (hiddenCategoryIdInput) hiddenCategoryIdInput.value = cat.id || "";
        }
        return `
          <button type="button" class="cl-bubble-chip ${isSelected ? 'active' : ''}" data-id="${cat.id || ''}" data-name="${catName}">
            <span class="material-symbols-outlined text-sm">${isSelected ? 'check_circle' : 'circle'}</span>
            ${catName}
          </button>
        `;
      }).join("");

      categoryBubblesContainer.querySelectorAll(".cl-bubble-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          categoryBubblesContainer.querySelectorAll(".cl-bubble-chip").forEach(c => {
            c.classList.remove("active");
            const icon = c.querySelector(".material-symbols-outlined");
            if (icon) icon.textContent = "circle";
          });
          chip.classList.add("active");
          const icon = chip.querySelector(".material-symbols-outlined");
          if (icon) icon.textContent = "check_circle";

          const name = chip.getAttribute("data-name") || "";
          const id = chip.getAttribute("data-id") || "";
          if (hiddenCategoryInput) {
            hiddenCategoryInput.value = name;
            hiddenCategoryInput.dispatchEvent(new Event("change"));
          }
          if (hiddenCategoryIdInput) hiddenCategoryIdInput.value = id;
          isDirty = true;
        });
      });
    } catch (err) {
      console.warn("Failed to load staff categories for bubble selection:", err);
    }
  }
  initCategories();

  // Size Bubble Selection Logic
  const sizeBubblesContainer = container.querySelector("#cl-size-bubbles");
  const hiddenSizeInput = container.querySelector("#cl-size");
  const sizeCustomContainer = container.querySelector("#cl-size-custom-container");
  const sizeCustomInput = container.querySelector("#cl-size-custom-input");

  function setSizeValue(val) {
    if (!hiddenSizeInput) return;
    hiddenSizeInput.value = val;
    isDirty = true;
  }

  function initSizeSelection(initialSize = "") {
    if (!sizeBubblesContainer || !hiddenSizeInput) return;
    const standardSizes = ["XS", "S", "M", "L", "XL"];
    const isStandard = standardSizes.includes(initialSize.toUpperCase());
    const isOther = initialSize && !isStandard;

    sizeBubblesContainer.querySelectorAll(".cl-bubble-chip").forEach((chip) => {
      const chipSize = chip.getAttribute("data-size");
      const isActive = (chipSize && initialSize && chipSize.toUpperCase() === initialSize.toUpperCase()) || (chipSize === "Khác" && isOther);
      if (isActive) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    });

    if (isOther) {
      if (sizeCustomContainer) sizeCustomContainer.classList.remove("hidden");
      if (sizeCustomInput) sizeCustomInput.value = initialSize;
      setSizeValue(initialSize);
    } else if (isStandard) {
      if (sizeCustomContainer) sizeCustomContainer.classList.add("hidden");
      setSizeValue(initialSize.toUpperCase());
    } else {
      if (sizeCustomContainer) sizeCustomContainer.classList.add("hidden");
    }

    sizeBubblesContainer.querySelectorAll(".cl-bubble-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        sizeBubblesContainer.querySelectorAll(".cl-bubble-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        const selected = chip.getAttribute("data-size");
        if (selected === "Khác") {
          if (sizeCustomContainer) sizeCustomContainer.classList.remove("hidden");
          if (sizeCustomInput) {
            sizeCustomInput.focus();
            setSizeValue(sizeCustomInput.value.trim() || "khác");
          }
        } else {
          if (sizeCustomContainer) sizeCustomContainer.classList.add("hidden");
          setSizeValue(selected);
        }
      });
    });

    if (sizeCustomInput) {
      sizeCustomInput.addEventListener("input", () => {
        setSizeValue(sizeCustomInput.value.trim());
      });
    }
  }
  initSizeSelection();

  // Price Review Below Input
  const priceInput = container.querySelector("#cl-price");
  const pricePreview = container.querySelector("#cl-price-preview");
  function updatePricePreview() {
    if (!priceInput || !pricePreview) return;
    const val = priceInput.value ? Number(priceInput.value) : NaN;
    if (!isNaN(val) && val >= 0) {
      pricePreview.textContent = val.toLocaleString("vi-VN") + " VND";
    } else {
      pricePreview.textContent = "";
    }
  }
  if (priceInput) {
    priceInput.addEventListener("input", updatePricePreview);
    priceInput.addEventListener("change", updatePricePreview);
  }

  // 5. Image Event Handlers & Upload Progress Render
  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  });

  const MAX_CONCURRENT_UPLOADS = 3;
  let activeUploads = 0;

  async function processUploadQueue() {
    while (activeUploads < MAX_CONCURRENT_UPLOADS) {
      const nextImg = selectedImages.find(img => img.status === 'pending');
      if (!nextImg) break;

      activeUploads++;
      nextImg.status = 'uploading';
      renderImageThumbnails();

      uploadProductImage(nextImg.compressedFile).then(res => {
        nextImg.uploadUrl = res.url;
        nextImg.status = 'success';
      }).catch(err => {
        console.error("Lỗi upload ảnh:", err);
        nextImg.status = 'error';
      }).finally(() => {
        activeUploads--;
        renderImageThumbnails();
        processUploadQueue();
      });
    }
  }

  async function handleFiles(files) {
    const spaceLeft = 10 - selectedImages.length;
    if (spaceLeft <= 0) {
      alert("Bạn chỉ được tải lên tối đa 10 ảnh sản phẩm.");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, spaceLeft);
    showLoading("Đang xử lý hình ảnh...");

    for (const file of filesToProcess) {
      if (!file.type.startsWith("image/")) continue;

      try {
        const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.85 });
        const previewUrl = URL.createObjectURL(compressed);

        selectedImages.push({
          file,
          compressedFile: compressed,
          previewUrl,
          uploadUrl: null,
          status: 'pending' // pending, uploading, success, error
        });
      } catch (err) {
        console.error("Nén ảnh thất bại:", err);
      }
    }

    isDirty = true;
    hideLoading();
    renderImageThumbnails();
    processUploadQueue();
  }

  function renderImageThumbnails() {
    imageGrid.innerHTML = selectedImages
      .map(
        (img, idx) => {
          let statusOverlay = '';
          if (img.status === 'uploading') {
            statusOverlay = `<div class="cl-image-status uploading"><span class="material-symbols-outlined">progress_activity</span></div>`;
          } else if (img.status === 'error') {
            statusOverlay = `<div class="cl-image-status error cl-retry-btn" data-index="${idx}" title="Lỗi upload. Click để thử lại."><span class="material-symbols-outlined">refresh</span></div>`;
          } else if (img.status === 'success') {
            statusOverlay = `<div class="cl-image-status success"><span class="material-symbols-outlined">check_circle</span></div>`;
          }
          
          return `
      <div class="cl-image-item">
        <img src="${img.previewUrl}" alt="Preview" />
        ${statusOverlay}
        <button type="button" class="cl-image-remove" data-index="${idx}">&times;</button>
      </div>
    `;
        }
      )
      .join("");

    // Bind remove event
    imageGrid.querySelectorAll(".cl-image-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        // Revoke Object URL to free memory
        URL.revokeObjectURL(selectedImages[idx].previewUrl);
        selectedImages.splice(idx, 1);
        isDirty = true;
        renderImageThumbnails();
      });
    });

    imageGrid.querySelectorAll(".cl-retry-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        selectedImages[idx].status = 'pending';
        renderImageThumbnails();
        processUploadQueue();
      });
    });
  }

  // 6. Loading overlay utility
  function showLoading(text) {
    loadingText.textContent = text;
    loadingOverlay.style.display = "flex";
  }

  function hideLoading() {
    loadingOverlay.style.display = "none";
  }

  // 7. Input Change detection
  form.querySelectorAll("input, select, textarea").forEach((element) => {
    element.addEventListener("input", () => {
      isDirty = true;
    });
  });

  // 7.5 Load Existing Product Data if Edit Mode
  if (isEditMode && editId) {
    showLoading("Đang tải thông tin sản phẩm...");
    getProductById(editId).then(product => {
      hideLoading();
      if (!product) return;
      const isDraft = (String(product.status || '').trim().toUpperCase() === 'DRAFT') || isDraftProduct(product);
      if (!isDraft) {
        alert("Chỉ những sản phẩm với trạng thái Bản nháp (DRAFT) mới có nút chỉnh sửa bài đăng và có thể chỉnh sửa.");
        window.location.hash = "#/profile?tab=panel-shop";
        return;
      }
      if (form.querySelector("#cl-title-input")) form.querySelector("#cl-title-input").value = product.title || "";
      if (form.querySelector("#cl-description")) form.querySelector("#cl-description").value = product.description || "";
      if (form.querySelector("#cl-type")) form.querySelector("#cl-type").value = product.type || "ITEM";
      initCategories(product.category || "", product.categoryId || "");
      if (form.querySelector("#cl-brand")) form.querySelector("#cl-brand").value = product.brand || "";
      if (form.querySelector("#cl-price")) {
        form.querySelector("#cl-price").value = product.price || "";
        updatePricePreview();
      }
      initSizeSelection(product.size || "");
      if (form.querySelector("#cl-color")) form.querySelector("#cl-color").value = product.color || "";
      if (form.querySelector("#cl-condition")) form.querySelector("#cl-condition").value = product.condition || "3";
      if (product.aiTags && Array.isArray(product.aiTags)) {
        if (form.querySelector("#cl-tags")) form.querySelector("#cl-tags").value = product.aiTags.join(", ");
      }
      const existingImages = product.images || (product.imageUrl ? [product.imageUrl] : []);
      if (Array.isArray(existingImages)) {
        existingImages.forEach(url => {
          if (typeof url === 'string') {
            selectedImages.push({
              file: null,
              compressedFile: null,
              previewUrl: url,
              uploadUrl: url
            });
          }
        });
        renderImageThumbnails();
      }
      isDirty = false;
    }).catch(err => {
      hideLoading();
      console.error("Error loading product for edit:", err);
      alert("Không thể tải dữ liệu sản phẩm để chỉnh sửa.");
    });
  }

  async function uploadAllImages() {
    const isUploading = selectedImages.some(img => img.status === 'pending' || img.status === 'uploading');
    if (isUploading) {
      throw new Error("Vui lòng chờ hệ thống tải lên hình ảnh hoàn tất.");
    }
    const hasError = selectedImages.some(img => img.status === 'error');
    if (hasError) {
      throw new Error("Có ảnh tải lên bị lỗi. Vui lòng thử lại hoặc xóa ảnh lỗi.");
    }

    const urls = [];
    for (let i = 0; i < selectedImages.length; i++) {
      const img = selectedImages[i];
      if (img.uploadUrl) {
        urls.push(img.uploadUrl);
      } else {
        // Fallback for pre-existing URLs or edge cases
        if (!img.compressedFile) {
          urls.push(img.previewUrl); // Existing image url
        } else {
          showLoading(`Đang đăng tải ảnh ${i + 1}/${selectedImages.length} lên máy chủ...`);
          const res = await uploadProductImage(img.compressedFile);
          img.uploadUrl = res.url;
          img.status = 'success';
          urls.push(res.url);
        }
      }
    }
    return urls;
  }

  // 9. Save Product logic (Publish or Draft)
  async function saveProduct(status) {
    // Basic Form validation
    const category = form.querySelector("#cl-category").value;
    const categoryId = form.querySelector("#cl-category-id")?.value || "";
    const brand = form.querySelector("#cl-brand").value;
    const condition = form.querySelector("#cl-condition").value;
    const color = form.querySelector("#cl-color").value;
    const size = form.querySelector("#cl-size").value;
    const priceVal = form.querySelector("#cl-price").value;
    const title = form.querySelector("#cl-title-input").value;
    const description = form.querySelector("#cl-description").value;
    const type = "ITEM";
    const rawTags = form.querySelector("#cl-tags").value;

    if (status === "AVAILABLE") {
      // Validate all required fields for publish
      if (selectedImages.length === 0) {
        alert("Vui lòng tải lên ít nhất 1 ảnh sản phẩm.");
        return false;
      }
      if (!category || !brand || !condition || !color || !size || !priceVal || !title || !description) {
        alert("Vui lòng điền đầy đủ tất cả các trường thông tin bắt buộc.");
        return false;
      }
    } else {
      // Draft mode: Require title at minimum to save draft
      if (!title) {
        alert("Vui lòng nhập Tên sản phẩm trước khi lưu bản nháp.");
        return false;
      }
    }

    // Verify no unrelated non-fashion/electronic products are listed
    const nonFashionKeywords = [
      "điện tử", "máy tính", "điện thoại", "laptop", "tủ lạnh", "máy giặt", "xe máy", "ô tô", "đồ gia dụng", "tivi", "ti vi"
    ];
    const lowerTitle = (title || "").toLowerCase();
    const lowerDesc = (description || "").toLowerCase();
    for (const kw of nonFashionKeywords) {
      if (lowerTitle.includes(kw) || lowerDesc.includes(kw)) {
        alert("Hệ thống EcoCycle chỉ hỗ trợ đăng bán các sản phẩm Thời trang (Quần áo, phụ kiện theo danh mục quy định). Các mặt hàng điện tử, xe cộ, gia dụng không thuộc phạm vi hỗ trợ.");
        return false;
      }
    }

    try {
      showLoading("Đang xử lý dữ liệu...");

      // Upload images
      const imageUrls = await uploadAllImages();

      // Tags parse
      const tagsList = rawTags
        ? rawTags.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
        : [];

      // UUID Guard: Backend ProductReq.java requires java.util.UUID categoryId.
      // If categoryId is non-UUID (e.g. "c1", "c2" from fallback or empty string ""), send null to prevent HTTP 400 Bad Request.
      const isValidUUID = (idStr) => idStr && typeof idStr === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idStr.trim());
      const cleanCategoryId = isValidUUID(categoryId) ? categoryId.trim() : null;

      const payload = {
        title,
        description,
        category,
        categoryId: cleanCategoryId,
        type: "ITEM",
        condition: condition ? parseInt(condition, 10) : 3,
        price: priceVal ? parseInt(priceVal, 10) : 0,
        size,
        color,
        images: imageUrls,
        aiTags: tagsList,
        brand,
        status: status // AVAILABLE or DRAFT
      };

      showLoading(isEditMode ? "Đang cập nhật sản phẩm..." : (status === "AVAILABLE" ? "Đang đăng bán sản phẩm..." : "Đang lưu bản nháp..."));
      let createdProduct;
      if (isEditMode) {
        createdProduct = await updateProduct(editId, payload);
      } else {
        createdProduct = await createProduct(payload);
      }
      const createdProductId = createdProduct?.id ?? createdProduct?.productId ?? createdProduct?.data?.id ?? editId;

      if (createdProductId) {
        if (status === "DRAFT") {
          markDraftProductId(createdProductId);
        } else {
          unmarkDraftProductId(createdProductId);
        }
      }

      isDirty = false;
      isSubmitting = true;
      hideLoading();

      alert(isEditMode ? "Cập nhật sản phẩm thành công!" : (status === "AVAILABLE" ? "Đăng bán sản phẩm thành công!" : "Lưu bản nháp thành công!"));
      cleanup();
      window.location.hash = "#/profile";
      return true;
    } catch (err) {
      console.error(err);
      hideLoading();
      alert("Đã xảy ra lỗi: " + err.message);
      return false;
    }
  }

  // Bind Submit (Publish)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await saveProduct("AVAILABLE");
  });

  // Bind Save Draft
  btnDraft.addEventListener("click", async () => {
    await saveProduct("DRAFT");
  });

  // 10. Preview Modal Logic
  btnPreview.addEventListener("click", () => {
    const category = form.querySelector("#cl-category").value || "Chưa chọn danh mục";
    const brand = form.querySelector("#cl-brand").value;
    const conditionText = form.querySelector("#cl-condition").options[form.querySelector("#cl-condition").selectedIndex]?.text || "Chưa chọn";
    const color = form.querySelector("#cl-color").value || "Chưa nhập";
    const size = form.querySelector("#cl-size").value || "Chưa chọn size";
    const priceVal = form.querySelector("#cl-price").value;
    const title = form.querySelector("#cl-title-input").value || "Tên sản phẩm xem trước";
    const description = form.querySelector("#cl-description").value || "Mô tả sản phẩm...";
    const typeText = "Sản phẩm đơn lẻ (Item)";
    const rawTags = form.querySelector("#cl-tags").value;
    const delivery = form.querySelector("#cl-delivery").value;

    const formattedPrice = priceVal
      ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(priceVal)
      : "Liên hệ";

    const tagsHtml = rawTags
      ? rawTags.split(",").map((t) => `<span class="preview-tag">#${t.trim()}</span>`).join(" ")
      : "";

    const mainPreviewImage = selectedImages.length > 0
      ? selectedImages[0].previewUrl
      : "https://placehold.co/400x500/E4EBE4/6E7B6C?text=No+Image";

    const thumbnailsHtml = selectedImages
      .map((img) => `<img src="${img.previewUrl}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #DDE5DB;" />`)
      .join("");

    previewBody.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 32px; font-family:'Be Vietnam Pro',sans-serif;">
        <!-- Left: Image display mock -->
        <div>
          <div style="width: 100%; aspect-ratio: 4/5; border-radius: 16px; overflow: hidden; border: 1px solid #DDE5DB; margin-bottom: 12px; background: #f9f9f9;">
            <img src="${mainPreviewImage}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${thumbnailsHtml}
          </div>
        </div>

        <!-- Right: Info display mock -->
        <div>
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <span style="background: #E5EDE4; color: #006B2C; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">${typeText}</span>
            <span style="background: #F0F5EF; color: #6E7B6C; padding: 4px 12px; border-radius: 20px; font-size: 13px;">${category || "Chưa chọn danh mục"}</span>
          </div>

          <h2 style="font-size: 26px; font-weight: 700; color: #1E271D; margin: 0 0 12px 0; line-height: 1.3;">${title}</h2>
          <p style="font-size: 24px; font-weight: 700; color: #006B2C; margin: 0 0 24px 0;">${formattedPrice}</p>

          <div style="background: #F7FAF6; border: 1px solid #DDE5DB; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h4 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; color: #6E7B6C; letter-spacing: 0.5px;">Thông tin thuộc tính</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
              <div><strong style="color: #4A5748;">Thương hiệu:</strong> ${brand || "Chưa nhập"}</div>
              <div><strong style="color: #4A5748;">Độ mới:</strong> ${conditionText}</div>
              <div><strong style="color: #4A5748;">Màu sắc:</strong> ${color}</div>
              <div><strong style="color: #4A5748;">Kích cỡ (Size):</strong> ${size}</div>
              <div style="grid-column: span 2;"><strong style="color: #4A5748;">Vận chuyển gợi ý:</strong> ${delivery}</div>
            </div>
          </div>

          <div style="margin-bottom: 24px;">
            <h4 style="margin: 0 0 8px 0; font-size: 15px; color: #2E392D;">Mô tả sản phẩm</h4>
            <p style="font-size: 14px; color: #4A5748; line-height: 1.6; white-space: pre-wrap; margin: 0;">${description}</p>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${tagsHtml}
          </div>
        </div>
      </div>
    `;

    previewModal.style.display = "flex";
  });

  function closeModal() {
    previewModal.style.display = "none";
  }

  btnCloseModal.addEventListener("click", closeModal);
  previewModal.addEventListener("click", (e) => {
    if (e.target === previewModal) closeModal();
  });

  // 11. Exception Flow Guard: SPA hashchange & browser beforeunload
  const originalHash = "#/create-listing";

  async function hashGuard() {
    if (!isDirty || isSubmitting) return;

    const newHash = window.location.hash;
    if (newHash === originalHash) return;

    // Temporarily reset hash so visual state stays on create-listing while confirming
    window.removeEventListener("hashchange", hashGuard);
    window.location.hash = originalHash;

    const confirmSave = confirm(
      "Bạn có thay đổi chưa lưu. Bạn có muốn lưu bản nháp (Save Draft) trước khi rời đi không?\n\n" +
      "- Bấm OK để Tải ảnh, Lưu Nháp vào Tủ đồ và chuyển trang.\n" +
      "- Bấm Cancel để xem tùy chọn Rời đi không lưu."
    );

    if (confirmSave) {
      // Validate title at least to save draft
      const title = form.querySelector("#cl-title-input").value;
      if (!title) {
        alert("Cần nhập tên sản phẩm để có thể lưu bản nháp.");
        window.addEventListener("hashchange", hashGuard);
        return;
      }

      const success = await saveProduct("DRAFT");
      if (success) {
        window.location.hash = newHash;
      } else {
        window.addEventListener("hashchange", hashGuard);
      }
    } else {
      const confirmExit = confirm("Bạn có chắc chắn muốn rời đi mà không lưu bản nháp? Toàn bộ ảnh và thông tin đã nhập sẽ bị mất.");
      if (confirmExit) {
        isDirty = false;
        cleanup();
        window.location.hash = newHash;
      } else {
        window.addEventListener("hashchange", hashGuard);
      }
    }
  }

  function beforeUnloadHandler(e) {
    if (isDirty && !isSubmitting) {
      e.preventDefault();
      e.returnValue = "Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng trang?";
      return e.returnValue;
    }
  }

  // Bind guards
  window.addEventListener("hashchange", hashGuard);
  window.addEventListener("beforeunload", beforeUnloadHandler);

  // Cleanup handler
  function cleanup() {
    window.removeEventListener("hashchange", hashGuard);
    window.removeEventListener("beforeunload", beforeUnloadHandler);

    // Revoke any created Object URLs
    selectedImages.forEach((img) => {
      URL.revokeObjectURL(img.previewUrl);
    });
  }

  return cleanup;
}
