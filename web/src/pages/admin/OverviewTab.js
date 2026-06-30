import { getAllUsers, getAllDonationRequests } from "../../services/admin.service.js";
import { getAllProducts } from "../../services/product.service.js";

export function renderOverviewTab() {
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
              <h3 class="text-headline-md font-headline-md text-on-surface" id="stat-total-users">--</h3>
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
                  <span class="material-symbols-outlined" data-icon="domain">domain</span>
                </div>
                <span class="text-tertiary text-label-sm font-bold bg-tertiary-fixed px-2 py-1 rounded-full">Đã duyệt</span>
              </div>
              <p class="text-label-md text-on-surface-variant">Tổ chức đăng ký</p>
              <h3 class="text-headline-md font-headline-md text-on-surface" id="stat-total-shops">--</h3>
            </div>
            <div class="stat-card bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30 cursor-pointer">
              <div class="flex justify-between items-start mb-stack-md">
                <div class="w-12 h-12 rounded-lg bg-error-container/20 flex items-center justify-center text-error">
                  <span class="material-symbols-outlined" data-icon="volunteer_activism">volunteer_activism</span>
                </div>
                <span class="text-error text-label-sm font-bold bg-error-container px-2 py-1 rounded-full">Cần xử lý</span>
              </div>
              <p class="text-label-md text-on-surface-variant">Donation đang chờ</p>
              <h3 class="text-headline-md font-headline-md text-on-surface" id="stat-total-donations">--</h3>
            </div>
          </div>

          <!-- Bento Charts Section -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <!-- Line Chart Area -->
            <div class="lg:col-span-2 bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-center items-center h-72 text-center">
              <span class="material-symbols-outlined text-4xl text-outline mb-2 animate-pulse">query_stats</span>
              <h4 class="font-headline-sm text-on-surface font-semibold">Biểu đồ Giao dịch chưa sẵn sàng</h4>
              <p class="text-body-sm text-on-surface-variant max-w-md mt-1">Hệ thống đang tích hợp API phân tích dữ liệu thời gian thực từ máy chủ. Vui lòng quay lại sau.</p>
            </div>
            <!-- Donut Chart Area -->
            <div class="bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-center items-center h-72 text-center">
              <span class="material-symbols-outlined text-4xl text-outline mb-2 animate-pulse">pie_chart</span>
              <h4 class="font-headline-sm text-on-surface font-semibold">Danh mục Sản phẩm</h4>
              <p class="text-body-sm text-on-surface-variant max-w-xs mt-1">Đang tích hợp dữ liệu phân bổ từ kho API.</p>
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
                        <p class="font-label-md text-on-surface">Phê duyệt tổ chức mới</p>
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
                    <p class="text-label-md text-on-surface font-bold">Tổ chức mới đăng ký: GreenLife</p>
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

export function attachOverviewListeners(container) {
  const actionBtns = container.querySelectorAll('.action-btn');
  actionBtns.forEach(btn => {
    btn.addEventListener('click', function (e) {
      if (this.innerText === 'Xử lý ngay') {
        const row = this.closest('tr');
        row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        setTimeout(() => row.remove(), 300);
      }
    });
  });

  // Fetch and populate stats
  fetchStatsData(container);
}

async function fetchStatsData(container) {
  try {
    // 1. Total Users
    const users = await getAllUsers();
    const usersCountEl = container.querySelector('#stat-total-users');
    if (usersCountEl) {
      usersCountEl.textContent = users.length.toLocaleString("vi");
    }

    // 2. Total Organizations
    const shopsCountEl = container.querySelector('#stat-total-shops');
    if (shopsCountEl) {
      const shopCount = users.filter(u => u.role?.roleName === 'ROLE_ORGANIZATION').length;
      shopsCountEl.textContent = shopCount.toLocaleString("vi");
    }

    // 3. Active Products
    const productsCountEl = container.querySelector('#stat-total-products');
    if (productsCountEl) {
      const products = await getAllProducts();
      productsCountEl.textContent = products.length.toLocaleString("vi");
    }

    // 4. Pending Donations
    const donationsCountEl = container.querySelector('#stat-total-donations');
    if (donationsCountEl) {
      const donations = await getAllDonationRequests();
      donationsCountEl.textContent = donations.length.toLocaleString("vi");
    }

  } catch (error) {
    console.error("Lỗi khi tải dữ liệu tổng quan:", error);
  }
}