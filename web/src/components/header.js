/**
 * EcoCycle – Site Header Component
 * Renders a sticky navigation header with the official logo + wordmark.
 * Used across Login, Register, and all future pages.
 */

import './header.css';
import { isAuthenticated, getUser, logoutApi } from '../services/auth.service.js';

/**
 * Inject the header as the first child of <body>.
 * Call once per page render — it replaces any existing header.
 *
 * @param {object} [opts]
 * @param {string} [opts.activePage] - 'login' | 'register' | '' — highlights correct nav link
 */
export function renderHeader(opts = {}) {
  // Remove any existing header to avoid duplicates on re-render
  const existing = document.getElementById('site-header');
  if (existing) existing.remove();

  const authenticated = isAuthenticated();
  const user = getUser();

  const header = document.createElement('header');
  header.id = 'site-header';
  header.className = 'site-header';
  header.setAttribute('role', 'banner');

  header.innerHTML = `
    <div class="site-header__inner">

      <!-- Logo + Wordmark -->
      <a href="#/" class="site-header__brand" aria-label="EcoCycle – Trang chủ">
        <img
          src="/logo.svg"
          alt="EcoCycle logo"
          class="site-header__logo"
          width="36"
          height="36"
        />
        <span class="site-header__wordmark">EcoCycle</span>
      </a>

      <!-- Nav links (desktop) -->
      <nav class="site-header__nav" aria-label="Điều hướng chính">
        <a href="#/products" class="site-header__nav-link ${opts.activePage === 'products' ? 'is-active' : ''}">Sản phẩm</a>
        <a href="#/explore" class="site-header__nav-link ${opts.activePage === 'explore' ? 'is-active' : ''}">Khám phá</a>
        <a href="#/map"     class="site-header__nav-link ${opts.activePage === 'map'     ? 'is-active' : ''}">Bản đồ</a>
        <a href="#/community" class="site-header__nav-link ${opts.activePage === 'community' ? 'is-active' : ''}">Cộng đồng</a>
      </nav>

      <!-- Auth actions -->
      <div class="site-header__actions">
        ${authenticated
          ? `
            <div class="site-header__user-dropdown" id="header-user-menu">
              <div class="site-header__user-trigger">
                <span class="site-header__user-avatar">
                  ${(user?.fullName ?? user?.name ?? 'U')[0].toUpperCase()}
                </span>
                <span class="site-header__user-name">${user?.fullName ?? user?.name ?? 'Tài khoản'}</span>
              </div>
              <div class="site-header__dropdown-menu">
                <a href="#/profile" class="site-header__dropdown-item">Tài Khoản Của Tôi</a>
                <a href="javascript:void(0)" class="site-header__dropdown-item" onclick="alert('Tính năng Đơn mua sẽ sớm ra mắt!')">Đơn Mua</a>
                ${user?.role === 'admin' ? `<a href="#/admin" class="site-header__dropdown-item">Trang Quản Trị</a>` : ''}
                <button class="site-header__dropdown-item" id="header-logout-btn">Đăng Xuất</button>
              </div>
            </div>
          `
          : `
            <a href="#/login"
               class="site-header__btn-ghost ${opts.activePage === 'login' ? 'is-active' : ''}"
               id="header-login-link">
              Đăng nhập
            </a>
            <a href="#/register"
               class="site-header__btn-primary ${opts.activePage === 'register' ? 'is-active' : ''}"
               id="header-register-link">
              Đăng ký
            </a>
          `
        }
      </div>

      <!-- Mobile hamburger -->
      <button class="site-header__hamburger" id="header-hamburger" aria-label="Mở menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>

    </div>

    <!-- Mobile drawer -->
    <div class="site-header__drawer" id="header-drawer" aria-hidden="true">
      <nav class="site-header__drawer-nav">
        <a href="#/products"  class="site-header__drawer-link">Sản phẩm</a>
        <a href="#/explore"   class="site-header__drawer-link">Khám phá</a>
        <a href="#/map"       class="site-header__drawer-link">Bản đồ</a>
        <a href="#/community" class="site-header__drawer-link">Cộng đồng</a>
        <a href="#/profile"   class="site-header__drawer-link">Hồ sơ của tôi</a>
        ${user?.role === 'admin' ? `<a href="#/admin" class="site-header__drawer-link" style="color: #006B2C; font-weight: 600;">Trang Quản trị</a>` : ''}
        <hr class="site-header__drawer-divider"/>
        ${authenticated
          ? `<a href="#/logout" class="site-header__drawer-link site-header__drawer-link--danger">Đăng xuất</a>`
          : `
            <a href="#/login"    class="site-header__drawer-link">Đăng nhập</a>
            <a href="#/register" class="site-header__drawer-link site-header__drawer-link--primary">Đăng ký miễn phí</a>
          `
        }
      </nav>
    </div>
  `;

  // Insert before everything else in body
  document.body.insertBefore(header, document.body.firstChild);

  /* ── Hamburger toggle ── */
  const hamburger = document.getElementById('header-hamburger');
  const drawer    = document.getElementById('header-drawer');

  hamburger?.addEventListener('click', () => {
    const open = drawer.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
    hamburger.classList.toggle('is-open', open);
  });

  // Close drawer on any drawer link click
  drawer?.querySelectorAll('.site-header__drawer-link').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      hamburger.classList.remove('is-open');
    });
  });

  /* ── Logout button (desktop) ── */
  document.getElementById('header-logout-btn')?.addEventListener('click', async () => {
    await logoutApi();
    window.location.hash = '#/login';
  });

  /* ── Scroll shadow ── */
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 4);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
