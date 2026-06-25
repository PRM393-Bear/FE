/**
 * EcoCycle – Private Profile Dashboard & Edit Profile Page
 * Displays different tabs based on the user's role and allows profile updates.
 */
import "../styles/profile.css";
import { getMyProfile, MOCK_PROFILES, updateUserProfile } from "../services/profile.service.js";
import { showToast } from "../utils/ui.js";
import { isAuthenticated, getUser, getUserIdFromToken } from "../services/auth.service.js";
import { getAllProducts } from "../services/product.service.js";
import { getConditionPercentage } from "../utils/conditionMapping.js";

/* ══════════════════════════════════════
   HELPERS & UI GENERATORS
   ══════════════════════════════════════ */

function roleLabel(role) {
  return (
    {
      member: "Thành viên",
      org: "Tổ chức từ thiện",
      admin: "Quản trị viên",
    }[role] ?? role
  );
}

// Init default localStorage data if not present
function initLocalStorageData() {
  if (!localStorage.getItem("ecocycle_orders")) {
    const defaultOrders = [
      {
        id: "LC-882910",
        item: "Áo khoác Denim Tái chế - Levi's Custom",
        price: 450000,
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaZDUsKVsUSl_T1MujMHS-VkoTRyF3nuoV902Mbkc61pOp3HpqkaQzLNGn5vQ0vPo2SjoSRTWn6qixASQtC0YawgnDhfwt7TY1XqLa7-2koIPzpLnuJQO7EKCUCGD60-C-fa0vHI0sCjA9xpxmevIMGsbber-qhNjB4Rp_DxvyzFxlWLCAdWnlnsUlZX3lgMck-2Dh8dW-FUwlIZE3zUUzL8u9uCNeVnAfjXWd0QeoOXbRrad3bA4XqTcomJUpt9FU2utCUSMNjwpH",
        date: "14/05/2024",
        status: "Đang giao",
        statusClass: "warning",
      },
      {
        id: "LC-881504",
        item: "Đồng hồ Gốm Minimalist - White Edition",
        price: 1200000,
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOtlehQznobQSTb9cLDRgCGj1mQ_6Ba4cuDQZgupLItbfF2wC1CRt5SUSHtILhBAAsSm7z8qK9fGKBqEejPzFNH7ahCOrvyyh-NFQBEPHyDDM-9QJPhZSlh04jMqD-3esnRp9q2NC91GgP1z8IhkRQqcm4FFmERYiUXbLoPWjeiuVhpS9TUcvpoUfOlmBfaRxciFRwPw74VSRB1_bToQ9Ppeydztvg6xiufFW3N3_cJxkWVes9ubyuBM1juVh_kgiGDN7-HIqRfzqP",
        date: "02/05/2024",
        status: "Hoàn thành",
        statusClass: "success",
      },
      {
        id: "LC-880221",
        item: "Túi Tote Canvas Organic - Họa tiết Lá",
        price: 150000,
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtKw1kPEASrQlwPFqmj9SoB57dU1e4xn8q6upIvhx4glRIltNfVjOkzz5GGjp0HNKuib4wzTEk2d9lSKo_ANyAn7nX7dYaNbCS0tQ3Id7lwnQ5tb4S-NxSMT_53Do5zg8xlFFwCIDn8jvGw_GPRL3JtBu7GeVP9YIeLiT5c4W7hS6iA5EXXSPOdmhNO9tcCVtjJQRn99oy5KAPkzv9lQVBT-nFOYWwJjzCV-oPFU5QoXCB1zuNF2ksZVAAiRFDMwBPFwVWZ4WPED7e",
        date: "28/04/2024",
        status: "Hoàn thành",
        statusClass: "success",
      },
    ];
    localStorage.setItem("ecocycle_orders", JSON.stringify(defaultOrders));
  }

  if (!localStorage.getItem("ecocycle_reviews")) {
    const defaultReviews = [
      {
        id: "r1",
        author: "Quang Huy",
        avatar: "https://i.pravatar.cc/40?img=12",
        rating: 5,
        comment: "Bán hàng rất uy tín, giao hàng nhanh. Sản phẩm đúng như mô tả!",
        date: "2 ngày trước",
      },
      {
        id: "r2",
        author: "Lan Anh",
        avatar: "https://i.pravatar.cc/40?img=25",
        rating: 5,
        comment: "Chị dễ thương, đồ còn rất mới. Sẽ ủng hộ lần sau!",
        date: "1 tuần trước",
      },
      {
        id: "r3",
        author: "Minh Tú",
        avatar: "https://i.pravatar.cc/40?img=33",
        rating: 4,
        comment: "Giao dịch suôn sẻ, đồ chất lượng tốt.",
        date: "2 tuần trước",
      },
    ];
    localStorage.setItem("ecocycle_reviews", JSON.stringify(defaultReviews));
  }

  if (!localStorage.getItem("ecocycle_donations")) {
    const defaultDonations = [
      {
        id: "d1",
        org: "Tổ chức Kết nối Cộng đồng",
        items: "2 áo khoác + 1 túi xách",
        date: "15/05/2024",
        status: "Đã nhận",
        orgAvatar: "https://i.pravatar.cc/40?img=60",
      },
      {
        id: "d2",
        org: "Mái ấm Hoa Hướng Dương",
        items: "3 bộ quần áo trẻ em",
        date: "02/04/2024",
        status: "Đã nhận",
        orgAvatar: "https://i.pravatar.cc/40?img=61",
      },
      {
        id: "d3",
        org: "Tổ chức Kết nối Cộng đồng",
        items: "1 đôi giày size 38",
        date: "18/02/2024",
        status: "Đã nhận",
        orgAvatar: "https://i.pravatar.cc/40?img=60",
      },
    ];
    localStorage.setItem("ecocycle_donations", JSON.stringify(defaultDonations));
  }
}

function emptyStateHtml(icon, text) {
  return `
    <div class="empty-state">
      <span class="material-symbols-outlined empty-state-icon">${icon}</span>
      <p class="empty-state-text">${text}</p>
    </div>
  `;
}

function renderSidebarItem(id, icon, label, isActive = false) {
  return `
    <button class="sidebar-nav-item ${isActive ? "is-active" : ""}" data-target="${id}">
      <span class="material-symbols-outlined sidebar-nav-icon" data-icon="${icon}">${icon}</span>
      <span class="sidebar-nav-label">${label}</span>
    </button>
  `;
}

/* ── showToast imported from ui.js ── */

/* ══════════════════════════════════════
   TAB RENDERING FUNCTIONS
   ══════════════════════════════════════ */

function renderSettingsTab(p) {
  // Load bio and addresses from localStorage or use defaults
  const savedBio = localStorage.getItem(`profile_bio_${p.id}`) || 
    "Tôi là một người yêu thích các sản phẩm tái chế và phong cách sống tối giản. Rất mong được kết nối và trao đổi các món đồ hữu ích với cộng đồng.";
  
  return `
    <div class="dashboard-panel" id="panel-settings">
      <header class="settings-header">
        <h1 class="settings-title">Chỉnh sửa hồ sơ</h1>
        <p class="settings-subtitle">Quản lý thông tin cá nhân và cài đặt bảo mật của bạn.</p>
      </header>
      
      <div class="settings-layout-grid">
        <!-- Left: Media Uploads -->
        <div class="settings-media-col">
          <!-- Cover Photo Area -->
          <div class="cover-upload-box" onclick="alert('Tính năng tải ảnh bìa đang phát triển')">
            <div class="upload-box-content">
              <span class="material-symbols-outlined">add_a_photo</span>
              <p>Tải lên ảnh bìa</p>
            </div>
          </div>
          
          <!-- Avatar Card Area -->
          <div class="avatar-card">
            <div class="avatar-edit-wrapper">
              <img src="${p.avatar || "https://i.pravatar.cc/150?img=11"}" alt="Large Avatar" />
              <button class="btn-avatar-camera" type="button" onclick="alert('Tính năng đổi ảnh đại diện đang phát triển')">
                <span class="material-symbols-outlined">camera_alt</span>
              </button>
            </div>
            <h3 class="avatar-card-name">${p.name}</h3>
            <p class="avatar-card-role">${roleLabel(p.role)} từ 2023</p>
          </div>
          
          <!-- Profile Trust Score Badge -->
          <div class="trust-score-badge">
            <span class="material-symbols-outlined">verified</span>
            <div class="trust-score-content">
              <div class="trust-score-header">
                <span>Độ tin cậy hồ sơ</span>
                <span>85%</span>
              </div>
              <div class="trust-score-bar-bg">
                <div class="trust-score-bar-fill" style="width: 85%"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Right: Profile Form -->
        <div class="settings-form-col">
          <div class="settings-form-card">
            <form class="settings-form">
              <div class="form-row-2col">
                <!-- Full Name -->
                <div class="form-group text-left">
                  <label class="form-label">Họ và tên</label>
                  <input type="text" id="settings-fullname" class="form-input input-focus" value="${p.name}" required />
                </div>
                <!-- Phone Number -->
                <div class="form-group text-left">
                  <label class="form-label">SĐT</label>
                  <input type="tel" id="settings-phone" class="form-input input-focus" value="${p.phone}" required />
                </div>
              </div>
              
              <!-- Email (Readonly to avoid session bugs) -->
              <div class="form-group text-left">
                <label class="form-label">Email (Không thể thay đổi)</label>
                <div class="readonly-input-wrapper">
                  <input type="email" id="settings-email" class="form-input input-readonly" readonly value="${p.email}" />
                  <span class="material-symbols-outlined lock-icon">lock</span>
                </div>
              </div>
              
              <!-- About Me -->
              <div class="form-group text-left">
                <label class="form-label">Giới thiệu bản thân</label>
                <textarea id="settings-bio" class="form-textarea input-focus" placeholder="Chia sẻ đôi điều về bạn và lối sống bền vững của bạn..." rows="4">${savedBio}</textarea>
              </div>
              
              <!-- Saved Addresses -->
              <div class="addresses-section">
                <div class="addresses-header">
                  <h3 class="addresses-title">Địa chỉ đã lưu</h3>
                  <button class="btn-add-address" type="button" onclick="alert('Tính năng đang phát triển')">
                    <span class="material-symbols-outlined">add</span>
                    <span>Thêm địa chỉ mới</span>
                  </button>
                </div>
                
                <div class="addresses-list-stack">
                  <!-- Home Address Card -->
                  <div class="address-card is-default">
                    <div class="address-content">
                      <span class="material-symbols-outlined address-icon">home</span>
                      <div class="address-details-text">
                        <p class="address-name-tag">Nhà riêng <span class="badge-default">Mặc định</span></p>
                        <p class="address-text">${p.location || "123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh"}</p>
                      </div>
                    </div>
                    <button class="btn-edit-address" type="button" onclick="alert('Tính năng đang phát triển')">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                  
                  <!-- Work Address Card -->
                  <div class="address-card">
                    <div class="address-content">
                      <span class="material-symbols-outlined address-icon">work</span>
                      <div class="address-details-text">
                        <p class="address-name-tag">Văn phòng</p>
                        <p class="address-text">Tòa nhà Bitexco, 2 Hải Triều, Quận 1, TP. Hồ Chí Minh</p>
                      </div>
                    </div>
                    <button class="btn-edit-address" type="button" onclick="alert('Tính năng đang phát triển')">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Form Actions -->
              <div class="form-actions">
                <button class="btn-cancel" type="button" id="btn-cancel-settings">
                  Hủy bỏ
                </button>
                <button class="btn-save" type="submit">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderOrdersTab(orders) {
  return `
    <div class="dashboard-panel" id="panel-orders">
      <div class="panel-header bg-white rounded-t-xl border border-outline-variant">
        <h2 class="panel-title">Sản phẩm đã mua</h2>
        <div class="panel-filters">
          <button class="btn-filter is-active">Tất cả</button>
          <button class="btn-filter" onclick="alert('Tính năng lọc đang phát triển')">Đang xử lý</button>
        </div>
      </div>
      
      <div class="orders-list bg-white rounded-b-xl border border-t-0 border-outline-variant">
        ${orders.length === 0
          ? `<div style="padding: 48px 0;">${emptyStateHtml("shopping_bag", "Bạn chưa có đơn hàng nào.")}</div>`
          : orders
          .map(
            (o) => `
          <div class="order-item">
            <div class="order-img-container">
              <img src="${o.img}" alt="" />
            </div>
            
            <div class="order-details">
              <div class="order-row">
                <h3 class="order-item-title">${o.item}</h3>
                <span class="status-badge ${o.statusClass}">${o.status}</span>
              </div>
              
              <div class="order-meta-grid">
                <div class="meta-item">
                  <span class="meta-label">Ngày đặt</span>
                  <span class="meta-value">${o.date}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Mã đơn</span>
                  <span class="meta-value text-primary font-semibold">${o.id}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Tổng cộng</span>
                  <span class="meta-value font-semibold text-on-surface">${o.price.toLocaleString("vi")}đ</span>
                </div>
              </div>
            </div>
            
            <div class="order-actions">
              ${o.status === "Đang giao" || o.status === "Đang xử lý"
                ? `<button class="btn-outline" onclick="alert('Theo dõi đơn ${o.id}')">Theo dõi đơn</button>` 
                : `<button class="btn-primary" onclick="alert('Đánh giá đơn hàng ${o.id}')">Đánh giá ngay</button>
                   <button class="btn-link" onclick="alert('Mua lại đơn hàng ${o.id}')">Mua lại</button>`
              }
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
      
      <div class="panel-footer bg-white rounded-b-xl border border-t-0 border-outline-variant mt-2">
        <button class="btn-view-all" onclick="alert('Hiển thị toàn bộ lịch sử')">
          <span>Xem tất cả lịch sử đơn hàng</span>
          <span class="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  `;
}

function renderReviewsTab(reviews) {
  if (reviews.length === 0) {
    return `
      <div class="dashboard-panel" id="panel-reviews">
        <div class="panel-header bg-white rounded-t-xl border border-outline-variant">
          <h2 class="panel-title">Đánh giá của bạn</h2>
        </div>
        <div class="panel-empty-body bg-white rounded-b-xl border border-t-0 border-outline-variant">
          ${emptyStateHtml("reviews", "Bạn chưa nhận được đánh giá nào.")}
        </div>
      </div>
    `;
  }

  return `
    <div class="dashboard-panel" id="panel-reviews">
      <div class="panel-header bg-white rounded-t-xl border border-outline-variant">
        <h2 class="panel-title">Đánh giá của bạn</h2>
      </div>
      <div class="reviews-list bg-white border border-t-0 border-outline-variant rounded-b-xl">
        ${reviews
          .map(
            (r) => `
          <div class="review-item">
            <div class="review-author-avatar">
              <img src="${r.avatar || 'https://i.pravatar.cc/40?img=11'}" alt="" />
            </div>
            <div class="review-details">
              <div class="review-header">
                <h4 class="review-author-name">${r.author}</h4>
                <span class="review-date">${r.date}</span>
              </div>
              <div class="review-stars">
                ${Array.from({ length: 5 })
                  .map(
                    (_, i) => `
                  <span class="material-symbols-outlined star-filled ${
                    i < r.rating ? "filled" : ""
                  }" style="${i < r.rating ? 'font-variation-settings: \'FILL\' 1;' : ''}">star</span>
                `
                  )
                  .join("")}
              </div>
              <p class="review-comment">${r.comment}</p>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderDonationsTab(donations) {
  if (donations.length === 0) {
    return `
      <div class="dashboard-panel" id="panel-donation-requests">
        <div class="panel-header bg-white rounded-t-xl border border-outline-variant">
          <h2 class="panel-title">Yêu cầu tặng đồ</h2>
        </div>
        <div class="panel-empty-body bg-white rounded-b-xl border border-t-0 border-outline-variant">
          ${emptyStateHtml("volunteer_activism", "Hiện chưa có yêu cầu tặng đồ nào.")}
        </div>
      </div>
    `;
  }

  return `
    <div class="dashboard-panel" id="panel-donation-requests">
      <div class="panel-header bg-white rounded-t-xl border border-outline-variant">
        <h2 class="panel-title">Yêu cầu tặng đồ</h2>
      </div>
      <div class="donations-list bg-white border border-t-0 border-outline-variant rounded-b-xl">
        ${donations
          .map(
            (d) => `
          <div class="donation-item">
            <div class="donation-org-avatar">
              <img src="${d.orgAvatar || 'https://i.pravatar.cc/40?img=60'}" alt="" />
            </div>
            <div class="donation-details">
              <div class="donation-row">
                <h4 class="donation-org-name">${d.org}</h4>
                <span class="status-badge success">${d.status}</span>
              </div>
              <div class="donation-meta-grid">
                <div class="meta-item">
                  <span class="meta-label">Ngày quyên góp</span>
                  <span class="meta-value">${d.date}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Vật phẩm quyên góp</span>
                  <span class="meta-value font-semibold text-on-surface">${d.items}</span>
                </div>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderDraftsTab(posts) {
  return `
    <div class="dashboard-panel" id="panel-drafts">
      <div class="panel-header bg-white rounded-t-xl border border-outline-variant">
        <h2 class="panel-title">Bản nháp</h2>
      </div>
      
      <div class="orders-list bg-white border border-t-0 border-outline-variant rounded-b-xl">
        ${
          posts.length === 0
            ? `<div style="padding: 48px 0;">${emptyStateHtml("edit_note", "Không có bản nháp nào.")}</div>`
            : posts
                .map((post) => {
                  const imgUrl = (post.images && post.images.length > 0) 
                    ? post.images[0] 
                    : "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=100";
                  
                  return `
                    <div class="order-item">
                      <div class="order-img-container">
                        <img src="${imgUrl}" alt="${post.title}" />
                      </div>
                      <div class="order-details">
                        <div class="order-row">
                          <h3 class="order-item-title">${post.title}</h3>
                          <span class="status-badge warning">Bản nháp</span>
                        </div>
                        <div class="order-meta-grid">
                          <div class="meta-item">
                            <span class="meta-label">Phân loại</span>
                            <span class="meta-value">${post.category || "Chưa phân loại"}</span>
                          </div>
                          <div class="meta-item">
                            <span class="meta-label">Độ mới</span>
                            <span class="meta-value">${post.condition ? post.condition * 10 : 90}%</span>
                          </div>
                          <div class="meta-item">
                            <span class="meta-label">Giá bán dự kiến</span>
                            <span class="meta-value font-semibold text-on-surface">${(post.price || 0).toLocaleString("vi")}₫</span>
                          </div>
                        </div>
                      </div>
                      <div class="order-actions">
                        <button class="btn-outline-variant" onclick="alert('Tính năng sửa bản nháp đang phát triển')">Sửa</button>
                        <button class="btn-danger-text" onclick="alert('Tính năng đang phát triển')">Xóa</button>
                      </div>
                    </div>
                  `;
                })
                .join("")
        }
      </div>
    </div>
  `;
}

function renderClosetTab(posts) {
  return `
    <div class="dashboard-panel is-active" id="panel-closet">
      <div class="panel-header bg-white rounded-t-xl border border-outline-variant">
        <h2 class="panel-title">Sản phẩm đăng bán</h2>
        <button class="btn-primary" onclick="window.location.hash='#/create-listing'">+ Đăng sản phẩm mới</button>
      </div>
      
      <div class="orders-list bg-white border border-t-0 border-outline-variant rounded-b-xl">
        ${
          posts.length === 0
            ? `<div style="padding: 48px 0;">${emptyStateHtml("checkroom", "Tủ đồ của bạn đang trống. Hãy đăng sản phẩm mới!")}</div>`
            : posts
                .map((post) => {
                  const imgUrl = (post.images && post.images.length > 0) 
                    ? post.images[0] 
                    : "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=100";
                  
                  const statusLabel = post.status === "AVAILABLE" ? "Còn hàng" : (post.status === "SOLD" ? "Đã bán" : post.status);
                  const statusClass = post.status === "AVAILABLE" ? "success" : "warning";
                  
                  return `
                    <div class="order-item">
                      <div class="order-img-container">
                        <img src="${imgUrl}" alt="${post.title}" />
                      </div>
                      <div class="order-details">
                        <div class="order-row">
                          <h3 class="order-item-title">${post.title}</h3>
                          <span class="status-badge ${statusClass}">${statusLabel}</span>
                        </div>
                        <div class="order-meta-grid">
                          <div class="meta-item">
                            <span class="meta-label">Phân loại</span>
                            <span class="meta-value">${post.category || "Chưa phân loại"}</span>
                          </div>
                          <div class="meta-item">
                            <span class="meta-label">Độ mới</span>
                            <span class="meta-value">${getConditionPercentage(post.condition)}%</span>
                          </div>
                          <div class="meta-item">
                            <span class="meta-label">Giá bán</span>
                            <span class="meta-value font-semibold text-on-surface">${(post.price || 0).toLocaleString("vi")}₫</span>
                          </div>
                        </div>
                      </div>
                      <div class="order-actions">
                        <button class="btn-outline-variant" onclick="alert('Tính năng đang phát triển')">Sửa</button>
                        <button class="btn-danger-text" onclick="alert('Tính năng đang phát triển')">Xóa</button>
                      </div>
                    </div>
                  `;
                })
                .join("")
        }
      </div>
    </div>
  `;
}

/* ══════════════════════════════════════
   MAIN RENDERING LOGIC
   ══════════════════════════════════════ */

export async function renderProfilePage(container) {
  // Auth redirect
  if (!isAuthenticated()) {
    window.location.hash = "#/login";
    return;
  }

  const userId = getUserIdFromToken();
  if (!userId) {
    console.warn("No user ID found in token. Redirecting to login...");
    localStorage.removeItem("ecocycle_token");
    localStorage.removeItem("ecocycle_user");
    window.location.hash = "#/login";
    setTimeout(() => {
      location.reload();
    }, 100);
    return;
  }

  // Show loading state
  container.innerHTML = `
    <div class="profile-loading-container">
      <div class="profile-spinner"></div>
      <p>Đang tải dữ liệu hồ sơ từ hệ thống…</p>
    </div>
  `;

  let profile;
  let closetProducts = [];
  let activeProducts = [];
  let draftProducts = [];
  let orders = [];
  let reviews = [];
  let donations = [];
  let avgRating = "4.8";

  try {
    profile = await getMyProfile();

    // Fetch closet products dynamically
    try {
      const allProducts = await getAllProducts();
      closetProducts = allProducts.filter(
        (p) => p.sellerId === profile.id || p.sellerName === profile.username
      );
      activeProducts = closetProducts.filter(p => p.status !== "DRAFT");
      draftProducts = closetProducts.filter(p => p.status === "DRAFT");
    } catch (err) {
      console.error("Failed to fetch products for user closet:", err);
    }

    // Initialize and read local storage data
    initLocalStorageData();
    orders = JSON.parse(localStorage.getItem("ecocycle_orders") || "[]");
    reviews = JSON.parse(localStorage.getItem("ecocycle_reviews") || "[]");
    donations = JSON.parse(localStorage.getItem("ecocycle_donations") || "[]");

    avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";
  } catch (err) {
    console.error("Failed to load profile:", err);
    if (err.message && (err.message.includes("401") || err.message.includes("Unauthorized") || err.message.includes("403"))) {
      console.warn("Session invalid or unauthorized. Redirecting to login...");
      localStorage.removeItem("ecocycle_token");
      localStorage.removeItem("ecocycle_user");
      window.location.hash = "#/login";
      // Force page reload to clear header profile state
      setTimeout(() => {
        location.reload();
      }, 100);
      return;
    }
    container.innerHTML = `
      <div class="profile-error-container">
        <span class="material-symbols-outlined">error</span>
        <p>Lỗi khi kết nối với máy chủ. Vui lòng thử lại sau.</p>
        <button class="btn-primary" onclick="location.reload()">Tải lại trang</button>
      </div>
    `;
    return;
  }

  const role = profile.role ?? "member";

  // Sidebar Menu list
  const sidebarNavItems = [
    { id: "panel-closet", icon: "inventory_2", label: "Sản phẩm đăng bán", active: true },
    { id: "panel-drafts", icon: "edit_note", label: "Bản nháp" },
    { id: "panel-orders", icon: "shopping_bag", label: "Sản phẩm đã mua" },
    { id: "panel-donation-requests", icon: "feature_search", label: "Yêu cầu tặng đồ" },
    { id: "panel-saved", icon: "bookmark", label: "Đã lưu" },
    { id: "panel-reviews", icon: "grade", label: "Đánh giá" },
    { id: "panel-settings", icon: "settings", label: "Cài đặt" }
  ];

  const sidebarNavHtml = sidebarNavItems
    .map(item => renderSidebarItem(item.id, item.icon, item.label, item.active))
    .join("");

  // Assemble HTML
  container.innerHTML = `
    <div class="profile-page-wrapper">
      <!-- Cover & Hero Section -->
      <section class="profile-hero">
        <!-- Cover Photo -->
        <div class="profile-cover">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxEbtAz9mVOPPHhZX4zL6HN9E1Cdh2uB6UGwjzVw7UQHMUWGkx0_dgbSLiYU73YHBmR7AMsxVixsfPPyV6kNqp_nzt-Z-6UKRP_flCp-Gs7oWT2aOETaDA0ir_7AcLwDzs873IxdLFaT73QRa2T44fWb--q-D4wbbp_KRvwrnNQN15tyO-y-K2Anlji_hrNhssCra0BRWZwg2EgnBdwfmjBN42JwUunNaS67-HKR351ULaav2LBRch3XUhWwryFUTzExuW_H97gYtX" alt="Organic theme cover" />
          <div class="profile-cover-overlay"></div>
        </div>
        
        <!-- Profile Banner Details -->
        <div class="profile-banner-details">
          <div class="profile-meta-row">
            <div class="profile-avatar-container">
              <img src="${profile.avatar || "https://i.pravatar.cc/150?img=11"}" alt="User avatar" />
            </div>
            <div class="profile-identity">
              <h1 class="profile-name">${profile.name}</h1>
              <p class="profile-role">${roleLabel(role)} của EcoCycle từ 2023</p>
            </div>
            <div class="profile-action-container">
              <button class="hero-edit-btn">
                <span class="material-symbols-outlined">edit</span>
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            </div>
          </div>
          
          <!-- Stats Row -->
          <div class="profile-stats-row">
            <div class="profile-stat-item">
              <span class="profile-stat-value">${activeProducts.length}</span>
              <span class="profile-stat-label">Đang bán</span>
            </div>
            <div class="profile-stat-item">
              <span class="profile-stat-value">${draftProducts.length}</span>
              <span class="profile-stat-label">Bản nháp</span>
            </div>
            <div class="profile-stat-item">
              <span class="profile-stat-value">${orders.length}</span>
              <span class="profile-stat-label">Đã mua</span>
            </div>
            <div class="profile-stat-item">
              <span class="profile-stat-value">${donations.length}</span>
              <span class="profile-stat-label">Đã tặng</span>
            </div>
            <div class="profile-stat-item">
              <div class="profile-rating-display">
                <span class="material-symbols-outlined star-filled" style="font-variation-settings: 'FILL' 1;">star</span>
                <span class="profile-stat-value">${avgRating}</span>
              </div>
              <span class="profile-stat-label">(${reviews.length} đánh giá)</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Layout -->
      <div class="profile-dashboard-layout">
        <!-- Left Sidebar -->
        <aside class="profile-sidebar">
          <nav class="profile-sidebar-nav">
            ${sidebarNavHtml}
            <div class="profile-sidebar-divider"></div>
            <button class="logout-btn">
              <span class="material-symbols-outlined">logout</span>
              <span class="logout-btn-label">Đăng xuất</span>
            </button>
          </nav>
          
          <div class="profile-sidebar-action">
            <button class="btn-list-new" onclick="window.location.hash='#/create-listing'">
              <span class="material-symbols-outlined">add_circle</span>
              <span>List New Item</span>
            </button>
          </div>
        </aside>
        
        <!-- Right Content Panels -->
        <main class="dashboard-content">
          ${renderOrdersTab(orders)}
          ${renderClosetTab(activeProducts)}
          ${renderDraftsTab(draftProducts)}
          ${renderDonationsTab(donations)}
          
          <div class="dashboard-panel" id="panel-saved">
            <div class="panel-header bg-white rounded-t-xl border border-outline-variant">
              <h2 class="panel-title">Đã lưu</h2>
            </div>
            <div class="panel-empty-body bg-white rounded-b-xl border border-t-0 border-outline-variant">
              ${emptyStateHtml("bookmark", "Bạn chưa lưu sản phẩm hoặc sự kiện nào.")}
            </div>
          </div>
          
          ${renderReviewsTab(reviews)}
          
          ${renderSettingsTab(profile)}
        </main>
      </div>
    </div>
  `;

  // Bind tab clicking
  const navItems = container.querySelectorAll(".sidebar-nav-item[data-target]");
  const panels = container.querySelectorAll(".dashboard-panel");

  function switchTab(targetId) {
    navItems.forEach((n) => {
      if (n.getAttribute("data-target") === targetId) {
        n.classList.add("is-active");
      } else {
        n.classList.remove("is-active");
      }
    });

    panels.forEach((p) => {
      if (p.id === targetId) {
        p.classList.add("is-active");
      } else {
        p.classList.remove("is-active");
      }
    });
  }

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const targetId = item.getAttribute("data-target");
      switchTab(targetId);
    });
  });

  // Switch to settings if edit hero btn clicked
  const heroEditBtn = container.querySelector(".hero-edit-btn");
  if (heroEditBtn) {
    heroEditBtn.addEventListener("click", () => {
      switchTab("panel-settings");
    });
  }

  // Cancel settings redirects back to closet tab
  const cancelBtn = container.querySelector("#btn-cancel-settings");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      switchTab("panel-closet");
    });
  }

  // Logout button handler
  const logoutBtn = container.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.location.hash = "#/logout";
    });
  }

  // Handle settings form submit
  const form = container.querySelector(".settings-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector(".btn-save");
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin" data-icon="sync" style="font-size:18px;">sync</span> Đang lưu...';
      submitBtn.classList.add("opacity-80");

      const fullNameVal = form.querySelector("#settings-fullname").value;
      const phoneVal = form.querySelector("#settings-phone").value;
      const bioVal = form.querySelector("#settings-bio").value;

      try {
        // Exclude username/email modifications in body to prevent 401 unauthenticated session lockout bugs
        await updateUserProfile(profile.id, {
          username: profile.username, // keep current
          email: profile.email,       // keep current
          fullName: fullNameVal,      // updated
          phone: phoneVal            // updated
        });

        // Save bio mock detail locally
        localStorage.setItem(`profile_bio_${profile.id}`, bioVal);

        submitBtn.innerHTML = '<span class="material-symbols-outlined" data-icon="check" style="font-size:18px;">check</span> Đã lưu thành công';
        submitBtn.classList.replace("bg-primary", "bg-secondary");

        showToast("Cập nhật thông tin tài khoản thành công!", "success");

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.classList.replace("bg-secondary", "bg-primary");
          submitBtn.classList.remove("opacity-80");
          submitBtn.disabled = false;
          // Refresh profile details in UI
          renderProfilePage(container);
        }, 1500);
      } catch (err) {
        console.error(err);
        showToast("Cập nhật thất bại: " + err.message, "error");
        submitBtn.innerHTML = originalText;
        submitBtn.classList.remove("opacity-80");
        submitBtn.disabled = false;
      }
    });
  }
}
