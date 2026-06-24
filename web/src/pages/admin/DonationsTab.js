export function renderDonationsTab() {
  return `
      <!-- Main Content Canvas -->
      <main class="ml-64 flex-1 flex flex-col min-h-screen bg-surface w-full max-w-[calc(100%-16rem)]">
        <!-- TopNavBar -->
        <header class="flex justify-between items-center px-margin-desktop bg-surface-container-lowest shadow-sm border-b border-outline-variant h-20 sticky top-0 z-40">
          <div class="flex items-center flex-1 max-w-xl">
            <div class="relative w-full">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input class="w-full h-12 pl-12 pr-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-body-md transition-soft" placeholder="Tìm kiếm donation, người tặng..." type="text"/>
            </div>
          </div>
          <div class="flex items-center space-x-6 ml-gutter">
            <button class="relative p-2 rounded-lg hover:bg-surface-variant transition-soft">
              <span class="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span class="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button class="p-2 rounded-lg hover:bg-surface-variant transition-soft">
              <span class="material-symbols-outlined text-on-surface-variant">help_outline</span>
            </button>
            <button class="p-2 rounded-lg hover:bg-surface-variant transition-soft">
              <span class="material-symbols-outlined text-on-surface-variant">more_vert</span>
            </button>
            <div class="flex items-center space-x-3 border-l border-outline-variant pl-6">
              <div class="text-right">
                <p class="text-label-md font-bold text-on-surface leading-none">Admin Nguyễn</p>
                <p class="text-label-sm text-on-surface-variant opacity-70">Quản trị viên</p>
              </div>
              <img alt="Administrator Profile" class="w-10 h-10 rounded-full border-2 border-primary/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD9hhQ7imU1OcP9ZuaAj-txVZJ9mesZyPCCubq9_3HyM9crEa34Etk5pQ1Y2A2gv4o2T9f2FddVeqZQy3v5xDT2uforX9X869WqAQHD9zDiFh5GGURfK7pNuAoitnM1oympNIMcxitFbdxdz7cBKwXI0D-fCfsel9T4LXKiMoJe6Opoixm0OG2YZB_f7qyds7HS-EkSa8PGiQZn8c59Kf0oMgP_LtMTLSyrF321YBHRVRJVu_P6xIxDZVLww-WDz6WVd6w9-x0K_zy"/>
            </div>
          </div>
        </header>

        <!-- Page Header & Tabs -->
        <section class="px-margin-desktop py-stack-lg bg-surface">
          <div class="mb-stack-lg">
            <h2 class="text-headline-lg font-headline-md text-on-surface">Quản lý Donation</h2>
            <p class="text-body-md text-on-surface-variant">Theo dõi và phê duyệt các khoản đóng góp từ cộng đồng Lifecycle.</p>
          </div>
          <!-- Custom Tabs -->
          <div class="flex items-center space-x-gutter border-b border-outline-variant donations-tabs">
            <button class="tab-btn active pb-4 px-2 text-label-md font-bold text-primary border-b-2 border-primary flex items-center">
              Chờ xử lý
              <span class="ml-2 px-2 py-0.5 bg-primary-container text-on-primary-container text-[10px] rounded-full">8</span>
            </button>
            <button class="tab-btn pb-4 px-2 text-label-md font-medium text-on-surface-variant hover:text-primary transition-soft border-b-2 border-transparent">
              Đang vận chuyển
            </button>
            <button class="tab-btn pb-4 px-2 text-label-md font-medium text-on-surface-variant hover:text-primary transition-soft border-b-2 border-transparent">
              Hoàn tất
            </button>
          </div>
        </section>

        <!-- Donation Table Section -->
        <section class="px-margin-desktop pb-stack-xl flex-1">
          <div class="glass-card rounded-xl overflow-hidden shadow-sm border border-outline-variant/30">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-surface-container-high border-b border-outline-variant">
                    <th class="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Người tặng</th>
                    <th class="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Tổ chức nhận</th>
                    <th class="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Mô tả món đồ</th>
                    <th class="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Trạng thái</th>
                    <th class="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Thời gian chờ</th>
                    <th class="px-6 py-4 font-headline-md text-label-md text-on-surface-variant text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant">
                  <!-- Entry 1 -->
                  <tr class="hover:bg-surface-container transition-colors group">
                    <td class="px-6 py-5">
                      <div class="flex items-center space-x-3">
                        <img alt="User Avatar" class="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXjGPK7ghnstDR_ku2FyV7RM2a9jUIB4maGC08m8ygMSLK9ftYb-WlPO1DbxIYKmLAkcXlsn12HrWakZxLghQnwJVu-OzGzlQxF3lqDEZOqqVOM1pm7YHVGjF4mvl5faQXBffGTJigUWX8SSkD-9VMWHD3xyHmUuVxfq2K91S42DvFoc6rMyzcl3uewKhegtP1xc1ahlbZ0uceoBa1AodxCiwUv2mvaBcJoZoTj4tdpTz5eVBj5MEf7QgjRFubs95Vi57kyhNF81TT"/>
                        <div>
                          <p class="text-label-md font-bold text-on-surface">Lê Minh Tuấn</p>
                          <p class="text-label-sm text-on-surface-variant">ID: #DN-8842</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      <p class="text-label-md font-medium text-on-surface">Quỹ Vì Trẻ Thơ</p>
                    </td>
                    <td class="px-6 py-5">
                      <p class="text-body-md text-on-surface-variant line-clamp-1">30 bộ quần áo trẻ em, 5 đôi giày cũ</p>
                    </td>
                    <td class="px-6 py-5">
                      <span class="inline-flex items-center px-3 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full text-label-sm font-bold">
                        <span class="w-2 h-2 bg-secondary rounded-full mr-2"></span>
                        Chờ xử lý
                      </span>
                    </td>
                    <td class="px-6 py-5">
                      <span class="text-label-md font-bold text-error">12 ngày</span>
                      <p class="text-label-sm text-on-error-container opacity-60">>10 ngày chưa phản hồi</p>
                    </td>
                    <td class="px-6 py-5 text-right">
                      <button class="approve-fallback-btn bg-primary text-on-primary px-4 py-2 rounded-lg text-label-md font-bold shadow-sm hover:opacity-90 transition-soft active:scale-95">
                        Duyệt Fallback
                      </button>
                    </td>
                  </tr>
                  <!-- Entry 2 -->
                  <tr class="hover:bg-surface-container transition-colors group">
                    <td class="px-6 py-5">
                      <div class="flex items-center space-x-3">
                        <img alt="User Avatar" class="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkiuLv2ZkJwL8iWaeV7ZGtBs0NGAFKddTDlzepjh0SDGKKIqD5UWp2-0ctJ7cLLBXpMOtpTQwgBW565dkCUCa1yh9-e-H6etPnn7IEDaBO78Vjk2RNQwkniSQj0do8_4K7v8sHoYbHB4dZDLbdI5gJfSPt0MDGzUmBSPb-apU6i9KCesq_bQrf_8_Jj8NkpWg5v9514tB0437FWPzO1p89r6b87e_v7SUTW1k6MIFX6rFQlKaK269Yn8VUwaIRhkAFoA2tQV7jc0qt"/>
                        <div>
                          <p class="text-label-md font-bold text-on-surface">Trần Thị Bích</p>
                          <p class="text-label-sm text-on-surface-variant">ID: #DN-8843</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      <p class="text-label-md font-medium text-on-surface">Green Life Vietnam</p>
                    </td>
                    <td class="px-6 py-5">
                      <p class="text-body-md text-on-surface-variant line-clamp-1">Sách giáo khoa lớp 6-9, dụng cụ</p>
                    </td>
                    <td class="px-6 py-5">
                      <span class="inline-flex items-center px-3 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full text-label-sm font-bold">
                        <span class="w-2 h-2 bg-secondary rounded-full mr-2"></span>
                        Chờ xử lý
                      </span>
                    </td>
                    <td class="px-6 py-5">
                      <span class="text-label-md font-medium text-on-surface-variant">3 ngày</span>
                    </td>
                    <td class="px-6 py-5 text-right">
                      <div class="flex items-center justify-end space-x-2">
                        <button class="p-2 text-on-surface-variant hover:text-primary transition-soft">
                          <span class="material-symbols-outlined">visibility</span>
                        </button>
                        <button class="p-2 text-on-surface-variant hover:text-secondary transition-soft">
                          <span class="material-symbols-outlined">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <!-- Entry 3 -->
                  <tr class="hover:bg-surface-container transition-colors group">
                    <td class="px-6 py-5">
                      <div class="flex items-center space-x-3">
                        <img alt="User Avatar" class="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRRM4X_g9zbGCyYRZZA2Tq9ydB6mXhRIVvH6Zw-njmYsWY84K8kJlWJ1syygyc3Aw94MfJv1Hnrr_P3FZvN46l4kdGsX1LjusjsIts_IYU9T20eI_7siWPl9gasu8gu5elKDVFa2XpxPNClFUVgnttkjhC-n43pv3PrcydWn22-kjDsb5SXIFhUm6ZDu28exgmKu53rFmcY5E-FTWxkKjuWZeymw4wSZ55kl8R7cqXQ7DQr8-mr6ChZRJ8icOyqMgRP_wK3nZHFtbx"/>
                        <div>
                          <p class="text-label-md font-bold text-on-surface">Nguyễn Văn An</p>
                          <p class="text-label-sm text-on-surface-variant">ID: #DN-8845</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      <p class="text-label-md font-medium text-on-surface">Làng Trẻ SOS</p>
                    </td>
                    <td class="px-6 py-5">
                      <p class="text-body-md text-on-surface-variant line-clamp-1">Đồ chơi gỗ, mô hình lắp ráp giáo dục</p>
                    </td>
                    <td class="px-6 py-5">
                      <span class="inline-flex items-center px-3 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full text-label-sm font-bold">
                        <span class="w-2 h-2 bg-secondary rounded-full mr-2"></span>
                        Chờ xử lý
                      </span>
                    </td>
                    <td class="px-6 py-5">
                      <span class="text-label-md font-medium text-on-surface-variant">1 ngày</span>
                    </td>
                    <td class="px-6 py-5 text-right">
                      <div class="flex items-center justify-end space-x-2">
                        <button class="p-2 text-on-surface-variant hover:text-primary transition-soft">
                          <span class="material-symbols-outlined">visibility</span>
                        </button>
                        <button class="p-2 text-on-surface-variant hover:text-secondary transition-soft">
                          <span class="material-symbols-outlined">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Pagination footer -->
            <div class="px-6 py-4 bg-surface-container-low flex justify-between items-center border-t border-outline-variant">
              <p class="text-label-sm text-on-surface-variant">Hiển thị 1-3 trong số 8 yêu cầu chờ xử lý</p>
              <div class="flex items-center space-x-2">
                <button class="p-2 border border-outline-variant rounded-lg disabled:opacity-30" disabled="">
                  <span class="material-symbols-outlined text-label-md">chevron_left</span>
                </button>
                <button class="w-10 h-10 bg-primary text-on-primary rounded-lg text-label-md font-bold">1</button>
                <button class="p-2 border border-outline-variant rounded-lg hover:bg-surface-variant transition-soft">
                  <span class="material-symbols-outlined text-label-md">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Stats Section -->
        <section class="px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-gutter pb-stack-xl">
          <div class="glass-card p-6 rounded-xl border-l-4 border-primary">
            <div class="flex justify-between items-start mb-4">
              <span class="p-3 bg-primary-container text-on-primary-container rounded-lg material-symbols-outlined">volunteer_activism</span>
              <span class="text-label-sm text-primary font-bold">+12% vs tuần trước</span>
            </div>
            <h4 class="text-label-md text-on-surface-variant font-medium">Tổng món đồ đã tặng</h4>
            <p class="text-display-lg font-headline-md text-on-surface mt-1">1,284</p>
          </div>
          <div class="glass-card p-6 rounded-xl border-l-4 border-secondary">
            <div class="flex justify-between items-start mb-4">
              <span class="p-3 bg-secondary-fixed text-on-secondary-fixed rounded-lg material-symbols-outlined">pending_actions</span>
            </div>
            <h4 class="text-label-md text-on-surface-variant font-medium">Cần xử lý gấp</h4>
            <p class="text-display-lg font-headline-md text-on-surface mt-1">2 <span class="text-body-md text-error font-normal">(Fallback)</span></p>
          </div>
          <div class="glass-card p-6 rounded-xl border-l-4 border-tertiary-container">
            <div class="flex justify-between items-start mb-4">
              <span class="p-3 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-lg material-symbols-outlined">corporate_fare</span>
            </div>
            <h4 class="text-label-md text-on-surface-variant font-medium">Đối tác tích cực</h4>
            <p class="text-display-lg font-headline-md text-on-surface mt-1">18</p>
          </div>
        </section>

        <!-- Floating Action Button -->
        <button class="fixed bottom-10 right-10 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-soft z-50 group">
          <span class="material-symbols-outlined">add</span>
          <span class="absolute right-full mr-4 px-3 py-1 bg-inverse-surface text-on-primary-fixed text-label-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Tạo mới Donation</span>
        </button>
      </main>
  `;
}

export function attachDonationsListeners(container) {
  // Fallback Approval Interactions
  const fallbackBtns = container.querySelectorAll('.approve-fallback-btn');
  fallbackBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const row = this.closest('tr');
      row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';
      setTimeout(() => row.remove(), 300);
    });
  });

  // Tab switching logic (Visual only)
  const tabs = container.querySelectorAll('.donations-tabs .tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('text-primary', 'font-bold', 'border-primary');
        t.classList.add('text-on-surface-variant', 'font-medium', 'border-transparent');
      });
      tab.classList.add('text-primary', 'font-bold', 'border-primary');
      tab.classList.remove('text-on-surface-variant', 'font-medium', 'border-transparent');
    });
  });
}