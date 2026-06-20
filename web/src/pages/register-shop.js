import "../styles/register-shop.css";
import { registerApi } from "../services/auth.service.js";

export function renderRegisterShopPage(container) {
  container.innerHTML = `
    <main class="rs-shop-main">
      <!-- Step Progress Bar -->
      <div class="rs-shop-progress">
        <div class="rs-shop-step-container">
          <div class="rs-shop-step rs-shop-step-active">1</div>
          <span class="rs-shop-step-label active">Thông tin Shop & Tài khoản</span>
        </div>
        <div class="rs-shop-line"></div>
        <div class="rs-shop-step-container">
          <div class="rs-shop-step rs-shop-step-inactive">2</div>
          <span class="rs-shop-step-label">Giấy tờ xác minh</span>
        </div>
        <div class="rs-shop-line"></div>
        <div class="rs-shop-step-container">
          <div class="rs-shop-step rs-shop-step-inactive">3</div>
          <span class="rs-shop-step-label">Xác nhận</span>
        </div>
      </div>
      
      <div class="rs-shop-grid">
        <!-- Left Column: Form -->
        <div class="rs-shop-card">
          <h2 class="rs-shop-title">Bắt đầu kinh doanh cùng Lifecycle</h2>
          <p class="rs-shop-desc">Vui lòng cung cấp thông tin chính xác để chúng tôi có thể hỗ trợ bạn tốt nhất trong quá trình vận hành Shop.</p>
          
          <form class="rs-shop-form" id="shop-form">
            <!-- Account Credentials -->
            <div class="rs-shop-section rs-shop-section-divider">
                <h3 class="rs-shop-section-title">Thông tin đăng nhập</h3>
                <div class="rs-shop-row">
                  <div class="rs-shop-input-group">
                      <label class="rs-shop-label">Tên đăng nhập *</label>
                      <input id="shop-username" type="text" required class="rs-shop-input" placeholder="my_shop_123"/>
                  </div>
                  <div class="rs-shop-input-group">
                      <label class="rs-shop-label">Email *</label>
                      <input id="shop-email" type="email" required class="rs-shop-input" placeholder="shop@example.com"/>
                  </div>
                </div>
                <div class="rs-shop-input-group">
                    <label class="rs-shop-label">Mật khẩu *</label>
                    <input id="shop-password" type="password" required class="rs-shop-input" placeholder="••••••••"/>
                </div>
            </div>

            <!-- Shop Info -->
            <div class="rs-shop-section">
              <h3 class="rs-shop-section-title">Thông tin cửa hàng</h3>
              <!-- Shop Name -->
              <div class="rs-shop-input-group">
                <label class="rs-shop-label">Tên Shop *</label>
                <input id="shop-name-input" type="text" required class="rs-shop-input" placeholder="Ví dụ: Cửa hàng Đồ Cũ Hạnh Phúc"/>
              </div>
              
              <!-- Business Type & Phone -->
              <div class="rs-shop-row">
                <div class="rs-shop-input-group">
                  <label class="rs-shop-label">Loại hình kinh doanh *</label>
                  <select class="rs-shop-input">
                    <option value="individual">Cá nhân kinh doanh</option>
                    <option value="household">Hộ kinh doanh</option>
                    <option value="company">Công ty</option>
                  </select>
                </div>
                <div class="rs-shop-input-group">
                  <label class="rs-shop-label">Số điện thoại Shop *</label>
                  <input id="shop-phone-input" type="tel" required class="rs-shop-input" placeholder="09xx xxx xxx"/>
                </div>
              </div>
              
              <!-- Main Category (Chips) -->
              <div class="rs-shop-input-group">
                <label class="rs-shop-label">Danh mục chính *</label>
                <div class="rs-shop-chips" id="category-chips">
                  <button type="button" class="rs-shop-chip active">Quần áo</button>
                  <button type="button" class="rs-shop-chip">Giày</button>
                  <button type="button" class="rs-shop-chip">Túi xách</button>
                  <button type="button" class="rs-shop-chip">Điện tử</button>
                  <button type="button" class="rs-shop-chip">Đồ nhà</button>
                  <button type="button" class="rs-shop-chip">Khác</button>
                </div>
              </div>

              <!-- Shop Description -->
              <div class="rs-shop-input-group">
                <label class="rs-shop-label">Mô tả Shop</label>
                <textarea id="shop-desc-input" rows="3" class="rs-shop-input" placeholder="Chia sẻ câu chuyện hoặc phong cách sản phẩm của bạn..."></textarea>
              </div>

              <!-- Logo Upload -->
              <div class="rs-shop-input-group">
                <label class="rs-shop-label">Logo/Avatar Shop</label>
                <div class="rs-shop-upload">
                  <div class="rs-shop-upload-box">
                    <span class="material-symbols-outlined">add_a_photo</span>
                  </div>
                  <div class="rs-shop-upload-info">
                    <p>Định dạng: JPG, PNG. Tối đa 2MB.</p>
                    <button type="button" class="rs-shop-upload-btn">Tải lên từ máy tính</button>
                  </div>
                </div>
              </div>

              <!-- Address & Map -->
              <div class="rs-shop-input-group">
                <label class="rs-shop-label">Địa chỉ Shop *</label>
                <div class="rs-shop-input-icon">
                  <input type="text" class="rs-shop-input" placeholder="Nhập địa chỉ chính xác của bạn" required/>
                  <span class="material-symbols-outlined">location_on</span>
                </div>
                <div class="rs-shop-map">
                  <div class="rs-shop-map-inner">
                    <div class="rs-shop-map-content">
                      <span class="material-symbols-outlined">map</span>
                      <p>Nhấp để chọn vị trí trên bản đồ</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Submit -->
              <button type="submit" class="rs-shop-submit">
                Đăng ký & Tiếp theo
                <span class="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Right Column: Live Preview -->
        <div class="rs-shop-preview-col">
          <div class="rs-shop-preview-sticky">
            <h3 class="rs-shop-preview-header">Xem trước cửa hàng</h3>
            
            <!-- Mobile Preview Container -->
            <div class="rs-preview-device">
              
              <!-- Preview Header -->
              <div class="rs-preview-notch">
                <div class="rs-preview-camera"></div>
              </div>
              
              <!-- Shop Hero Section -->
              <div class="rs-preview-hero">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS28YD-5YceOfYtQpxA6U55a7MsKaSSK8-v7NmGwwCSs2gJwfBRThtrzswUTwkfKC-mRZn6k6lcE7aplAdcpGW5HHGhZzWLjJ4BcGaHYN2AKa9OMUtzx5aJWRf0-hkwuI6exlvch7Vfrs_stldjbVz4kZ_A05-N5ZKP_6pVXbKQlEEQqwRQNTUW4SZfrHijwDFNLDtKAfocAI3Kwd6aEwEN8R23sG9WvmV3vewc64t29c4koryv1vIw_QqGJg7KHe_kdFeiY19vV91"/>
                <div class="rs-preview-hero-overlay"></div>
                <div class="rs-preview-avatar">
                  <span class="material-symbols-outlined" id="preview-logo">storefront</span>
                </div>
              </div>
              
              <!-- Shop Info Preview -->
              <div class="rs-preview-info">
                <h4 class="rs-preview-name" id="preview-name">Tên Shop của bạn</h4>
                <div class="rs-preview-rating">
                  <span class="material-symbols-outlined">star</span>
                  <span>5.0</span>
                  <span class="rs-preview-reviews">(0 đánh giá)</span>
                </div>
                <p class="rs-preview-desc" id="preview-desc">Mô tả cửa hàng sẽ xuất hiện ở đây...</p>
              </div>
              
              <!-- Preview Action Bar -->
              <div class="rs-preview-actions">
                <div class="rs-preview-tag active">Tất cả</div>
                <div class="rs-preview-tag inactive" id="preview-tag">Danh mục</div>
              </div>
              
              <!-- Preview Grid -->
              <div class="rs-preview-grid">
                <!-- Placeholder Items -->
                <div class="rs-preview-item"><div class="rs-preview-item-skeleton"></div></div>
                <div class="rs-preview-item"><div class="rs-preview-item-skeleton"></div></div>
                <div class="rs-preview-item"><div class="rs-preview-item-skeleton"></div></div>
                <div class="rs-preview-item"><div class="rs-preview-item-skeleton"></div></div>
              </div>
            </div>
            
            <div class="rs-preview-footer">
              <p>Shop của bạn sẽ trông như thế này trên ứng dụng di động của khách hàng.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;

  // Bind logic
  const shopNameInput = document.getElementById('shop-name-input');
  const shopDescInput = document.getElementById('shop-desc-input');
  const previewName = document.getElementById('preview-name');
  const previewDesc = document.getElementById('preview-desc');
  const categoryChips = document.querySelectorAll('#category-chips button');
  const previewTag = document.getElementById('preview-tag');

  if (shopNameInput) {
    shopNameInput.addEventListener('input', (e) => {
        if (previewName) previewName.textContent = e.target.value || "Tên Shop của bạn";
    });
  }

  if (shopDescInput) {
    shopDescInput.addEventListener('input', (e) => {
        if (previewDesc) previewDesc.textContent = e.target.value || "Chia sẻ câu chuyện hoặc phong cách sản phẩm của bạn...";
    });
  }

  categoryChips.forEach(chip => {
      chip.addEventListener('click', () => {
          categoryChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          if (previewTag) previewTag.textContent = chip.textContent;
      });
  });

  const form = document.getElementById("shop-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const username = document.getElementById("shop-username").value.trim();
    const email = document.getElementById("shop-email").value.trim();
    const password = document.getElementById("shop-password").value;
    const fullName = shopNameInput.value.trim();
    const phone = document.getElementById("shop-phone-input").value.trim();

    const btn = e.target.querySelector('button[type="submit"]');
    const originalContent = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = `<span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span> Đang lưu...`;

    try {
      await registerApi({
        fullName,
        username,
        email,
        phone,
        password,
        roleName: "SELLER"
      });
      alert('Đăng ký Shop thành công! Chuyển hướng đến Đăng nhập...');
      window.location.hash = '#/login';
    } catch (err) {
      alert(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      btn.innerHTML = originalContent;
      btn.disabled = false;
    }
  });
}
