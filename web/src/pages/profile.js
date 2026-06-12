/**
 * EcoCycle – Private Profile Dashboard
 * This is the private view (Tài khoản của tôi) for the logged-in user.
 * Displays different management panels based on the user's role.
 */

import '../styles/profile.css';
import { getMyProfile, MOCK_PROFILES } from '../services/profile.service.js';

/* ══════════════════════════════════════
   HELPERS & UI GENERATORS
══════════════════════════════════════ */

function roleLabel(role) {
  return { member: 'Thành viên', seller: 'Cửa hàng', org: 'Tổ chức từ thiện', admin: 'Quản trị viên' }[role] ?? role;
}

function emptyStateHtml(icon, text) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <div class="empty-state-text">${text}</div>
    </div>
  `;
}

function renderSidebarItem(id, icon, label, isActive = false) {
  return `
    <button class="sidebar-nav-item ${isActive ? 'is-active' : ''}" data-target="${id}">
      <span class="sidebar-nav-icon">${icon}</span>
      <span class="sidebar-nav-label">${label}</span>
    </button>
  `;
}

function renderSettingsPanel(p, role) {
  const isOrg = role === 'org';
  const isSeller = role === 'seller';
  
  return `
    <div class="dashboard-panel is-active" id="panel-settings">
      <div class="panel-header">
        <h2 class="panel-title">Hồ sơ cá nhân</h2>
        <p class="panel-desc">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>
      <div class="panel-body">
        <div class="settings-layout">
          <form class="settings-form" onsubmit="event.preventDefault(); alert('Cập nhật thành công!');">
            <div class="form-group">
              <label class="form-label">Tên đăng nhập</label>
              <div class="form-static">${p.id}</div>
            </div>
            <div class="form-group">
              <label class="form-label">Tên hiển thị</label>
              <input type="text" class="form-input" value="${p.name}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <div class="form-static">user@ecocycle.vn <span style="color:#006B2C;font-size:12px;margin-left:8px;cursor:pointer;text-decoration:underline;">Thay đổi</span></div>
            </div>
            <div class="form-group">
              <label class="form-label">Số điện thoại</label>
              <div class="form-static">*********89 <span style="color:#006B2C;font-size:12px;margin-left:8px;cursor:pointer;text-decoration:underline;">Thay đổi</span></div>
            </div>
            ${isSeller || isOrg ? `
              <div class="form-group">
                <label class="form-label">Địa chỉ / Vị trí</label>
                <input type="text" class="form-input" value="${p.location || ''}" />
              </div>
              <div class="form-group">
                <label class="form-label">Mô tả / Giới thiệu</label>
                <textarea class="form-input" rows="4" style="resize:vertical">${p.bio || ''}</textarea>
              </div>
            ` : ''}
            <button type="submit" class="btn-save">Lưu Thay Đổi</button>
          </form>
          
          <div class="avatar-upload">
            <img src="${p.avatar || 'https://i.pravatar.cc/150?img=11'}" alt="Avatar" class="avatar-preview" />
            <button type="button" class="btn-upload">Chọn ảnh</button>
            <div class="upload-hint">Dụng lượng file tối đa 1 MB<br/>Định dạng: .JPEG, .PNG</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderOrdersPanel() {
  // Mock orders data
  const orders = [
    { id: 'DH012391', item: 'Áo khoác denim Levi\'s', price: 350000, img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=100', status: 'Đang giao', statusClass: 'info' },
    { id: 'DH012345', item: 'Giày Nike Air Max 90', price: 1200000, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100', status: 'Đã hoàn thành', statusClass: 'success' },
  ];

  return `
    <div class="dashboard-panel" id="panel-orders">
      <div class="panel-header">
        <h2 class="panel-title">Đơn hàng của tôi</h2>
        <p class="panel-desc">Theo dõi trạng thái các đơn hàng bạn đã mua</p>
      </div>
      <div class="panel-body">
        <div class="data-list">
          ${orders.map(o => `
            <div class="data-item">
              <img src="${o.img}" alt="" class="data-item-img" />
              <div class="data-item-info">
                <h3 class="data-item-title">${o.item}</h3>
                <span class="data-item-meta">Mã ĐH: ${o.id}</span>
              </div>
              <div class="data-item-status">
                <span class="status-badge ${o.statusClass}">${o.status}</span>
                <span class="data-item-price">${o.price.toLocaleString('vi')}đ</span>
                <button class="data-item-action" onclick="alert('Tính năng đang phát triển')">Xem chi tiết</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderClosetPanel(p) {
  const posts = p.posts || [];
  return `
    <div class="dashboard-panel" id="panel-closet">
      <div class="panel-header">
        <h2 class="panel-title">Tủ đồ / Sản phẩm đã đăng</h2>
        <p class="panel-desc">Quản lý các sản phẩm bạn đang rao bán hoặc tặng</p>
      </div>
      <div class="panel-body">
        ${posts.length === 0 ? emptyStateHtml('👕', 'Tủ đồ của bạn đang trống. Hãy đăng sản phẩm mới!') : `
          <div style="margin-bottom: 20px;"><button class="btn-save">+ Đăng sản phẩm mới</button></div>
          <div class="data-list">
            ${posts.map(post => `
              <div class="data-item">
                <img src="${post.image}" alt="" class="data-item-img" />
                <div class="data-item-info">
                  <h3 class="data-item-title">${post.title}</h3>
                  <span class="data-item-meta">Tình trạng: ${post.condition} | Phân loại: ${post.category}</span>
                </div>
                <div class="data-item-status">
                  <span class="status-badge success">Đang hiển thị</span>
                  <span class="data-item-price">${post.price.toLocaleString('vi')}đ</span>
                  <div>
                    <button class="data-item-action" style="margin-right: 8px;">Sửa</button>
                    <button class="data-item-action" style="color:#BA1A1A; border-color:#BA1A1A;">Xóa</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
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
        ${events.length === 0 ? emptyStateHtml('🎪', 'Chưa có sự kiện nào.') : `
          <div style="margin-bottom: 20px;"><button class="btn-save">+ Tạo sự kiện mới</button></div>
          <div class="data-list">
            ${events.map(e => `
              <div class="data-item">
                <img src="${e.image}" alt="" class="data-item-img" />
                <div class="data-item-info">
                  <h3 class="data-item-title">${e.title}</h3>
                  <span class="data-item-meta">Ngày: ${e.date} | Địa điểm: ${e.location}</span>
                </div>
                <div class="data-item-status">
                  <span class="status-badge ${e.status === 'Đã kết thúc' ? 'warning' : 'success'}">${e.status}</span>
                  <span class="data-item-meta">${e.participants} người tham gia</span>
                  <button class="data-item-action">Cập nhật tiến độ</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

/* ══════════════════════════════════════
   MAIN RENDERING LOGIC
══════════════════════════════════════ */

export async function renderProfilePage(container) {
  // Show loading
  container.innerHTML = `
    <div style="min-height:60vh;display:flex;align-items:center;justify-content:center;background:#F5F5F5">
      <div style="text-align:center;color:#6E7B6C;font-family:'Be Vietnam Pro',sans-serif">
        <div style="width:40px;height:40px;border:3px solid #DDE5DB;border-top-color:#006B2C;border-radius:50%;animation:spin .75s linear infinite;margin:0 auto 12px"></div>
        <p>Đang tải dữ liệu hồ sơ…</p>
        <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
      </div>
    </div>
  `;

  let profile;
  try { 
    profile = await getMyProfile(); 
  } catch { 
    profile = MOCK_PROFILES.member; 
  }

  const role = profile.role ?? 'member';

  // Build Sidebar based on role
  let sidebarHtml = '';
  let contentHtml = '';

  if (role === 'admin') {
    sidebarHtml = `
      ${renderSidebarItem('panel-settings', '⚙️', 'Cài đặt cá nhân', true)}
      <a href="#/admin" class="sidebar-nav-item"><span class="sidebar-nav-icon">📊</span><span class="sidebar-nav-label">Bảng điều khiển Admin</span></a>
    `;
    contentHtml = renderSettingsPanel(profile, role);
  } else if (role === 'org') {
    sidebarHtml = `
      ${renderSidebarItem('panel-settings', '🏢', 'Hồ sơ Tổ chức', true)}
      ${renderSidebarItem('panel-events', '🎪', 'Sự kiện quyên góp')}
      ${renderSidebarItem('panel-donations', '🎁', 'Lịch sử nhận đồ')}
    `;
    contentHtml = `
      ${renderSettingsPanel(profile, role)}
      ${renderEventsPanel(profile)}
      <div class="dashboard-panel" id="panel-donations">
        <div class="panel-header">
          <h2 class="panel-title">Lịch sử nhận đồ</h2>
          <p class="panel-desc">Theo dõi các lượt quyên góp từ cộng đồng</p>
        </div>
        <div class="panel-body">${emptyStateHtml('📦', 'Chưa có dữ liệu')}</div>
      </div>
    `;
  } else if (role === 'seller') {
    sidebarHtml = `
      ${renderSidebarItem('panel-settings', '⚙️', 'Hồ sơ cá nhân', true)}
      ${renderSidebarItem('panel-closet', '📦', 'Quản lý Sản phẩm')}
      ${renderSidebarItem('panel-orders', '📋', 'Quản lý Đơn hàng')}
      ${renderSidebarItem('panel-shop', '🏪', 'Cài đặt Gian hàng')}
    `;
    contentHtml = `
      ${renderSettingsPanel(profile, role)}
      ${renderClosetPanel(profile)}
      <div class="dashboard-panel" id="panel-orders">
        <div class="panel-header">
          <h2 class="panel-title">Đơn hàng của khách</h2>
          <p class="panel-desc">Quản lý và giao hàng cho khách</p>
        </div>
        <div class="panel-body">${emptyStateHtml('🚚', 'Chưa có đơn hàng nào')}</div>
      </div>
      <div class="dashboard-panel" id="panel-shop">
        <div class="panel-header">
          <h2 class="panel-title">Cài đặt Gian hàng</h2>
          <p class="panel-desc">Thay đổi ảnh bìa, chính sách cửa hàng</p>
        </div>
        <div class="panel-body">${emptyStateHtml('🔧', 'Tính năng đang phát triển')}</div>
      </div>
    `;
  } else {
    // Default: User (Member)
    sidebarHtml = `
      ${renderSidebarItem('panel-settings', '👤', 'Hồ sơ của tôi', true)}
      ${renderSidebarItem('panel-orders', '🛍️', 'Đơn Mua')}
      ${renderSidebarItem('panel-closet', '👕', 'Tủ đồ của tôi')}
    `;
    contentHtml = `
      ${renderSettingsPanel(profile, role)}
      ${renderOrdersPanel()}
      ${renderClosetPanel(profile)}
    `;
  }

  // Assemble the layout
  container.innerHTML = `
    <div class="profile-dashboard-layout">
      <aside class="dashboard-sidebar">
        <div class="sidebar-user">
          <img src="${profile.avatar || 'https://i.pravatar.cc/150?img=11'}" alt="Avatar" class="sidebar-avatar" />
          <div class="sidebar-user-info">
            <span class="sidebar-name">${profile.name || profile.id}</span>
            <span class="sidebar-role">✏️ ${roleLabel(role)}</span>
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
  `;

  // Bind tab clicking
  const navItems = container.querySelectorAll('.sidebar-nav-item[data-target]');
  const panels = container.querySelectorAll('.dashboard-panel');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Deactivate all
      navItems.forEach(n => n.classList.remove('is-active'));
      panels.forEach(p => p.classList.remove('is-active'));

      // Activate clicked
      item.classList.add('is-active');
      const targetId = item.getAttribute('data-target');
      const targetPanel = container.querySelector(`#${targetId}`);
      if (targetPanel) {
        targetPanel.classList.add('is-active');
      }
    });
  });
}
