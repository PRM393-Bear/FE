import { getAllUsers, banUser, createStaff } from '../../services/admin.service.js';
import { showToast } from '../../utils/ui.js';

// Module-level state
let allUsersCache = [];
let currentFilters = { role: '', status: '', search: '' };

export function renderUsersTab() {
  return `
      <!-- Top Bar -->
      <header class="flex justify-between items-center ml-64 px-margin-desktop w-[calc(100%-16rem)] h-20 bg-surface-container-lowest shadow-sm border-b border-outline-variant fixed top-0 z-40">
        <div class="flex items-center gap-stack-lg">
          <h2 class="text-headline-md font-headline-md text-on-surface">Quản lý User</h2>
          <div class="relative group">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined" data-icon="search">search</span>
            <input id="users-search-input" class="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-label-md w-80 focus:ring-2 focus:ring-primary transition-all" placeholder="Tìm kiếm theo tên, email..." type="text"/>
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
              <select id="filter-role" class="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2 text-label-md min-w-[140px] focus:ring-primary">
                <option value="">Tất cả</option>
                <option value="ADMIN">Admin</option>
                <option value="STAFF">Staff</option>
                <option value="ORGANIZATION">Tổ chức</option>
                <option value="MEMBER">Cá nhân</option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-label-sm text-on-surface-variant ml-1">Trạng thái</label>
              <select id="filter-status" class="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2 text-label-md min-w-[140px] focus:ring-primary">
                <option value="">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="blocked">Bị khóa</option>
              </select>
            </div>
          </div>
          <button id="btn-add-user" class="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label-md shadow-md hover:opacity-90 transition-all mt-6 active:scale-95">
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
              <tr><td colspan="5" class="text-center py-8 text-on-surface-variant">Đang tải dữ liệu...</td></tr>
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

      <!-- Ban/Unban Confirm Modal -->
      <div id="modal-ban-confirm" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] hidden flex items-center justify-center">
        <div class="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant p-8 max-w-md w-full mx-4">
          <div class="flex items-center gap-3 mb-4">
            <span id="modal-ban-icon" class="material-symbols-outlined text-3xl text-error">gavel</span>
            <h3 id="modal-ban-title" class="text-headline-sm font-bold text-on-surface">Xác nhận thao tác</h3>
          </div>
          <p id="modal-ban-message" class="text-body-md text-on-surface-variant mb-6"></p>
          <div class="flex justify-end gap-3">
            <button id="btn-ban-cancel" class="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-variant transition-colors">Hủy</button>
            <button id="btn-ban-confirm" class="px-5 py-2.5 rounded-xl bg-error text-on-error font-semibold hover:bg-error/90 transition-colors">Xác nhận</button>
          </div>
        </div>
      </div>

      <!-- Create Staff Modal -->
      <div id="modal-create-staff" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] hidden flex items-center justify-center">
        <div class="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant p-8 max-w-lg w-full mx-4">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-2xl text-primary">person_add</span>
              <h3 class="text-headline-sm font-bold text-on-surface">Tạo tài khoản Staff</h3>
            </div>
            <button id="btn-close-staff-modal" class="p-2 hover:bg-surface-variant rounded-full transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <form id="form-create-staff" class="flex flex-col gap-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-label-md font-semibold text-on-surface">Tên đăng nhập *</label>
                <input type="text" name="username" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-label-md font-semibold text-on-surface">Họ và tên *</label>
                <input type="text" name="fullName" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-label-md font-semibold text-on-surface">Email *</label>
                <input type="email" name="email" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-label-md font-semibold text-on-surface">Số điện thoại</label>
                <input type="tel" name="phone" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-label-md font-semibold text-on-surface">Mật khẩu *</label>
                <input type="password" name="password" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" required minlength="6" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-label-md font-semibold text-on-surface">Vai trò</label>
                <select name="roleName" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="STAFF">Staff</option>
                </select>
              </div>
            </div>
            <p id="staff-error-msg" class="text-sm text-error hidden"></p>
            <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
              <button type="button" id="btn-cancel-staff" class="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-variant transition-colors">Hủy</button>
              <button type="submit" id="btn-submit-staff" class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                <span class="material-symbols-outlined text-lg">person_add</span>
                Tạo tài khoản
              </button>
            </div>
          </form>
        </div>
      </div>
  `;
}

function getRoleBadge(roleName) {
  const role = roleName?.toUpperCase() || 'USER';
  if (role === 'ADMIN') return '<span class="px-3 py-1 bg-primary text-on-primary text-label-sm rounded-full">Admin</span>';
  if (role === 'STAFF' || role === 'ROLE_STAFF') return '<span class="px-3 py-1 bg-tertiary text-on-tertiary text-label-sm rounded-full">Staff</span>';
  if (role === 'ORGANIZATION' || role === 'ROLE_ORGANIZATION') return '<span class="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-label-sm rounded-full">Tổ chức</span>';
  return '<span class="px-3 py-1 bg-surface-variant text-on-surface-variant text-label-sm rounded-full">Cá nhân</span>';
}

function getStatusInfo(user) {
  if (user.isBlocked || user.blocked) {
    return { html: '<div class="flex items-center gap-2 text-error font-label-md"><span class="w-2 h-2 rounded-full bg-error"></span>Bị khóa</div>', key: 'blocked' };
  }
  if (user.isVerified === false || user.verified === false) {
    return { html: '<div class="flex items-center gap-2 text-amber-600 font-label-md"><span class="w-2 h-2 rounded-full bg-amber-500"></span>Chưa xác thực</div>', key: 'unverified' };
  }
  return { html: '<div class="flex items-center gap-2 text-primary font-label-md"><span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>Hoạt động</div>', key: 'active' };
}

function renderUserRow(user) {
  const avatarUrl = user.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.userName || 'U')}&background=random`;
  const statusInfo = getStatusInfo(user);
  const isBlocked = user.isBlocked || user.blocked || false;
  const blockBtnLabel = isBlocked ? 'Mở khóa' : 'Khóa';
  const blockBtnIcon = isBlocked ? 'lock_open' : 'block';
  const blockBtnColor = isBlocked ? 'hover:text-primary' : 'hover:text-error';

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
        ${statusInfo.html}
      </td>
      <td class="px-6 py-4 text-right" onclick="event.stopPropagation()">
        <button class="btn-ban-user p-2 text-outline ${blockBtnColor} transition-colors" data-userid="${user.userId}" data-blocked="${isBlocked}" title="${blockBtnLabel}">
          <span class="material-symbols-outlined">${blockBtnIcon}</span>
        </button>
      </td>
    </tr>
  `;
}

function renderDrawerContent(user) {
  const avatarUrl = user.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.userName || 'U')}&background=random`;
  const statusInfo = getStatusInfo(user);
  const isBlocked = user.isBlocked || user.blocked || false;

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
          <span class="absolute bottom-1 right-1 w-6 h-6 ${isBlocked ? 'bg-error' : 'bg-primary'} border-2 border-surface-container-lowest rounded-full"></span>
        </div>
        <h4 class="text-headline-md font-headline-md text-on-surface">${user.fullName || user.userName || 'Không tên'}</h4>
        <p class="text-on-surface-variant">${user.email || 'N/A'}</p>
        <div class="flex gap-2 mt-4">
          ${getRoleBadge(user.role?.roleName)}
          <span class="px-4 py-1 ${isBlocked ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'} text-label-md rounded-full">${isBlocked ? 'Bị khóa' : 'Hoạt động'}</span>
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
            <div class="flex justify-between">
              <span class="text-on-surface-variant">Xác thực</span>
              <span class="font-label-md">${user.isVerified || user.verified ? 'Đã xác thực' : 'Chưa xác thực'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function applyFilters() {
  const { role, status, search } = currentFilters;
  const filtered = allUsersCache.filter(user => {
    // Role filter
    if (role && (user.role?.roleName?.toUpperCase() !== role.toUpperCase())) {
      return false;
    }
    // Status filter
    if (status === 'blocked' && !(user.isBlocked || user.blocked)) return false;
    if (status === 'active' && (user.isBlocked || user.blocked)) return false;
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const matchName = (user.fullName || '').toLowerCase().includes(q);
      const matchUserName = (user.userName || '').toLowerCase().includes(q);
      const matchEmail = (user.email || '').toLowerCase().includes(q);
      if (!matchName && !matchUserName && !matchEmail) return false;
    }
    return true;
  });
  return filtered;
}

function renderFilteredUsers() {
  const tbody = document.getElementById('users-table-body');
  const countLabel = document.getElementById('users-count-label');
  if (!tbody) return;

  const filtered = applyFilters();
  if (filtered.length > 0) {
    tbody.innerHTML = filtered.map(renderUserRow).join('');
    if (countLabel) countLabel.textContent = `Hiển thị ${filtered.length} / ${allUsersCache.length} users`;
  } else {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-on-surface-variant">Không tìm thấy user phù hợp</td></tr>';
    if (countLabel) countLabel.textContent = `Hiển thị 0 / ${allUsersCache.length} users`;
  }

  // Re-attach ban buttons
  attachBanButtons();
  // Re-attach row click for drawer
  attachRowClicks();
}

function attachBanButtons() {
  document.querySelectorAll('.btn-ban-user').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const userId = btn.getAttribute('data-userid');
      const isCurrentlyBlocked = btn.getAttribute('data-blocked') === 'true';
      const user = allUsersCache.find(u => u.userId === userId);
      if (!user) return;

      const modal = document.getElementById('modal-ban-confirm');
      const title = document.getElementById('modal-ban-title');
      const message = document.getElementById('modal-ban-message');
      const icon = document.getElementById('modal-ban-icon');
      const confirmBtn = document.getElementById('btn-ban-confirm');

      if (isCurrentlyBlocked) {
        title.textContent = 'Mở khóa tài khoản';
        message.textContent = `Bạn có chắc muốn mở khóa tài khoản "${user.fullName || user.userName}"? Người dùng sẽ có thể đăng nhập và sử dụng hệ thống bình thường.`;
        icon.textContent = 'lock_open';
        icon.className = 'material-symbols-outlined text-3xl text-primary';
        confirmBtn.className = 'px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors';
        confirmBtn.textContent = 'Mở khóa';
      } else {
        title.textContent = 'Khóa tài khoản';
        message.textContent = `Bạn có chắc muốn khóa tài khoản "${user.fullName || user.userName}"? Người dùng sẽ không thể đăng nhập vào hệ thống.`;
        icon.textContent = 'gavel';
        icon.className = 'material-symbols-outlined text-3xl text-error';
        confirmBtn.className = 'px-5 py-2.5 rounded-xl bg-error text-on-error font-semibold hover:bg-error/90 transition-colors';
        confirmBtn.textContent = 'Khóa tài khoản';
      }

      modal.classList.remove('hidden');

      // Remove old listeners by cloning
      const newConfirmBtn = confirmBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

      newConfirmBtn.addEventListener('click', async () => {
        newConfirmBtn.disabled = true;
        newConfirmBtn.textContent = 'Đang xử lý...';
        try {
          await banUser(userId, !isCurrentlyBlocked);
          showToast(isCurrentlyBlocked ? 'Đã mở khóa tài khoản!' : 'Đã khóa tài khoản!', 'success');
          modal.classList.add('hidden');
          // Refresh data
          allUsersCache = await getAllUsers();
          renderFilteredUsers();
        } catch (err) {
          showToast('Lỗi: ' + (err.message || 'Không thể thực hiện thao tác'), 'error');
          newConfirmBtn.disabled = false;
          newConfirmBtn.textContent = isCurrentlyBlocked ? 'Mở khóa' : 'Khóa tài khoản';
        }
      });
    });
  });
}

function attachRowClicks() {
  const tbody = document.getElementById('users-table-body');
  const drawerContent = document.getElementById('drawer-content');
  if (!tbody || !drawerContent) return;

  tbody.querySelectorAll('tr[data-userid]').forEach(row => {
    row.addEventListener('click', () => {
      const userId = row.getAttribute('data-userid');
      const user = allUsersCache.find(u => u.userId === userId);
      if (user) {
        drawerContent.innerHTML = renderDrawerContent(user);
        if (window.toggleDrawer) window.toggleDrawer(true);
      }
    });
  });
}

export async function attachUsersListeners(container) {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;

  // Load users
  try {
    allUsersCache = await getAllUsers();
    renderFilteredUsers();
  } catch (error) {
    console.error('Error loading users:', error);
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-error">Lỗi khi tải dữ liệu</td></tr>';
  }

  // Search
  const searchInput = document.getElementById('users-search-input');
  let searchTimeout;
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentFilters.search = searchInput.value.trim();
      renderFilteredUsers();
    }, 300);
  });

  // Role filter
  const filterRole = document.getElementById('filter-role');
  filterRole?.addEventListener('change', () => {
    currentFilters.role = filterRole.value;
    renderFilteredUsers();
  });

  // Status filter
  const filterStatus = document.getElementById('filter-status');
  filterStatus?.addEventListener('change', () => {
    currentFilters.status = filterStatus.value;
    renderFilteredUsers();
  });

  // Ban modal cancel
  const banCancel = document.getElementById('btn-ban-cancel');
  banCancel?.addEventListener('click', () => {
    document.getElementById('modal-ban-confirm')?.classList.add('hidden');
  });

  // Create Staff modal
  const btnAddUser = document.getElementById('btn-add-user');
  const staffModal = document.getElementById('modal-create-staff');
  const btnCloseStaff = document.getElementById('btn-close-staff-modal');
  const btnCancelStaff = document.getElementById('btn-cancel-staff');
  const staffForm = document.getElementById('form-create-staff');
  const staffErrorMsg = document.getElementById('staff-error-msg');

  const closeStaffModal = () => {
    staffModal?.classList.add('hidden');
    staffForm?.reset();
    if (staffErrorMsg) { staffErrorMsg.classList.add('hidden'); staffErrorMsg.textContent = ''; }
  };

  btnAddUser?.addEventListener('click', () => staffModal?.classList.remove('hidden'));
  btnCloseStaff?.addEventListener('click', closeStaffModal);
  btnCancelStaff?.addEventListener('click', closeStaffModal);

  staffForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    staffErrorMsg?.classList.add('hidden');

    const formData = new FormData(staffForm);
    const payload = {
      username: formData.get('username')?.trim(),
      fullName: formData.get('fullName')?.trim(),
      email: formData.get('email')?.trim(),
      phone: formData.get('phone')?.trim() || null,
      password: formData.get('password'),
      roleName: formData.get('roleName') || 'STAFF',
    };

    if (!payload.username || !payload.fullName || !payload.email || !payload.password) {
      staffErrorMsg.textContent = 'Vui lòng điền đầy đủ các trường bắt buộc.';
      staffErrorMsg.classList.remove('hidden');
      return;
    }

    if (payload.password.length < 6) {
      staffErrorMsg.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
      staffErrorMsg.classList.remove('hidden');
      return;
    }

    const submitBtn = document.getElementById('btn-submit-staff');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-symbols-outlined text-lg animate-spin">progress_activity</span> Đang tạo...';

    try {
      await createStaff(payload);
      showToast('Tạo tài khoản Staff thành công!', 'success');
      closeStaffModal();
      // Refresh users
      allUsersCache = await getAllUsers();
      renderFilteredUsers();
    } catch (err) {
      const msg = err.message || 'Không thể tạo tài khoản.';
      staffErrorMsg.textContent = msg;
      staffErrorMsg.classList.remove('hidden');
      showToast('Lỗi: ' + msg, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="material-symbols-outlined text-lg">person_add</span> Tạo tài khoản';
    }
  });
}
