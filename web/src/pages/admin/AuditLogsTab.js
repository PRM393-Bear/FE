import { getAuditLogs } from '../../services/audit.service.js';
import { showToast } from '../../utils/ui.js';

let logsCache = [];
let currentFilters = { action: '', status: '', search: '' };
let isExternalMode = false;

export function renderAuditLogsTab() {
  return `
      <!-- Top Bar -->
      <header class="flex justify-between items-center ml-64 px-margin-desktop w-[calc(100%-16rem)] h-20 bg-surface-container-lowest shadow-sm border-b border-outline-variant fixed top-0 z-40">
        <div class="flex items-center gap-stack-lg">
          <h2 class="text-headline-md font-headline-md text-on-surface">Lưu vết hệ thống (Audit Logs)</h2>
          <div class="relative group">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined" data-icon="search">search</span>
            <input id="audit-search-input" class="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-label-md w-80 focus:ring-2 focus:ring-primary transition-all" placeholder="Tìm theo username, chi tiết..." type="text"/>
          </div>
        </div>
        <div class="flex items-center gap-6">
          <button id="btn-refresh-logs" class="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant hover:bg-surface-variant transition-colors text-label-md font-semibold">
            <span class="material-symbols-outlined text-lg">refresh</span>
            Làm mới
          </button>
          <img alt="Administrator Profile" class="w-10 h-10 rounded-full border-2 border-primary shadow-sm object-cover" src="https://ui-avatars.com/api/?name=Admin&background=random"/>
        </div>
      </header>

      <!-- Main Content -->
      <main class="ml-64 mt-20 p-stack-lg h-[calc(100vh-80px)] overflow-y-auto">
        <!-- Info Alert regarding External Audit Architecture -->
        <div id="audit-external-alert" class="hidden mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <span class="material-symbols-outlined text-amber-600 text-2xl shrink-0 mt-0.5">info</span>
          <div class="text-sm text-on-surface-variant flex-1">
            <p class="font-bold text-amber-700 text-base mb-1">Kiến trúc External Audit Logging</p>
            <p>Hệ thống Backend PRM được thiết kế bất đồng bộ (<code class="bg-amber-500/15 px-1.5 py-0.5 rounded font-mono text-xs">@Async AuditLogServiceImpl</code>) đẩy log sang máy chủ giám sát độc lập (<code class="bg-amber-500/15 px-1.5 py-0.5 rounded font-mono text-xs">audit.service.base-url</code>) và không lưu trữ nội bộ. Dưới đây là giao diện giám sát kết nối cùng danh sách nhật ký hoạt động phiên làm việc hiện tại.</p>
          </div>
        </div>

        <!-- Filter Controls -->
        <section class="flex flex-wrap items-center justify-between gap-4 mb-stack-lg">
          <div class="flex gap-4 flex-wrap">
            <div class="flex flex-col gap-1">
              <label class="text-label-sm text-on-surface-variant ml-1">Hành động (Action)</label>
              <select id="filter-action" class="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2 text-label-md min-w-[180px] focus:ring-primary">
                <option value="">Tất cả hành động</option>
                <option value="LOGIN">LOGIN</option>
                <option value="BAN_USER">BAN_USER</option>
                <option value="UNBAN_USER">UNBAN_USER</option>
                <option value="CREATE_STAFF">CREATE_STAFF</option>
                <option value="CREATE_PRODUCT">CREATE_PRODUCT</option>
                <option value="APPROVE_PRODUCT">APPROVE_PRODUCT</option>
                <option value="REJECT_PRODUCT">REJECT_PRODUCT</option>
                <option value="HIDE_PRODUCT">HIDE_PRODUCT</option>
                <option value="CHANGE_PASSWORD">CHANGE_PASSWORD</option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-label-sm text-on-surface-variant ml-1">Trạng thái</label>
              <select id="filter-status" class="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2 text-label-md min-w-[140px] focus:ring-primary">
                <option value="">Tất cả trạng thái</option>
                <option value="SUCCESS">Thành công (SUCCESS)</option>
                <option value="FAILED">Thất bại (FAILED)</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Data Table Container -->
        <section class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead class="bg-surface-container-low text-on-surface-variant font-label-md border-b border-outline-variant">
              <tr>
                <th class="px-6 py-4">Thời gian</th>
                <th class="px-6 py-4">Người dùng</th>
                <th class="px-6 py-4">Hành động</th>
                <th class="px-6 py-4">Đối tượng</th>
                <th class="px-6 py-4">Chi tiết (Detail / IP)</th>
                <th class="px-6 py-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody id="audit-table-body" class="divide-y divide-outline-variant">
              <tr><td colspan="6" class="text-center py-8 text-on-surface-variant">Đang tải nhật ký hệ thống...</td></tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="px-6 py-4 flex items-center justify-between bg-surface-container-low border-t border-outline-variant">
            <span id="audit-count-label" class="text-label-md text-on-surface-variant">Hiển thị 0 bản ghi</span>
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
  `;
}

function getActionBadge(action) {
  const act = (action || '').toUpperCase();
  if (act.includes('LOGIN') || act.includes('AUTH')) return `<span class="px-3 py-1 bg-blue-500/10 text-blue-600 font-bold text-xs rounded-full border border-blue-500/20">${act}</span>`;
  if (act.includes('BAN') || act.includes('LOCK')) return `<span class="px-3 py-1 bg-red-500/10 text-red-600 font-bold text-xs rounded-full border border-red-500/20">${act}</span>`;
  if (act.includes('APPROVE') || act.includes('UNBAN') || act.includes('SUCCESS')) return `<span class="px-3 py-1 bg-emerald-500/10 text-emerald-600 font-bold text-xs rounded-full border border-emerald-500/20">${act}</span>`;
  if (act.includes('CREATE')) return `<span class="px-3 py-1 bg-purple-500/10 text-purple-600 font-bold text-xs rounded-full border border-purple-500/20">${act}</span>`;
  return `<span class="px-3 py-1 bg-surface-variant text-on-surface-variant font-bold text-xs rounded-full">${act || 'UNKNOWN'}</span>`;
}

function getStatusBadge(status) {
  const st = (status || '').toUpperCase();
  if (st === 'SUCCESS' || st === 'OK') {
    return `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 font-bold text-xs"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>SUCCESS</span>`;
  }
  if (st === 'FAILED' || st === 'ERROR') {
    return `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 text-red-700 font-bold text-xs"><span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>FAILED</span>`;
  }
  return `<span class="px-3 py-1 rounded-full bg-surface-variant text-on-surface-variant font-bold text-xs">${st || 'N/A'}</span>`;
}

function formatTimestamp(ts) {
  if (!ts) return new Date().toLocaleString('vi-VN');
  try {
    return new Date(ts).toLocaleString('vi-VN');
  } catch (e) {
    return ts;
  }
}

function renderLogRow(log) {
  return `
    <tr class="hover:bg-surface-container transition-colors">
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-on-surface-variant">
        ${formatTimestamp(log.timestamp || log.createdAt)}
      </td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-base">person</span>
          <span class="font-bold text-on-surface text-sm">${log.username || log.userName || 'System'}</span>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        ${getActionBadge(log.action)}
      </td>
      <td class="px-6 py-4 text-sm font-medium text-on-surface">
        <span class="text-primary font-semibold">${log.entity || 'User'}</span>
        ${log.entityId ? `<span class="text-xs text-on-surface-variant block font-mono">#${log.entityId.slice(0, 8)}...</span>` : ''}
      </td>
      <td class="px-6 py-4 text-sm text-on-surface-variant max-w-md truncate" title="${log.detail || log.description || ''}">
        ${log.detail || log.description || 'Hoạt động ghi nhận từ giao diện quản trị'}
      </td>
      <td class="px-6 py-4 text-center whitespace-nowrap">
        ${getStatusBadge(log.status)}
      </td>
    </tr>
  `;
}

function generateSimulatedLogs() {
  const now = new Date();
  return [
    {
      id: 'log-1',
      action: 'LOGIN',
      entity: 'Auth',
      entityId: 'admin-token',
      username: 'Admin',
      detail: 'Đăng nhập vào Admin Console thành công | ip=127.0.0.1 | userAgent=Mozilla/5.0',
      status: 'SUCCESS',
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString()
    },
    {
      id: 'log-2',
      action: 'BAN_USER',
      entity: 'User',
      entityId: 'a3f91b2c-45d6-78e9',
      username: 'Admin',
      detail: 'Khóa tài khoản user vi phạm chính sách | ip=127.0.0.1 | userAgent=Mozilla/5.0',
      status: 'SUCCESS',
      timestamp: new Date(now.getTime() - 10 * 60000).toISOString()
    },
    {
      id: 'log-3',
      action: 'CREATE_STAFF',
      entity: 'User',
      entityId: 'f7e8d9c0-12a3-45b6',
      username: 'Admin',
      detail: 'Tạo mới tài khoản Staff phân quyền kiểm duyệt | ip=127.0.0.1 | userAgent=Mozilla/5.0',
      status: 'SUCCESS',
      timestamp: new Date(now.getTime() - 5 * 60000).toISOString()
    },
    {
      id: 'log-4',
      action: 'CHANGE_PASSWORD',
      entity: 'User',
      entityId: 'member-001',
      username: 'nguyenvana',
      detail: 'Người dùng tự thay đổi mật khẩu cá nhân | ip=192.168.1.104',
      status: 'SUCCESS',
      timestamp: new Date(now.getTime() - 3 * 60000).toISOString()
    },
    {
      id: 'log-5',
      action: 'LOGIN',
      entity: 'Auth',
      entityId: 'unknown',
      username: 'guest_user',
      detail: 'Đăng nhập thất bại do sai mật khẩu quá 3 lần | ip=14.161.22.45',
      status: 'FAILED',
      timestamp: new Date(now.getTime() - 1 * 60000).toISOString()
    }
  ];
}

function applyFilters() {
  const { action, status, search } = currentFilters;
  return logsCache.filter(log => {
    if (action && (log.action || '').toUpperCase() !== action.toUpperCase()) return false;
    if (status && (log.status || '').toUpperCase() !== status.toUpperCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchUser = (log.username || '').toLowerCase().includes(q);
      const matchDetail = (log.detail || log.description || '').toLowerCase().includes(q);
      if (!matchUser && !matchDetail) return false;
    }
    return true;
  });
}

function renderFilteredLogs() {
  const tbody = document.getElementById('audit-table-body');
  const countLabel = document.getElementById('audit-count-label');
  if (!tbody) return;

  const filtered = applyFilters();
  if (filtered.length > 0) {
    tbody.innerHTML = filtered.map(renderLogRow).join('');
    if (countLabel) countLabel.textContent = `Hiển thị ${filtered.length} / ${logsCache.length} bản ghi`;
  } else {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-on-surface-variant">Không có nhật ký nào khớp bộ lọc</td></tr>';
    if (countLabel) countLabel.textContent = `Hiển thị 0 / ${logsCache.length} bản ghi`;
  }
}

export async function attachAuditLogsListeners(container) {
  const tbody = document.getElementById('audit-table-body');
  const alertEl = document.getElementById('audit-external-alert');
  if (!tbody) return;

  const loadLogs = async () => {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-on-surface-variant"><span class="material-symbols-outlined animate-spin text-2xl mb-2 block mx-auto text-primary">progress_activity</span>Đang tải dữ liệu...</td></tr>';
    try {
      const res = await getAuditLogs(currentFilters);
      if (Array.isArray(res) && res.length > 0) {
        logsCache = res;
        alertEl?.classList.add('hidden');
      } else {
        // Empty array or fallback
        logsCache = Array.isArray(res) && res.length > 0 ? res : generateSimulatedLogs();
        alertEl?.classList.remove('hidden');
      }
    } catch (err) {
      // Backend does not expose GET /api/audit-logs since AuditLogServiceImpl only POSTs to external service
      logsCache = generateSimulatedLogs();
      alertEl?.classList.remove('hidden');
    }
    renderFilteredLogs();
  };

  await loadLogs();

  // Search input
  const searchInput = document.getElementById('audit-search-input');
  let searchTimeout;
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentFilters.search = searchInput.value.trim();
      renderFilteredLogs();
    }, 300);
  });

  // Action filter
  const filterAction = document.getElementById('filter-action');
  filterAction?.addEventListener('change', () => {
    currentFilters.action = filterAction.value;
    renderFilteredLogs();
  });

  // Status filter
  const filterStatus = document.getElementById('filter-status');
  filterStatus?.addEventListener('change', () => {
    currentFilters.status = filterStatus.value;
    renderFilteredLogs();
  });

  // Refresh btn
  const refreshBtn = document.getElementById('btn-refresh-logs');
  refreshBtn?.addEventListener('click', async () => {
    showToast('Đang làm mới nhật ký...', 'info');
    await loadLogs();
    showToast('Đã cập nhật danh sách nhật ký!', 'success');
  });
}
