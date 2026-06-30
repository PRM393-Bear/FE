import "../styles/product-detail.css";
import { getProductById, getAllProducts } from "../services/product.service.js";
import { getConditionLabel, getConditionPercentage } from "../utils/conditionMapping.js";
import { createOrder } from "../services/order.service.js";
import { showToast } from "../utils/ui.js";

/**
 * Render the Product Detail Page
 * @param {HTMLElement} container - The main container to render into
 * @param {string} productId - The dynamic product ID from the route
 */
export async function renderProductDetailPage(container, productId) {
  // Render loading skeleton matching the grid
  container.innerHTML = `
    <div class="pd-container">
      <div class="pd-breadcrumb">
        <a href="#/">Trang chủ</a> <span class="separator">chevron_right</span>
        <a href="#/products">Sản phẩm</a> <span class="separator">chevron_right</span>
        <span class="current">Đang tải...</span>
      </div>
      <div class="pd-loading-layout">
        <div class="pd-skeleton-img pulse"></div>
        <div>
          <div class="pd-skeleton-line pulse" style="width: 30%;"></div>
          <div class="pd-skeleton-line pulse tall" style="width: 70%; margin-top: 24px;"></div>
          <div class="pd-skeleton-line pulse" style="width: 40%; margin-top: 16px;"></div>
          <div class="pd-skeleton-line pulse" style="width: 100%; height: 120px; margin-top: 40px;"></div>
          <div class="pd-skeleton-line pulse" style="width: 100%; height: 60px; margin-top: 24px;"></div>
        </div>
      </div>
    </div>
  `;

  try {
    const product = await getProductById(productId);

    // Helpers
    const formatPrice = (price) => {
      if (!price && price !== 0) return "Liên hệ";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(price);
    };

    const getConditionText = (cond) => {
      // Use shared condition mapping
      const percentage = getConditionPercentage(cond);
      const label = getConditionLabel(cond);
      return `${label} (${percentage}%)`;
    };

    const getLifecycleText = (gen) => {
      switch (gen) {
        case 1: return "Vòng đời thứ 1 🌱";
        case 2: return "Vòng đời thứ 2 🔄";
        case 3: return "Vòng đời thứ 3+ ♻️";
        default: return "Vòng đời thứ 2 🔄";
      }
    };

    // Extract product details
    const priceFormatted = formatPrice(product.price);
    const conditionText = getConditionText(product.condition);
    const lifecycleText = getLifecycleText(product.lifecycleGeneration);
    const sellerName = product.sellerName || "Eco Seller";
    const sellerAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=006B2C&color=fff`;
    
    const imageCount = product.images ? product.images.length : 0;
    const mainImageUrl = imageCount > 0 ? product.images[0] : "https://placehold.co/800x800/E4EBE4/6E7B6C?text=No+Image";

    // Build Gallery Thumbnails
    let thumbnailsHtml = "";
    if (imageCount > 1) {
      thumbnailsHtml = `
        <div class="pd-thumbnails">
          ${product.images.slice(0, 4).map((img, idx) => {
            const isActive = idx === 0 ? "is-active" : "";
            const isLast = idx === 3 && imageCount > 4;
            const remaining = imageCount - 4;
            return `
              <div class="pd-thumb-container ${isActive}" data-idx="${idx}" data-src="${img}">
                <img src="${img}" alt="Thumbnail ${idx + 1}" class="pd-thumb-img" />
                ${isLast ? `<div class="pd-thumb-overlay">+${remaining + 1}</div>` : ""}
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    // AI appraisal tags list
    const aiTagsList = product.aiTags && product.aiTags.length > 0
      ? product.aiTags.map(tag => `<span class="pd-attr-tag" style="background:rgba(0,107,44,0.05); color:var(--primary); margin: 0 4px 4px 0; display:inline-block; font-size:13px; font-weight:500;">#${tag}</span>`).join("")
      : "";

    const aiAnalysisText = `
      Hệ thống AI đã phân tích cấu trúc sợi vải, đường may và tag nhãn qua hình ảnh cung cấp. Kết quả giám định cho thấy đây là sản phẩm thuộc danh mục <strong>${product.category || "Khác"}</strong>. Tình trạng vải đạt chất lượng tốt, form dáng được bảo tồn ở mức <strong>${conditionText}</strong>.
      ${aiTagsList ? `<br/><br/><strong>Nhãn AI nhận diện:</strong><br/>${aiTagsList}` : ""}
    `;

    // Populate Page Structure
    container.innerHTML = `
      <div class="pd-container">
        <!-- Breadcrumbs -->
        <nav class="pd-breadcrumb">
          <a href="#/">Trang chủ</a>
          <span class="material-symbols-outlined separator">chevron_right</span>
          <a href="#/products">Sản phẩm</a>
          <span class="material-symbols-outlined separator">chevron_right</span>
          <span class="current">${product.title || "Chi tiết sản phẩm"}</span>
        </nav>
        
        <div class="pd-layout">
          <!-- Left Side: Image Gallery -->
          <div class="pd-gallery-section">
            <div class="pd-gallery">
              <div class="pd-image-wrapper">
                <img src="${mainImageUrl}" alt="${product.title || "Product Image"}" class="pd-image-main" id="pd-main-img" />
                <button class="pd-zoom-btn" onclick="alert('Đang hiển thị ảnh kích thước đầy đủ!')">
                  <span class="material-symbols-outlined">zoom_in</span>
                </button>
              </div>
              ${thumbnailsHtml}
            </div>
          </div>

          <!-- Right Side: Product Buy Panel -->
          <div class="pd-info-section">
            <div class="pd-sticky-panel">
              <div class="pd-meta-header">
                <span class="pd-lifecycle-badge">
                  ${lifecycleText}
                </span>
                <div class="pd-rating-badge">
                  <span class="material-symbols-outlined star-icon">star</span>
                  <span class="pd-rating-text">4.5</span>
                  <span class="pd-rating-count">(8 đánh giá)</span>
                </div>
              </div>

              <h1 class="pd-title">${product.title || "Sản phẩm không có tên"}</h1>
              
              <div class="pd-price-row">
                <p class="pd-price">${priceFormatted}</p>
                <span class="pd-ai-badge">AI đánh giá: ${product.condition >= 4 ? "Khá" : "Tốt"}</span>
              </div>

              <!-- Attributes Grid -->
              <div class="pd-attributes-grid">
                <div class="pd-attribute-item">
                  <p class="pd-attribute-label">Kích cỡ</p>
                  <p class="pd-attribute-value">Size ${product.size || "Free Size"}</p>
                </div>
                <div class="pd-attribute-item">
                  <p class="pd-attribute-label">Màu sắc</p>
                  <p class="pd-attribute-value">${product.color || "Khác"}</p>
                </div>
                <div class="pd-attribute-item">
                  <p class="pd-attribute-label">Danh mục</p>
                  <p class="pd-attribute-value">${product.category || "Thời trang"}</p>
                </div>
              </div>

              <!-- Seller Card -->
              <div class="pd-seller-card">
                <div class="pd-seller-left">
                  <div class="pd-seller-img-wrapper">
                    <img src="${sellerAvatarUrl}" alt="${sellerName}" class="pd-seller-img" />
                  </div>
                  <div class="pd-seller-details">
                    <h4 class="pd-seller-title">${sellerName}</h4>
                    <div class="pd-seller-rating">
                      <span class="material-symbols-outlined star-icon">star</span>
                      <span>4.8</span>
                    </div>
                  </div>
                </div>
                <a class="pd-seller-link" href="#/products">Xem shop →</a>
              </div>

              <!-- Shipping Info -->
              <div class="pd-shipping-info">
                <div class="pd-shipping-item">
                  <span class="material-symbols-outlined icon">location_on</span>
                  <span class="pd-shipping-text">Quận 1, TP. Hồ Chí Minh</span>
                </div>
                <div class="pd-shipping-item">
                  <span class="material-symbols-outlined icon">local_shipping</span>
                  <span class="pd-shipping-text">Giao hàng toàn quốc (25.000₫)</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="pd-actions-wrapper">
                <button class="pd-btn-buy" id="btn-buy-now">
                  <span class="material-symbols-outlined">shopping_bag</span>
                  Mua ngay
                </button>
                <div class="pd-secondary-actions">
                  <button class="pd-btn-chat" onclick="alert('Tính năng Nhắn tin sẽ sớm ra mắt!')">
                    <span class="material-symbols-outlined">chat</span>
                    Chat với seller
                  </button>
                  <button class="pd-btn-fav" aria-label="Add to favorites">
                    <span class="material-symbols-outlined">favorite</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Details Tabs -->
        <div class="pd-tabs-section">
          <div class="pd-tabs-header">
            <button class="pd-tab-btn is-active" data-target="desc-panel">Mô tả sản phẩm</button>
            <button class="pd-tab-btn" data-target="ai-panel">AI Analysis</button>
          </div>
          <div class="pd-tabs-content">
            <!-- Description Panel -->
            <div class="pd-tab-panel is-active" id="desc-panel">
              <div class="pd-description-content">
                <h3>Thông tin chi tiết</h3>
                <p>${product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}</p>
                <ul>
                  <li>Độ mới: ${conditionText}</li>
                  <li>Hình thức: ${product.type === "BUNDLE" ? "Kiện đồ (Bundle)" : "Món lẻ"}</li>
                  <li>Nguồn gốc: Đồ cũ tuyển chọn bảo vệ môi trường</li>
                </ul>
              </div>
            </div>
            <!-- AI Panel -->
            <div class="pd-tab-panel" id="ai-panel">
              <div class="pd-ai-content">
                <div class="pd-ai-header">
                  <span class="material-symbols-outlined">auto_awesome</span>
                  <h3>Kết quả giám định AI</h3>
                </div>
                <p class="pd-ai-text">${aiAnalysisText}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Other Listings from Seller -->
        <section class="pd-listings-section" id="pd-seller-listings-section">
          <div class="pd-listings-header">
            <h2 class="pd-listings-title">Sản phẩm khác từ ${sellerName}</h2>
            <a class="pd-listings-link" href="#/products">Tất cả sản phẩm <span class="material-symbols-outlined icon">arrow_right_alt</span></a>
          </div>
          <div class="pd-listings-grid" id="pd-seller-listings">
            <!-- Dynamic loading -->
          </div>
        </section>

        <!-- Similar Products -->
        <section class="pd-listings-section" id="pd-similar-listings-section">
          <h2 class="pd-listings-title" style="margin-bottom: 24px;">Sản phẩm tương tự</h2>
          <div class="pd-listings-grid" id="pd-similar-listings">
            <!-- Dynamic loading -->
          </div>
        </section>
      </div>
    `;

    // --- Interactive Page Event Listeners ---

    // 1. Thumbnail Image Switcher
    const thumbs = container.querySelectorAll(".pd-thumb-container");
    const mainImg = container.querySelector("#pd-main-img");
    thumbs.forEach(thumb => {
      thumb.addEventListener("click", () => {
        thumbs.forEach(t => t.classList.remove("is-active"));
        thumb.classList.add("is-active");
        if (mainImg) {
          mainImg.src = thumb.dataset.src;
        }
      });
    });

    // 2. Tab Switcher
    const tabBtns = container.querySelectorAll(".pd-tab-btn");
    const tabPanels = container.querySelectorAll(".pd-tab-panel");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        tabBtns.forEach(b => b.classList.remove("is-active"));
        tabPanels.forEach(p => p.classList.remove("is-active"));
        
        btn.classList.add("is-active");
        const targetPanel = container.querySelector(`#${btn.dataset.target}`);
        if (targetPanel) {
          targetPanel.classList.add("is-active");
        }
      });
    });

    // 3. Favorite Button Toggler
    const favBtn = container.querySelector(".pd-btn-fav");
    if (favBtn) {
      favBtn.addEventListener("click", () => {
        favBtn.classList.toggle("is-favorited");
        const isFav = favBtn.classList.contains("is-favorited");
        const iconSpan = favBtn.querySelector(".material-symbols-outlined");
        if (iconSpan) {
          iconSpan.style.fontVariationSettings = isFav ? "'FILL' 1" : "'FILL' 0";
        }
      });
    }

    // 4. Buy Now Button Handler
    const buyBtn = container.querySelector("#btn-buy-now");
    if (buyBtn) {
      buyBtn.addEventListener("click", async () => {
        try {
          buyBtn.disabled = true;
          await createOrder(product.id);
          showToast("Đơn hàng đã được gửi tới người bán. Hãy theo dõi tại Tủ đồ cá nhân -> Đơn mua hàng!", "success");
          // Redirect to profile orders tab inside wardrobe
          window.location.hash = "#/profile?tab=panel-wardrobe&sub=wardrobe-orders";
        } catch (err) {
          console.error("Lỗi đặt mua hàng:", err);
          showToast(`Đặt mua thất bại: ${err.message}`, "error");
        } finally {
          buyBtn.disabled = false;
        }
      });
    }

    // --- Dynamic Listings Loading (Seller listings & Similar listings) ---
    try {
      const allProducts = await getAllProducts();
      
      // Other listings from seller (excluding current product)
      const sellerProducts = allProducts.filter(
        p => p.sellerId === product.sellerId && p.id !== product.id
      ).slice(0, 4);

      // Similar products in same category (excluding current product & current seller)
      let similarProducts = allProducts.filter(
        p => p.category === product.category && p.id !== product.id && p.sellerId !== product.sellerId
      ).slice(0, 4);

      // Fill in with other same category products if not enough
      if (similarProducts.length < 4) {
        const extraSimilar = allProducts.filter(
          p => p.category === product.category && p.id !== product.id && !similarProducts.some(s => s.id === p.id)
        ).slice(0, 4 - similarProducts.length);
        similarProducts = [...similarProducts, ...extraSimilar];
      }

      // Render Seller Listings
      const sellerListingsContainer = container.querySelector("#pd-seller-listings");
      if (sellerListingsContainer) {
        if (sellerProducts.length > 0) {
          sellerListingsContainer.innerHTML = sellerProducts.map(p => {
            const img = p.images && p.images.length > 0 ? p.images[0] : "https://placehold.co/400x533/E4EBE4/6E7B6C?text=No+Image";
            const priceK = p.price ? `${Math.round(p.price / 1000)}k` : "Liên hệ";
            return `
              <a href="#/product/${p.id}" class="pd-card">
                <div class="pd-card-img-wrapper">
                  <img src="${img}" alt="${p.title}" class="pd-card-img" loading="lazy" />
                  <span class="pd-card-price-badge">${priceK}</span>
                </div>
                <h4 class="pd-card-title">${p.title || "Sản phẩm không có tên"}</h4>
                <p class="pd-card-meta">Size ${p.size || "Free"} | ${getConditionText(p.condition)}</p>
              </a>
            `;
          }).join("");
        } else {
          const section = container.querySelector("#pd-seller-listings-section");
          if (section) section.style.display = "none";
        }
      }

      // Render Similar Listings
      const similarListingsContainer = container.querySelector("#pd-similar-listings");
      if (similarListingsContainer) {
        if (similarProducts.length > 0) {
          similarListingsContainer.innerHTML = similarProducts.map(p => {
            const img = p.images && p.images.length > 0 ? p.images[0] : "https://placehold.co/400x533/E4EBE4/6E7B6C?text=No+Image";
            return `
              <a href="#/product/${p.id}" class="pd-similar-card pd-card">
                <div class="pd-card-img-wrapper">
                  <img src="${img}" alt="${p.title}" class="pd-card-img" loading="lazy" />
                </div>
                <span class="pd-similar-category">${p.category || "Khác"}</span>
                <h3 class="pd-similar-title">${p.title || "Sản phẩm không có tên"}</h3>
                <p class="pd-similar-price">${p.price ? p.price.toLocaleString("vi") + "₫" : "Liên hệ"}</p>
              </a>
            `;
          }).join("");
        } else {
          const section = container.querySelector("#pd-similar-listings-section");
          if (section) section.style.display = "none";
        }
      }

    } catch (apiErr) {
      console.error("Failed to load seller/similar listings:", apiErr);
      // Hide sections on API failure
      const s1 = container.querySelector("#pd-seller-listings-section");
      const s2 = container.querySelector("#pd-similar-listings-section");
      if (s1) s1.style.display = "none";
      if (s2) s2.style.display = "none";
    }

  } catch (error) {
    console.error("Failed to fetch product details:", error);
    container.innerHTML = `
      <div class="pd-container">
        <div class="pd-error">
          <h2>Không tìm thấy sản phẩm!</h2>
          <p>Sản phẩm này có thể đã bị xóa hoặc đường dẫn không hợp lệ.</p>
          <br/>
          <a href="#/products" class="pd-btn-primary" style="text-decoration:none; display:inline-block; max-width:200px;">Quay lại danh sách</a>
        </div>
      </div>
    `;
  }
}
