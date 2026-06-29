/**
 * EcoCycle – Private Profile Dashboard & Edit Profile Page
 * Displays different tabs based on the user's role and allows profile updates.
 */
import "../styles/profile.css";
import {
  getMyProfile,
  MOCK_PROFILES,
  updateUserProfile,
  createDonationRequestApi,
  acceptDonationRequest,
  rejectDonationRequest,
  shippingDonationRequest,
  shippedDonationRequest,
  receivedDonationRequest,
  cancelDonationRequest,
  getAllOrganizationsApi,
  getAllDonationEventsApi
} from "../services/profile.service.js";
import { showToast } from "../utils/ui.js";
import { BASE_URL } from "../utils/api.js";
import { isAuthenticated, getUser, getUserIdFromToken } from "../services/auth.service.js";
import { getAllProducts, isDraftProduct } from "../services/product.service.js";
import { getConditionPercentage } from "../utils/conditionMapping.js";
import { confirmOrder, shipOrder, confirmReceived, getOrdersByBuyer, getOrdersBySeller } from "../services/order.service.js";

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

function normalizeProductStatus(status) {
  return String(status ?? "").trim().toUpperCase();
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

function mapOrderStatus(status) {
  switch (status) {
    case "PENDING": return { label: "Chờ xác nhận", class: "warning" };
    case "PAID": return { label: "Đã thanh toán", class: "info" };
    case "PROCESSING": return { label: "Đang chuẩn bị hàng", class: "warning" };
    case "SHIPPING": return { label: "Đang giao", class: "warning" };
    case "RECEIVED": return { label: "Đã nhận", class: "success" };
    case "COMPLETED": return { label: "Hoàn thành", class: "success" };
    case "CANCELLED": return { label: "Đã hủy", class: "danger" };
    default: return { label: status, class: "neutral" };
  }
}

function getFilterCategory(status) {
  if (status === "PENDING" || status === "PROCESSING" || status === "PAID") return "pending";
  if (status === "SHIPPING") return "shipping";
  if (status === "RECEIVED") return "received";
  if (status === "COMPLETED") return "completed";
  if (status === "CANCELLED") return "cancelled";
  return "all";
}

function renderOrdersTab(orders) {
  return `
    <div class="dashboard-panel" id="panel-orders">
      <div class="panel-header bg-white rounded-t-xl border border-outline-variant flex flex-wrap gap-2 justify-between items-center">
        <h2 class="panel-title">Đơn mua</h2>
        <div class="panel-filters order-status-filters flex flex-wrap gap-1">
          <button class="btn-filter is-active" data-filter="all">Tất cả</button>
          <button class="btn-filter" data-filter="pending">Chờ xác nhận</button>
          <button class="btn-filter" data-filter="shipping">Đang giao</button>
          <button class="btn-filter" data-filter="received">Đã nhận</button>
          <button class="btn-filter" data-filter="completed">Hoàn tất</button>
          <button class="btn-filter" data-filter="cancelled">Đã hủy</button>
        </div>
      </div>
      
      <div class="orders-list bg-white rounded-b-xl border border-t-0 border-outline-variant">
        ${orders.length === 0
          ? `<div style="padding: 48px 0;">${emptyStateHtml("shopping_bag", "Bạn chưa có đơn hàng nào.")}</div>`
          : orders
          .map(
            (o) => {
              const item = o.orderItems && o.orderItems.length > 0 ? o.orderItems[0].product : null;
              const title = item ? item.title : "Sản phẩm EcoCycle";
              const img = item && item.images && item.images.length > 0 ? item.images[0] : "https://placehold.co/800x800/E4EBE4/6E7B6C?text=No+Image";
              const price = o.totalAmount || 0;
              const date = o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : "";
              const statusInfo = mapOrderStatus(o.status);
              const sellerName = o.seller ? (o.seller.fullName || o.seller.userName) : (item && item.seller ? (item.seller.fullName || item.seller.userName) : "Người bán EcoCycle");
              const filterCat = getFilterCategory(o.status);
              
              // Actions based on status
              let actionsHtml = "";
              if (o.status === "SHIPPING") {
                actionsHtml = `
                  <button class="btn-primary btn-confirm-received px-4 py-2 rounded-lg text-label-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-all text-sm" style="background-color: #006b2c; color: white;" data-id="${o.id}">Đã nhận được hàng</button>
                  ${o.trackingCode ? `<button class="btn-outline ml-2" onclick="alert('Mã vận đơn: ${o.trackingCode}')">Theo dõi đơn</button>` : ''}
                `;
              } else if (o.status === "PENDING" || o.status === "PROCESSING") {
                actionsHtml = `<span class="text-body-sm text-on-surface-variant font-medium opacity-70">Chờ seller xử lý</span>`;
              } else if (o.status === "COMPLETED") {
                actionsHtml = `
                  <button class="btn-primary px-4 py-2 rounded-lg text-label-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-all text-sm" style="background-color: #006b2c; color: white;" onclick="alert('Đánh giá đơn hàng ${o.id}')">Đánh giá ngay</button>
                `;
              } else {
                actionsHtml = `<span class="text-body-sm text-on-surface-variant opacity-50">${statusInfo.label}</span>`;
              }

              return `
                <div class="order-item" data-filter-status="${filterCat}">
                  <div class="order-img-container">
                    <img src="${img}" alt="" />
                  </div>
                  
                  <div class="order-details">
                    <div class="order-row">
                      <h3 class="order-item-title">${title}</h3>
                      <span class="status-badge ${statusInfo.class}">${statusInfo.label}</span>
                    </div>
                    
                    <div class="order-meta-grid">
                      <div class="meta-item">
                        <span class="meta-label">Người bán</span>
                        <span class="meta-value font-semibold text-on-surface">${sellerName}</span>
                      </div>
                      <div class="meta-item">
                        <span class="meta-label">Ngày đặt</span>
                        <span class="meta-value">${date}</span>
                      </div>
                      <div class="meta-item">
                        <span class="meta-label">Mã đơn</span>
                        <span class="meta-value text-primary font-semibold">${o.id}</span>
                      </div>
                      <div class="meta-item">
                        <span class="meta-label">Tổng cộng</span>
                        <span class="meta-value font-semibold text-on-surface">${price.toLocaleString("vi")}đ</span>
                      </div>
                      ${o.trackingCode ? `
                        <div class="meta-item col-span-2">
                          <span class="meta-label">Mã vận đơn</span>
                          <span class="meta-value font-mono font-bold text-secondary">${o.trackingCode}</span>
                        </div>
                      ` : ""}
                    </div>
                  </div>
                  
                  <div class="order-actions">
                    ${actionsHtml}
                  </div>
                </div>
              `;
            }
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

function renderSalesTab(salesOrders) {
  return `
    <div class="dashboard-panel" id="panel-sales">
      <div class="panel-header bg-white rounded-t-xl border border-outline-variant flex flex-wrap gap-2 justify-between items-center">
        <h2 class="panel-title">Đơn bán</h2>
        <div class="panel-filters order-status-filters flex flex-wrap gap-1">
          <button class="btn-filter is-active" data-filter="all">Tất cả</button>
          <button class="btn-filter" data-filter="pending">Chờ xác nhận</button>
          <button class="btn-filter" data-filter="shipping">Đang giao</button>
          <button class="btn-filter" data-filter="received">Đã nhận</button>
          <button class="btn-filter" data-filter="completed">Hoàn tất</button>
          <button class="btn-filter" data-filter="cancelled">Đã hủy</button>
        </div>
      </div>
      
      <div class="orders-list bg-white rounded-b-xl border border-t-0 border-outline-variant">
        ${salesOrders.length === 0
          ? `<div style="padding: 48px 0;">${emptyStateHtml("store", "Bạn chưa nhận được đơn hàng nào.")}</div>`
          : salesOrders
          .map(
            (o) => {
              const item = o.orderItems && o.orderItems.length > 0 ? o.orderItems[0].product : null;
              const title = item ? item.title : "Sản phẩm EcoCycle";
              const img = item && item.images && item.images.length > 0 ? item.images[0] : "https://placehold.co/800x800/E4EBE4/6E7B6C?text=No+Image";
              const price = o.totalAmount || 0;
              const date = o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : "";
              const statusInfo = mapOrderStatus(o.status);
              const buyerName = o.buyer ? (o.buyer.fullName || o.buyer.userName) : "Người mua ẩn danh";
              const filterCat = getFilterCategory(o.status);

              // Actions based on status
              let actionsHtml = "";
              if (o.status === "PENDING") {
                actionsHtml = `
                  <button class="btn-primary btn-confirm-sale-order px-4 py-2 rounded-lg text-label-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-all text-sm" style="background-color: #006b2c; color: white;" data-id="${o.id}">Xác nhận đơn hàng</button>
                `;
              } else if (o.status === "PROCESSING") {
                actionsHtml = `
                  <div class="flex flex-col gap-2 w-full max-w-xs" style="align-items: flex-start; text-align: left;">
                    <input type="text" placeholder="Nhập mã vận đơn..." class="shipping-tracking-input border border-outline-variant rounded-lg p-2 text-body-sm w-full" style="border: 1px solid #bdcaba; border-radius: 8px; padding: 8px; font-size: 14px;" />
                    <button class="btn-primary btn-ship-sale-order w-full px-4 py-2 rounded-lg text-label-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-all text-sm" style="background-color: #006b2c; color: white;" data-id="${o.id}">Giao hàng</button>
                  </div>
                `;
              } else if (o.status === "SHIPPING") {
                actionsHtml = `<span class="text-body-sm text-secondary font-semibold">Đang giao hàng</span>`;
              } else if (o.status === "COMPLETED") {
                actionsHtml = `<span class="text-body-sm text-primary font-semibold">Đã hoàn thành</span>`;
              } else {
                actionsHtml = `<span class="text-body-sm text-on-surface-variant opacity-50">${statusInfo.label}</span>`;
              }

              return `
                <div class="order-item" data-filter-status="${filterCat}">
                  <div class="order-img-container">
                    <img src="${img}" alt="" />
                  </div>
                  
                  <div class="order-details">
                    <div class="order-row">
                      <h3 class="order-item-title">${title}</h3>
                      <span class="status-badge ${statusInfo.class}">${statusInfo.label}</span>
                    </div>
                    
                    <div class="order-meta-grid">
                      <div class="meta-item">
                        <span class="meta-label">Người mua</span>
                        <span class="meta-value font-semibold text-on-surface">${buyerName}</span>
                      </div>
                      <div class="meta-item">
                        <span class="meta-label">Ngày đặt</span>
                        <span class="meta-value">${date}</span>
                      </div>
                      <div class="meta-item">
                        <span class="meta-label">Mã đơn</span>
                        <span class="meta-value text-primary font-semibold">${o.id}</span>
                      </div>
                      <div class="meta-item">
                        <span class="meta-label">Tổng cộng</span>
                        <span class="meta-value font-semibold text-on-surface">${price.toLocaleString("vi")}đ</span>
                      </div>
                      ${o.trackingCode ? `
                        <div class="meta-item col-span-2">
                          <span class="meta-label">Mã vận đơn</span>
                          <span class="meta-value font-mono font-bold text-secondary">${o.trackingCode}</span>
                        </div>
                      ` : ""}
                    </div>
                  </div>
                  
                  <div class="order-actions">
                    ${actionsHtml}
                  </div>
                </div>
              `;
            }
          )
          .join("")}
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

function renderDonationsTab(donations, role) {
  const title = role === 'org' ? "Yêu cầu nhận quyên góp" : "Yêu cầu tặng đồ";
  
  if (donations.length === 0) {
    return `
      <div class="dashboard-panel" id="panel-donation-requests">
        <div class="panel-header bg-white rounded-t-xl border border-outline-variant">
          <h2 class="panel-title">${title}</h2>
        </div>
        <div class="panel-empty-body bg-white rounded-b-xl border border-t-0 border-outline-variant">
          ${emptyStateHtml("volunteer_activism", "Hiện chưa có yêu cầu nào.")}
        </div>
      </div>
    `;
  }

  return `
    <div class="dashboard-panel" id="panel-donation-requests">
      <div class="panel-header bg-white rounded-t-xl border border-outline-variant">
        <h2 class="panel-title">${title}</h2>
      </div>
      <div class="donations-list bg-white border border-t-0 border-outline-variant rounded-b-xl">
        ${donations
          .map(
            (d) => {
              let statusLabel = d.status || "PENDING";
              let statusClass = "warning";
              let badgeStyle = "";
              if (d.status === "ACCEPTED") { statusClass = "success"; statusLabel = "Đã chấp nhận"; }
              else if (d.status === "REJECTED") { badgeStyle = 'style="background: rgba(211, 47, 47, 0.1); color: #d32f2f;"'; statusLabel = "Đã từ chối"; }
              else if (d.status === "SHIPPING") { statusClass = "warning"; statusLabel = "Đang vận chuyển"; }
              else if (d.status === "SHIPPED") { statusClass = "warning"; statusLabel = "Đã gửi hàng"; }
              else if (d.status === "RECEIVED" || d.status === "COMPLETED") { statusClass = "success"; statusLabel = d.status === "RECEIVED" ? "Đã nhận hàng" : "Hoàn thành"; }
              else if (d.status === "CANCELLED") { badgeStyle = 'style="background: rgba(211, 47, 47, 0.1); color: #d32f2f;"'; statusLabel = "Đã hủy"; }

              let actionButtons = "";
              if (role === 'org') {
                if (d.status === "PENDING") {
                  actionButtons = `
                    <div class="flex items-center space-x-2 mt-3">
                      <button class="btn-primary btn-accept-donation px-3 py-1.5 rounded-lg text-label-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-all" data-id="${d.id}">
                        Chấp nhận
                      </button>
                      <button class="btn-danger-text btn-reject-donation px-3 py-1.5 rounded-lg text-label-sm font-bold border border-outline text-error hover:bg-error/10 transition-all" data-id="${d.id}">
                        Từ chối
                      </button>
                    </div>
                  `;
                } else if (d.status === "SHIPPED") {
                  actionButtons = `
                    <div class="flex items-center space-x-2 mt-3">
                      <button class="btn-primary btn-received-donation px-3 py-1.5 rounded-lg text-label-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-all" data-id="${d.id}">
                        Xác nhận đã nhận hàng
                      </button>
                    </div>
                  `;
                }
              } else {
                // Member actions
                if (d.status === "ACCEPTED") {
                  actionButtons = `
                    <div class="flex flex-col mt-3 space-y-2">
                      <div class="flex items-center space-x-2">
                        <input type="text" placeholder="Nhập mã vận đơn (Tracking Code)" class="shipping-tracking-input border border-outline-variant rounded-lg px-3 py-1.5 text-body-sm max-w-xs" />
                        <button class="btn-primary btn-ship-donation px-3 py-1.5 rounded-lg text-label-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-all" data-id="${d.id}">
                          Gửi hàng
                        </button>
                      </div>
                    </div>
                  `;
                }
                if (d.status === "PENDING" || d.status === "ACCEPTED") {
                  actionButtons += `
                    <div class="mt-2">
                      <button class="btn-danger-text btn-cancel-donation px-3 py-1 text-label-sm font-medium border border-outline text-error hover:bg-error/10 rounded-lg" data-id="${d.id}">
                        Hủy yêu cầu
                      </button>
                    </div>
                  `;
                }
              }

              return `
                <div class="donation-item p-4 border-b border-outline-variant last:border-0">
                  <div class="flex items-start space-x-4">
                    <div class="donation-org-avatar w-10 h-10 rounded-full overflow-hidden bg-surface-variant flex-shrink-0">
                      <img src="${d.orgAvatar || 'https://i.pravatar.cc/40?img=60'}" alt="" class="w-full h-full object-cover" />
                    </div>
                    <div class="donation-details flex-grow">
                      <div class="donation-row flex justify-between items-start">
                        <div>
                          <h4 class="donation-org-name font-bold text-on-surface">${role === 'org' ? `Người gửi: ${d.username || "Thành viên"}` : `Tổ chức: ${d.org}`}</h4>
                          ${d.rejectedReason ? `<p class="text-error text-body-sm mt-1">Lý do từ chối: ${d.rejectedReason}</p>` : ''}
                          ${d.cancelReason ? `<p class="text-error text-body-sm mt-1">Lý do hủy: ${d.cancelReason}</p>` : ''}
                        </div>
                        <span class="status-badge px-2 py-0.5 text-label-sm font-bold rounded-full ${statusClass}" ${badgeStyle}>${statusLabel}</span>
                      </div>
                      <div class="donation-meta-grid grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        <div class="meta-item">
                          <span class="meta-label text-label-sm text-on-surface-variant opacity-70">Ngày yêu cầu: </span>
                          <span class="meta-value text-body-sm font-medium">${d.date}</span>
                        </div>
                        <div class="meta-item">
                          <span class="meta-label text-label-sm text-on-surface-variant opacity-70">Vật phẩm: </span>
                          <span class="meta-value text-body-sm font-semibold text-primary">${d.items}</span>
                        </div>
                        ${d.description ? `
                          <div class="meta-item md:col-span-2">
                            <span class="meta-label text-label-sm text-on-surface-variant opacity-70">Mô tả: </span>
                            <span class="meta-value text-body-sm text-on-surface">${d.description}</span>
                          </div>
                        ` : ''}
                        ${d.trackingCode ? `
                          <div class="meta-item md:col-span-2">
                            <span class="meta-label text-label-sm text-on-surface-variant opacity-70">Mã vận đơn: </span>
                            <span class="meta-value text-body-sm font-mono font-bold text-secondary">${d.trackingCode}</span>
                          </div>
                        ` : ''}
                      </div>
                      ${actionButtons}
                    </div>
                  </div>
                </div>
              `;
            }
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

function renderClosetTab(posts, role) {
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
                  
                  const status = normalizeProductStatus(post.status);
                  const statusLabel = status === "AVAILABLE" ? "Còn hàng" : (status === "SOLD" ? "Đã bán" : (status || "Chưa rõ"));
                  const statusClass = status === "AVAILABLE" ? "success" : "warning";
                  
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
                      <div class="order-actions flex items-center space-x-2">
                        ${status === "AVAILABLE" && role === "member" ? `
                          <button class="btn-primary btn-donate-item px-3 py-1 rounded-lg text-label-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-all" data-title="${post.title}">
                            Quyên góp
                          </button>
                        ` : ''}
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

/* ── Donation Form Modal Helper ── */
async function showDonationModal(itemTitle, onSuccess) {
  // Fetch orgs and events
  let orgs = [];
  let events = [];
  try {
    orgs = await getAllOrganizationsApi();
    events = await getAllDonationEventsApi();
  } catch (e) {
    console.error("Failed to load details for modal:", e);
    showToast("Không thể tải danh sách tổ chức/sự kiện. Vui lòng thử lại sau.", "error");
    return;
  }

  // Create modal container
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-body-md";
  modal.id = "donation-modal";
  
  const orgOptions = orgs.map(org => `<option value="${org.orgName}">${org.orgName} - ${org.address || ''}</option>`).join("");
  const eventOptions = `<option value="">Không tham gia sự kiện</option>` + events.map(ev => `<option value="${ev.title}">${ev.title}</option>`).join("");

  modal.innerHTML = `
    <div class="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl text-left" style="font-family: 'Be Vietnam Pro', sans-serif;">
      <div class="flex justify-between items-center border-b border-outline-variant pb-3 mb-4">
        <h3 class="text-headline-sm font-bold text-on-surface text-lg">Yêu cầu quyên góp</h3>
        <button class="text-on-surface-variant hover:text-on-surface close-modal-btn">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <p class="text-body-md text-on-surface-variant mb-4">
        Bạn đang gửi yêu cầu quyên góp vật phẩm: <strong class="text-primary" style="color: #006b2c;">${itemTitle}</strong>
      </p>

      <form id="donation-submit-form" class="space-y-4">
        <div class="flex flex-col mb-3">
          <label class="block text-label-md font-bold mb-1.5 text-sm text-on-surface">Chọn tổ chức nhận quyên góp *</label>
          <select id="donation-org" class="w-full border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary focus:outline-none text-body-sm" required>
            ${orgOptions ? orgOptions : '<option value="">Không có tổ chức khả dụng</option>'}
          </select>
        </div>
        
        <div class="flex flex-col mb-3">
          <label class="block text-label-md font-bold mb-1.5 text-sm text-on-surface">Sự kiện quyên góp (Tùy chọn)</label>
          <select id="donation-event" class="w-full border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary focus:outline-none text-body-sm">
            ${eventOptions}
          </select>
        </div>
        
        <div class="flex flex-col mb-3">
          <label class="block text-label-md font-bold mb-1.5 text-sm text-on-surface">Mô tả chi tiết / Lời nhắn *</label>
          <textarea id="donation-desc" placeholder="Nhập tình trạng vật phẩm, lời nhắn gửi đến tổ chức..." rows="3" class="w-full border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary focus:outline-none text-body-sm" required></textarea>
        </div>
        
        <div class="flex justify-end space-x-3 pt-3 border-t border-outline-variant mt-4">
          <button type="button" class="btn-outline-variant close-modal-btn px-4 py-2 rounded-xl text-label-md font-bold border border-outline hover:bg-surface-variant transition-all text-sm">Hủy</button>
          <button type="submit" class="btn-primary px-4 py-2 rounded-xl text-label-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-all text-sm" style="background-color: #006b2c; color: white;">Gửi yêu cầu</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Bind close events
  const close = () => {
    modal.remove();
  };
  modal.querySelectorAll(".close-modal-btn").forEach(btn => btn.addEventListener("click", close));

  // Form submit
  modal.querySelector("#donation-submit-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const org = modal.querySelector("#donation-org").value;
    const event = modal.querySelector("#donation-event").value;
    const desc = modal.querySelector("#donation-desc").value;
    
    if (!org) {
      showToast("Vui lòng chọn tổ chức nhận quyên góp!", "error");
      return;
    }

    const payload = {
      itemName: itemTitle,
      organizationName: org,
      donationEventName: event || null,
      description: desc,
      imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400",
      trackingCode: null
    };

    try {
      await createDonationRequestApi(payload);
      close();
      if (onSuccess) onSuccess(org, desc);
    } catch (err) {
      console.error(err);
      showToast("Gửi yêu cầu thất bại: " + err.message, "error");
    }
  });
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
  let salesOrders = [];
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
      activeProducts = closetProducts.filter((p) => !isDraftProduct(p));
      draftProducts = closetProducts.filter((p) => isDraftProduct(p));
    } catch (err) {
      console.error("Failed to fetch products for user closet:", err);
    }

    // Fetch orders dynamically from backend API
    try {
      orders = await getOrdersByBuyer();
    } catch (err) {
      console.error("Failed to fetch orders from backend:", err);
      orders = [];
    }

    try {
      salesOrders = await getOrdersBySeller();
    } catch (err) {
      console.error("Failed to fetch sales orders from backend:", err);
      salesOrders = [];
    }

    // Initialize and read local storage data
    initLocalStorageData();
    reviews = JSON.parse(localStorage.getItem("ecocycle_reviews") || "[]");
    
    // Manage dynamic donation request lists
    const rawRole = profile.role || "member";
    let trackedDonations = [];
    try {
      const stored = localStorage.getItem("ecocycle_tracked_donations");
      if (stored) {
        trackedDonations = JSON.parse(stored);
      } else {
        trackedDonations = [
          {
            id: "d1",
            org: "Tổ chức Kết nối Cộng đồng",
            items: "2 áo khoác + 1 túi xách",
            date: "15/05/2024",
            status: "RECEIVED",
            orgAvatar: "https://i.pravatar.cc/40?img=60",
            description: "Quyên góp quần áo ấm cho trẻ em"
          },
          {
            id: "d2",
            org: "Mái ấm Hoa Hướng Dương",
            items: "3 bộ quần áo trẻ em",
            date: "02/04/2024",
            status: "RECEIVED",
            orgAvatar: "https://i.pravatar.cc/40?img=61",
            description: "Ủng hộ các bé mồ côi"
          }
        ];
        localStorage.setItem("ecocycle_tracked_donations", JSON.stringify(trackedDonations));
      }
    } catch (e) {
      console.error(e);
    }

    // If Organization, load pending requests from real Backend API
    if (rawRole === 'org') {
      let backendPending = [];
      try {
        const token = localStorage.getItem("ecocycle_token");
        if (token) {
          const res = await fetch(`${BASE_URL}/api/donation-requests/lists`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            backendPending = await res.json();
          }
        }
      } catch (err) {
        console.warn("Could not fetch backend pending donations:", err);
      }
      
      // Merge backend pending requests into trackedDonations if they are not already there
      if (Array.isArray(backendPending)) {
        backendPending.forEach(bp => {
          const exists = trackedDonations.some(td => td.id === bp.id);
          if (!exists) {
            trackedDonations.unshift({
              id: bp.id,
              org: bp.organizationName,
              items: bp.itemName || "Vật phẩm quyên góp",
              date: new Date(bp.createdAt).toLocaleDateString("vi-VN"),
              status: "PENDING",
              orgAvatar: "https://i.pravatar.cc/40?img=60",
              description: bp.description,
              username: bp.username,
              trackingCode: bp.trackingCode
            });
          }
        });
        localStorage.setItem("ecocycle_tracked_donations", JSON.stringify(trackedDonations));
      }
    }

    // Filter displayed donations based on role
    if (rawRole === 'org') {
      donations = trackedDonations.filter(d => 
        d.org === profile.name || 
        d.org === profile.username ||
        d.org?.toLowerCase() === profile.name?.toLowerCase() ||
        d.org?.toLowerCase() === profile.username?.toLowerCase()
      );
      // Fallback if empty to show test data
      if (donations.length === 0) {
        donations = trackedDonations;
      }
    } else {
      donations = trackedDonations.filter(d => d.username === undefined || d.username === profile.username);
    }

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
  let sidebarNavItems;
  if (role === 'org') {
    sidebarNavItems = [
      { id: "panel-donation-requests", icon: "feature_search", label: "Yêu cầu nhận quyên góp", active: true },
      { id: "panel-reviews", icon: "grade", label: "Đánh giá" },
      { id: "panel-settings", icon: "settings", label: "Cài đặt" }
    ];
  } else {
    sidebarNavItems = [
      { id: "panel-closet", icon: "inventory_2", label: "Sản phẩm đăng bán", active: true },
      { id: "panel-drafts", icon: "edit_note", label: "Bản nháp" },
      { id: "panel-orders", icon: "shopping_bag", label: "Đơn mua" },
      { id: "panel-sales", icon: "store", label: "Đơn bán" },
      { id: "panel-donation-requests", icon: "feature_search", label: "Yêu cầu tặng đồ" },
      { id: "panel-saved", icon: "bookmark", label: "Đã lưu" },
      { id: "panel-reviews", icon: "grade", label: "Đánh giá" },
      { id: "panel-settings", icon: "settings", label: "Cài đặt" }
    ];
  }

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
          ${role === 'org' ? '' : renderOrdersTab(orders)}
          ${role === 'org' ? '' : renderSalesTab(salesOrders)}
          ${role === 'org' ? '' : renderClosetTab(activeProducts, role)}
          ${role === 'org' ? '' : renderDraftsTab(draftProducts)}
          ${renderDonationsTab(donations, role)}
          
          ${role === 'org' ? '' : `
            <div class="dashboard-panel" id="panel-saved">
              <div class="panel-header bg-white rounded-t-xl border border-outline-variant">
                <h2 class="panel-title">Đã lưu</h2>
              </div>
              <div class="panel-empty-body bg-white rounded-b-xl border border-t-0 border-outline-variant">
                ${emptyStateHtml("bookmark", "Bạn chưa lưu sản phẩm hoặc sự kiện nào.")}
              </div>
            </div>
          `}
          
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

  // Set initial active tab based on role or URL query param
  let initialActiveTab = role === 'org' ? 'panel-donation-requests' : 'panel-closet';
  if (window.location.hash.includes("?")) {
    const urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
    const tabParam = urlParams.get("tab");
    if (tabParam && container.querySelector(`#${tabParam}`)) {
      initialActiveTab = tabParam;
    }
  }
  switchTab(initialActiveTab);

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
      switchTab(role === 'org' ? 'panel-donation-requests' : 'panel-closet');
    });
  }

  /* ── MARKETPLACE ORDER INTERACTION HANDLERS ── */

  // 1. Buyer Confirm Received Order
  container.querySelectorAll(".btn-confirm-received").forEach(btn => {
    btn.addEventListener("click", async () => {
      const orderId = btn.getAttribute("data-id");
      if (!confirm("Xác nhận đơn hàng đã nhận đủ và không hoàn trả? Đồng ý sẽ chuyển đơn hàng sang hoàn tất.")) return;
      try {
        btn.disabled = true;
        await confirmReceived(orderId);
        showToast("Đã xác nhận nhận hàng và hoàn tất giao dịch!", "success");
        renderProfilePage(container); // Reload page
      } catch (err) {
        showToast("Lỗi xác nhận nhận hàng: " + err.message, "error");
        btn.disabled = false;
      }
    });
  });

  // 2. Seller Confirm Order
  container.querySelectorAll(".btn-confirm-sale-order").forEach(btn => {
    btn.addEventListener("click", async () => {
      const orderId = btn.getAttribute("data-id");
      try {
        btn.disabled = true;
        await confirmOrder(orderId);
        showToast("Xác nhận đơn hàng thành công!", "success");
        renderProfilePage(container); // Reload page
      } catch (err) {
        showToast("Lỗi xác nhận đơn hàng: " + err.message, "error");
        btn.disabled = false;
      }
    });
  });

  // 3. Seller Ship Order (with tracking code input)
  container.querySelectorAll(".btn-ship-sale-order").forEach(btn => {
    btn.addEventListener("click", async () => {
      const orderId = btn.getAttribute("data-id");
      const parent = btn.closest(".order-item");
      const input = parent?.querySelector(".shipping-tracking-input");
      const trackingCode = input?.value?.trim();
      if (!trackingCode) {
        showToast("Vui lòng nhập mã vận đơn trước khi giao hàng!", "error");
        return;
      }
      try {
        btn.disabled = true;
        await shipOrder(orderId, trackingCode);
        showToast("Cập nhật giao hàng thành công!", "success");
        renderProfilePage(container); // Reload page
      } catch (err) {
        showToast("Lỗi cập nhật giao hàng: " + err.message, "error");
        btn.disabled = false;
      }
    });
  });

  // 4. Status Filtering Handlers for Orders & Sales Panels
  container.querySelectorAll(".dashboard-panel").forEach(panel => {
    const filterBtns = panel.querySelectorAll(".order-status-filters .btn-filter");
    const orderItems = panel.querySelectorAll(".order-item");
    if (filterBtns.length > 0) {
      filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          filterBtns.forEach(b => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          const filter = btn.getAttribute("data-filter");
          orderItems.forEach(item => {
            if (filter === "all" || item.getAttribute("data-filter-status") === filter) {
              item.style.display = "";
            } else {
              item.style.display = "none";
            }
          });
        });
      });
    }
  });

  /* ── DONATION FLOW INTERACTION HANDLERS ── */

  // 1. Member Donate Item Button Clicked (Opens modal)
  container.querySelectorAll(".btn-donate-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const itemTitle = btn.getAttribute("data-title");
      showDonationModal(itemTitle, (orgName, descText) => {
        // Add to tracked donations in localStorage
        const stored = localStorage.getItem("ecocycle_tracked_donations");
        const list = stored ? JSON.parse(stored) : [];
        const newId = "temp-" + Date.now();
        list.unshift({
          id: newId,
          org: orgName,
          items: itemTitle,
          date: new Date().toLocaleDateString("vi-VN"),
          status: "PENDING",
          orgAvatar: "https://i.pravatar.cc/40?img=60",
          description: descText,
          username: profile.username
        });
        localStorage.setItem("ecocycle_tracked_donations", JSON.stringify(list));
        showToast("Đã gửi yêu cầu quyên góp thành công!", "success");
        renderProfilePage(container);
      });
    });
  });

  // 2. Org Accept Donation Request
  container.querySelectorAll(".btn-accept-donation").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      try {
        btn.disabled = true;
        await acceptDonationRequest(id);
        const list = JSON.parse(localStorage.getItem("ecocycle_tracked_donations") || "[]");
        const item = list.find(d => d.id === id);
        if (item) item.status = "ACCEPTED";
        localStorage.setItem("ecocycle_tracked_donations", JSON.stringify(list));
        showToast("Đã chấp nhận yêu cầu quyên góp!", "success");
        renderProfilePage(container);
      } catch (err) {
        showToast("Lỗi phê duyệt: " + err.message, "error");
        btn.disabled = false;
      }
    });
  });

  // 3. Org Reject Donation Request
  container.querySelectorAll(".btn-reject-donation").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const reason = prompt("Nhập lý do từ chối yêu cầu quyên góp:");
      if (reason === null) return;
      if (!reason.trim()) {
        showToast("Vui lòng nhập lý do từ chối!", "error");
        return;
      }
      try {
        btn.disabled = true;
        await rejectDonationRequest(id, reason.trim());
        const list = JSON.parse(localStorage.getItem("ecocycle_tracked_donations") || "[]");
        const item = list.find(d => d.id === id);
        if (item) {
          item.status = "REJECTED";
          item.rejectedReason = reason.trim();
        }
        localStorage.setItem("ecocycle_tracked_donations", JSON.stringify(list));
        showToast("Đã từ chối yêu cầu quyên góp!", "success");
        renderProfilePage(container);
      } catch (err) {
        showToast("Lỗi từ chối: " + err.message, "error");
        btn.disabled = false;
      }
    });
  });

  // 4. Member Ship Request (Ship: shipping -> shipped)
  container.querySelectorAll(".btn-ship-donation").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const parent = btn.closest(".donation-details");
      const input = parent?.querySelector(".shipping-tracking-input");
      const trackingCode = input?.value?.trim();
      if (!trackingCode) {
        showToast("Vui lòng nhập mã vận đơn (Tracking Code) trước khi gửi hàng!", "error");
        return;
      }
      try {
        btn.disabled = true;
        await shippingDonationRequest(id);
        await shippedDonationRequest(id);
        const list = JSON.parse(localStorage.getItem("ecocycle_tracked_donations") || "[]");
        const item = list.find(d => d.id === id);
        if (item) {
          item.status = "SHIPPED";
          item.trackingCode = trackingCode;
        }
        localStorage.setItem("ecocycle_tracked_donations", JSON.stringify(list));
        showToast("Đã gửi hàng thành công!", "success");
        renderProfilePage(container);
      } catch (err) {
        showToast("Lỗi cập nhật gửi hàng: " + err.message, "error");
        btn.disabled = false;
      }
    });
  });

  // 5. Org Confirm Received Shipment
  container.querySelectorAll(".btn-received-donation").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      try {
        btn.disabled = true;
        await receivedDonationRequest(id);
        const list = JSON.parse(localStorage.getItem("ecocycle_tracked_donations") || "[]");
        const item = list.find(d => d.id === id);
        if (item) item.status = "RECEIVED";
        localStorage.setItem("ecocycle_tracked_donations", JSON.stringify(list));
        showToast("Đã xác nhận nhận được hàng!", "success");
        renderProfilePage(container);
      } catch (err) {
        showToast("Lỗi xác nhận nhận hàng: " + err.message, "error");
        btn.disabled = false;
      }
    });
  });

  // 6. Member Cancel Request
  container.querySelectorAll(".btn-cancel-donation").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const reason = prompt("Nhập lý do hủy yêu cầu quyên góp này:");
      if (reason === null) return;
      if (!reason.trim()) {
        showToast("Vui lòng nhập lý do hủy!", "error");
        return;
      }
      try {
        btn.disabled = true;
        await cancelDonationRequest(id, reason.trim());
        const list = JSON.parse(localStorage.getItem("ecocycle_tracked_donations") || "[]");
        const item = list.find(d => d.id === id);
        if (item) {
          item.status = "CANCELLED";
          item.cancelReason = reason.trim();
        }
        localStorage.setItem("ecocycle_tracked_donations", JSON.stringify(list));
        showToast("Đã hủy yêu cầu quyên góp!", "success");
        renderProfilePage(container);
      } catch (err) {
        showToast("Lỗi hủy yêu cầu: " + err.message, "error");
        btn.disabled = false;
      }
    });
  });

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
