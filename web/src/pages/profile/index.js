/**
 * EcoCycle Web - Profile Main Page Controller
 * Modularized controller (<250 lines) coordinating layout, tabs, and subcomponents.
 */

import "../../styles/profile.css";
import { isAuthenticated, logout } from "../../services/auth.service.js";
import { getMyProfile, getAllOrganizationsApi } from "../../services/profile.service.js";
import { getOrdersByBuyer, getOrdersBySeller } from "../../services/order.service.js";
import { getMyWardrobe } from "../../services/wardrobe.service.js";
import { getAllProducts, isDraftProduct } from "../../services/product.service.js";
import { apiFetch } from "../../utils/api.js";

import { renderWardrobePanel } from "./WardrobePanel.js";
import { renderShopPanel } from "./ShopPanel.js";
import { renderDonationsTab } from "./DonationsTab.js";
import { renderSettingsTab } from "./SettingsTab.js";
import { renderDonationModal } from "./DonationModal.js";

export async function renderProfilePage(container) {
  if (!isAuthenticated()) {
    window.location.hash = "#/login";
    return;
  }

  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-surface">
      <div class="flex flex-col items-center gap-3">
        <span class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
        <p class="font-medium text-on-surface-variant">Đang tải hồ sơ cá nhân...</p>
      </div>
    </div>
  `;

  let profile = null;
  try {
    profile = await getMyProfile();
  } catch (err) {
    console.error("Failed to load profile:", err);
    container.innerHTML = `
      <div class="max-w-md mx-auto my-16 p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
        <span class="material-symbols-outlined text-5xl text-error mb-2">error</span>
        <h3 class="text-title-lg font-bold text-on-surface">Không thể tải hồ sơ</h3>
        <p class="text-body-sm text-on-surface-variant mt-1">${err.message}</p>
        <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold">Thử lại</button>
      </div>
    `;
    return;
  }

  // Fetch parallel data
  let buyerOrders = [], sellerOrders = [], wardrobe = [], drafts = [], donations = [], orgs = [];
  try {
    const [bOrders, sOrders, wItems, allProds, orgList, donList] = await Promise.all([
      getOrdersByBuyer().catch(() => []),
      getOrdersBySeller().catch(() => []),
      getMyWardrobe().catch(() => []),
      getAllProducts().catch(() => []),
      getAllOrganizationsApi().catch(() => []),
      apiFetch("/api/donation-requests/lists").catch(() => [])
    ]);

    buyerOrders = Array.isArray(bOrders) ? bOrders : [];
    sellerOrders = Array.isArray(sOrders) ? sOrders : [];
    wardrobe = Array.isArray(wItems) ? wItems : [];
    drafts = Array.isArray(allProds) ? allProds.filter(p => isDraftProduct(p)) : [];
    orgs = Array.isArray(orgList) ? orgList : [];
    donations = Array.isArray(donList) ? donList : [];
  } catch (e) {
    console.warn("Partial data load warning:", e);
  }

  const roleName = profile.role === "admin" ? "Quản trị viên" : profile.role === "org" ? "Tổ chức từ thiện" : "Thành viên";

  container.innerHTML = `
    <div class="profile-page min-h-screen bg-surface py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Sidebar Navigation -->
        <div class="md:col-span-1 flex flex-col gap-6">
          <!-- Profile Brief Card -->
          <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 text-center shadow-sm flex flex-col items-center">
            <img src="${profile.avatar || 'https://i.pravatar.cc/150'}" class="w-24 h-24 rounded-full object-cover shadow-md border-2 border-primary/20 mb-3" />
            <h3 class="font-bold text-on-surface text-lg line-clamp-1">${profile.name || profile.username}</h3>
            <span class="mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase">${roleName}</span>
          </div>

          <!-- Tabs menu -->
          <nav class="bg-surface-container-lowest rounded-2xl p-3 border border-outline-variant/30 shadow-sm flex flex-col gap-1">
            <button class="tab-btn flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors text-on-surface-variant hover:bg-surface-variant/50" data-tab="wardrobe">
              <span class="material-symbols-outlined text-xl">checkroom</span> Tủ đồ & Đơn mua
            </button>
            <button class="tab-btn flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors text-on-surface-variant hover:bg-surface-variant/50" data-tab="shop">
              <span class="material-symbols-outlined text-xl">storefront</span> Quản lý bán hàng
            </button>
            <button class="tab-btn flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors text-on-surface-variant hover:bg-surface-variant/50" data-tab="donations">
              <span class="material-symbols-outlined text-xl">volunteer_activism</span> Quản lý Quyên góp
            </button>
            <button class="tab-btn flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors text-on-surface-variant hover:bg-surface-variant/50" data-tab="settings">
              <span class="material-symbols-outlined text-xl">settings</span> Cài đặt Tài khoản
            </button>
            <div class="border-t border-outline-variant/30 my-1"></div>
            <button id="btn-logout" class="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-error hover:bg-error/10 transition-colors w-full text-left">
              <span class="material-symbols-outlined text-xl">logout</span> Đăng xuất
            </button>
          </nav>
        </div>

        <!-- Main Content Area -->
        <div id="profile-content-area" class="md:col-span-3"></div>
      </div>
    </div>
  `;

  const contentArea = container.querySelector("#profile-content-area");
  const tabBtns = container.querySelectorAll(".tab-btn");

  const refreshPage = () => renderProfilePage(container);

  const openDonationModal = () => {
    renderDonationModal(document.body, {
      organizations: orgs,
      onSuccess: refreshPage
    });
  };

  const switchTab = (tabKey) => {
    tabBtns.forEach(b => {
      if (b.getAttribute("data-tab") === tabKey) {
        b.classList.add("bg-primary", "text-on-primary");
        b.classList.remove("text-on-surface-variant", "hover:bg-surface-variant/50");
      } else {
        b.classList.remove("bg-primary", "text-on-primary");
        b.classList.add("text-on-surface-variant", "hover:bg-surface-variant/50");
      }
    });

    if (tabKey === "wardrobe") {
      renderWardrobePanel(contentArea, { orders: buyerOrders, wardrobe, profile, onRefresh: refreshPage });
    } else if (tabKey === "shop") {
      renderShopPanel(contentArea, { sellerOrders, myDrafts: drafts, onRefresh: refreshPage });
    } else if (tabKey === "donations") {
      renderDonationsTab(contentArea, { profile, requests: donations, onRefresh: refreshPage, onOpenModal: openDonationModal });
    } else if (tabKey === "settings") {
      renderSettingsTab(contentArea, { profile, onRefresh: refreshPage });
    }
  };

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.getAttribute("data-tab")));
  });

  container.querySelector("#btn-logout")?.addEventListener("click", () => {
    logout();
    window.location.hash = "#/login";
  });

  switchTab("wardrobe");
}
