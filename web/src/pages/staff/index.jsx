import React from "react";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import CategoriesTab from "./CategoriesTab.jsx";
import OrganizationsTab from "./OrganizationsTab.jsx";
import PendingProductsTab from "./PendingProductsTab.jsx";

export default function Staff() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Guard check: only allow staff or admin to view (or specifically staff as required)
  if (!user || (user.role !== "staff" && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="max-w-md w-full bg-surface-container-lowest border border-error/30 p-8 rounded-2xl text-center shadow-lg">
          <span className="material-symbols-outlined text-5xl text-error mb-3">gpp_bad</span>
          <h2 className="text-headline-sm font-bold text-on-surface">Truy cập bị từ chối</h2>
          <p className="text-body-md text-on-surface-variant mt-2">Trang này được thiết kế dành riêng cho tài khoản Kiểm duyệt viên (Staff).</p>
          <Link to="/" className="mt-6 inline-block px-6 py-3 bg-primary text-on-primary font-bold rounded-xl shadow hover:bg-primary/90 transition-colors">Quay lại Trang chủ</Link>
        </div>
      </div>
    );
  }

  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get("tab") || "pending";

  const handleLogout = async () => {
    logout();
    navigate("/login");
  };

  const activeClass = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all bg-primary text-on-primary shadow-sm";
  const inactiveClass = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-on-surface-variant hover:bg-surface-variant hover:text-on-surface";

  let pageTitle = "Danh sách sản phẩm chờ kiểm duyệt";
  if (tab === "categories") pageTitle = "Quản lý Danh mục Quần áo (Categories)";
  else if (tab === "organizations") pageTitle = "Xét duyệt tài khoản tổ chức (Organizations)";

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col md:flex-row">
      {/* Dedicated Staff Sidebar */}
      <aside className="w-full md:w-64 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col justify-between shrink-0">
        <div>
          {/* Staff Brand/Logo */}
          <div className="p-6 border-b border-outline-variant/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="font-bold text-base text-on-surface leading-tight">EcoCycle Staff</h1>
              <p className="text-xs text-on-surface-variant font-medium">Kiểm duyệt & Danh mục</p>
            </div>
          </div>

          {/* Staff Nav */}
          <nav className="p-4 flex flex-col gap-1.5">
            <Link to="/staff?tab=pending" className={tab === "pending" ? activeClass : inactiveClass}>
              <span className="material-symbols-outlined">fact_check</span>
              Duyệt bài đăng
            </Link>
            <Link to="/staff?tab=categories" className={tab === "categories" ? activeClass : inactiveClass}>
              <span className="material-symbols-outlined">category</span>
              Quản lý Danh mục
            </Link>
            <Link to="/staff?tab=organizations" className={tab === "organizations" ? activeClass : inactiveClass}>
              <span className="material-symbols-outlined">domain_verification</span>
              Xét duyệt tổ chức
            </Link>
          </nav>
        </div>

        {/* Staff Profile & Exit */}
        <div className="p-4 border-t border-outline-variant/30 flex flex-col gap-2">
          <div className="p-3 bg-surface-variant/50 rounded-xl flex items-center gap-3">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Staff')}&background=006B2C&color=fff`} className="w-9 h-9 rounded-full" alt="avatar" />
            <div className="overflow-hidden">
              <p className="font-bold text-sm text-on-surface truncate">{user.name || "Kiểm duyệt viên"}</p>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">Staff Account</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="flex-1 py-2 text-center rounded-lg border border-outline-variant text-xs font-semibold text-on-surface-variant hover:bg-surface transition-colors flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">home</span> Cửa hàng
            </Link>
            <button onClick={handleLogout} className="flex-1 py-2 text-center rounded-lg bg-error/10 text-error text-xs font-semibold hover:bg-error/20 transition-colors flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">logout</span> Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Staff Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Dedicated Staff Header */}
        <header className="bg-surface-container-lowest border-b border-outline-variant/30 px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">verified_user</span>
            <h2 className="text-title-lg font-bold text-on-surface">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-on-surface-variant">
            <span>Phiên làm việc Staff</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
        </header>

        {/* Tab Body */}
        <div className="p-8 flex-1 overflow-y-auto">
          {tab === "pending" && <PendingProductsTab />}
          {tab === "categories" && <CategoriesTab />}
          {tab === "organizations" && <OrganizationsTab />}
        </div>
      </main>
    </div>
  );
}
