import '../styles/product-detail.css';
import { getProductById } from '../services/product.service.js';

export async function renderProductDetailPage(container, productId) {
  // Render loading skeleton
  container.innerHTML = `
    <div class="pd-container">
      <div class="pd-breadcrumb">
        <a href="#/products">Sản phẩm</a> / Đang tải...
      </div>
      <div class="pd-loading-layout">
        <div class="pd-skeleton-img"></div>
        <div>
          <div class="pd-skeleton-line"></div>
          <div class="pd-skeleton-line short"></div>
          <div class="pd-skeleton-line tall" style="margin-top: 24px;"></div>
          <div class="pd-skeleton-line" style="margin-top: 40px;"></div>
          <div class="pd-skeleton-line"></div>
          <div class="pd-skeleton-line"></div>
        </div>
      </div>
    </div>
  `;

  try {
    const product = await getProductById(productId);
    
    // Format variables
    const priceFormatted = product.price != null ? product.price.toLocaleString('vi') + 'đ' : 'Liên hệ';
    const conditionText = getConditionText(product.condition);
    const sellerName = product.sellerName || 'Eco Seller';
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=006B2C&color=fff`;
    
    const mainImageUrl = (product.images && product.images.length > 0) 
      ? product.images[0] 
      : 'https://placehold.co/800x800/E4EBE4/6E7B6C?text=No+Image';

    const thumbnailsHtml = (product.images && product.images.length > 1) 
      ? `
        <div class="pd-thumbnails">
          ${product.images.map((img, idx) => `
            <img src="${img}" alt="Thumbnail ${idx}" class="pd-thumb ${idx === 0 ? 'is-active' : ''}" onclick="window.updateMainImage(this, '${img}')" />
          `).join('')}
        </div>
      ` : '';

    const sizeAttr = product.size ? `<span class="pd-attr-tag">Size: ${product.size}</span>` : '';
    const colorAttr = product.color ? `<span class="pd-attr-tag">Màu: ${product.color}</span>` : '';
    const typeAttr = product.type ? `<span class="pd-attr-tag">Loại: ${product.type}</span>` : '';
    const categoryAttr = product.category ? `<span class="pd-attr-tag">Danh mục: ${product.category}</span>` : '';

    container.innerHTML = `
      <div class="pd-container">
        <div class="pd-breadcrumb">
          <a href="#/">Trang chủ</a> / <a href="#/products">Sản phẩm</a> / <span style="color: #1A1A1A;">${product.title || 'Chi tiết sản phẩm'}</span>
        </div>
        
        <div class="pd-layout">
          <!-- Left: Gallery -->
          <div class="pd-gallery">
            <img src="${mainImageUrl}" alt="${product.title || 'Product Image'}" class="pd-image-main" id="pd-main-img" />
            ${thumbnailsHtml}
          </div>

          <!-- Right: Info -->
          <div class="pd-info">
            <h1 class="pd-title">${product.title || 'Sản phẩm không có tên'}</h1>
            <div class="pd-price">${priceFormatted}</div>
            
            <div class="pd-attributes">
              <span class="pd-attr-tag">${conditionText}</span>
              ${categoryAttr}
              ${typeAttr}
              ${sizeAttr}
              ${colorAttr}
            </div>

            <p class="pd-description">${product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}</p>

            <div class="pd-seller">
              <img src="${avatarUrl}" alt="${sellerName}" class="pd-seller-avatar" />
              <div class="pd-seller-info">
                <h3 class="pd-seller-name">${sellerName}</h3>
                <p class="pd-seller-role">Người bán</p>
              </div>
              <button class="pd-seller-action" onclick="alert('Tính năng Nhắn tin sẽ sớm ra mắt!')">Nhắn tin</button>
            </div>

            <div class="pd-actions">
              <button class="pd-btn-primary" onclick="alert('Đã thêm ${product.title} vào giỏ hàng!')">Thêm vào giỏ</button>
              <button class="pd-btn-secondary" onclick="alert('Tính năng Mua ngay sẽ sớm ra mắt!')">Mua ngay</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Expose function for thumbnail click
    window.updateMainImage = function(element, newSrc) {
      document.getElementById('pd-main-img').src = newSrc;
      document.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('is-active'));
      element.classList.add('is-active');
    };

  } catch (error) {
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
