import "../styles/admin.css";
import { getAllProducts } from "../services/product.service.js";

window.toggleDrawer = function(open) {
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
  const isSellersTab = hash.includes("tab=sellers");
  const isOverviewTab = !isUsersTab && !isSellersTab;

  const getNavClass = (isActive) => isActive 
    ? 'text-primary-fixed font-bold border-l-4 border-primary-fixed bg-on-surface-variant/10 transition-all duration-200 opacity-90'
    : 'text-surface-variant font-label-md hover:text-surface-bright hover:bg-on-surface-variant/10 transition-colors duration-200';

  const overviewNavClass = getNavClass(isOverviewTab);
  const usersNavClass = getNavClass(isUsersTab);
  const sellersNavClass = getNavClass(isSellersTab);

  container.innerHTML = `
    <div class="font-body-md text-body-md overflow-hidden bg-background w-full h-full relative text-on-surface">
      <!-- SideNavBar Shell -->
      <aside class="fixed left-0 top-0 h-full flex flex-col py-stack-lg bg-inverse-surface shadow-md w-64 z-50">
        <div class="px-stack-lg mb-stack-xl">
          <h1 class="text-headline-md font-headline-md font-bold text-primary-fixed">Lifecycle</h1>
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
          <a class="flex items-center gap-stack-md py-3 pl-4 ${sellersNavClass}" href="#/admin?tab=sellers">
            <span class="material-symbols-outlined" data-icon="store">store</span>
            <span class="font-label-md">Duyệt Seller & Tổ chức</span>
          </a>
          <a class="flex items-center gap-stack-md py-3 text-surface-variant font-label-md hover:text-surface-bright pl-4 hover:bg-on-surface-variant/10 transition-colors duration-200" href="javascript:alert('Tính năng đang phát triển')">
            <span class="material-symbols-outlined" data-icon="package_2">package_2</span>
            <span class="font-label-md">Giao dịch</span>
          </a>
          <a class="flex items-center gap-stack-md py-3 text-surface-variant font-label-md hover:text-surface-bright pl-4 hover:bg-on-surface-variant/10 transition-colors duration-200" href="javascript:alert('Tính năng đang phát triển')">
            <span class="material-symbols-outlined" data-icon="featured_seasonal_and_gifts">featured_seasonal_and_gifts</span>
            <span class="font-label-md">Donation</span>
          </a>
          <a class="flex items-center gap-stack-md py-3 text-surface-variant font-label-md hover:text-surface-bright pl-4 hover:bg-on-surface-variant/10 transition-colors duration-200" href="javascript:alert('Tính năng đang phát triển')">
            <span class="material-symbols-outlined" data-icon="policy">policy</span>
            <span class="font-label-md">Kiểm duyệt</span>
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

      ${isUsersTab ? renderUsersTab() : (isSellersTab ? renderSellersTab() : renderOverviewTab())}
    </div>
  `;

  if (isSellersTab) {
    attachSellersListeners(container);
  } else if (isOverviewTab) {
    attachOverviewListeners(container);
    fetchStatsData();
  }
}

function renderOverviewTab() {
  return `
      <!-- Main Content Area -->
      <main class="ml-64 flex-1 min-h-screen h-screen overflow-y-auto bg-background">
        <!-- TopNavBar Shell -->
        <header class="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant h-20 flex justify-between items-center px-margin-desktop shadow-sm">
          <div class="flex items-center gap-stack-lg">
            <div class="relative w-96">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined" data-icon="search">search</span>
              <input class="w-full pl-12 pr-4 h-12 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline-variant" placeholder="Tìm kiếm hệ thống..." type="text"/>
            </div>
          </div>
          <div class="flex items-center gap-stack-lg">
            <button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors text-on-surface-variant">
              <span class="material-symbols-outlined" data-icon="notifications">notifications</span>
            </button>
            <button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors text-on-surface-variant">
              <span class="material-symbols-outlined" data-icon="help_outline">help_outline</span>
            </button>
            <div class="flex items-center gap-stack-sm ml-stack-sm border-l border-outline-variant pl-stack-lg">
              <div class="text-right">
                <p class="font-label-md text-on-surface">Admin Master</p>
                <p class="text-[10px] text-outline uppercase font-bold tracking-tight">System Owner</p>
              </div>
              <img alt="Administrator Profile" class="w-10 h-10 rounded-full border-2 border-primary-fixed" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0xu-mkKPh2dYj4iA0DCjMmKbkLzUM4MCyVR50aYt3ZmoOlkTp4rj84A_HdtZZLNfnJPzjzToAb4KAwgU8MO-rjTasLTDBfiuuQOq-qprKsFJPJHmocjo1eDq_ehXyVapmngH86CsAz8CRyarMCy_03XJZqrFGPB7zhYBHl4DqnHinvi_r9RxfRypptvOBt6fLFN2Dgr8Z0nxonJZgd1mzCYIvO5530cIdhiK4XMFWp2dEAgMs6HPvK-nwvQDhzOm5wydz66LYrK8e"/>
            </div>
          </div>
        </header>

        <!-- Dashboard Canvas -->
        <div class="p-margin-desktop space-y-stack-xl max-w-[1440px] mx-auto pb-10">
          <!-- Welcome Header -->
          <div>
            <h2 class="font-headline-lg text-headline-lg text-on-surface">Chào buổi sáng, Admin</h2>
            <p class="text-body-md text-on-surface-variant">Hệ thống đang hoạt động ổn định. Dưới đây là các chỉ số chính.</p>
          </div>

          <!-- Stats Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <div class="stat-card bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30 cursor-pointer">
              <div class="flex justify-between items-start mb-stack-md">
                <div class="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined" data-icon="group">group</span>
                </div>
                <span class="text-primary text-label-sm font-bold bg-primary-fixed-dim px-2 py-1 rounded-full">+12%</span>
              </div>
              <p class="text-label-md text-on-surface-variant">Tổng User</p>
              <h3 class="text-headline-md font-headline-md text-on-surface">5,240</h3>
            </div>
            <div class="stat-card bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30 cursor-pointer">
              <div class="flex justify-between items-start mb-stack-md">
                <div class="w-12 h-12 rounded-lg bg-secondary-container/10 flex items-center justify-center text-secondary">
                  <span class="material-symbols-outlined" data-icon="inventory_2">inventory_2</span>
                </div>
                <span class="text-secondary text-label-sm font-bold bg-secondary-fixed px-2 py-1 rounded-full">+5.4%</span>
              </div>
              <p class="text-label-md text-on-surface-variant">Sản phẩm đang bán</p>
              <h3 class="text-headline-md font-headline-md text-on-surface" id="stat-total-products">--</h3>
            </div>
            <div class="stat-card bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30 cursor-pointer">
              <div class="flex justify-between items-start mb-stack-md">
                <div class="w-12 h-12 rounded-lg bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                  <span class="material-symbols-outlined" data-icon="shopping_bag">shopping_bag</span>
                </div>
                <span class="text-tertiary text-label-sm font-bold bg-tertiary-fixed px-2 py-1 rounded-full">Cao</span>
              </div>
              <p class="text-label-md text-on-surface-variant">Giao dịch hôm nay</p>
              <h3 class="text-headline-md font-headline-md text-on-surface">85</h3>
            </div>
            <div class="stat-card bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30 cursor-pointer">
              <div class="flex justify-between items-start mb-stack-md">
                <div class="w-12 h-12 rounded-lg bg-error-container/20 flex items-center justify-center text-error">
                  <span class="material-symbols-outlined" data-icon="volunteer_activism">volunteer_activism</span>
                </div>
                <span class="text-error text-label-sm font-bold bg-error-container px-2 py-1 rounded-full">Cần xử lý</span>
              </div>
              <p class="text-label-md text-on-surface-variant">Donation đang chờ</p>
              <h3 class="text-headline-md font-headline-md text-on-surface">12</h3>
            </div>
          </div>

          <!-- Bento Charts Section -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <!-- Line Chart Area -->
            <div class="lg:col-span-2 bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30">
              <div class="flex justify-between items-center mb-stack-lg">
                <h4 class="font-headline-md text-on-surface">Giao dịch 30 ngày</h4>
                <div class="flex gap-stack-sm">
                  <button class="px-3 py-1 text-label-sm rounded-lg bg-surface-variant text-on-surface-variant hover:bg-outline-variant transition-colors">Tải báo cáo</button>
                </div>
              </div>
              <!-- Chart Placeholder with custom visual -->
              <div class="h-64 w-full relative flex items-end justify-between gap-2 pt-4">
                <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div class="w-full border-t border-outline"></div>
                  <div class="w-full border-t border-outline"></div>
                  <div class="w-full border-t border-outline"></div>
                  <div class="w-full border-t border-outline"></div>
                </div>
                <!-- Mockup Line Chart -->
                <svg class="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
                  <path d="M0,180 Q50,150 100,160 T200,100 T300,120 T400,60 T500,80 T600,40 T700,90 T800,50 T900,70 T1000,30" fill="none" stroke="#16A34A" stroke-linecap="round" stroke-width="4"></path>
                  <path d="M0,180 Q50,150 100,160 T200,100 T300,120 T400,60 T500,80 T600,40 T700,90 T800,50 T900,70 T1000,30 L1000,200 L0,200 Z" fill="url(#grad1)" opacity="0.1"></path>
                  <defs>
                    <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#16A34A;stop-opacity:1"></stop>
                      <stop offset="100%" style="stop-color:#16A34A;stop-opacity:0"></stop>
                    </linearGradient>
                  </defs>
                </svg>
                <div class="z-10 w-full flex justify-between px-2 text-[10px] text-outline font-bold mt-2">
                  <span>1 Tháng 10</span><span>15 Tháng 10</span><span>Hôm nay</span>
                </div>
              </div>
            </div>
            <!-- Donut Chart Area -->
            <div class="bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col">
              <h4 class="font-headline-md text-on-surface mb-stack-lg">Danh mục sản phẩm</h4>
              <div class="flex-1 flex flex-col items-center justify-center">
                <div class="relative w-48 h-48">
                  <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#dde5d9" stroke-width="3"></circle>
                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#006b2c" stroke-dasharray="40 60" stroke-dashoffset="0" stroke-width="3"></circle>
                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#fea619" stroke-dasharray="25 75" stroke-dashoffset="-40" stroke-width="3"></circle>
                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#a72d51" stroke-dasharray="20 80" stroke-dashoffset="-65" stroke-width="3"></circle>
                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#bdcaba" stroke-dasharray="15 85" stroke-dashoffset="-85" stroke-width="3"></circle>
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-headline-md font-bold text-on-surface">1.1k</span>
                    <span class="text-[10px] text-outline uppercase font-bold">Tổng mục</span>
                  </div>
                </div>
                <div class="mt-stack-lg grid grid-cols-2 gap-stack-md w-full">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-primary"></div>
                    <span class="text-label-sm text-on-surface-variant">Thời trang</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-secondary-container"></div>
                    <span class="text-label-sm text-on-surface-variant">Đồ gia dụng</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-tertiary"></div>
                    <span class="text-label-sm text-on-surface-variant">Phụ kiện</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-outline-variant"></div>
                    <span class="text-label-sm text-on-surface-variant">Khác</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Table & Feed Row -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter mt-stack-xl">
            <!-- Pending Actions Table -->
            <div class="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
              <div class="p-stack-lg border-b border-outline-variant/30 flex justify-between items-center">
                <h4 class="font-headline-md text-on-surface">Pending actions</h4>
                <span class="bg-error-container text-on-error-container text-[10px] font-bold px-2 py-1 rounded-full">Cần lưu ý (5)</span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left">
                  <thead class="bg-surface-container-low text-on-surface-variant font-label-md text-xs uppercase tracking-wider">
                    <tr>
                      <th class="px-stack-lg py-4">Nội dung</th>
                      <th class="px-stack-lg py-4">Loại</th>
                      <th class="px-stack-lg py-4">Trạng thái</th>
                      <th class="px-stack-lg py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-outline-variant/30">
                    <tr>
                      <td class="px-stack-lg py-4">
                        <p class="font-label-md text-on-surface">Phê duyệt Seller mới</p>
                        <p class="text-xs text-outline">EcoFashion Group</p>
                      </td>
                      <td class="px-stack-lg py-4 text-sm">Hệ thống</td>
                      <td class="px-stack-lg py-4">
                        <span class="text-[10px] font-bold bg-secondary-fixed px-2 py-1 rounded-full text-secondary-fixed-dim">Chờ duyệt</span>
                      </td>
                      <td class="px-stack-lg py-4 text-right">
                        <button class="action-btn bg-primary text-on-primary px-4 py-2 rounded-xl text-label-sm font-bold hover:opacity-90 active:scale-95 transition-all">Xử lý ngay</button>
                      </td>
                    </tr>
                    <tr>
                      <td class="px-stack-lg py-4">
                        <p class="font-label-md text-on-surface">Yêu cầu quyên góp quá hạn</p>
                        <p class="text-xs text-outline">Mã: DON-8821</p>
                      </td>
                      <td class="px-stack-lg py-4 text-sm">Quyên góp</td>
                      <td class="px-stack-lg py-4">
                        <span class="text-[10px] font-bold bg-error-container px-2 py-1 rounded-full text-error">Quá hạn</span>
                      </td>
                      <td class="px-stack-lg py-4 text-right">
                        <button class="action-btn bg-primary text-on-primary px-4 py-2 rounded-xl text-label-sm font-bold hover:opacity-90 active:scale-95 transition-all">Xử lý ngay</button>
                      </td>
                    </tr>
                    <tr>
                      <td class="px-stack-lg py-4">
                        <p class="font-label-md text-on-surface">Báo cáo vi phạm sản phẩm</p>
                        <p class="text-xs text-outline">User: luan_nguyen99</p>
                      </td>
                      <td class="px-stack-lg py-4 text-sm">Bảo mật</td>
                      <td class="px-stack-lg py-4">
                        <span class="text-[10px] font-bold bg-surface-variant px-2 py-1 rounded-full text-on-surface-variant">Mới</span>
                      </td>
                      <td class="px-stack-lg py-4 text-right">
                        <button class="action-btn bg-primary text-on-primary px-4 py-2 rounded-xl text-label-sm font-bold hover:opacity-90 active:scale-95 transition-all">Xử lý ngay</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Recent Activity Feed -->
            <div class="bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col">
              <div class="flex justify-between items-center mb-stack-lg">
                <h4 class="font-headline-md text-on-surface">Recent activity</h4>
                <button class="text-primary text-label-sm font-bold hover:underline">Xem tất cả</button>
              </div>
              <div class="space-y-stack-lg">
                <div class="flex gap-stack-md">
                  <div class="w-1 h-12 bg-primary rounded-full"></div>
                  <div class="flex-1">
                    <p class="text-label-md text-on-surface font-bold">Admin đăng nhập thành công</p>
                    <p class="text-xs text-on-surface-variant">Vừa xong • Địa chỉ IP: 192.168.1.1</p>
                  </div>
                </div>
                <div class="flex gap-stack-md">
                  <div class="w-1 h-12 bg-secondary-container rounded-full"></div>
                  <div class="flex-1">
                    <p class="text-label-md text-on-surface font-bold">50 sản phẩm mới được đăng</p>
                    <p class="text-xs text-on-surface-variant">10 phút trước • Danh mục: Thời trang</p>
                  </div>
                </div>
                <div class="flex gap-stack-md">
                  <div class="w-1 h-12 bg-tertiary rounded-full"></div>
                  <div class="flex-1">
                    <p class="text-label-md text-on-surface font-bold">Giao dịch #TX-4402 hoàn tất</p>
                    <p class="text-xs text-on-surface-variant">25 phút trước • Giá trị: 1,250,000đ</p>
                  </div>
                </div>
                <div class="flex gap-stack-md">
                  <div class="w-1 h-12 bg-outline-variant rounded-full"></div>
                  <div class="flex-1">
                    <p class="text-label-md text-on-surface font-bold">Seller mới đăng ký: GreenLife</p>
                    <p class="text-xs text-on-surface-variant">1 giờ trước • Chờ xác minh hồ sơ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Visual Flare - Subtle Background Animation -->
          <div class="fixed bottom-0 right-0 w-96 h-96 -z-10 opacity-30 pointer-events-none">
          </div>

        </div>
      </main>
  `;
}

function renderUsersTab() {
  return `
      <!-- Top Bar -->
      <header class="flex justify-between items-center ml-64 px-margin-desktop w-[calc(100%-16rem)] h-20 bg-surface-container-lowest shadow-sm border-b border-outline-variant fixed top-0 z-40">
        <div class="flex items-center gap-stack-lg">
          <h2 class="text-headline-md font-headline-md text-on-surface">Quản lý User</h2>
          <div class="relative group">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined" data-icon="search">search</span>
            <input class="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-label-md w-80 focus:ring-2 focus:ring-primary transition-all" placeholder="Tìm kiếm theo tên, email..." type="text"/>
          </div>
        </div>
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <button class="p-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-transform active:scale-95">
              <span class="material-symbols-outlined" data-icon="notifications">notifications</span>
            </button>
            <button class="p-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-transform active:scale-95">
              <span class="material-symbols-outlined" data-icon="help_outline">help_outline</span>
            </button>
            <button class="p-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-transform active:scale-95">
              <span class="material-symbols-outlined" data-icon="more_vert">more_vert</span>
            </button>
          </div>
          <img alt="Administrator Profile" class="w-10 h-10 rounded-full border-2 border-primary shadow-sm object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZRe5D_gU67IHdqDt9U-el7rs0APuS6sqnGIy1rRFahS_g2LdJGKnm7jCtYs-YT1XQAmAPSuZsdGaZQI5q5ycifQpiuOFBQUN45oxWzsYncy5ER4u7x6zFlkaA4_c1LFZiUprJv-fIhCnT8DGaUiTNGC-yib69AifASv-frqlf7owfozbEbt07dyC28LXZcsfLiTFUbq3rI66pCs6pdQ1nRi3Zm_kAcu_dkWDIlyf05mR2cNyUWPNToB9JEvx0G6uzEP-yFcl5icep"/>
        </div>
      </header>

      <!-- Main Content -->
      <main class="ml-64 mt-20 p-stack-lg h-[calc(100vh-80px)] overflow-y-auto">
        <!-- Filter Controls -->
        <section class="flex flex-wrap items-center justify-between gap-4 mb-stack-lg">
          <div class="flex gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-label-sm text-on-surface-variant ml-1">Vai trò</label>
              <select class="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2 text-label-md min-w-[140px] focus:ring-primary">
                <option>Tất cả</option>
                <option>Admin</option>
                <option>Seller</option>
                <option>User</option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-label-sm text-on-surface-variant ml-1">Trạng thái</label>
              <select class="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2 text-label-md min-w-[140px] focus:ring-primary">
                <option>Tất cả</option>
                <option>Hoạt động</option>
                <option>Bị khóa</option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-label-sm text-on-surface-variant ml-1">Ngày tham gia</label>
              <input class="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2 text-label-md focus:ring-primary" type="date"/>
            </div>
          </div>
          <button class="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label-md shadow-md hover:opacity-90 transition-all mt-6 active:scale-95">
            <span class="material-symbols-outlined" data-icon="add">add</span>
            Thêm User mới
          </button>
        </section>

        <!-- Data Table Container -->
        <section class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead class="bg-surface-container-low text-on-surface-variant font-label-md border-b border-outline-variant">
              <tr>
                <th class="px-6 py-4">
                  <input class="rounded text-primary focus:ring-primary border-outline" type="checkbox"/>
                </th>
                <th class="px-6 py-4">User</th>
                <th class="px-6 py-4">Vai trò</th>
                <th class="px-6 py-4">Trạng thái</th>
                <th class="px-6 py-4">Ngày tham gia</th>
                <th class="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant">
              <!-- Row 1: Clickable to show side drawer -->
              <tr class="hover:bg-surface-container transition-colors cursor-pointer group" onclick="toggleDrawer(true)">
                <td class="px-6 py-4" onclick="event.stopPropagation()">
                  <input class="rounded text-primary focus:ring-primary border-outline" type="checkbox"/>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <img alt="Nguyen Van A Avatar" class="w-10 h-10 rounded-full object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpyuXrRoVl61xwLqKtSvt4XDFOa_wA64327vW-MXqIXGoJqDM9QWAUTjfmUcuFKKyJ39qjvIyUok68tnVOYtg9ISfcCN3itKyK59vLAWDB9yv9w3Mqe1kcjmF9KTP4fYNLX4Y6faAPbgDzgVtNhJiFOuYQfyIKxTZeh8fCLzKYqr8yOvlRToTNBIbsCuN0qeZop9iSNo5EAVLas5Uh3JkzqmG76_ocFbu-Sai7Ukq8-4PLViFwxiPwm-j8irTvzumrK56gXFUy0tAh"/>
                    <div>
                      <p class="font-bold text-on-surface">Nguyen Van A</p>
                      <p class="text-label-sm text-on-surface-variant">nguyenvana@email.com</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-label-sm rounded-full">Seller</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2 text-primary font-label-md">
                    <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Hoạt động
                  </div>
                </td>
                <td class="px-6 py-4 text-on-surface-variant font-label-md">
                  12/10/2023
                </td>
                <td class="px-6 py-4 text-right" onclick="event.stopPropagation()">
                  <button class="p-2 text-outline hover:text-primary transition-colors">
                    <span class="material-symbols-outlined" data-icon="edit">edit</span>
                  </button>
                  <button class="p-2 text-outline hover:text-error transition-colors">
                    <span class="material-symbols-outlined" data-icon="block">block</span>
                  </button>
                </td>
              </tr>
              <!-- Row 2 -->
              <tr class="hover:bg-surface-container transition-colors cursor-pointer group">
                <td class="px-6 py-4">
                  <input class="rounded text-primary focus:ring-primary border-outline" type="checkbox"/>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <img alt="Tran Thi B Avatar" class="w-10 h-10 rounded-full object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu8RfvA-JU9EX2nrmUPFSY2u-DBNhsuZC1wT5amDtspj0OMoslsdwegwbXVq_aumAVFXFQZ1LUWD8IWpDYeykcMfb3Enkb-DUfxChjJedPR2i4l884q57XgxCVEogMhIBOlhgSyqzXwM6u1Bblopysh70Q6KJw2DxpGhbu80uEvW7-R6XsklItWjy66ZB61Ts2qxPMK6IghAh3fXnVxxRoW_0Do4ui4M-pTYttScWWzpIqZcgxUyO6HjejsBCaSVQlzWH7O01OU7ci"/>
                    <div>
                      <p class="font-bold text-on-surface">Tran Thi B</p>
                      <p class="text-label-sm text-on-surface-variant">tranthib@email.com</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-3 py-1 bg-surface-variant text-on-surface-variant text-label-sm rounded-full">User</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2 text-primary font-label-md">
                    <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Hoạt động
                  </div>
                </td>
                <td class="px-6 py-4 text-on-surface-variant font-label-md">
                  05/11/2023
                </td>
                <td class="px-6 py-4 text-right">
                  <button class="p-2 text-outline hover:text-primary transition-colors">
                    <span class="material-symbols-outlined" data-icon="edit">edit</span>
                  </button>
                  <button class="p-2 text-outline hover:text-error transition-colors">
                    <span class="material-symbols-outlined" data-icon="block">block</span>
                  </button>
                </td>
              </tr>
              <!-- Row 3 (Locked) -->
              <tr class="hover:bg-surface-container transition-colors cursor-pointer group opacity-75">
                <td class="px-6 py-4">
                  <input class="rounded text-primary focus:ring-primary border-outline" type="checkbox"/>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <img alt="Le Van C Avatar" class="w-10 h-10 rounded-full object-cover shadow-sm grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKWA94pWT7FYjiQ2wltqzf5I4Le2uHWSrImuV026O7WpkiWRNkAxMUzSo_59i8YHtCzkaNoCIsjMzPPefF2HhAx__VoDNfoYll98wJeoEESFbQZvAUP_KW3cVLYA_0XiMYKinOAqSGRo3xRuHAxetEmqdVWxTQoidCxmX5XKCS0Hos_llEwR8X36D5FCWCe5IH6BtldmCICPHS1XIaWV1wmwaK7huVnp_Mqk7N1oML2LJqab5qX6JNj3Pm5y15hQzIXVZPMKSXg_RE"/>
                    <div>
                      <p class="font-bold text-on-surface">Le Van C</p>
                      <p class="text-label-sm text-on-surface-variant">levanc@email.com</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-3 py-1 bg-surface-variant text-on-surface-variant text-label-sm rounded-full">User</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2 text-error font-label-md">
                    <span class="w-2 h-2 rounded-full bg-error"></span>
                    Bị khóa
                  </div>
                </td>
                <td class="px-6 py-4 text-on-surface-variant font-label-md">
                  20/09/2023
                </td>
                <td class="px-6 py-4 text-right">
                  <button class="p-2 text-outline hover:text-primary transition-colors">
                    <span class="material-symbols-outlined" data-icon="lock_open">lock_open</span>
                  </button>
                  <button class="p-2 text-outline hover:text-error transition-colors">
                    <span class="material-symbols-outlined" data-icon="delete">delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="px-6 py-4 flex items-center justify-between bg-surface-container-low border-t border-outline-variant">
            <span class="text-label-md text-on-surface-variant">Hiển thị 1-10 của 245 users</span>
            <div class="flex gap-2">
              <button class="p-2 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors disabled:opacity-30" disabled="">
                <span class="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
              </button>
              <button class="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md shadow-sm">1</button>
              <button class="px-4 py-2 rounded-lg border border-outline-variant hover:bg-surface-variant font-label-md transition-colors">2</button>
              <button class="px-4 py-2 rounded-lg border border-outline-variant hover:bg-surface-variant font-label-md transition-colors">3</button>
              <button class="p-2 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors">
                <span class="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <!-- User Detail Side Drawer -->
      <div class="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60] hidden opacity-0 transition-opacity duration-300" id="backdrop" onclick="toggleDrawer(false)"></div>
      <div class="fixed right-0 top-0 h-full w-[450px] bg-surface-container-lowest z-[70] translate-x-full transition-transform duration-300 drawer-shadow flex flex-col" id="userDrawer">
        <div class="p-6 border-b border-outline-variant flex items-center justify-between">
          <h3 class="text-headline-md font-headline-md text-on-surface">Chi tiết User</h3>
          <button class="p-2 hover:bg-surface-variant rounded-full transition-colors" onclick="toggleDrawer(false)">
            <span class="material-symbols-outlined" data-icon="close">close</span>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Profile Header -->
          <div class="flex flex-col items-center text-center mb-8">
            <div class="relative mb-4">
              <img alt="Nguyen Van A Large Profile" class="w-24 h-24 rounded-full border-4 border-surface-container-low shadow-lg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_nYZIesLwtmhnPaD_9gdwJnHAhf_QkNfVcnuTidjqGvC2OPczYZBGKgGyYzyjasIwZFmLnEdWDTY_W_4GeQ1pqB3TLvfx-lYej7QQm2j1f5LzT3LL60fBhUBWGD4kfSuEgeebienea_lVXHcKYwovzprl0Nxgu6axmUmlpkQzgdgjy8U-3i2wm0SYogc7XmOzrBtX3F_yIMTbhS6xeOL97mmYx8CQ5oF7IU0zOKAf3tNR39Xsaxwc9HlV2lfB_rPDyrqnKD7UpYvu"/>
              <span class="absolute bottom-1 right-1 w-6 h-6 bg-primary border-2 border-surface-container-lowest rounded-full"></span>
            </div>
            <h4 class="text-headline-md font-headline-md text-on-surface">Nguyen Van A</h4>
            <p class="text-on-surface-variant">nguyenvana@email.com</p>
            <div class="flex gap-2 mt-4">
              <span class="px-4 py-1 bg-secondary-fixed text-on-secondary-fixed text-label-md rounded-full">Seller</span>
              <span class="px-4 py-1 bg-primary-container text-on-primary-container text-label-md rounded-full">Active</span>
            </div>
          </div>
          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-4 mb-8">
            <div class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant">
              <p class="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Tổng đơn hàng</p>
              <p class="text-headline-md font-bold text-primary">15</p>
            </div>
            <div class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant">
              <p class="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Lịch sử vi phạm</p>
              <p class="text-headline-md font-bold text-error">0</p>
            </div>
          </div>
          <!-- Detailed Info -->
          <div class="space-y-6">
            <div>
              <h5 class="text-label-sm text-on-surface-variant font-bold uppercase mb-3 border-b border-outline-variant pb-2">Thông tin tài khoản</h5>
              <div class="grid grid-cols-1 gap-4">
                <div class="flex justify-between">
                  <span class="text-on-surface-variant">Ngày đăng ký</span>
                  <span class="font-label-md">12/10/2023</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-on-surface-variant">Số điện thoại</span>
                  <span class="font-label-md">098 765 4321</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-on-surface-variant">Địa chỉ</span>
                  <span class="font-label-md">Quận 1, TP. Hồ Chí Minh</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-on-surface-variant">Lần cuối đăng nhập</span>
                  <span class="font-label-md">Hôm nay, 09:45</span>
                </div>
              </div>
            </div>
            <div>
              <h5 class="text-label-sm text-on-surface-variant font-bold uppercase mb-3 border-b border-outline-variant pb-2">Phân quyền</h5>
              <div class="space-y-3">
                <label class="flex items-center gap-3 p-3 rounded-xl border border-outline-variant hover:bg-surface-variant cursor-pointer transition-colors">
                  <input class="text-primary focus:ring-primary" name="role" type="radio"/>
                  <div class="flex-1">
                    <p class="font-label-md">Admin</p>
                    <p class="text-label-sm text-on-surface-variant">Toàn quyền quản trị hệ thống</p>
                  </div>
                </label>
                <label class="flex items-center gap-3 p-3 rounded-xl border-2 border-primary bg-primary-container/10 cursor-pointer transition-colors">
                  <input checked="" class="text-primary focus:ring-primary" name="role" type="radio"/>
                  <div class="flex-1">
                    <p class="font-label-md">Seller</p>
                    <p class="text-label-sm text-on-surface-variant">Quyền đăng sản phẩm và quản lý shop</p>
                  </div>
                </label>
                <label class="flex items-center gap-3 p-3 rounded-xl border border-outline-variant hover:bg-surface-variant cursor-pointer transition-colors">
                  <input class="text-primary focus:ring-primary" name="role" type="radio"/>
                  <div class="flex-1">
                    <p class="font-label-md">User</p>
                    <p class="text-label-sm text-on-surface-variant">Người mua hàng cơ bản</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="p-6 border-t border-outline-variant bg-surface-container-low flex gap-4">
          <button class="flex-1 py-3 border border-error text-error rounded-xl font-label-md hover:bg-error-container/20 transition-colors flex items-center justify-center gap-2">
            <span class="material-symbols-outlined" data-icon="block">block</span>
            Khóa tài khoản
          </button>
          <button class="flex-1 py-3 bg-primary text-on-primary rounded-xl font-label-md hover:opacity-90 transition-all shadow-md active:scale-95" onclick="toggleDrawer(false)">
            Lưu thay đổi
          </button>
        </div>
      </div>
  `;
}

function renderSellersTab() {
  return `
      <!-- TopNavBar Shell -->
      <header class="flex justify-between items-center ml-64 px-margin-desktop w-[calc(100%-16rem)] h-20 fixed top-0 bg-surface-container-lowest shadow-sm z-40 border-b border-outline-variant">
        <div class="flex items-center flex-1">
          <div class="relative w-96">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input class="w-full h-10 pl-10 pr-4 bg-surface-container-low border-none rounded-xl text-label-md focus:ring-2 focus:ring-primary transition-all" placeholder="Tìm kiếm đơn duyệt..." type="text"/>
          </div>
        </div>
        <div class="flex items-center gap-stack-lg">
          <button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors">
            <span class="material-symbols-outlined text-on-surface-variant" data-icon="notifications">notifications</span>
          </button>
          <button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors">
            <span class="material-symbols-outlined text-on-surface-variant" data-icon="help_outline">help_outline</span>
          </button>
          <div class="h-8 w-px bg-outline-variant"></div>
          <div class="flex items-center gap-3 pl-2">
            <div class="text-right">
              <p class="text-label-md font-bold text-on-surface">Minh Tran</p>
              <p class="text-label-sm text-on-surface-variant">Senior Admin</p>
            </div>
            <img alt="Administrator Profile" class="w-10 h-10 rounded-full border-2 border-primary-fixed shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKrp_8SB0ccvB_9LqEcarJwr7--Ii-Sfp85Ubv7rRiWd0zWlbve4ZjoBQfuOyuMHreqzjFa6mMo4gkwXo01bYpvAOzzzDgJVnLdFyfb4oiRWxy2QEoi9qYRC6TiOb6ThJD-VQkQ3521OSlax7NtX7_Avpw_3BXEL9VmAT6f1LNWtJ1c4_PBhlS6_8lJhFED3rL_Dq7Jmz7YMeBrYA-R-35IyXZ-qoH916GV9ksyDEtvBRMDe0hcvEJpIQrcDwBLedMHwbk1rD0Spuh"/>
          </div>
        </div>
      </header>

      <!-- Main Canvas Content -->
      <main class="ml-64 pt-20 px-margin-desktop min-h-screen">
        <div class="max-w-container-max mx-auto py-stack-xl">
          <!-- Page Header -->
          <div class="flex justify-between items-end mb-stack-lg">
            <div>
              <h2 class="font-headline-lg text-headline-lg text-on-surface">Duyệt Seller & Tổ chức</h2>
              <p class="text-body-md text-on-surface-variant">Xem xét và phê duyệt các hồ sơ đăng ký bán hàng và tổ chức từ thiện mới.</p>
            </div>
            <div class="flex gap-stack-sm">
              <button class="px-4 py-2 flex items-center gap-2 bg-surface-container-high rounded-xl text-label-md hover:bg-surface-variant transition-colors">
                <span class="material-symbols-outlined text-label-md" data-icon="filter_list">filter_list</span>
                Bộ lọc
              </button>
              <button class="px-4 py-2 flex items-center gap-2 bg-surface-container-high rounded-xl text-label-md hover:bg-surface-variant transition-colors">
                <span class="material-symbols-outlined text-label-md" data-icon="download">download</span>
                Xuất báo cáo
              </button>
            </div>
          </div>

          <!-- Tabbed Interface -->
          <div class="relative flex border-b border-outline-variant mb-stack-lg sellers-tabs">
            <button class="px-stack-lg py-4 text-primary font-bold relative group tab-btn active">
              Đang chờ duyệt (12)
              <div class="active-tab-indicator"></div>
            </button>
            <button class="px-stack-lg py-4 text-on-surface-variant font-label-md hover:text-on-surface transition-colors group tab-btn">
              Đã duyệt
            </button>
            <button class="px-stack-lg py-4 text-on-surface-variant font-label-md hover:text-on-surface transition-colors group tab-btn">
              Đã từ chối
            </button>
          </div>

          <!-- Application Cards List (Asymmetric/Modern Layout) -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-stack-lg items-start">
            <!-- Card 1 -->
            <div class="glass-card rounded-xl p-stack-lg flex flex-col gap-stack-md transition-all hover:shadow-lg action-card">
              <div class="flex justify-between items-start">
                <div class="flex gap-4">
                  <img alt="Store Logo" class="w-16 h-16 rounded-xl border border-outline-variant object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCO04dBqFuAnpW9IB1QCTyPyF_z-Kji-JWlZxCJGJkRMxMeABi652uOaaL42UIjj2NtFtCjnbq_j1wP-h3nnjmCrSsbxNxKZef1xX0C7XObDmXgrfJy8ZBgkzgacWTMKXbbsrFt8mkYuRkOx7yS7AqGubWhqPz54PffOqLPZ8CgjGXLfYeHbMe-Yx8jDZ0BrKKgmggZozEMMMABNwo54fKwvPGZH-jR6TI3OC2E_yajWskU3qnYQvr2VzlgOs4YqcqU0cPzwRIEuBnN"/>
                  <div>
                    <h3 class="text-headline-md font-headline-md text-on-surface">Tiệm Xanh Hạnh Phúc</h3>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="material-symbols-outlined text-[18px] text-primary" data-icon="verified_user">verified_user</span>
                      <p class="text-label-md text-on-surface-variant">Lê Văn Hạnh • Cá nhân</p>
                    </div>
                    <p class="text-label-sm text-on-surface-variant mt-1 italic">Yêu cầu lúc: 10:45 - 24/10/2023</p>
                  </div>
                </div>
                <div class="bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full text-label-sm">Ưu tiên cao</div>
              </div>
              <div class="grid grid-cols-2 gap-4 my-2">
                <div class="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer group">
                  <p class="text-label-sm text-on-surface-variant mb-2">CCCD / Định danh</p>
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-surface-variant rounded-lg flex items-center justify-center overflow-hidden">
                      <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpGKZHFBTZFh4VYRJAeXAbgW9oHQoC73uH9fbKmIX10O_wuDd1sjxVFO2U-yzbwZMJQ76147x6sSz5BQyd85hvHPUwXqudACIQEEfS4kebdqyAbqX9FyIelGrUbWK3gBqBNnQSqvY6isF722ByW5X7b6lxiY2D9qGH1sLBnxm9wmPchduD1pr7ePUzdRVl63-eBVNXe9_l7BQ1qlP0qu9mRBiQdqCVdTbE2CLsvKol9yuDPNMUM2Za01FVMxW6Il_q_bhieh_tSF-M"/>
                    </div>
                    <span class="text-label-md text-primary font-bold group-hover:underline">View document</span>
                  </div>
                </div>
                <div class="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer group">
                  <p class="text-label-sm text-on-surface-variant mb-2">Giấy phép kinh doanh</p>
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-surface-variant rounded-lg flex items-center justify-center overflow-hidden">
                      <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGxY09IgUt8CMWhQhgplMZR1VSnT_PMAxjLVHkADEaoNjzY0Sadgb2b0xgqnG_3dQ9p8xu9twsbJ4mG7PH-EwZAnxZcvD7xPj1JDOoIanTq1ZPFhPoRX7yzqHbLY_xbO-V0-tmyEgHiqzMFcDJDEv0hm6Edndyt956YEMYS21-5DBscKGcCDFWGY1MLBeInQjGEbpTGggz3-HVkPSfarYrCJJY7_aIHiSTwSVINB6_2dVB5RmqLwsEKcFh6Az9HIWTBodYm76O5OdF"/>
                    </div>
                    <span class="text-label-md text-primary font-bold group-hover:underline">View document</span>
                  </div>
                </div>
              </div>
              <div>
                <label class="text-label-sm font-bold text-on-surface mb-2 block">Lý do từ chối (nếu có)</label>
                <textarea class="w-full rounded-xl border-outline-variant bg-surface-container-lowest text-label-md focus:border-primary focus:ring-primary placeholder:text-on-surface-variant/40" placeholder="Nhập lý do nếu bạn không duyệt hồ sơ này..." rows="2"></textarea>
              </div>
              <div class="flex gap-4 mt-2">
                <button class="approve-btn flex-1 h-12 rounded-xl bg-primary text-on-primary font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
                  <span class="material-symbols-outlined" data-icon="check_circle">check_circle</span>
                  Duyệt ✓
                </button>
                <button class="reject-btn flex-1 h-12 rounded-xl border-2 border-error text-error font-bold flex items-center justify-center gap-2 hover:bg-error/5 active:scale-95 transition-all">
                  <span class="material-symbols-outlined" data-icon="cancel">cancel</span>
                  Từ chối ✗
                </button>
              </div>
            </div>

            <!-- Card 2 -->
            <div class="glass-card rounded-xl p-stack-lg flex flex-col gap-stack-md transition-all hover:shadow-lg action-card">
              <div class="flex justify-between items-start">
                <div class="flex gap-4">
                  <img alt="Store Logo" class="w-16 h-16 rounded-xl border border-outline-variant object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqJ8m2rJ-54CmthM7iueIX7qjNSE_5VZTK1FHSn4gYBCP2WiLhBCTzKBEVhDglgalg2FPp8BCRTtt6TT4l5E6AtALTtZyk2fCpXdrDn3xAjxEtl02UMmmpgx7HzA-3mhoX3vKB_W7C_wWbQ-AsiBFsDbFRsuWGhrB6qJcuCCEVQjX6W-cEFHjw-IhS_1sJzvTv0_iNfTL1h24GTf-RNkpqEIVfV2hDqp6e36lxNRaVrnJqIC0jRVJguhrqryySFoakvzJxhT4KkWFT"/>
                  <div>
                    <h3 class="text-headline-md font-headline-md text-on-surface">Green Organics VN</h3>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="material-symbols-outlined text-[18px] text-tertiary" data-icon="corporate_fare">corporate_fare</span>
                      <p class="text-label-md text-on-surface-variant">CTY TNHH Green Organics • Tổ chức</p>
                    </div>
                    <p class="text-label-sm text-on-surface-variant mt-1 italic">Yêu cầu lúc: 09:12 - 24/10/2023</p>
                  </div>
                </div>
                <div class="bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded-full text-label-sm">Đang kiểm tra</div>
              </div>
              <div class="grid grid-cols-2 gap-4 my-2">
                <div class="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer group">
                  <p class="text-label-sm text-on-surface-variant mb-2">Quyết định thành lập</p>
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-surface-variant rounded-lg flex items-center justify-center overflow-hidden">
                      <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiM53VRz-himRMMqM5xmad-ktzgOcR23puhUGh4FAr6TK_zFjSeNqSSXJhcFT70e-sJ1VL-FbdNtbfsC7OjG6Cl-uWfTRB9-x4raUd3Mw-NqEPLEDyvuB7j5sg6XcR-ZJIsrd9DWWdy4LXnF23eHVea-7eRzRwZq2_z2VQm250_HfAfOOom--YixAl7mlE1zwUhIBHB4fd2O8Qk9qtoPclzfOaubipk09C5YdQJAx5J4yxwmkkWut7gCdBOkI-XQy9Yh2uolvR-mCz"/>
                    </div>
                    <span class="text-label-md text-primary font-bold group-hover:underline">View document</span>
                  </div>
                </div>
                <div class="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer group">
                  <p class="text-label-sm text-on-surface-variant mb-2">Hồ sơ năng lực</p>
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-surface-variant rounded-lg flex items-center justify-center overflow-hidden">
                      <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSN3r-xJbkN0fnmNnRGvgg7DyR3k3PhSh4Fk3dN6E0F2gv-BRCVn1WU0Jo_BR4lvKSwptXB2C3XPf8DVdfyA6vwTajCJw-_pRHm-F8UBjJg-cSeUt3RjGCh2rOV_gDx1sqKJBIalhK1g0xaUg4-UJYbHz2q7bgfuOlmLe9C0jvs4GqenZT-tEHhmU1m-lyVeXfp0PKSfW2V0xkTo4CuOZ3OD1gbW5dh5TcCVTyRI9AZn6ufpW_Skw1vAFv9Y8iHjqmnTR9LC9omkDu"/>
                    </div>
                    <span class="text-label-md text-primary font-bold group-hover:underline">View document</span>
                  </div>
                </div>
              </div>
              <div>
                <label class="text-label-sm font-bold text-on-surface mb-2 block">Lý do từ chối (nếu có)</label>
                <textarea class="w-full rounded-xl border-outline-variant bg-surface-container-lowest text-label-md focus:border-primary focus:ring-primary placeholder:text-on-surface-variant/40" placeholder="Hồ sơ còn thiếu minh chứng doanh thu năm trước..." rows="2"></textarea>
              </div>
              <div class="flex gap-4 mt-2">
                <button class="approve-btn flex-1 h-12 rounded-xl bg-primary text-on-primary font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
                  <span class="material-symbols-outlined" data-icon="check_circle">check_circle</span>
                  Duyệt ✓
                </button>
                <button class="reject-btn flex-1 h-12 rounded-xl border-2 border-error text-error font-bold flex items-center justify-center gap-2 hover:bg-error/5 active:scale-95 transition-all">
                  <span class="material-symbols-outlined" data-icon="cancel">cancel</span>
                  Từ chối ✗
                </button>
              </div>
            </div>

            <!-- Card 3 (Wait List) -->
            <div class="glass-card rounded-xl p-stack-lg flex flex-col gap-stack-md transition-all hover:shadow-lg opacity-80 hover:opacity-100 action-card">
              <div class="flex justify-between items-start">
                <div class="flex gap-4">
                  <div class="w-16 h-16 rounded-xl bg-surface-container-high flex items-center justify-center border border-outline-variant">
                    <span class="material-symbols-outlined text-4xl text-outline" data-icon="storefront">storefront</span>
                  </div>
                  <div>
                    <h3 class="text-headline-md font-headline-md text-on-surface">Đồ Cũ Giá Rẻ</h3>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="material-symbols-outlined text-[18px] text-primary" data-icon="person">person</span>
                      <p class="text-label-md text-on-surface-variant">Trần Thị Bé • Cá nhân</p>
                    </div>
                    <p class="text-label-sm text-on-surface-variant mt-1 italic">Yêu cầu lúc: 08:30 - 24/10/2023</p>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4 my-2">
                <div class="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer group">
                  <p class="text-label-sm text-on-surface-variant mb-2">CCCD / Định danh</p>
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-on-surface/5 rounded-lg flex items-center justify-center">
                      <span class="material-symbols-outlined text-outline" data-icon="image">image</span>
                    </div>
                    <span class="text-label-md text-primary font-bold group-hover:underline">View document</span>
                  </div>
                </div>
                <div class="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer group">
                  <p class="text-label-sm text-on-surface-variant mb-2">Mặt bằng kinh doanh</p>
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-on-surface/5 rounded-lg flex items-center justify-center">
                      <span class="material-symbols-outlined text-outline" data-icon="image">image</span>
                    </div>
                    <span class="text-label-md text-primary font-bold group-hover:underline">View document</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-4 mt-2">
                <button class="approve-btn flex-1 h-12 rounded-xl bg-primary text-on-primary font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                  Duyệt ✓
                </button>
                <button class="reject-btn flex-1 h-12 rounded-xl border-2 border-error text-error font-bold flex items-center justify-center gap-2 hover:bg-error/5 transition-all">
                  Từ chối ✗
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <!-- Background Decoration -->
      <div class="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40"></div>
  `;
}

function attachOverviewListeners(container) {
  const actionBtns = container.querySelectorAll('.action-btn');
  actionBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      if (this.innerText === 'Xử lý ngay') {
        const row = this.closest('tr');
        row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        setTimeout(() => row.remove(), 300);
      }
    });
  });
}

function attachSellersListeners(container) {
  // Micro-interactions for buttons
  const cards = container.querySelectorAll('.action-card');
  cards.forEach(card => {
    const buttons = card.querySelectorAll('button.approve-btn, button.reject-btn');
    buttons.forEach(btn => {
      // Simulate click interaction
      btn.addEventListener('mousedown', () => btn.style.transform = 'scale(0.95)');
      btn.addEventListener('mouseup', () => btn.style.transform = 'scale(1)');
      btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
      
      btn.addEventListener('click', () => {
        // Simple animation to remove the card
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => card.remove(), 300);
      });
    });
  });

  // Tab switching logic (Visual only)
  const tabs = container.querySelectorAll('.sellers-tabs .tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('text-primary', 'font-bold');
        t.classList.add('text-on-surface-variant', 'font-label-md');
        const indicator = t.querySelector('.active-tab-indicator');
        if (indicator) indicator.remove();
      });
      tab.classList.add('text-primary', 'font-bold');
      tab.classList.remove('text-on-surface-variant', 'font-label-md');
      const newIndicator = document.createElement('div');
      newIndicator.className = 'active-tab-indicator';
      tab.appendChild(newIndicator);
    });
  });
}

async function fetchStatsData() {
  const totalCountEl = document.getElementById("stat-total-products");
  if (!totalCountEl) return;
  try {
    const products = await getAllProducts();
    if (totalCountEl) {
      totalCountEl.textContent = products.length.toLocaleString("vi");
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu sản phẩm:", error);
  }
}
