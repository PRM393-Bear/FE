import "../styles/admin.css";
import { getAllProducts } from "../services/product.service.js";

export async function renderAdminPage(container) {
  container.innerHTML = `
    <div class="font-body-md text-body-md overflow-hidden bg-background w-full h-full relative">
      <!-- SideNavBar Shell -->
      <aside class="fixed left-0 top-0 h-full flex flex-col py-stack-lg bg-inverse-surface shadow-md w-64 z-50">
        <div class="px-stack-lg mb-stack-xl">
          <h1 class="text-headline-md font-headline-md font-bold text-primary-fixed">Lifecycle</h1>
          <p class="text-label-sm text-surface-variant opacity-80 uppercase tracking-widest">Admin Console</p>
        </div>
        <nav class="flex-1 flex flex-col gap-stack-xs overflow-y-auto scrollbar-hide">
          <a class="flex items-center gap-stack-md py-3 text-primary-fixed font-bold border-l-4 border-primary-fixed pl-4 bg-on-surface-variant/10 transition-all duration-200" href="#/admin">
            <span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
            <span class="font-label-md">Tổng quan</span>
          </a>
          <a class="flex items-center gap-stack-md py-3 text-surface-variant font-label-md hover:text-surface-bright pl-4 hover:bg-on-surface-variant/10 transition-colors duration-200" href="javascript:alert('Tính năng đang phát triển')">
            <span class="material-symbols-outlined" data-icon="group">group</span>
            <span class="font-label-md">Quản lý User</span>
          </a>
          <a class="flex items-center gap-stack-md py-3 text-surface-variant font-label-md hover:text-surface-bright pl-4 hover:bg-on-surface-variant/10 transition-colors duration-200" href="javascript:alert('Tính năng đang phát triển')">
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

      <!-- Main Content Area -->
      <main class="ml-64 min-h-screen h-screen overflow-y-auto bg-background">
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
    </div>
  `;

  // Attach event listeners after rendering
  attachEventListeners(container);

  // Fetch real data for stats
  fetchStatsData();
}

function attachEventListeners(container) {
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

async function fetchStatsData() {
  const totalCountEl = document.getElementById("stat-total-products");

  try {
    const products = await getAllProducts();
    // Update total count
    if (totalCountEl) {
      totalCountEl.textContent = products.length.toLocaleString("vi");
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu sản phẩm:", error);
  }
}

