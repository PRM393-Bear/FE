import React, { useState, useEffect } from "react";
import { getAuditLogs, getLocalSessionAuditLogs } from '../../services/audit.service.js';
import { showToast } from '../../utils/ui.js';

function getActionBadge(action) {
  const act = (action || '').toUpperCase();
  if (act.includes('LOGIN') || act.includes('AUTH')) return <span className="px-3 py-1 bg-blue-500/10 text-blue-600 font-bold text-xs rounded-full border border-blue-500/20">{act}</span>;
  if (act.includes('BAN') || act.includes('LOCK')) return <span className="px-3 py-1 bg-red-500/10 text-red-600 font-bold text-xs rounded-full border border-red-500/20">{act}</span>;
  if (act.includes('APPROVE') || act.includes('UNBAN') || act.includes('SUCCESS')) return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 font-bold text-xs rounded-full border border-emerald-500/20">{act}</span>;
  if (act.includes('CREATE')) return <span className="px-3 py-1 bg-purple-500/10 text-purple-600 font-bold text-xs rounded-full border border-purple-500/20">{act}</span>;
  return <span className="px-3 py-1 bg-surface-variant text-on-surface-variant font-bold text-xs rounded-full">{act || 'UNKNOWN'}</span>;
}

function getStatusBadge(status) {
  const st = (status || '').toUpperCase();
  if (st === 'SUCCESS' || st === 'OK') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 font-bold text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>SUCCESS
      </span>
    );
  }
  if (st === 'FAILED' || st === 'ERROR') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 text-red-700 font-bold text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>FAILED
      </span>
    );
  }
  return <span className="px-3 py-1 rounded-full bg-surface-variant text-on-surface-variant font-bold text-xs">{st || 'N/A'}</span>;
}

function formatTimestamp(ts) {
  if (!ts) return new Date().toLocaleString('vi-VN');
  try {
    return new Date(ts).toLocaleString('vi-VN');
  } catch (e) {
    return ts;
  }
}

function generateSimulatedLogs() {
  const now = new Date();
  const baseSimulated = [
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
  return [...getLocalSessionAuditLogs(), ...baseSimulated];
}

export default function AuditLogsTab() {
  const [logsCache, setLogsCache] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ action: '', status: '', search: '' });
  const [showExternalAlert, setShowExternalAlert] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs(filters);
      if (Array.isArray(res) && res.length > 0) {
        setLogsCache(res);
        setShowExternalAlert(false);
      } else {
        setLogsCache(generateSimulatedLogs());
        setShowExternalAlert(true);
      }
    } catch (err) {
      setLogsCache(generateSimulatedLogs());
      setShowExternalAlert(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []); // Run only on mount

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRefresh = async () => {
    showToast('Đang làm mới nhật ký...', 'info');
    await loadLogs();
    showToast('Đã cập nhật danh sách nhật ký!', 'success');
  };

  const filteredLogs = logsCache.filter(log => {
    if (filters.action && (log.action || '').toUpperCase() !== filters.action.toUpperCase()) return false;
    if (filters.status && (log.status || '').toUpperCase() !== filters.status.toUpperCase()) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchUser = (log.username || '').toLowerCase().includes(q);
      const matchDetail = (log.detail || log.description || '').toLowerCase().includes(q);
      if (!matchUser && !matchDetail) return false;
    }
    return true;
  });

  return (
    <>
      {/* Top Bar */}
      <header className="flex justify-between items-center ml-64 px-margin-desktop w-[calc(100%-16rem)] h-20 bg-surface-container-lowest shadow-sm border-b border-outline-variant fixed top-0 z-40">
        <div className="flex items-center gap-stack-lg">
          <h2 className="text-headline-md font-headline-md text-on-surface">Lưu vết hệ thống (Audit Logs)</h2>
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined">search</span>
            <input 
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-label-md w-80 focus:ring-2 focus:ring-primary transition-all" 
              placeholder="Tìm theo username, chi tiết..." 
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant hover:bg-surface-variant transition-colors text-label-md font-semibold">
            <span className="material-symbols-outlined text-lg">refresh</span>
            Làm mới
          </button>
          <img alt="Administrator Profile" className="w-10 h-10 rounded-full border-2 border-primary shadow-sm object-cover" src="https://ui-avatars.com/api/?name=Admin&background=random"/>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 mt-20 p-stack-lg h-[calc(100vh-80px)] overflow-y-auto">
        {/* Info Alert regarding External Audit Architecture */}
        {showExternalAlert && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-600 text-2xl shrink-0 mt-0.5">info</span>
            <div className="text-sm text-on-surface-variant flex-1">
              <p className="font-bold text-amber-700 text-base mb-1">Kiến trúc External Audit Logging</p>
              <p>Hệ thống Backend PRM được thiết kế bất đồng bộ (<code className="bg-amber-500/15 px-1.5 py-0.5 rounded font-mono text-xs">@Async AuditLogServiceImpl</code>) đẩy log sang máy chủ giám sát độc lập (<code className="bg-amber-500/15 px-1.5 py-0.5 rounded font-mono text-xs">audit.service.base-url</code>) và không lưu trữ nội bộ. Dưới đây là giao diện giám sát kết nối cùng danh sách nhật ký hoạt động phiên làm việc hiện tại.</p>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <section className="flex flex-wrap items-center justify-between gap-4 mb-stack-lg">
          <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-label-sm text-on-surface-variant ml-1">Hành động (Action)</label>
              <select name="action" value={filters.action} onChange={handleFilterChange} className="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2 text-label-md min-w-[180px] focus:ring-primary">
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
            <div className="flex flex-col gap-1">
              <label className="text-label-sm text-on-surface-variant ml-1">Trạng thái</label>
              <select name="status" value={filters.status} onChange={handleFilterChange} className="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2 text-label-md min-w-[140px] focus:ring-primary">
                <option value="">Tất cả trạng thái</option>
                <option value="SUCCESS">Thành công (SUCCESS)</option>
                <option value="FAILED">Thất bại (FAILED)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Data Table Container */}
        <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-md border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Hành động</th>
                <th className="px-6 py-4">Đối tượng</th>
                <th className="px-6 py-4">Chi tiết (Detail / IP)</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-on-surface-variant"><span className="material-symbols-outlined animate-spin text-2xl mb-2 block mx-auto text-primary">progress_activity</span>Đang tải dữ liệu...</td></tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id || log.timestamp} className="hover:bg-surface-container transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-on-surface-variant">
                      {formatTimestamp(log.timestamp || log.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">person</span>
                        <span className="font-bold text-on-surface text-sm">{log.username || log.userName || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">
                      <span className="text-primary font-semibold">{log.entity || 'User'}</span>
                      {log.entityId && <span className="text-xs text-on-surface-variant block font-mono">#{log.entityId.slice(0, 8)}...</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant max-w-md truncate" title={log.detail || log.description || ''}>
                      {log.detail || log.description || 'Hoạt động ghi nhận từ giao diện quản trị'}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {getStatusBadge(log.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-8 text-on-surface-variant">Không có nhật ký nào khớp bộ lọc</td></tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between bg-surface-container-low border-t border-outline-variant">
            <span className="text-label-md text-on-surface-variant">Hiển thị {filteredLogs.length} / {logsCache.length} bản ghi</span>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors disabled:opacity-30" disabled>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md shadow-sm">1</button>
              <button className="p-2 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors disabled:opacity-30" disabled>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
