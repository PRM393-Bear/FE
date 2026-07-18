/**
 * EcoCycle – Site Header Component (Figma V2)
 * Renders a sticky navigation header with the official logo + search bar + cart badge.
 */

import "./header.css";
import {
  isAuthenticated,
  getUser,
  logoutApi,
} from "../services/auth.service.js";
import { getCart } from "../services/cart.service.js";
import { getMyNotifications, markNotificationAsRead } from "../services/notification.service.js";
import { chatService } from "../services/chat.service.js";

let notifications = [];

async function updateCartBadge() {
  if (!isAuthenticated()) return;
  const badgeEl = document.getElementById("header-cart-badge");
  if (!badgeEl) return;
  try {
    const cart = await getCart();
    const count = cart?.items?.length || 0;
    if (count > 0) {
      badgeEl.textContent = count > 99 ? "99+" : count;
      badgeEl.classList.remove("hidden");
      badgeEl.style.display = "inline-flex";
    } else {
      badgeEl.classList.add("hidden");
      badgeEl.style.display = "none";
    }
  } catch (e) {
    console.warn("Badge cart fetch error:", e);
  }
}

/**
 * Inject the header as the first child of <body>.
 * Call once per page render.
 *
 * @param {object} [opts]
 * @param {string} [opts.activePage] - 'home' | 'explore' | 'donate' | 'cart' | 'profile'
 */
export function renderHeader(opts = {}) {
  // Clear any existing listeners tied to the old header instance
  if (window._notificationListener) {
    chatService.offNotification(window._notificationListener);
  }
  const existing = document.getElementById("site-header");
  if (existing) existing.remove();

  const authenticated = isAuthenticated();
  const user = getUser();
  const isPendingOrg = authenticated && (user?.role === "organization" || user?.role === "org") && (user?.status === "pending" || user?.status === "rejected");

  const header = document.createElement("header");
  header.id = "site-header";
  header.className = "site-header";
  header.setAttribute("role", "banner");

  header.innerHTML = `
    <!-- Left: Logo & Search -->
    <div class="site-header__left">
      <a href="${isPendingOrg ? '#/pending-approval' : '#/'}" class="site-header__brand" aria-label="EcoCycle">
        <img src="/logo.svg" alt="EcoCycle logo" class="site-header__logo" />
        <span>EcoCycle</span>
      </a>
      
      ${!isPendingOrg ? `
      <div class="site-header__search">
        <span class="material-symbols-outlined">search</span>
        <input type="text" placeholder="Tìm kiếm sản phẩm, người bán..." />
      </div>
      ` : `
      <div style="display:inline-flex;align-items:center;padding:4px 12px;border-radius:999px;background:rgba(245,158,11,0.1);color:#D97706;font-size:13px;font-weight:600;border:1px solid rgba(245,158,11,0.2);margin-left:8px;">
        ${user?.status === "rejected" ? 'Từ Chối Xét Duyệt' : 'Tổ Chức • Chờ Xét Duyệt'}
      </div>
      `}
    </div>

    <!-- Right: Nav & Auth -->
    <div class="site-header__right">
      ${!isPendingOrg ? `
      <nav class="site-header__nav">
        <a href="#/" class="site-header__nav-link ${opts.activePage === 'home' || !opts.activePage ? 'is-active' : ''}">Trang chủ</a>
        <a href="#/products" class="site-header__nav-link ${opts.activePage === 'products' || opts.activePage === 'explore' ? 'is-active' : ''}">Khám phá</a>
        <a href="#/map" class="site-header__nav-link ${opts.activePage === 'map' ? 'is-active' : ''}">Bản đồ</a>
        <a href="#/donate" class="site-header__nav-link ${opts.activePage === 'donate' ? 'is-active' : ''}">Quyên góp</a>
      </nav>
      ` : ''}

      <div class="site-header__actions">
        ${authenticated ? `
          ${!isPendingOrg ? `
          <div class="site-header__notification-dropdown relative" id="header-notification-container">
            <button class="site-header__icon-btn relative" id="header-notification-btn" title="Thông báo">
              <span class="material-symbols-outlined">notifications</span>
              <span id="header-notification-badge" class="absolute -top-1.5 -right-1.5 bg-error text-on-error text-[11px] font-bold w-5 h-5 rounded-full hidden items-center justify-center border-2 border-surface shadow-sm">0</span>
            </button>
            <div class="site-header__notification-menu hidden absolute right-[-40px] sm:right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 overflow-hidden z-50 flex flex-col" id="header-notification-menu">
              <div class="p-3 border-b border-outline-variant/30 bg-surface/50 backdrop-blur font-bold text-on-surface flex justify-between items-center">
                Thông báo
              </div>
              <div class="flex-1 overflow-y-auto max-h-[350px]" id="header-notification-list">
                <div class="p-4 text-center text-sm text-on-surface-variant flex items-center justify-center">
                  <span class="material-symbols-outlined animate-spin mr-2">sync</span> Đang tải...
                </div>
              </div>
            </div>
          </div>

          <a href="#/cart" class="site-header__icon-btn relative ${opts.activePage === 'cart' ? 'bg-surface-variant text-primary' : ''}" title="Giỏ hàng">
            <span class="material-symbols-outlined">shopping_cart</span>
            <span id="header-cart-badge" class="absolute -top-1.5 -right-1.5 bg-error text-on-error text-[11px] font-bold w-5 h-5 rounded-full hidden items-center justify-center border-2 border-surface shadow-sm">0</span>
          </a>
          ` : ''}
          
          <div class="site-header__user-dropdown">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrlaW40yOoCWpNiBstKzrHVSAW72kTTU7p7v-pQe_rDsKJlX4PUBigCH7nF9WKXRK45Hq6mv2ZViHgaMBqK_PzLjMsrJQtoQ7WPS8GcEarFolyXAqS7jbNSdJlJcUyBz0_sENDF3UKiHJHXNm6vDX5pGfiZ8hjHKTp5MmI7N_p6LIdCDQXHfQKbP1-icv_i8Xmu9xMsG4F9g8qj582KVvK_iG9i5t-tv9IOPrLI1X22ZoC-_ytAYpEbfSxleQikMrt6CY9cmPiUP2J" alt="User profile" class="site-header__avatar" />
            
            <div class="site-header__dropdown-menu">
              ${!isPendingOrg ? '<a href="#/profile" class="site-header__dropdown-item">Tài Khoản Của Tôi</a>' : ''}
              ${user?.role === 'admin' ? '<a href="#/admin" class="site-header__dropdown-item">Trang Quản Trị</a>' : ''}
              ${user?.role === 'staff' ? '<a href="#/staff" class="site-header__dropdown-item font-bold text-primary">Khu Vực Staff</a>' : ''}
              <button class="site-header__dropdown-item" id="header-logout-btn">Đăng Xuất</button>
            </div>
          </div>
        ` : `
          <a href="#/login" class="site-header__btn-ghost">Đăng nhập</a>
          <a href="#/register" class="site-header__btn-primary">Đăng ký</a>
        `}
      </div>
    </div>
  `;

  document.body.insertBefore(header, document.body.firstChild);

  if (authenticated) {
    updateCartBadge();
    if (!isPendingOrg) {
      initNotifications();
    }
  }

  // Logout listener
  document.getElementById("header-logout-btn")?.addEventListener("click", async () => {
    await logoutApi();
    window.location.hash = "#/login";
  });

  // Brand click listener to scroll to top if already home
  header.querySelector(".site-header__brand")?.addEventListener("click", (e) => {
    if (window.location.hash === "#/" || window.location.hash === "") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // Search input keydown listener
  const searchInput = header.querySelector(".site-header__search input");
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && searchInput.value.trim()) {
        window.location.hash = `#/products?search=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
  }
}

// Global listen for cart updates across pages
window.addEventListener("ecocycle:cart-updated", () => {
  updateCartBadge();
});

// Notifications Logic
async function initNotifications() {
  try {
    notifications = await getMyNotifications();
    renderNotifications();
  } catch (e) {
    console.error("Failed to fetch notifications", e);
  }

  // Set up dropdown toggle
  const btn = document.getElementById("header-notification-btn");
  const menu = document.getElementById("header-notification-menu");
  if (btn && menu) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("hidden");
    });
    
    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });
  }

  // Set up realtime listener
  window._notificationListener = (newNotification) => {
    notifications.unshift(newNotification);
    renderNotifications();
  };
  chatService.onNotification(window._notificationListener);
}

function renderNotifications() {
  const badgeEl = document.getElementById("header-notification-badge");
  const listEl = document.getElementById("header-notification-list");
  if (!badgeEl || !listEl) return;

  const unreadCount = notifications.filter(n => !n.read).length;
  if (unreadCount > 0) {
    badgeEl.textContent = unreadCount > 99 ? "99+" : unreadCount;
    badgeEl.classList.remove("hidden");
    badgeEl.style.display = "flex";
  } else {
    badgeEl.classList.add("hidden");
    badgeEl.style.display = "none";
  }

  if (notifications.length === 0) {
    listEl.innerHTML = `
      <div class="p-6 text-center flex flex-col items-center text-on-surface-variant opacity-70">
        <span class="material-symbols-outlined text-4xl mb-2">notifications_off</span>
        <span class="text-sm">Bạn chưa có thông báo nào</span>
      </div>
    `;
    return;
  }

  listEl.innerHTML = notifications.map(notif => `
    <div class="p-3 border-b border-outline-variant/30 hover:bg-surface-variant/30 transition-colors cursor-pointer flex gap-3 ${notif.read ? 'opacity-70' : 'bg-primary/5'}" onclick="window.markNotificationRead(this, ${notif.id})">
      <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
        <span class="material-symbols-outlined">${notif.type === 'MESSAGE' ? 'forum' : 'notifications'}</span>
      </div>
      <div class="flex-1">
        <div class="text-sm font-semibold text-on-surface ${!notif.read ? 'text-primary' : ''}">${notif.title}</div>
        <div class="text-xs text-on-surface-variant mt-0.5 line-clamp-2">${notif.message}</div>
        <div class="text-[10px] text-on-surface-variant mt-1.5 opacity-70">
          ${new Date(notif.createdAt).toLocaleString('vi-VN')}
        </div>
      </div>
      ${!notif.read ? '<div class="w-2 h-2 rounded-full bg-primary mt-1.5"></div>' : ''}
    </div>
  `).join("");
}

window.markNotificationRead = async (el, id) => {
  try {
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.read) {
      notif.read = true;
      renderNotifications();
      await markNotificationAsRead(id);
    }
  } catch (e) {
    console.error("Mark read failed", e);
  }
};

