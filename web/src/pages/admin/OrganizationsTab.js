import { getPendingOrganizations, approveOrganization, rejectOrganization } from '../../services/admin.service.js';

export function renderOrganizationsTab() {
  return `
      <!-- Main Content Canvas -->
      <main class="ml-64 flex-1 flex flex-col min-h-screen bg-surface w-full max-w-[calc(100%-16rem)]">
        <!-- TopNavBar -->
        <header class="flex justify-between items-center px-margin-desktop bg-surface-container-lowest shadow-sm border-b border-outline-variant h-20 sticky top-0 z-40">
          <div class="flex items-center flex-1 max-w-xl">
            <div class="relative w-full">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input class="w-full h-12 pl-12 pr-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-body-md transition-soft" placeholder="Tìm kiếm tổ chức..." type="text"/>
            </div>
          </div>
          <div class="flex items-center space-x-6 ml-gutter">
            <button class="relative p-2 rounded-lg hover:bg-surface-variant transition-soft">
              <span class="material-symbols-outlined text-on-surface-variant">notifications</span>
            </button>
            <button class="p-2 rounded-lg hover:bg-surface-variant transition-soft">
              <span class="material-symbols-outlined text-on-surface-variant">help_outline</span>
            </button>
            <button class="p-2 rounded-lg hover:bg-surface-variant transition-soft">
              <span class="material-symbols-outlined text-on-surface-variant">more_vert</span>
            </button>
            <div class="flex items-center space-x-3 border-l border-outline-variant pl-6">
              <div class="text-right">
                <p class="text-label-md font-bold text-on-surface leading-none">Admin Master</p>
                <p class="text-label-sm text-on-surface-variant opacity-70">Quản trị viên</p>
              </div>
              <img alt="Administrator Profile" class="w-10 h-10 rounded-full border-2 border-primary/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD9hhQ7imU1OcP9ZuaAj-txVZJ9mesZyPCCubq9_3HyM9crEa34Etk5pQ1Y2A2gv4o2T9f2FddVeqZQy3v5xDT2uforX9X869WqAQHD9zDiFh5GGURfK7pNuAoitnM1oympNIMcxitFbdxdz7cBKwXI0D-fCfsel9T4LXKiMoJe6Opoixm0OG2YZB_f7qyds7HS-EkSa8PGiQZn8c59Kf0oMgP_LtMTLSyrF321YBHRVRJVu_P6xIxDZVLww-WDz6WVd6w9-x0K_zy"/>
            </div>
          </div>
        </header>

        <!-- Page Header -->
        <section class="px-margin-desktop py-stack-lg bg-surface">
          <div class="mb-stack-lg">
            <h2 class="text-headline-lg font-headline-md text-on-surface">Xét duyệt tài khoản tổ chức</h2>
            <p class="text-body-md text-on-surface-variant">Xem xét và phê duyệt các tổ chức đăng ký tham gia mạng lưới từ thiện của Lifecycle.</p>
          </div>
        </section>

        <!-- Organization Table Section -->
        <section class="px-margin-desktop pb-stack-xl flex-1">
          <div class="glass-card rounded-xl overflow-hidden shadow-sm border border-outline-variant/30">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-surface-container-high border-b border-outline-variant">
                    <th class="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Tổ chức</th>
                    <th class="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Đại diện</th>
                    <th class="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Loại nhận quyên góp</th>
                    <th class="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Tài liệu xác minh</th>
                    <th class="px-6 py-4 font-headline-md text-label-md text-on-surface-variant text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody id="orgs-table-body" class="divide-y divide-outline-variant">
                  <tr>
                    <td colspan="5" class="text-center py-8 text-on-surface-variant">Đang tải dữ liệu...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
  `;
}

export async function attachOrganizationsListeners(container) {
  const tbody = document.getElementById('orgs-table-body');
  if (!tbody) return;

  try {
    const orgs = await getPendingOrganizations();
    if (orgs && orgs.length > 0) {
      tbody.innerHTML = orgs.map(org => {
        const logoUrl = org.avtOrg || `https://ui-avatars.com/api/?name=${encodeURIComponent(org.orgName || 'O')}&background=006B2C&color=fff`;
        const acceptedTypesText = org.acceptedTypes && org.acceptedTypes.length > 0 
          ? org.acceptedTypes.map(t => `<span class="px-2 py-0.5 bg-surface-variant text-on-surface-variant rounded text-xs mr-1">${t}</span>`).join('')
          : '<span class="text-xs text-on-surface-variant/60">Không giới hạn</span>';

        const docLinks = org.verificationDocs && org.verificationDocs.length > 0
          ? org.verificationDocs.map((doc, idx) => `<a href="${doc}" target="_blank" class="text-primary hover:underline text-sm mr-2 flex items-center gap-1" onclick="event.stopPropagation()"><span class="material-symbols-outlined text-sm">description</span> Tài liệu ${idx + 1}</a>`).join('')
          : '<span class="text-xs text-on-surface-variant/60">Không có tài liệu</span>';

        return `
          <tr class="hover:bg-surface-container transition-colors" data-orgid="${org.id}">
            <td class="px-6 py-5">
              <div class="flex items-center space-x-3">
                <img alt="Org Logo" class="w-10 h-10 rounded-lg object-cover border border-outline/20" src="${logoUrl}"/>
                <div>
                  <p class="text-label-md font-bold text-on-surface">${org.orgName || 'Chưa đặt tên'}</p>
                  <p class="text-xs text-on-surface-variant">${org.address || 'Không có địa chỉ'}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-5">
              <p class="text-label-md font-bold text-on-surface">${org.userFullName || 'N/A'}</p>
              <p class="text-xs text-on-surface-variant">${org.userEmail || 'N/A'}</p>
            </td>
            <td class="px-6 py-5">
              <div class="flex flex-wrap gap-1">
                ${acceptedTypesText}
              </div>
            </td>
            <td class="px-6 py-5">
              <div class="flex flex-col gap-1">
                ${docLinks}
              </div>
            </td>
            <td class="px-6 py-5 text-right space-x-2">
              <button class="approve-org-btn bg-primary text-on-primary px-3 py-1.5 rounded-lg text-label-sm font-bold shadow-sm hover:opacity-90 transition-soft active:scale-95" data-id="${org.id}">
                Duyệt
              </button>
              <button class="reject-org-btn bg-error text-on-error px-3 py-1.5 rounded-lg text-label-sm font-bold shadow-sm hover:opacity-90 transition-soft active:scale-95" data-id="${org.id}">
                Từ chối
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // Add click listeners to buttons
      tbody.querySelectorAll('.approve-org-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          if (confirm('Bạn có chắc chắn muốn DUYỆT tài khoản tổ chức này?')) {
            try {
              btn.disabled = true;
              btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">sync</span>`;
              await approveOrganization(id);
              // Reload tab
              attachOrganizationsListeners(container);
            } catch (err) {
              alert('Lỗi khi duyệt tổ chức: ' + err.message);
              btn.disabled = false;
              btn.textContent = 'Duyệt';
            }
          }
        });
      });

      tbody.querySelectorAll('.reject-org-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          if (confirm('Bạn có chắc chắn muốn TỪ CHỐI tài khoản tổ chức này?')) {
            try {
              btn.disabled = true;
              btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">sync</span>`;
              await rejectOrganization(id);
              // Reload tab
              attachOrganizationsListeners(container);
            } catch (err) {
              alert('Lỗi khi từ chối tổ chức: ' + err.message);
              btn.disabled = false;
              btn.textContent = 'Từ chối';
            }
          }
        });
      });

    } else {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-12 text-on-surface-variant">
            <span class="material-symbols-outlined text-4xl mb-2 text-outline-variant">check_circle</span>
            <p class="text-label-md font-bold">Không có tổ chức nào đang chờ xét duyệt</p>
          </td>
        </tr>
      `;
    }
  } catch (error) {
    console.error('Error loading pending organizations:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-8 text-error font-bold">
          Lỗi khi tải dữ liệu từ máy chủ
        </td>
      </tr>
    `;
  }
}
