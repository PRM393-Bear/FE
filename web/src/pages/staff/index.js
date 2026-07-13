/**
 * EcoCycle Web - Staff Dashboard Layout
 * Dedicated portal for STAFF role (Categories management & Product approval).
 * Completely separated from Admin Dashboard.
 */

import { renderCategoriesTab } from "./CategoriesTab.js";
import { renderPendingProductsTab } from "./PendingProductsTab.js";
import { getUser, logoutApi } from "../../services/auth.service.js";

export function renderStaffDashboard(container) {
  const user = getUser();

  // Guard check: only allow staff or admin to view (or specifically staff as required)
  if (!user || (user.role !== "staff" && user.role !== "admin")) {
    container.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-surface p-4">
        <div class="max-w-md w-full bg-surface-container-lowest border border-error/30 p-8 rounded-2xl text-center shadow-lg">
          <span class="material-symbols-outlined text-5xl text-error mb-3">gpp_bad</span>
          <h2 class="text-headline-sm font-bold text-on-surface">Truy cập bị từ chối</h2>
          <p class="text-body-md text-on-surface-variant mt-2">Trang này được thiết kế dành riêng cho tài khoản Kiểm duyệt viên (Staff).</p>
          <a href="#/" class="mt-6 inline-block px-6 py-3 bg-primary text-on-primary font-bold rounded-xl shadow hover:bg-primary/90 transition-colors">Quay lại Trang chủ</a>
        </div>
      </div>
    `;
    return () => {};
  }

  container.innerHTML = `
    <div class="min-h-screen bg-surface-container-low flex flex-col md:flex-row">
      <!-- Dedicated Staff Sidebar -->
      <aside class="w-full md:w-64 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col justify-between shrink-0">
        <div>
          <!-- Staff Brand/Logo -->
          <div class="p-6 border-b border-outline-variant/30 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
              <span class="material-symbols-outlined">admin_panel_settings</span>
            </div>
            <div>
              <h1 class="font-bold text-base text-on-surface leading-tight">EcoCycle Staff</h1>
              <p class="text-xs text-on-surface-variant font-medium">Kiểm duyệt & Danh mục</p>
            </div>
          </div>

          <!-- Staff Nav -->
          <nav class="p-4 flex flex-col gap-1.5">
            <button id="tab-btn-pending" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all bg-primary text-on-primary shadow-sm">
              <span class="material-symbols-outlined">fact_check</span>
              Duyệt bài đăng
            </button>
            <button id="tab-btn-categories" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-on-surface-variant hover:bg-surface-variant hover:text-on-surface">
              <span class="material-symbols-outlined">category</span>
              Quản lý Danh mục
            </button>
          </nav>
        </div>

        <!-- Staff Profile & Exit -->
        <div class="p-4 border-t border-outline-variant/30 flex flex-col gap-2">
          <div class="p-3 bg-surface-variant/50 rounded-xl flex items-center gap-3">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Staff')}&background=006B2C&color=fff" class="w-9 h-9 rounded-full" />
            <div class="overflow-hidden">
              <p class="font-bold text-sm text-on-surface truncate">${user.name || "Kiểm duyệt viên"}</p>
              <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">Staff Account</span>
            </div>
          </div>
          <div class="flex gap-2">
            <a href="#/" class="flex-1 py-2 text-center rounded-lg border border-outline-variant text-xs font-semibold text-on-surface-variant hover:bg-surface transition-colors flex items-center justify-center gap-1">
              <span class="material-symbols-outlined text-sm">home</span> Cửa hàng
            </a>
            <button id="staff-logout-btn" class="flex-1 py-2 text-center rounded-lg bg-error/10 text-error text-xs font-semibold hover:bg-error/20 transition-colors flex items-center justify-center gap-1">
              <span class="material-symbols-outlined text-sm">logout</span> Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      <!-- Staff Main Content Area -->
      <main class="flex-1 flex flex-col min-w-0">
        <!-- Dedicated Staff Header -->
        <header class="bg-surface-container-lowest border-b border-outline-variant/30 px-8 py-4 flex justify-between items-center shadow-sm">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">verified_user</span>
            <h2 id="staff-page-title" class="text-title-lg font-bold text-on-surface">Danh sách sản phẩm chờ kiểm duyệt</h2>
          </div>
          <div class="flex items-center gap-4 text-xs font-semibold text-on-surface-variant">
            <span>Phiên làm việc Staff</span>
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
        </header>

        <!-- Tab Body -->
        <div id="staff-content-area" class="p-8 flex-1 overflow-y-auto"></div>
      </main>
    </div>
  `;

  const btnPending = container.querySelector("#tab-btn-pending");
  const btnCategories = container.querySelector("#tab-btn-categories");
  const pageTitle = container.querySelector("#staff-page-title");
  const contentArea = container.querySelector("#staff-content-area");

  function switchTab(tab) {
    if (tab === "pending") {
      btnPending.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all bg-primary text-on-primary shadow-sm";
      btnCategories.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-on-surface-variant hover:bg-surface-variant hover:text-on-surface";
      pageTitle.textContent = "Danh sách sản phẩm chờ kiểm duyệt";
      renderPendingProductsTab(contentArea);
    } else if (tab === "categories") {
      btnCategories.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all bg-primary text-on-primary shadow-sm";
      btnPending.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-on-surface-variant hover:bg-surface-variant hover:text-on-surface";
      pageTitle.textContent = "Quản lý Danh mục Thời trang (Categories)";
      renderCategoriesTab(contentArea);
    }
  }

  btnPending?.addEventListener("click", () => switchTab("pending"));
  btnCategories?.addEventListener("click", () => switchTab("categories"));

  container.querySelector("#staff-logout-btn")?.addEventListener("click", async () => {
    await logoutApi();
    window.location.hash = "#/login";
  });

  // Default tab
  switchTab("pending");

  return () => {};
}
