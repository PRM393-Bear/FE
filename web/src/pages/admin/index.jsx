import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import OverviewTab from "./OverviewTab.jsx";
import UsersTab from "./UsersTab.jsx";
import DonationsTab from "./DonationsTab.jsx";
import AuditLogsTab from "./AuditLogsTab.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { showToast } from "../../utils/ui.js";

export default function Admin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get("tab") || "overview";

  const isUsersTab = tab === "users";
  const isDonationsTab = tab === "donations";
  const isAuditTab = tab === "audit";
  const isOverviewTab = tab === "overview";

  const getNavClass = (isActive) => isActive
    ? 'text-primary-fixed font-bold border-l-4 border-primary-fixed bg-on-surface-variant/10 transition-all duration-200 opacity-90'
    : 'text-surface-variant font-label-md hover:text-surface-bright hover:bg-on-surface-variant/10 transition-colors duration-200';

  const overviewNavClass = getNavClass(isOverviewTab);
  const usersNavClass = getNavClass(isUsersTab);
  const donationsNavClass = getNavClass(isDonationsTab);
  const auditNavClass = getNavClass(isAuditTab);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/login");
  };

  return (
    <div className="font-body-md text-body-md overflow-hidden bg-background w-full h-full relative text-on-surface">
      {/* SideNavBar Shell */}
      <aside className="fixed left-0 top-0 h-full flex flex-col py-stack-lg bg-inverse-surface shadow-md w-64 z-50">
        <div className="px-stack-lg mb-stack-xl">
          <h1 className="text-headline-md font-headline-md text-primary-fixed">Lifecycle</h1>
          <p className="text-label-sm text-surface-variant opacity-80 uppercase tracking-widest">Admin Console</p>
        </div>
        <nav className="flex-1 flex flex-col gap-stack-xs overflow-y-auto scrollbar-hide">
          <Link to="/admin?tab=overview" className={`flex items-center gap-stack-md py-3 pl-4 ${overviewNavClass}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md">Tổng quan</span>
          </Link>
          <Link to="/admin?tab=users" className={`flex items-center gap-stack-md py-3 pl-4 ${usersNavClass}`}>
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-md">Quản lý User</span>
          </Link>
          <button onClick={() => showToast('Tính năng đang phát triển', 'info')} className="flex items-center gap-stack-md py-3 text-surface-variant font-label-md hover:text-surface-bright pl-4 hover:bg-on-surface-variant/10 transition-colors duration-200 text-left">
            <span className="material-symbols-outlined">package_2</span>
            <span className="font-label-md">Giao dịch</span>
          </button>
          <Link to="/admin?tab=donations" className={`flex items-center gap-stack-md py-3 pl-4 ${donationsNavClass}`}>
            <span className="material-symbols-outlined">featured_seasonal_and_gifts</span>
            <span className="font-label-md">Donation</span>
          </Link>
          <Link to="/admin?tab=audit" className={`flex items-center gap-stack-md py-3 pl-4 ${auditNavClass}`}>
            <span className="material-symbols-outlined">policy</span>
            <span className="font-label-md">Lưu vết hệ thống (Audit Logs)</span>
          </Link>
          <button onClick={() => showToast('Tính năng đang phát triển', 'info')} className="flex items-center gap-stack-md py-3 text-surface-variant font-label-md hover:text-surface-bright pl-4 hover:bg-on-surface-variant/10 transition-colors duration-200 text-left">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md">Cài đặt</span>
          </button>
        </nav>
        <div className="mt-auto px-stack-lg border-t border-outline/20 pt-stack-lg flex flex-col gap-2">
          <button onClick={() => showToast('Tính năng đang phát triển', 'info')} className="flex items-center gap-stack-md py-3 text-surface-variant font-label-md hover:text-surface-bright transition-colors duration-200">
            <span className="material-symbols-outlined">account_circle</span>
            <span className="font-label-md">Admin Profile</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-stack-md py-3 text-error font-label-md hover:opacity-80 transition-colors duration-200">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {isUsersTab ? <UsersTab /> : (isDonationsTab ? <DonationsTab /> : (isAuditTab ? <AuditLogsTab /> : <OverviewTab />))}
    </div>
  );
}
