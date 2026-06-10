/**
 * EcoCycle – Profile Page
 * 4 actor types: member | seller | org | admin
 */
import '../styles/profile.css';
import { getUser } from '../services/auth.service.js';
import { getMyProfile, MOCK_PROFILES } from '../services/profile.service.js';

/* ══════════════════════════════════════
   SHARED HELPERS
══════════════════════════════════════ */

function stars(n) {
  return Array.from({length:5}, (_,i) =>
    `<span class="star">${i < n ? '⭐' : '☆'}</span>`
  ).join('');
}

function fmt(n) {
  return n >= 1000 ? (n/1000).toFixed(1).replace('.0','') + 'K' : String(n);
}

function roleLabel(role) {
  return { member:'Thành viên', seller:'Cửa hàng', org:'Tổ chức từ thiện', admin:'Quản trị viên' }[role] ?? role;
}

function coverHtml(p) {
  return `
    <div class="profile-cover">
      <img src="${p.cover}" alt="Ảnh bìa" loading="lazy" onerror="this.style.display='none'"/>
      <div class="profile-cover-overlay"></div>
    </div>`;
}

function identityBarHtml(p, ctaHtml = '') {
  const initials = (p.name ?? 'U')[0].toUpperCase();
  return `
    <div class="profile-identity-bar">
      <div class="profile-avatar-wrap">
        ${p.avatar
          ? `<img src="${p.avatar}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
             <div class="profile-avatar-initials" style="display:none">${initials}</div>`
          : `<div class="profile-avatar-initials">${initials}</div>`}
      </div>
      <div class="profile-identity-info">
        <div class="profile-name-row">
          <h1 class="profile-name">${p.name}</h1>
          ${p.verified ? '<span class="verified-badge">✓</span>' : ''}
        </div>
        <div class="profile-meta-row">
          <span class="role-chip chip--${p.role}">${roleLabel(p.role)}</span>
          ${p.location ? `<span class="profile-location">📍 ${p.location}</span>` : ''}
          ${p.joinedDate ? `<span class="profile-location">🗓 Tham gia ${p.joinedDate}</span>` : ''}
        </div>
      </div>
      <div class="profile-cta-area">${ctaHtml}</div>
    </div>`;
}

/* Tab engine */
function bindTabs(wrapper) {
  const btns   = wrapper.querySelectorAll('.tab-btn');
  const panels = wrapper.querySelectorAll('.tab-panel');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('is-active'));
      panels.forEach(p => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      wrapper.querySelector(`#panel-${btn.dataset.tab}`)?.classList.add('is-active');
    });
  });
}

/* Posts grid */
function postsGridHtml(posts, isSeller = false) {
  if (!posts?.length) return '<p style="color:#6E7B6C;text-align:center;padding:32px 0">Chưa có bài đăng nào.</p>';
  return `<div class="posts-grid">${posts.map(p => `
    <a class="post-card" href="#/product/${p.id}">
      <img src="${p.image}" alt="${p.title}" loading="lazy"/>
      <div class="post-card-body">
        <p class="post-card-title">${p.title}</p>
        <span class="post-card-price">${Number(p.price).toLocaleString('vi')}đ</span>
        <div class="post-card-meta">
          <span class="post-condition">${p.condition}</span>
          ${isSeller && p.qty > 1 ? `<span class="post-qty-badge">x${p.qty}</span>` : '<span class="post-condition" style="background:#E8F5E9">SL: 1</span>'}
        </div>
      </div>
    </a>`).join('')}</div>`;
}

/* Events */
function eventsHtml(events) {
  if (!events?.length) return '<p style="color:#6E7B6C;text-align:center;padding:32px 0">Chưa có sự kiện nào.</p>';
  return events.map(e => `
    <div class="event-card">
      <img src="${e.image}" alt="${e.title}" loading="lazy"/>
      <div class="event-card-body">
        <span class="event-card-status ${e.status === 'Sắp diễn ra' ? 'status--upcoming' : 'status--ended'}">${e.status}</span>
        <p class="event-card-title">${e.title}</p>
        <div class="event-card-detail">
          <span>📅 ${e.date}</span>
          <span>📍 ${e.location}</span>
          ${e.role ? `<span>🏷 ${e.role}</span>` : ''}
        </div>
        ${e.participants ? `<p class="event-participants">👥 ${e.participants.toLocaleString('vi')} người tham gia</p>` : ''}
      </div>
    </div>`).join('');
}

/* Reviews */
function reviewsHtml(reviews) {
  if (!reviews?.length) return '<p style="color:#6E7B6C;text-align:center;padding:32px 0">Chưa có đánh giá nào.</p>';
  return reviews.map(r => `
    <div class="review-item">
      <div class="review-header">
        <img class="review-author-avatar" src="${r.avatar}" alt="${r.author}" loading="lazy"/>
        <div>
          <div class="review-author-name">${r.author}</div>
          <div class="review-date">${r.date}</div>
        </div>
        <div class="review-stars">${stars(r.rating)}</div>
      </div>
      <p class="review-comment">${r.comment}</p>
    </div>`).join('');
}

/* Donations */
function donationsHtml(donations, viewerIsOrg = false) {
  if (!donations?.length) return '<p style="color:#6E7B6C;text-align:center;padding:32px 0">Chưa có lịch sử quyên góp.</p>';
  return donations.map(d => `
    <div class="donation-item">
      <img class="donation-org-avatar" src="${d.orgAvatar ?? d.donorAvatar}" alt="" loading="lazy"/>
      <div class="donation-info">
        <div class="donation-org-name">${viewerIsOrg ? (d.donor ?? '') : (d.org ?? '')}</div>
        <div class="donation-items-text">${d.items}</div>
      </div>
      <div class="donation-meta">
        <span class="donation-date">${d.date}</span>
        <span class="donation-status">✓ ${d.status}</span>
      </div>
    </div>`).join('');
}

/* ══════════════════════════════════════
   MEMBER PROFILE
══════════════════════════════════════ */
function renderMember(container, p) {
  const cta = `<button class="btn-cta-ghost">💬 Nhắn tin</button>`;
  container.innerHTML = `
    <div class="profile-layout">
      ${coverHtml(p)}
      ${identityBarHtml(p, cta)}
      <div class="profile-page-body">
        <div>
          <div class="profile-stats-bar">
            <div class="profile-stat-item"><span class="stat-value">${p.stats.sold}</span><span class="stat-label">Đã bán</span></div>
            <div class="profile-stat-item"><span class="stat-value">${p.stats.bought}</span><span class="stat-label">Đã mua</span></div>
            <div class="profile-stat-item"><span class="stat-value">${p.stats.donated}</span><span class="stat-label">Đã tặng</span></div>
            <div class="profile-stat-item"><span class="stat-value">${p.stats.rating}⭐</span><span class="stat-label">${p.reviewCount} đánh giá</span></div>
          </div>
          <div class="p-card"><p class="p-card-title">Giới thiệu</p><p style="font-size:14px;color:#6E7B6C;line-height:1.7">${p.bio}</p></div>
          <div class="tab-bar" id="member-tabs">
            <button class="tab-btn is-active" data-tab="posts">Bài đăng (${p.posts?.length ?? 0})</button>
            <button class="tab-btn" data-tab="reviews">Đánh giá (${p.reviews?.length ?? 0})</button>
            <button class="tab-btn" data-tab="donations">Quyên góp (${p.donations?.length ?? 0})</button>
          </div>
          <div id="panel-posts" class="tab-panel is-active">${postsGridHtml(p.posts, false)}</div>
          <div id="panel-reviews" class="tab-panel">${reviewsHtml(p.reviews)}</div>
          <div id="panel-donations" class="tab-panel">${donationsHtml(p.donations)}</div>
        </div>
        <div></div>
      </div>
    </div>`;
  bindTabs(container.querySelector('#member-tabs').parentElement);
}

/* ══════════════════════════════════════
   SELLER PROFILE
══════════════════════════════════════ */
function renderSeller(container, p) {
  const cta = `<button class="btn-cta-ghost">💬 Nhắn tin</button><button class="btn-cta-primary">🏪 Xem cửa hàng</button>`;
  container.innerHTML = `
    <div class="profile-layout">
      ${coverHtml(p)}
      ${identityBarHtml(p, cta)}
      <div class="profile-page-body">
        <div>
          <div class="shop-stats-row">
            <div class="shop-stat"><div class="shop-stat-val">${fmt(p.stats.sold)}</div><div class="shop-stat-lbl">Đã bán</div></div>
            <div class="shop-stat"><div class="shop-stat-val">${p.shopStats.activeListings}</div><div class="shop-stat-lbl">Đang đăng</div></div>
            <div class="shop-stat"><div class="shop-stat-val">${p.shopStats.responseRate}</div><div class="shop-stat-lbl">Phản hồi</div></div>
            <div class="shop-stat"><div class="shop-stat-val">${p.shopStats.responseTime}</div><div class="shop-stat-lbl">Thời gian TL</div></div>
          </div>
          <div class="p-card"><p class="p-card-title">Giới thiệu cửa hàng</p><p style="font-size:14px;color:#6E7B6C;line-height:1.7">${p.bio}</p></div>
          <div class="tab-bar" id="seller-tabs">
            <button class="tab-btn is-active" data-tab="posts">Sản phẩm (${p.posts?.length ?? 0})</button>
            <button class="tab-btn" data-tab="events">Sự kiện (${p.events?.length ?? 0})</button>
            <button class="tab-btn" data-tab="donations">Quyên góp (${p.donations?.length ?? 0})</button>
            <button class="tab-btn" data-tab="reviews">Đánh giá (${p.reviews?.length ?? 0})</button>
          </div>
          <div id="panel-posts" class="tab-panel is-active">${postsGridHtml(p.posts, true)}</div>
          <div id="panel-events" class="tab-panel">${eventsHtml(p.events)}</div>
          <div id="panel-donations" class="tab-panel">${donationsHtml(p.donations)}</div>
          <div id="panel-reviews" class="tab-panel">${reviewsHtml(p.reviews)}</div>
        </div>
        <div></div>
      </div>
    </div>`;
  bindTabs(container.querySelector('#seller-tabs').parentElement);
}

/* ══════════════════════════════════════
   ORGANIZATION PROFILE (matches image)
══════════════════════════════════════ */
function renderOrg(container, p) {
  const cta = `<button class="btn-cta-primary">🎁 Tặng đồ cho tổ chức này</button>`;
  const cats = p.acceptedCategories.map(c => `<span class="category-chip">🏷 ${c}</span>`).join('');
  const imp  = p.impactStats;

  container.innerHTML = `
    <div class="profile-layout">
      ${coverHtml(p)}
      ${identityBarHtml(p, cta)}

      <div class="profile-page-body">
        <!-- LEFT: mission + categories + activity + tabs -->
        <div>
          <div class="p-card">
            <p class="p-card-title">Về sứ mệnh của chúng tôi</p>
            <p style="font-size:14px;color:#6E7B6C;line-height:1.75">${p.bio}</p>
          </div>

          <div class="p-card">
            <p class="p-card-title">Loại đồ nhận quyên góp</p>
            <div class="category-chips">${cats}</div>
          </div>

          <div class="p-card">
            <div class="p-card-title-row">
              <span class="p-card-title" style="margin:0">Hoạt động gần đây</span>
              <a href="#/events" class="p-card-link">Xem tất cả</a>
            </div>
            <div class="activity-grid">
              ${p.recentEvents.map(e => `
              <div class="activity-event-card">
                <img src="${e.image}" alt="${e.title}" loading="lazy"/>
                <div class="activity-event-overlay">
                  <span class="activity-event-badge">${e.type}</span>
                  <div class="activity-event-title">${e.title}</div>
                  <div class="activity-event-sub">${e.description}</div>
                </div>
              </div>`).join('')}
              ${p.recentTestimonials.map(t => `
              <div class="activity-testimonial">
                <p class="testimonial-text">"${t.comment}"</p>
                <div class="testimonial-author">
                  <img src="${t.avatar}" alt="${t.author}" loading="lazy"/>
                  <div>
                    <div style="font-size:13px;font-weight:600;color:#1A1A1A">${t.author}</div>
                    <div class="testimonial-time">${t.time}</div>
                  </div>
                </div>
              </div>`).join('')}
            </div>
          </div>

          <!-- Tabs -->
          <div class="tab-bar" id="org-tabs">
            <button class="tab-btn is-active" data-tab="events">Sự kiện (${p.events?.length ?? 0})</button>
            <button class="tab-btn" data-tab="donations">Quyên góp (${p.donations?.length ?? 0})</button>
            <button class="tab-btn" data-tab="reviews">Đánh giá (${p.reviews?.length ?? 0})</button>
          </div>
          <div id="panel-events" class="tab-panel is-active">${eventsHtml(p.events)}</div>
          <div id="panel-donations" class="tab-panel">${donationsHtml(p.donations, true)}</div>
          <div id="panel-reviews" class="tab-panel">${reviewsHtml(p.reviews)}</div>
        </div>

        <!-- RIGHT: stats + map + contact -->
        <div>
          <div class="impact-card">
            <p class="impact-card__title">Số liệu tác động</p>
            <div class="impact-stat">
              <div class="impact-stat__value">${Number(imp.itemsReceived).toLocaleString('vi')}+</div>
              <div class="impact-stat__label">Tổng vật phẩm đã nhận</div>
            </div>
            <div class="impact-stat">
              <div class="impact-stat__value">${imp.eventsOrganized}</div>
              <div class="impact-stat__label">Sự kiện đã tổ chức</div>
            </div>
            <div class="impact-stat">
              <div class="impact-stat__value">${Number(imp.trustedDonors).toLocaleString('vi')}</div>
              <div class="impact-stat__label">Người hiến tặng tin cậy</div>
            </div>
          </div>

          <div class="location-card">
            <div class="location-map-placeholder">🗺️</div>
            <div class="location-info">
              <div class="location-address">
                <span>📍</span>
                <span>${p.address}</span>
              </div>
              <button class="btn-directions" onclick="window.open('https://maps.google.com/?q=${encodeURIComponent(p.address)}','_blank')">Chỉ đường</button>
            </div>
          </div>

          <div class="p-card" style="margin-bottom:0">
            <p class="p-card-title">Liên hệ hỗ trợ</p>
            <div class="contact-item">
              <div class="contact-icon">📞</div>
              <a href="tel:${p.phone}" style="color:#1A1A1A;text-decoration:none">${p.phone}</a>
            </div>
            <div class="contact-item">
              <div class="contact-icon">✉️</div>
              <a href="mailto:${p.email}" style="color:#006B2C;text-decoration:none">${p.email}</a>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  bindTabs(container.querySelector('#org-tabs').parentElement);
}

/* ══════════════════════════════════════
   ADMIN PROFILE
══════════════════════════════════════ */
function renderAdmin(container, p) {
  const s = p.platformStats;
  container.innerHTML = `
    <div class="profile-layout">
      ${coverHtml(p)}
      ${identityBarHtml(p, '')}
      <div class="profile-page-body profile-page-body--full" style="max-width:1100px;margin:0 auto;padding:0 32px 48px">
        <div class="p-card">
          <p class="p-card-title">Thống kê nền tảng hôm nay</p>
          <div class="admin-stats-grid">
            <div class="admin-stat-card"><span class="admin-stat-value">${Number(s.totalUsers).toLocaleString('vi')}</span><div class="admin-stat-label">Tổng người dùng</div></div>
            <div class="admin-stat-card"><span class="admin-stat-value">${Number(s.activeListings).toLocaleString('vi')}</span><div class="admin-stat-label">Tin đăng đang hoạt động</div></div>
            <div class="admin-stat-card"><span class="admin-stat-value">${s.eventsThisMonth}</span><div class="admin-stat-label">Sự kiện tháng này</div></div>
            <div class="admin-stat-card"><span class="admin-stat-value">${Number(s.donationsThisMonth).toLocaleString('vi')}</span><div class="admin-stat-label">Quyên góp tháng này</div></div>
            <div class="admin-stat-card"><span class="admin-stat-value">${s.newUsersToday}</span><div class="admin-stat-label">Người dùng mới hôm nay</div></div>
            <div class="admin-stat-card alert"><span class="admin-stat-value">${s.pendingReports}</span><div class="admin-stat-label">Báo cáo chờ xử lý</div></div>
          </div>
        </div>
        <div class="p-card">
          <p class="p-card-title">Quản lý hệ thống</p>
          <div class="admin-links-grid">
            ${p.quickLinks.map(l => `
            <a class="admin-link-card" href="${l.href}">
              <span class="admin-link-icon">${l.icon}</span>
              <span class="admin-link-label">${l.label}${l.badge ? `<span class="admin-badge">${l.count}</span>` : ''}</span>
              ${l.count !== null && !l.badge ? `<span class="admin-link-count">${Number(l.count).toLocaleString('vi')} mục</span>` : ''}
            </a>`).join('')}
          </div>
        </div>
        <div class="admin-reports p-card">
          <p class="p-card-title">Báo cáo vi phạm gần đây</p>
          ${p.recentReports.map(r => `
          <div class="report-row">
            <span style="font-weight:600;color:#1A1A1A">${r.type}</span>
            <span style="color:#6E7B6C">@${r.user}</span>
            <span style="color:#AAAAAA">${r.time}</span>
            <span class="report-severity sev-${r.severity}">${r.severity === 'high' ? 'Cao' : 'Thấp'}</span>
            <a href="#/admin/reports/${r.id}" style="font-size:13px;font-weight:600;color:#006B2C">Xem →</a>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
}

/* ══════════════════════════════════════
   DEV ROLE SWITCHER
══════════════════════════════════════ */
let _currentRole = null;

function injectDevSwitcher(onSwitch) {
  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!isLocal) return;
  document.getElementById('dev-switcher')?.remove();
  const sw = document.createElement('div');
  sw.id = 'dev-switcher';
  sw.className = 'dev-switcher';
  sw.innerHTML = `
    <div class="dev-switcher-label">🛠 Dev: Vai trò</div>
    ${['member','seller','org','admin'].map(r => `
      <button class="dev-role-btn ${_currentRole===r?'is-active':''}" data-role="${r}">
        ${{ member:'👤 Thành viên', seller:'🏪 Người bán', org:'🏢 Tổ chức', admin:'🔧 Admin' }[r]}
      </button>`).join('')}`;
  document.body.appendChild(sw);
  sw.querySelectorAll('.dev-role-btn').forEach(btn => {
    btn.addEventListener('click', () => { _currentRole = btn.dataset.role; onSwitch(_currentRole); });
  });
}

/* ══════════════════════════════════════
   MAIN ENTRY POINT
══════════════════════════════════════ */
export async function renderProfilePage(container) {
  container.innerHTML = `
    <div style="min-height:60vh;display:flex;align-items:center;justify-content:center;background:#F0F5EF">
      <div style="text-align:center;color:#6E7B6C;font-family:'Be Vietnam Pro',sans-serif">
        <div style="width:40px;height:40px;border:3px solid #DDE5DB;border-top-color:#006B2C;border-radius:50%;animation:spin .75s linear infinite;margin:0 auto 12px"></div>
        <p>Đang tải hồ sơ…</p>
        <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
      </div>
    </div>`;

  let profile;
  try { profile = await getMyProfile(); }
  catch { profile = MOCK_PROFILES.member; }

  if (!_currentRole) _currentRole = profile.role ?? 'member';
  profile = MOCK_PROFILES[_currentRole] ?? profile;

  const render = (role) => {
    const p = MOCK_PROFILES[role] ?? MOCK_PROFILES.member;
    _currentRole = role;
    // Re-inject switcher to update active state
    injectDevSwitcher(render);
    switch (role) {
      case 'seller': renderSeller(container, p); break;
      case 'org':    renderOrg(container, p);    break;
      case 'admin':  renderAdmin(container, p);  break;
      default:       renderMember(container, p); break;
    }
  };

  render(_currentRole);
  injectDevSwitcher(render);
}
