import { renderOverviewTab, attachOverviewListeners } from './OverviewTab.js';
import { renderUsersTab, attachUsersListeners } from './UsersTab.js';
import { renderDonationsTab, attachDonationsListeners } from './DonationsTab.js';
import { renderAuditLogsTab, attachAuditLogsListeners } from './AuditLogsTab.js';

window.toggleDrawer = function (open) {
  const drawer = document.getElementById('userDrawer');
  const backdrop = document.getElementById('backdrop');
  if (open && drawer && backdrop) {
    drawer.classList.remove('translate-x-full');
    backdrop.classList.remove('hidden');
    setTimeout(() => backdrop.classList.add('opacity-100'), 10);
  } else if (drawer && backdrop) {
    drawer.classList.add('translate-x-full');
    backdrop.classList.remove('opacity-100');
    setTimeout(() => backdrop.classList.add('hidden'), 300);
  }
};

export async function renderAdminPage(container) {
  const hash = window.location.hash;
  const isUsersTab = hash.includes("tab=users");
  const isOrganizationsTab = hash.includes("tab=organizations");
  const isDonationsTab = hash.includes("tab=donations");
  const isAuditTab = hash.includes("tab=audit");
  const isOverviewTab = !isUsersTab && !isOrganizationsTab && !isDonationsTab && !isAuditTab;

  const getNavClass = (isActive) => isActive
    ? 'text-primary-fixed font-bold border-l-4 border-primary-fixed bg-on-surface-variant/10 transition-all duration-200 opacity-90'
    : 'text-surface-variant font-label-md hover:text-surface-bright hover:bg-on-surface-variant/10 transition-colors duration-200';

  const overviewNavClass = getNavClass(isOverviewTab);
  const usersNavClass = getNavClass(isUsersTab);
  const organizationsNavClass = getNavClass(isOrganizationsTab);
  const donationsNavClass = getNavClass(isDonationsTab);
  const auditNavClass = getNavClass(isAuditTab);

  container.innerHTML = `
    <div class="font-body-md text-body-md overflow-hidden bg-background w-full h-full relative text-on-surface">
      <!-- SideNavBar Shell -->
      <aside class="fixed left-0 top-0 h-full flex flex-col py-stack-lg bg-inverse-surface shadow-md w-64 z-50">
        <div class="px-stack-lg mb-stack-xl">
          <h1 class="text-headline-md font-headline-md text-primary-fixed">Lifecycle</h1>
          <p class="text-label-sm text-surface-variant opacity-80 uppercase tracking-widest">Admin Console</p>
        </div>
        <nav class="flex-1 flex flex-col gap-stack-xs overflow-y-auto scrollbar-hide">
          <a class="flex items-center gap-stack-md py-3 pl-4 ${overviewNavClass}" href="#/admin?tab=overview">
            <span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
            <span class="font-label-md">Tổng quan</span>
          </a>
          <a class="flex items-center gap-stack-md py-3 pl-4 ${usersNavClass}" href="#/admin?tab=users">
            <span class="material-symbols-outlined" data-icon="group">group</span>
            <span class="font-label-md">Quản lý User</span>
          </a>
          <a class="flex items-center gap-stack-md py-3 text-surface-variant font-label-md hover:text-surface-bright pl-4 hover:bg-on-surface-variant/10 transition-colors duration-200" href="javascript:alert('Tính năng đang phát triển')">
            <span class="material-symbols-outlined" data-icon="package_2">package_2</span>
            <span class="font-label-md">Giao dịch</span>
          </a>
          <a class="flex items-center gap-stack-md py-3 pl-4 ${donationsNavClass}" href="#/admin?tab=donations">
            <span class="material-symbols-outlined" data-icon="featured_seasonal_and_gifts">featured_seasonal_and_gifts</span>
            <span class="font-label-md">Donation</span>
          </a>
          <a class="flex items-center gap-stack-md py-3 pl-4 ${auditNavClass}" href="#/admin?tab=audit">
            <span class="material-symbols-outlined" data-icon="policy">policy</span>
            <span class="font-label-md">Lưu vết hệ thống (Audit Logs)</span>
          </a>
          <a class="flex items-center gap-stack-md py-3 text-surface-variant font-label-md hover:text-surface-bright pl-4 hover:bg-on-surface-variant/10 transition-colors duration-200" href="javascript:alert('Tính năng đang phát triển')">
            <span class="material-symbols-outlined" data-icon="settings">settings</span>
            <span class="font-label-md">Cài đặt</span>
          </a>
        </nav>
        <div class="mt-auto px-stack-lg border-t border-outline/20 pt-stack-lg flex flex-col gap-2">
          <a class="flex items-center gap-stack-md py-3 text-surface-variant font-label-md hover:text-surface-bright transition-colors duration-200" href="#">
            <span class="material-symbols-outlined" data-icon="account_circle">account_circle</span>
            <span class="font-label-md">Admin Profile</span>
          </a>
          <a class="flex items-center gap-stack-md py-3 text-error font-label-md hover:opacity-80 transition-colors duration-200" href="#/logout">
            <span class="material-symbols-outlined" data-icon="logout">logout</span>
            <span class="font-label-md">Đăng xuất</span>
          </a>
        </div>
      </aside>

      ${isUsersTab ? renderUsersTab() : (isOrganizationsTab ? `
        <main class="ml-64 flex-1 flex flex-col items-center justify-center min-h-screen p-8 bg-surface">
          <div class="max-w-md bg-surface-container-low p-8 rounded-2xl border border-outline-variant text-center shadow-sm">
            <span class="material-symbols-outlined text-5xl text-primary mb-3">move_group</span>
            <h3 class="text-title-lg font-bold text-on-surface mb-2">Chức năng đã chuyển giao</h3>
            <p class="text-body-md text-on-surface-variant mb-6">Chức năng xác thực và xét duyệt tài khoản tổ chức hiện được thực hiện bởi bộ phận Kiểm duyệt viên (Staff) thay vì Admin.</p>
            <a href="#/staff?tab=organizations" class="inline-block px-6 py-3 bg-primary text-on-primary font-bold rounded-xl shadow hover:opacity-90 transition-all">Đến trang Staff Dashboard</a>
          </div>
        </main>
      ` : (isDonationsTab ? renderDonationsTab() : (isAuditTab ? renderAuditLogsTab() : renderOverviewTab())))}
    </div>
  `;

  if (isDonationsTab) {
    attachDonationsListeners(container);
  } else if (isAuditTab) {
    attachAuditLogsListeners(container);
  } else if (isOverviewTab) {
    attachOverviewListeners(container);
  } else if (isUsersTab) {
    attachUsersListeners(container);
  }
}
