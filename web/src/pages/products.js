import "../styles/products.css";
import { getAllProducts } from "../services/product.service.js";

// Global state
let allProducts = [];
let filteredProducts = [];

/**
 * Render the Product List page
 * @param {HTMLElement} container
 */
export async function renderProductsPage(container) {
  container.innerHTML = `
    <div class="products-layout">
      <!-- Sidebar Filter -->
      <aside class="products-sidebar">
        <div class="sidebar-header">
          <h2>Bộ lọc</h2>
          <button class="btn-clear-all">Xóa tất cả</button>
        </div>

        <!-- Category Tree -->
        <div class="filter-section">
          <span class="filter-title">Danh mục</span>
          <ul class="category-list">
            <li class="category-item category-parent active" data-category="Thời trang Nam">
              <span>Thời trang Nam</span>
              <span class="material-symbols-outlined icon-sm">expand_more</span>
            </li>
            <li class="category-item category-child" data-category="Áo khoác">Áo khoác</li>
            <li class="category-item category-child" data-category="Quần dài">Quần dài</li>
            <li class="category-item category-child" data-category="Giày dép">Giày dép</li>
          </ul>
        </div>

        <!-- Price Range -->
        <div class="filter-section">
          <span class="filter-title">Khoảng giá (VNĐ)</span>
          <div class="price-slider-container">
            <input type="range" class="price-range" min="0" max="5000000" step="50000" value="0">
            <div class="price-labels">
              <span>0đ</span>
              <span>5.000.000đ+</span>
            </div>
          </div>
          <div class="price-inputs">
            <input type="number" placeholder="Từ" class="input-price input-price-min">
            <span class="price-separator">—</span>
            <input type="number" placeholder="Đến" class="input-price input-price-max">
          </div>
        </div>

        <!-- Condition Rating -->
        <div class="filter-section">
          <span class="filter-title">Tình trạng đồ</span>
          <div class="condition-list">
            <label class="checkbox-label">
              <input type="checkbox" class="checkbox-input" data-condition="5">
              <div class="star-rating">
                <span class="material-symbols-outlined filled">star</span>
                <span class="material-symbols-outlined filled">star</span>
                <span class="material-symbols-outlined filled">star</span>
                <span class="material-symbols-outlined filled">star</span>
                <span class="material-symbols-outlined filled">star</span>
              </div>
              <span class="checkbox-text">Mới tinh (5 sao)</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" class="checkbox-input" data-condition="4">
              <div class="star-rating">
                <span class="material-symbols-outlined filled">star</span>
                <span class="material-symbols-outlined filled">star</span>
                <span class="material-symbols-outlined filled">star</span>
                <span class="material-symbols-outlined filled">star</span>
                <span class="material-symbols-outlined unfilled">star</span>
              </div>
              <span class="checkbox-text">Rất tốt (4 sao)</span>
            </label>
             <label class="checkbox-label">
              <input type="checkbox" class="checkbox-input" data-condition="3">
              <div class="star-rating">
                <span class="material-symbols-outlined filled">star</span>
                <span class="material-symbols-outlined filled">star</span>
                <span class="material-symbols-outlined filled">star</span>
                <span class="material-symbols-outlined unfilled">star</span>
                <span class="material-symbols-outlined unfilled">star</span>
              </div>
              <span class="checkbox-text">Tốt (3 sao)</span>
            </label>
          </div>
        </div>

        <!-- Size Chips -->
        <div class="filter-section">
          <span class="filter-title">Kích cỡ</span>
          <div class="size-chips">
            <button class="chip-size" data-size="S">S</button>
            <button class="chip-size" data-size="M">M</button>
            <button class="chip-size" data-size="L">L</button>
            <button class="chip-size" data-size="XL">XL</button>
            <button class="chip-size" data-size="XXL">XXL</button>
          </div>
        </div>

        <!-- Colors -->
        <div class="filter-section">
          <span class="filter-title">Màu sắc</span>
          <div class="color-chips">
            <button class="chip-color color-black" data-color="Đen"></button>
            <button class="chip-color color-white" data-color="Trắng"></button>
            <button class="chip-color color-blue" data-color="Xanh dương"></button>
            <button class="chip-color color-red" data-color="Đỏ"></button>
            <button class="chip-color color-amber" data-color="Cam"></button>
            <button class="chip-color color-emerald" data-color="Xanh lá"></button>
          </div>
        </div>

        <!-- Type Selection -->
        <div class="filter-section">
          <span class="filter-title">Hình thức</span>
          <div class="type-list">
            <label class="radio-label">
              <input type="radio" name="product_type" class="radio-input" value="Món lẻ">
              <span class="radio-text">Món lẻ</span>
            </label>
            <label class="radio-label">
              <input type="radio" name="product_type" class="radio-input" value="Kiện đồ">
              <span class="radio-text">Kiện đồ (Bundle)</span>
            </label>
          </div>
        </div>

        <!-- Lifecycle Generation Selection -->
        <div class="filter-section">
          <span class="filter-title">Thế hệ vòng đời</span>
          <div class="lifecycle-list">
            <label class="checkbox-label">
              <input type="checkbox" class="checkbox-input lifecycle-input" data-lifecycle="1">
              <span class="checkbox-text">Thế hệ 1 (F1)</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" class="checkbox-input lifecycle-input" data-lifecycle="2">
              <span class="checkbox-text">Thế hệ 2 (F2)</span>
            </label>
             <label class="checkbox-label">
              <input type="checkbox" class="checkbox-input lifecycle-input" data-lifecycle="3">
              <span class="checkbox-text">Thế hệ 3+ (F3+)</span>
            </label>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="filter-actions">
          <button class="btn-primary btn-apply-filters">Áp dụng bộ lọc</button>
          <button class="btn-outline btn-clear-all">Thiết lập lại</button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <section class="products-main">
        <!-- Sort & View Controls -->
        <div class="products-controls">
          <div class="controls-header">
            <div class="controls-info">
              <h1>Sản phẩm</h1>
              <p class="results-count">Đang tải...</p>
            </div>
            <div class="controls-actions">
              <div class="sort-control">
                <span>Sắp xếp:</span>
                <select class="select-sort">
                  <option value="relevant">Phù hợp nhất</option>
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá thấp đến cao</option>
                  <option value="price_desc">Giá cao đến thấp</option>
                </select>
              </div>
              <div class="view-toggles">
                <button class="btn-view active">
                  <span class="material-symbols-outlined">grid_view</span>
                </button>
                <button class="btn-view">
                  <span class="material-symbols-outlined">view_list</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Active Filter Chips -->
          <div class="active-filters" id="active-filters-container">
            <!-- Will be populated dynamically -->
          </div>
        </div>

        <!-- Product Grid -->
        <div id="products-grid" class="products-grid">
          ${renderSkeletons(8)}
        </div>
        
        <!-- Pagination -->
        <nav class="pagination" id="products-pagination">
          <!-- Populated dynamically -->
        </nav>
      </section>
      
      <!-- FAB for adding items -->
      <button class="fab-add">
        <span class="material-symbols-outlined">add</span>
        <span class="fab-tooltip">Đăng tin mới</span>
      </button>
    </div>
  `;

  // Attach elements
  const gridContainer = document.getElementById("products-grid");
  const activeFiltersContainer = document.getElementById("active-filters-container");
  const resultsCount = container.querySelector(".results-count");

  // Load data
  try {
    const data = await getAllProducts();
    // Assuming status logic should only show 'available', if we had strict status. For now we just use all data.
    // allProducts = data.filter(p => p.status !== 'sold');
    allProducts = data || [];
    filteredProducts = [...allProducts];

    updateGrid();
  } catch (error) {
    gridContainer.innerHTML = `
      <div class="products-error">
        <h3>Đã xảy ra lỗi</h3>
        <p>Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.</p>
      </div>
    `;
    gridContainer.className = "products-grid-error";
    resultsCount.textContent = "Lỗi kết nối";
    return;
  }

  // --- Logic Bộ Lọc (Filter Logic) ---

  function getFiltersFromUI() {
    const filters = {
      categories: [],
      minPrice: null,
      maxPrice: null,
      conditions: [],
      sizes: [],
      colors: [],
      types: [],
      lifecycles: []
    };

    // Category
    container.querySelectorAll('.category-child[style*="font-weight: 600"]').forEach(el => {
      filters.categories.push(el.dataset.category);
    });

    // Price
    const minP = container.querySelector('.input-price-min').value;
    const maxP = container.querySelector('.input-price-max').value;
    if (minP) filters.minPrice = Number(minP);
    if (maxP) filters.maxPrice = Number(maxP);

    // Conditions
    container.querySelectorAll('input[data-condition]:checked').forEach(cb => {
      filters.conditions.push(Number(cb.dataset.condition));
    });

    // Sizes
    container.querySelectorAll('.chip-size.active').forEach(el => {
      filters.sizes.push(el.dataset.size);
    });

    // Colors
    container.querySelectorAll('.chip-color.active').forEach(el => {
      filters.colors.push(el.dataset.color);
    });

    // Types
    const typeChecked = container.querySelector('input[name="product_type"]:checked');
    if (typeChecked) {
      filters.types.push(typeChecked.value);
    }

    // Lifecycles
    container.querySelectorAll('.lifecycle-input:checked').forEach(cb => {
      filters.lifecycles.push(Number(cb.dataset.lifecycle));
    });

    return filters;
  }

  function applyFilters() {
    const filters = getFiltersFromUI();

    filteredProducts = allProducts.filter(p => {
      // Category
      if (filters.categories.length > 0 && (!p.category || !filters.categories.includes(p.category))) return false;

      // Price
      if (filters.minPrice !== null && (p.price === undefined || p.price < filters.minPrice)) return false;
      if (filters.maxPrice !== null && (p.price === undefined || p.price > filters.maxPrice)) return false;

      // Condition
      if (filters.conditions.length > 0 && (!p.condition || !filters.conditions.includes(p.condition))) return false;

      // Size
      if (filters.sizes.length > 0 && (!p.size || !filters.sizes.includes(p.size))) return false;

      // Color
      if (filters.colors.length > 0 && (!p.color || !filters.colors.includes(p.color))) return false;

      // Type
      if (filters.types.length > 0 && (!p.type || !filters.types.includes(p.type))) return false;

      // Lifecycle
      if (filters.lifecycles.length > 0 && (!p.lifecycle_generation || !filters.lifecycles.includes(p.lifecycle_generation))) return false;

      return true;
    });

    updateGrid();
    renderActiveFilterTags(filters);
  }

  function updateGrid() {
    if (filteredProducts.length > 0) {
      gridContainer.innerHTML = filteredProducts.map(renderProductCard).join("");
    } else {
      gridContainer.innerHTML = `
        <div class="products-empty">
          <h3>Không tìm thấy sản phẩm</h3>
          <p>Hãy thử thay đổi hoặc xóa bớt các tiêu chí lọc nhé!</p>
        </div>
      `;
    }
    resultsCount.textContent = `Tìm thấy ${filteredProducts.length} sản phẩm`;
  }

  function renderActiveFilterTags(filters) {
    let html = "";

    filters.categories.forEach(c => {
      html += `<div class="filter-tag" data-type="category" data-val="${c}">Danh mục: ${c} <span class="material-symbols-outlined tag-close">close</span></div>`;
    });
    if (filters.minPrice !== null || filters.maxPrice !== null) {
      const min = filters.minPrice || 0;
      const max = filters.maxPrice ? formatPrice(filters.maxPrice) : 'Trở lên';
      html += `<div class="filter-tag" data-type="price">Giá: ${formatPrice(min)} - ${max} <span class="material-symbols-outlined tag-close">close</span></div>`;
    }
    filters.conditions.forEach(c => {
      html += `<div class="filter-tag" data-type="condition" data-val="${c}">Tình trạng: ${c} sao <span class="material-symbols-outlined tag-close">close</span></div>`;
    });
    filters.sizes.forEach(s => {
      html += `<div class="filter-tag" data-type="size" data-val="${s}">Size: ${s} <span class="material-symbols-outlined tag-close">close</span></div>`;
    });
    filters.colors.forEach(c => {
      html += `<div class="filter-tag" data-type="color" data-val="${c}">Màu: ${c} <span class="material-symbols-outlined tag-close">close</span></div>`;
    });
    filters.types.forEach(t => {
      html += `<div class="filter-tag" data-type="type" data-val="${t}">Loại: ${t} <span class="material-symbols-outlined tag-close">close</span></div>`;
    });
    filters.lifecycles.forEach(l => {
      html += `<div class="filter-tag" data-type="lifecycle" data-val="${l}">Thế hệ: F${l} <span class="material-symbols-outlined tag-close">close</span></div>`;
    });

    activeFiltersContainer.innerHTML = html;
  }

  function removeFilter(type, val) {
    if (type === 'category') {
      container.querySelectorAll(`.category-child[data-category="${val}"]`).forEach(el => {
        el.style.fontWeight = 'normal';
        el.style.color = 'var(--on-surface-variant)';
      });
    } else if (type === 'price') {
      container.querySelector('.input-price-min').value = "";
      container.querySelector('.input-price-max').value = "";
    } else if (type === 'condition') {
      container.querySelector(`input[data-condition="${val}"]`).checked = false;
    } else if (type === 'size') {
      container.querySelector(`.chip-size[data-size="${val}"]`).classList.remove('active');
    } else if (type === 'color') {
      container.querySelector(`.chip-color[data-color="${val}"]`).classList.remove('active');
    } else if (type === 'type') {
      const el = container.querySelector(`input[name="product_type"][value="${val}"]`);
      if (el) el.checked = false;
    } else if (type === 'lifecycle') {
      container.querySelector(`input[data-lifecycle="${val}"]`).checked = false;
    }
    applyFilters();
  }

  // --- Gắn Sự Kiện (Events) ---

  // Nút Áp dụng bộ lọc
  const btnApplyFilters = container.querySelector('.btn-apply-filters');
  if (btnApplyFilters) {
    btnApplyFilters.addEventListener('click', () => {
      applyFilters();
    });
  }

  // Nút Xóa tất cả
  container.querySelectorAll('.btn-clear-all').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.checkbox-input').forEach(cb => cb.checked = false);
      container.querySelectorAll('input[name="product_type"]').forEach(cb => cb.checked = false);
      container.querySelector('.input-price-min').value = "";
      container.querySelector('.input-price-max').value = "";
      const range = container.querySelector('.price-range');
      if (range) range.value = 0;
      container.querySelectorAll('.chip-size, .chip-color').forEach(el => el.classList.remove('active'));
      container.querySelectorAll('.category-child').forEach(c => {
        c.style.fontWeight = 'normal';
        c.style.color = 'var(--on-surface-variant)';
      });
      applyFilters();
    });
  });

  // Tag Close
  if (activeFiltersContainer) {
    activeFiltersContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('tag-close')) {
        const tag = e.target.closest('.filter-tag');
        removeFilter(tag.dataset.type, tag.dataset.val);
      }
    });
  }

  // UI Interactive events
  const sizeChipsContainer = container.querySelector('.size-chips');
  if (sizeChipsContainer) {
    sizeChipsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('chip-size')) e.target.classList.toggle('active');
    });
  }

  const colorChipsContainer = container.querySelector('.color-chips');
  if (colorChipsContainer) {
    colorChipsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('chip-color')) e.target.classList.toggle('active');
    });
  }

  const categoryList = container.querySelector('.category-list');
  if (categoryList) {
    categoryList.addEventListener('click', (e) => {
      const item = e.target.closest('.category-child');
      if (item) {
        // Toggle category
        if (item.style.fontWeight === '600') {
          item.style.fontWeight = 'normal';
          item.style.color = 'var(--on-surface-variant)';
        } else {
          item.style.fontWeight = '600';
          item.style.color = 'var(--primary)';
        }
      }
    });
  }

  const viewToggles = container.querySelector('.view-toggles');
  if (viewToggles) {
    viewToggles.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-view');
      if (btn && gridContainer) {
        viewToggles.querySelectorAll('.btn-view').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.innerHTML.includes('view_list')) {
          gridContainer.style.gridTemplateColumns = '1fr';
        } else {
          gridContainer.style.gridTemplateColumns = '';
        }
      }
    });
  }
}


function formatPrice(price) {
  if (!price && price !== 0) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
}

function renderProductCard(product) {
  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : "https://placehold.co/400x533/E4EBE4/6E7B6C?text=No+Image";

  const price = product.price || 0;
  const originalPrice = price ? price * 1.3 : null;
  const sellerInitial = (product.sellerName || "S")[0].toUpperCase();


  const category = product.category || "Khác";
  const size = product.size || "Free Size";

  const isPremium = product.lifecycle_generation === 1 || product.condition === 5;

  return `
  <a href="#/product/${product.id}" class="product-card group">
    <div class="product-card__image-container">
      <img src="${imageUrl}" alt="${product.title}" class="product-card__image" loading="lazy" />
      <button class="product-card__favorite" aria-label="Add to favorites" onclick="event.preventDefault()">
        <span class="material-symbols-outlined">favorite</span>
      </button>
      ${isPremium ? `<div class="product-card__premium-badge">Đồ tuyển</div>` : ""}
    </div>

    <div class="product-card__content">
      <span class="product-card__category-size">${category} • Size ${size}</span>
      <h3 class="product-card__title">${product.title || "Sản phẩm không có tên"}</h3>

      <div class="product-card__price-wrapper">
        <span class="product-card__price">${formatPrice(price)}</span>
        ${originalPrice ? `<span class="product-card__price-original">${formatPrice(originalPrice)}</span>` : ""}
      </div>

      <div class="product-card__seller">
        <div class="product-card__seller-avatar">${sellerInitial}</div>
        <span class="product-card__seller-name">${product.sellerName || "Người bán ẩn danh"}</span>
      </div>
    </div>
  </a>
  `;
}


function renderSkeletons(count) {
  return Array(count)
    .fill(0)
    .map(
      () => `
        <div class="skeleton-card">
          <div class="skeleton-image-container"></div>
          <div class="skeleton-content">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line price"></div>
          </div>
        </div>
      `
    )
    .join("");
}
