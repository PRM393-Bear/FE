import '../styles/products.css';
import { getAllProducts } from '../services/product.service.js';

/**
 * Render the Product List page
 * @param {HTMLElement} container 
 */
export async function renderProductsPage(container) {
  container.innerHTML = `
    <div class="products-container">
      <div class="products-header">
        <h1>Khám phá Sản phẩm</h1>
        <p>Tìm kiếm những món đồ cũ chất lượng, góp phần bảo vệ môi trường.</p>
      </div>
      <div id="products-grid" class="products-grid">
        ${renderSkeletons(8)}
      </div>
    </div>
  `;

  const gridContainer = document.getElementById('products-grid');

  try {
    const products = await getAllProducts();
    
    if (products && products.length > 0) {
      gridContainer.innerHTML = products.map(renderProductCard).join('');
    } else {
      gridContainer.innerHTML = `
        <div class="products-empty">
          <h3>Chưa có sản phẩm nào</h3>
          <p>Hiện tại chưa có sản phẩm nào được đăng bán. Vui lòng quay lại sau!</p>
        </div>
      `;
    }
  } catch (error) {
    gridContainer.innerHTML = `
      <div class="products-error">
        <h3>Đã xảy ra lỗi</h3>
        <p>Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.</p>
      </div>
    `;
    // Remove grid class to allow error message to span full width nicely
    gridContainer.className = ''; 
  }
}

/**
 * Format price to VND
 */
function formatPrice(price) {
  if (!price && price !== 0) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Map condition enum to readable text
 */
function getConditionText(condition) {
  switch(condition) {
    case 1: return 'Mới (Nguyên tag)';
    case 2: return 'Như mới';
    case 3: return 'Tốt';
    case 4: return 'Khá';
    case 5: return 'Đã sử dụng nhiều';
    default: return 'Khác';
  }
}

/**
 * Helper to render a single product card
 */
function renderProductCard(product) {
  const imageUrl = (product.images && product.images.length > 0) 
    ? product.images[0] 
    : 'https://placehold.co/400x400/E4EBE4/6E7B6C?text=No+Image';

  // Mocked rating (e.g. 4.8 or 5.0) since it's missing in backend response
  const mockedRating = (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
  const sellerInitial = (product.sellerName || 'S')[0].toUpperCase();

  return `
    <a href="#/product/${product.id}" class="product-card">
      <img src="${imageUrl}" alt="${product.title}" class="product-card__image" loading="lazy" />
      ${product.condition ? `<div class="product-card__condition">${getConditionText(product.condition)}</div>` : ''}
      
      <div class="product-card__content">
        <h3 class="product-card__title">${product.title || 'Sản phẩm không có tên'}</h3>
        <div class="product-card__price">${formatPrice(product.price)}</div>
        
        <div class="product-card__meta">
          <div class="product-card__rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            ${mockedRating}
          </div>
          <div class="product-card__seller">
            <div class="product-card__seller-avatar">${sellerInitial}</div>
            <span>${product.sellerName || 'Eco Seller'}</span>
          </div>
        </div>
      </div>
    </a>
  `;
}

/**
 * Helper to render loading skeletons
 */
function renderSkeletons(count) {
  return Array(count).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line price"></div>
        <div class="skeleton-meta">
          <div class="skeleton-line short" style="width: 40px; margin: 0;"></div>
          <div class="skeleton-avatar"></div>
        </div>
      </div>
    </div>
  `).join('');
}
