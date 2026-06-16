/**
 * EcoCycle – Private Profile Dashboard
 * This is the private view (Tài khoản của tôi) for the logged-in user.
 * Displays different management panels based on the user's role.
 */

import "../styles/profile.css";
import { getMyProfile, MOCK_PROFILES, updateUserProfile } from "../services/profile.service.js";
import { isAuthenticated, getUser } from "../services/auth.service.js";
import { getAllProducts } from "../services/product.service.js";

/* ══════════════════════════════════════
   HELPERS & UI GENERATORS
   ══════════════════════════════════════ */

function roleLabel(role) {
  return (
    {
      member: "Thành viên",
      seller: "Cửa hàng",
      org: "Tổ chức từ thiện",
      admin: "Quản trị viên",
    }[role] ?? role
  );
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
      <span class="material-symbols-outlined sidebar-nav-icon">${icon}</span>
      <span class="sidebar-nav-label">${label}</span>
    </button>
  `;
}

function showToast(message, type = "success") {
  const existing = document.getElementById("profile-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "profile-toast";
  toast.className = `profile-toast ${type}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : 'error'}</span>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function renderSettingsPanel(p, role) {
  return `
    <div class="dashboard-panel is-active" id="panel-settings">
      <div class="panel-header">
        <h2 class="panel-title">Hồ sơ cá nhân</h2>
        <p class="panel-desc">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>
      <div class="panel-body">
        <div class="settings-layout">
          <form class="settings-form">
            <div class="form-group">
              <label class="form-label" for="settings-username">Tên đăng nhập</label>
              <input type="text" id="settings-username" class="form-input" value="${p.username || p.name}" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="settings-fullname">Tên hiển thị</label>
              <input type="text" id="settings-fullname" class="form-input" value="${p.name}" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="settings-email">Email</label>
              <input type="email" id="settings-email" class="form-input" value="${p.email}" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="settings-phone">Số điện thoại</label>
              <input type="text" id="settings-phone" class="form-input" value="${p.phone}" required />
            </div>
            
            <button type="submit" class="btn-save">Lưu Thay Đổi</button>
          </form>
          
          <div class="avatar-upload">
            <img src="${p.avatar || "https://i.pravatar.cc/150?img=11"}" alt="Avatar" class="avatar-preview" />
            <button type="button" class="btn-upload">
              <span class="material-symbols-outlined" style="font-size:16px;">upload</span>
              Chọn ảnh
            </button>
            <div class="upload-hint">Dung lượng file tối đa 1 MB<br/>Định dạng: .JPEG, .PNG</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderOrdersPanel() {
  const orders = [
    {
      id: "DH012391",
      item: "Áo khoác denim Levi's",
      price: 350000,
      img: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=100",
      status: "Đang giao",
      statusClass: "info",
    },
    {
      id: "DH012345",
      item: "Giày Nike Air Max 90",
      price: 1200000,
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100",
      status: "Đã hoàn thành",
      statusClass: "success",
    },
  ];

  return `
    <div class="dashboard-panel" id="panel-orders">
      <div class="panel-header">
        <h2 class="panel-title">Đơn hàng của tôi</h2>
        <p class="panel-desc">Theo dõi trạng thái các đơn hàng bạn đã mua</p>
      </div>
      <div class="panel-body">
        <div class="data-list">
          ${orders
            .map(
              (o) => `
            <div class="data-item">
              <img src="${o.img}" alt="" class="data-item-img" />
              <div class="data-item-info">
                <h3 class="data-item-title">${o.item}</h3>
                <span class="data-item-meta">Mã ĐH: ${o.id}</span>
              </div>
              <div class="data-item-status">
                <span class="status-badge ${o.statusClass}">${o.status}</span>
                <span class="data-item-price">${o.price.toLocaleString("vi")}đ</span>
                <button class="data-item-action" onclick="alert('Tính năng đang phát triển')">Xem chi tiết</button>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderClosetPanel(posts) {
  return `
    <div class="dashboard-panel" id="panel-closet">
      <div class="panel-header">
        <h2 class="panel-title">Tủ đồ / Sản phẩm đã đăng</h2>
        <p class="panel-desc">Quản lý các sản phẩm bạn đang rao bán hoặc tặng từ cơ sở dữ liệu</p>
      </div>
      <div class="panel-body">
        ${
          posts.length === 0
            ? `
            ${emptyStateHtml("checkroom", "Tủ đồ của bạn đang trống. Hãy đăng sản phẩm mới!")}
            <div style="text-align: center; margin-top: 16px;">
              <button class="btn-primary" onclick="window.location.hash='#/products'">+ Đăng sản phẩm mới</button>
            </div>
            `
            : `
          <div style="margin-bottom: 24px; display: flex; justify-content: flex-end;">
            <button class="btn-primary" onclick="window.location.hash='#/products'">+ Đăng sản phẩm mới</button>
          </div>
          <div class="data-list">
            ${posts
              .map(
                (post) => {
                  const imgUrl = (post.images && post.images.length > 0) 
                    ? post.images[0] 
                    : "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=100";
                  
                  const statusLabel = post.status === "AVAILABLE" ? "Còn hàng" : (post.status === "SOLD" ? "Đã bán" : post.status);
                  const statusClass = post.status === "AVAILABLE" ? "success" : "warning";
                  
                  return `
                    <div class="data-item">
                      <img src="${imgUrl}" alt="${post.title}" class="data-item-img" />
                      <div class="data-item-info">
                        <h3 class="data-item-title">${post.title}</h3>
                        <span class="data-item-meta">Tình trạng: Độ mới ${post.condition ? post.condition * 10 : 90}% | Phân loại: ${post.category || "Chưa phân loại"}</span>
                      </div>
                      <div class="data-item-status">
                        <span class="status-badge ${statusClass}">${statusLabel}</span>
                        <span class="data-item-price">${(post.price || 0).toLocaleString("vi")}₫</span>
                        <div>
                          <button class="data-item-action secondary" onclick="alert('Tính năng đang phát triển')">Sửa</button>
                          <button class="data-item-action danger" onclick="alert('Tính năng đang phát triển')">Xóa</button>
                        </div>
                      </div>
                    </div>
                  `;
                }
              )
              .join("")}
          </div>
        `
        }
      </div>
    </div>
  `;
}

function renderEventsPanel(p) {
  const events = p.events || [];
  return `
    <div class="dashboard-panel" id="panel-events">
      <div class="panel-header">
        <h2 class="panel-title">Quản lý Sự kiện quyên góp</h2>
        <p class="panel-desc">Tạo và theo dõi các chiến dịch quyên góp của tổ chức</p>
      </div>
      <div class="panel-body">
        ${
          events.length === 0
            ? emptyStateHtml("campaign", "Chưa có sự kiện nào.")
            : `
          <div style="margin-bottom: 20px;"><button class="btn-primary">+ Tạo sự kiện mới</button></div>
          <div class="data-list">
            ${events
              .map(
                (e) => `
              <div class="data-item">
                <img src="${e.image}" alt="" class="data-item-img" />
                <div class="data-item-info">
                  <h3 class="data-item-title">${e.title}</h3>
                  <span class="data-item-meta">Ngày: ${e.date} | Địa điểm: ${e.location}</span>
                </div>
                <div class="data-item-status">
                  <span class="status-badge ${e.status === "Đã kết thúc" ? "warning" : "success"}">${e.status}</span>
                  <span class="data-item-meta">${e.participants || 0} người tham gia</span>
                  <button class="data-item-action">Cập nhật tiến độ</button>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        `
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

  // Show loading state
  container.innerHTML = `
    <div class="profile-loading-container">
      <div class="profile-spinner"></div>
      <p>Đang tải dữ liệu hồ sơ từ hệ thống…</p>
    </div>
  `;

  let profile;
  let closetProducts = [];
  try {
    profile = await getMyProfile();

    // Fetch closet products dynamically
    try {
      const allProducts = await getAllProducts();
      closetProducts = allProducts.filter(
        (p) => p.sellerId === profile.id || p.sellerName === profile.username
      );
    } catch (err) {
      console.error("Failed to fetch products for user closet:", err);
    }
  } catch (err) {
    console.error("Failed to load profile:", err);
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

  // Build Sidebar based on role
  let sidebarHtml = "";
  let contentHtml = "";

  if (role === "admin") {
    sidebarHtml = `
      ${renderSidebarItem("panel-settings", "settings", "Cài đặt cá nhân", true)}
      <a href="#/admin" class="sidebar-nav-item">
        <span class="material-symbols-outlined sidebar-nav-icon">analytics</span>
        <span class="sidebar-nav-label">Trang Admin</span>
      </a>
    `;
    contentHtml = renderSettingsPanel(profile, role);
  } else if (role === "org") {
    sidebarHtml = `
      ${renderSidebarItem("panel-settings", "corporate_fare", "Hồ sơ Tổ chức", true)}
      ${renderSidebarItem("panel-events", "campaign", "Sự kiện quyên góp")}
      ${renderSidebarItem("panel-donations", "inventory", "Lịch sử nhận đồ")}
    `;
    contentHtml = `
      ${renderSettingsPanel(profile, role)}
      ${renderEventsPanel(profile)}
      <div class="dashboard-panel" id="panel-donations">
        <div class="panel-header">
          <h2 class="panel-title">Lịch sử nhận đồ</h2>
          <p class="panel-desc">Theo dõi các lượt quyên góp từ cộng đồng</p>
        </div>
        <div class="panel-body">${emptyStateHtml("package_2", "Chưa có dữ liệu nhận đồ")}</div>
      </div>
    `;
  } else if (role === "seller") {
    sidebarHtml = `
      ${renderSidebarItem("panel-settings", "settings", "Hồ sơ cá nhân", true)}
      ${renderSidebarItem("panel-closet", "checkroom", "Quản lý Sản phẩm")}
      ${renderSidebarItem("panel-orders", "receipt_long", "Quản lý Đơn hàng")}
      ${renderSidebarItem("panel-shop", "storefront", "Cài đặt Gian hàng")}
    `;
    contentHtml = `
      ${renderSettingsPanel(profile, role)}
      ${renderClosetPanel(closetProducts)}
      <div class="dashboard-panel" id="panel-orders">
        <div class="panel-header">
          <h2 class="panel-title">Đơn hàng của khách</h2>
          <p class="panel-desc">Quản lý và giao hàng cho khách</p>
        </div>
        <div class="panel-body">${emptyStateHtml("local_shipping", "Chưa có đơn hàng nào của khách")}</div>
      </div>
      <div class="dashboard-panel" id="panel-shop">
        <div class="panel-header">
          <h2 class="panel-title">Cài đặt Gian hàng</h2>
          <p class="panel-desc">Thay đổi ảnh bìa, chính sách cửa hàng</p>
        </div>
        <div class="panel-body">${emptyStateHtml("build", "Tính năng quản lý gian hàng đang phát triển")}</div>
      </div>
    `;
  } else {
    // Default: User (Member)
    sidebarHtml = `
      ${renderSidebarItem("panel-settings", "person", "Hồ sơ của tôi", true)}
      ${renderSidebarItem("panel-orders", "receipt_long", "Đơn Mua")}
      ${renderSidebarItem("panel-closet", "checkroom", "Tủ đồ của tôi")}
    `;
    contentHtml = `
      ${renderSettingsPanel(profile, role)}
      ${renderOrdersPanel()}
      ${renderClosetPanel(closetProducts)}
    `;
  }

  // Assemble the layout with breadcrumbs
  container.innerHTML = `
    <div class="profile-page-wrapper">
      <nav class="profile-breadcrumbs">
        <a href="#/">Trang chủ</a>
        <span class="material-symbols-outlined">chevron_right</span>
        <span class="active-crumb">Tài khoản của tôi</span>
      </nav>

      <div class="profile-dashboard-layout">
        <aside class="dashboard-sidebar">
          <div class="sidebar-user">
            <div class="sidebar-avatar-wrapper">
              <img src="${profile.avatar || "https://i.pravatar.cc/150?img=11"}" alt="Avatar" class="sidebar-avatar" />
            </div>
            <div class="sidebar-user-info">
              <span class="sidebar-name">${profile.name}</span>
              <span class="sidebar-role">
                <span class="material-symbols-outlined" style="font-size:14px;">verified_user</span>
                ${roleLabel(role)}
              </span>
            </div>
          </div>
          <nav class="sidebar-nav">
            ${sidebarHtml}
          </nav>
        </aside>
        
        <main class="dashboard-content">
          ${contentHtml}
        </main>
      </div>
    </div>
  `;

  // Bind tab clicking
  const navItems = container.querySelectorAll(".sidebar-nav-item[data-target]");
  const panels = container.querySelectorAll(".dashboard-panel");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Deactivate all
      navItems.forEach((n) => n.classList.remove("is-active"));
      panels.forEach((p) => p.classList.remove("is-active"));

      // Activate clicked
      item.classList.add("is-active");
      const targetId = item.getAttribute("data-target");
      const targetPanel = container.querySelector(`#${targetId}`);
      if (targetPanel) {
        targetPanel.classList.add("is-active");
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
      submitBtn.innerHTML = `
        <div style="width:16px;height:16px;border:2px solid #ffffff;border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite;"></div>
        Đang lưu...
      `;

      const usernameVal = form.querySelector("#settings-username").value;
      const fullNameVal = form.querySelector("#settings-fullname").value;
      const emailVal = form.querySelector("#settings-email").value;
      const phoneVal = form.querySelector("#settings-phone").value;

      try {
        await updateUserProfile(profile.id, {
          username: usernameVal,
          fullName: fullNameVal,
          email: emailVal,
          phone: phoneVal
        });

        showToast("Cập nhật thông tin tài khoản thành công!", "success");
        // Re-render to show updated info
        setTimeout(() => {
          renderProfilePage(container);
        }, 1000);
      } catch (err) {
        console.error(err);
        showToast("Cập nhật thất bại: " + err.message, "error");
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
}
