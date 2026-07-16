/**
 * EcoCycle Web - Profile Main Page Controller
 * Modularized controller (<250 lines) coordinating layout, tabs, and subcomponents.
 */

import "../../styles/profile.css";
import { isAuthenticated, logout } from "../../services/auth.service.js";
import { 
  getMyProfile, 
  getAllOrganizationsApi, 
  getMyOrganizationDetailApi, 
  getDonationEventsByOrgIdApi, 
  getAllDonationEventsApi,
  getOrgDonationRequestsApi 
} from "../../services/profile.service.js";
import { getOrdersByBuyer, getOrdersBySeller } from "../../services/order.service.js";
import { getMyWardrobe } from "../../services/wardrobe.service.js";
import { getAllProducts, isDraftProduct, getMyProducts } from "../../services/product.service.js";
import { apiFetch } from "../../utils/api.js";

import { renderWardrobePanel } from "./WardrobePanel.js";
import { renderShopPanel } from "./ShopPanel.js";
import { renderDonationsTab } from "./DonationsTab.js";
import { renderSettingsTab } from "./SettingsTab.js";
import { renderDonationModal } from "./DonationModal.js";

export async function renderProfilePage(container, initialTab = null) {
  if (!isAuthenticated()) {
    window.location.hash = "#/login";
    return;
  }

  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-surface pt-20">
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
      <div class="min-h-screen bg-surface pt-[104px] pb-12 flex items-center justify-center px-4">
        <div class="max-w-md w-full p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
          <span class="material-symbols-outlined text-5xl text-error mb-2">error</span>
          <h3 class="text-title-lg font-bold text-on-surface">Không thể tải hồ sơ</h3>
          <p class="text-body-sm text-on-surface-variant mt-1">${err.message}</p>
          <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold">Thử lại</button>
        </div>
      </div>
    `;
    return;
  }

  // Fetch parallel data based on role
  let orgs = [];
  let orgDetail = null;
  let myEvents = [];
  let donations = [];
  let buyerOrders = [];
  let sellerOrders = [];
  let wardrobe = [];
  let myProducts = [];
  let drafts = [];

  try {
    const isOrg = profile.role === "org";
    
    if (isOrg) {
      const [detailRes, eventsRes, requestsRes] = await Promise.all([
        getMyOrganizationDetailApi().catch(() => null),
        getAllDonationEventsApi().catch(() => []),
        getOrgDonationRequestsApi().catch(() => [])
      ]);
      orgDetail = detailRes;
      if (orgDetail && orgDetail.id) {
        myEvents = Array.isArray(eventsRes) 
          ? eventsRes.filter(ev => String(ev.organizationId || ev.orgId) === String(orgDetail.id)) 
          : [];
      }
      donations = Array.isArray(requestsRes) ? requestsRes : [];
    } else {
      const [bOrders, sOrders, wItems, prods, orgsList, allEvents, allReqs] = await Promise.all([
        getOrdersByBuyer().catch(() => []),
        getOrdersBySeller().catch(() => []),
        getMyWardrobe().catch(() => []),
        getMyProducts().catch(() => []),
        getAllOrganizationsApi().catch(() => []),
        getAllDonationEventsApi().catch(() => []),
        apiFetch("/api/donation-requests/my-requests", { method: "GET" }).catch(() => [])
      ]);
      buyerOrders = bOrders;
      sellerOrders = sOrders;
      wardrobe = wItems;
      myProducts = prods.filter(p => !isDraftProduct(p));
      drafts = prods.filter(p => isDraftProduct(p));
      orgs = orgsList;
      myEvents = allEvents;
      donations = Array.isArray(allReqs) ? allReqs : [];
    }
  } catch (err) {
    console.warn("Failed to load some profile data:", err);
  }

  const isOrg = profile.role === "org";

  container.innerHTML = `
    <div class="min-h-screen bg-surface pt-[90px] pb-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <!-- Sidebar Navigation -->
        <div class="md:col-span-1 flex flex-col gap-6">
          
          <!-- User Info Card -->
          <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col items-center text-center">
            <div class="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl mb-3 border-2 border-primary/20 shadow-inner overflow-hidden">
              ${profile.avatarUrl ? `<img src="${profile.avatarUrl}" class="w-full h-full object-cover" />` : (profile.fullName || profile.username || "U").substring(0,2).toUpperCase()}
            </div>
            <h2 class="text-title-md font-bold text-on-surface">${profile.fullName || profile.username}</h2>
            <p class="text-body-sm text-on-surface-variant mt-0.5">${profile.email || "Thành viên EcoCycle"}</p>
            
            <div class="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isOrg ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}">
              <span class="material-symbols-outlined text-sm">${isOrg ? 'corporate_fare' : 'checkroom'}</span>
              ${isOrg ? 'Tổ chức Quyên góp' : 'Thành viên Cá nhân'}
            </div>
          </div>

          <!-- Tab Buttons Menu -->
          <div class="bg-surface-container-lowest rounded-2xl p-3 border border-outline-variant/30 shadow-sm flex flex-col gap-1">
            ${
              !isOrg ? `
              <button class="tab-btn w-full px-4 py-3 rounded-xl text-left font-semibold text-sm flex items-center gap-3 transition-colors text-on-surface-variant hover:bg-surface-variant/50" data-tab="wardrobe">
                <span class="material-symbols-outlined">checkroom</span>
                <span>Tủ đồ của tôi</span>
              </button>
              <button class="tab-btn w-full px-4 py-3 rounded-xl text-left font-semibold text-sm flex items-center gap-3 transition-colors text-on-surface-variant hover:bg-surface-variant/50" data-tab="shop">
                <span class="material-symbols-outlined">storefront</span>
                <span>Cửa hàng / Đơn hàng</span>
              </button>
              ` : ''
            }
            <button class="tab-btn w-full px-4 py-3 rounded-xl text-left font-semibold text-sm flex items-center gap-3 transition-colors text-on-surface-variant hover:bg-surface-variant/50" data-tab="donations">
              <span class="material-symbols-outlined">volunteer_activism</span>
              <span>${isOrg ? 'Quản lý Quyên góp' : 'Lịch sử Quyên góp'}</span>
            </button>
            <button class="tab-btn w-full px-4 py-3 rounded-xl text-left font-semibold text-sm flex items-center gap-3 transition-colors text-on-surface-variant hover:bg-surface-variant/50" data-tab="settings">
              <span class="material-symbols-outlined">manage_accounts</span>
              <span>Cài đặt Tài khoản</span>
            </button>
            
            <div class="border-t border-outline-variant/30 my-1 pt-1"></div>
            <button id="btn-logout" class="w-full px-4 py-3 rounded-xl text-left font-semibold text-sm flex items-center gap-3 text-error hover:bg-error/10 transition-colors">
              <span class="material-symbols-outlined">logout</span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        <!-- Main Content Area -->
        <div id="profile-content-area" class="md:col-span-3"></div>
      </div>
    </div>
  `;

  const contentArea = container.querySelector("#profile-content-area");
  const tabBtns = container.querySelectorAll(".tab-btn");

  let activeTabKey = initialTab || (profile.role === "org" ? "donations" : "wardrobe");

  const refreshPage = (targetTab = null) => {
    const nextTab = typeof targetTab === "string" ? targetTab : activeTabKey;
    renderProfilePage(container, nextTab);
  };

  const openDonationModal = () => {
    renderDonationModal(document.body, {
      organizations: orgs,
      onSuccess: () => refreshPage("donations")
    });
  };

  const switchTab = (tabKey) => {
    activeTabKey = tabKey;
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
      renderWardrobePanel(contentArea, { orders: buyerOrders, wardrobe, profile, onRefresh: () => refreshPage("wardrobe") });
    } else if (tabKey === "shop") {
      renderShopPanel(contentArea, { sellerOrders, myDrafts: drafts, myProducts, onRefresh: () => refreshPage("shop") });
    } else if (tabKey === "donations") {
      renderDonationsTab(contentArea, { 
        profile, 
        orgDetail, 
        events: myEvents, 
        requests: donations, 
        onRefresh: () => refreshPage("donations"), 
        onOpenModal: openDonationModal 
      });
    } else if (tabKey === "settings") {
      renderSettingsTab(contentArea, { profile, orgDetail, onRefresh: () => refreshPage("settings") });
    }
  };

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.getAttribute("data-tab")));
  });

  container.querySelector("#btn-logout")?.addEventListener("click", () => {
    logout();
    window.location.hash = "#/login";
  });

  switchTab(activeTabKey);
}
