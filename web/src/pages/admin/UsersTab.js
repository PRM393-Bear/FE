import { getAllUsers } from '../../services/admin.service.js';

export function renderUsersTab() {
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
          <img alt="Administrator Profile" class="w-10 h-10 rounded-full border-2 border-primary shadow-sm object-cover" src="https://ui-avatars.com/api/?name=Admin&background=random"/>
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
                <option>Tổ chức</option>
                <option>Cá nhân</option>
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
                <th class="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody id="users-table-body" class="divide-y divide-outline-variant">
              <tr><td colspan="6" class="text-center py-8 text-on-surface-variant">Đang tải dữ liệu...</td></tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="px-6 py-4 flex items-center justify-between bg-surface-container-low border-t border-outline-variant">
            <span id="users-count-label" class="text-label-md text-on-surface-variant">Hiển thị 0 users</span>
            <div class="flex gap-2">
              <button class="p-2 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors disabled:opacity-30" disabled="">
                <span class="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
              </button>
              <button class="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md shadow-sm">1</button>
              <button class="p-2 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors disabled:opacity-30" disabled="">
                <span class="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <!-- User Detail Side Drawer -->
      <div class="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60] hidden opacity-0 transition-opacity duration-300" id="backdrop" onclick="toggleDrawer(false)"></div>
      <div class="fixed right-0 top-0 h-full w-[450px] bg-surface-container-lowest z-[70] translate-x-full transition-transform duration-300 drawer-shadow flex flex-col" id="userDrawer">
        <div id="drawer-content" class="flex-1 overflow-y-auto w-full h-full">
           <!-- Dynamic content injected here -->
        </div>
      </div>
  `;
}

function getRoleBadge(roleName) {
  const role = roleName?.toUpperCase() || 'USER';
  if (role === 'ADMIN') return '<span class="px-3 py-1 bg-primary text-on-primary text-label-sm rounded-full">Admin</span>';
  if (role === 'ORGANIZATION' || role === 'ROLE_ORGANIZATION') return '<span class="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-label-sm rounded-full">Tổ chức</span>';
  return '<span class="px-3 py-1 bg-surface-variant text-on-surface-variant text-label-sm rounded-full">Cá nhân</span>';
}

function renderUserRow(user) {
  const avatarUrl = user.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.userName || 'U')}&background=random`;
  let statusHtml;
  if (user.isBlocked || user.status === "BLOCKED" || user.status === "LOCKED") {
    statusHtml = `
      <div class="flex items-center gap-2 text-error font-label-md">
        <span class="w-2 h-2 rounded-full bg-error"></span>
        Đã bị khóa
      </div>
    `;
  } else if (user.status) {
    statusHtml = `
      <div class="flex items-center gap-2 text-primary font-label-md">
        <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        ${user.status}
      </div>
    `;
  } else {
    statusHtml = `
      <div class="flex items-center gap-2 text-on-surface-variant font-label-md">
        <span class="w-2 h-2 rounded-full bg-outline"></span>
        Đã xác thực
      </div>
    `;
  }

  return `
    <tr class="hover:bg-surface-container transition-colors cursor-pointer group" data-userid="${user.userId}">
      <td class="px-6 py-4" onclick="event.stopPropagation()">
        <input class="rounded text-primary focus:ring-primary border-outline" type="checkbox"/>
      </td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-4">
          <img alt="${user.fullName} Avatar" class="w-10 h-10 rounded-full object-cover shadow-sm" src="${avatarUrl}"/>
          <div>
            <p class="font-bold text-on-surface">${user.fullName || user.userName || 'Không tên'}</p>
            <p class="text-label-sm text-on-surface-variant">${user.email || 'N/A'}</p>
          </div>
        </div>
      </td>
      <td class="px-6 py-4">
        ${getRoleBadge(user.role?.roleName)}
      </td>
      <td class="px-6 py-4">
        ${statusHtml}
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
  `;
}

function renderDrawerContent(user) {
  const avatarUrl = user.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.userName || 'U')}&background=random`;

  return `
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
          <img alt="${user.fullName} Large Profile" class="w-24 h-24 rounded-full border-4 border-surface-container-low shadow-lg object-cover" src="${avatarUrl}"/>
          <span class="absolute bottom-1 right-1 w-6 h-6 bg-primary border-2 border-surface-container-lowest rounded-full"></span>
        </div>
        <h4 class="text-headline-md font-headline-md text-on-surface">${user.fullName || user.userName || 'Không tên'}</h4>
        <p class="text-on-surface-variant">${user.email || 'N/A'}</p>
        <div class="flex gap-2 mt-4">
          ${getRoleBadge(user.role?.roleName)}
          <span class="px-4 py-1 bg-primary-container text-on-primary-container text-label-md rounded-full">Active</span>
        </div>
      </div>
      <!-- Detailed Info -->
      <div class="space-y-6">
        <div>
          <h5 class="text-label-sm text-on-surface-variant font-bold uppercase mb-3 border-b border-outline-variant pb-2">Thông tin tài khoản</h5>
          <div class="grid grid-cols-1 gap-4">
            <div class="flex justify-between">
              <span class="text-on-surface-variant">Tên đăng nhập</span>
              <span class="font-label-md">${user.userName || 'N/A'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-on-surface-variant">Số điện thoại</span>
              <span class="font-label-md">${user.phone || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function attachUsersListeners(container) {
  const tbody = document.getElementById('users-table-body');
  const countLabel = document.getElementById('users-count-label');
  const drawerContent = document.getElementById('drawer-content');

  if (!tbody) return;

  try {
    const users = await getAllUsers();

    if (users && users.length > 0) {
      tbody.innerHTML = users.map(renderUserRow).join('');
      if (countLabel) {
        countLabel.textContent = `Hiển thị ${users.length} users`;
      }

      // Add click listeners to rows to show drawer
      const rows = tbody.querySelectorAll('tr[data-userid]');
      rows.forEach(row => {
        row.addEventListener('click', () => {
          const userId = row.getAttribute('data-userid');
          const user = users.find(u => u.userId === userId);
          if (user && drawerContent) {
            drawerContent.innerHTML = renderDrawerContent(user);
            if (window.toggleDrawer) {
              window.toggleDrawer(true);
            }
          }
        });
      });
    } else {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-on-surface-variant">Không có dữ liệu</td></tr>';
    }
  } catch (error) {
    console.error('Error loading users:', error);
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-error">Lỗi khi tải dữ liệu</td></tr>';
  }
}
