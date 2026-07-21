import React, { useState, useEffect } from "react";
import { getAllUsers, banUser, createStaff, getListBanned } from "../../services/admin.service.js";
import { recordLocalAuditLog } from "../../services/audit.service.js";
import { showToast } from "../../utils/ui.js";

function getRoleBadge(roleName) {
  const role = roleName?.toUpperCase() || 'USER';
  if (role === 'ADMIN') return <span className="px-3 py-1 bg-primary text-on-primary text-label-sm rounded-full">Admin</span>;
  if (role === 'STAFF' || role === 'ROLE_STAFF') return <span className="px-3 py-1 bg-tertiary text-on-tertiary text-label-sm rounded-full">Staff</span>;
  if (role === 'ORGANIZATION' || role === 'ROLE_ORGANIZATION') return <span className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-label-sm rounded-full">Tổ chức</span>;
  return <span className="px-3 py-1 bg-surface-variant text-on-surface-variant text-label-sm rounded-full">Cá nhân</span>;
}

function isUserBlocked(user) {
  if (!user) return false;
  return Boolean(user.isBlocked || user.blocked || user.isVerified === false || user.verified === false);
}

function getStatusInfo(user) {
  if (isUserBlocked(user)) {
    return (
      <div className="flex items-center gap-2 text-error font-label-md">
        <span className="w-2 h-2 rounded-full bg-error"></span>Bị khóa
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-primary font-label-md">
      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>Hoạt động
    </div>
  );
}

export default function UsersTab() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', status: '', search: '' });
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [banModal, setBanModal] = useState({ isOpen: false, user: null, reason: '' });
  
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    username: '', fullName: '', email: '', phone: '', password: '', roleName: 'STAFF'
  });
  const [staffError, setStaffError] = useState('');
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const users = await getAllUsers();
      
      try {
        const bannedUsers = await getListBanned(true);
        if (Array.isArray(bannedUsers)) {
          const bannedIds = new Set(bannedUsers.map(u => u.userId));
          users.forEach(user => {
            if (bannedIds.has(user.userId)) {
              user.isBlocked = true;
              user.blocked = true;
            }
          });
        }
      } catch (e) {
        console.error('Failed to fetch explicit banned list:', e);
      }
      
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
      showToast('Lỗi khi tải dữ liệu người dùng', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredUsers = allUsers.filter(user => {
    if (filters.role && (user.role?.roleName?.toUpperCase() !== filters.role.toUpperCase())) return false;
    if (filters.status === 'blocked' && !isUserBlocked(user)) return false;
    if (filters.status === 'active' && isUserBlocked(user)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchName = (user.fullName || '').toLowerCase().includes(q);
      const matchUserName = (user.userName || '').toLowerCase().includes(q);
      const matchEmail = (user.email || '').toLowerCase().includes(q);
      if (!matchName && !matchUserName && !matchEmail) return false;
    }
    return true;
  });

  const openUserDrawer = (user) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const openBanModal = (e, user) => {
    e.stopPropagation();
    const isBlocked = isUserBlocked(user);
    setBanModal({
      isOpen: true,
      user,
      reason: isBlocked ? 'Mở khóa tài khoản theo quyết định của Quản trị viên' : 'Vi phạm chính sách và điều khoản sử dụng cộng đồng EcoCycle'
    });
  };

  const confirmBanUser = async () => {
    const { user, reason } = banModal;
    if (!user) return;
    const isCurrentlyBlocked = isUserBlocked(user);
    const targetIsBanned = !isCurrentlyBlocked;

    setBanModal({ ...banModal, isOpen: false });
    showToast(targetIsBanned ? 'Đang khóa tài khoản...' : 'Đang mở khóa tài khoản...', 'info');

    // Optimistic update
    setAllUsers(prev => prev.map(u => {
      if (u.userId === user.userId) {
        return { ...u, isBlocked: targetIsBanned, blocked: targetIsBanned };
      }
      return u;
    }));

    try {
      await banUser(user.userId, targetIsBanned, reason);
      recordLocalAuditLog({
        action: targetIsBanned ? 'BAN_USER' : 'UNBAN_USER',
        username: 'Admin',
        entity: 'User',
        entityId: user.userId,
        detail: `${targetIsBanned ? 'Khóa' : 'Mở khóa'} tài khoản "${user.fullName || user.userName}" từ Admin Console | lý do: ${reason} | ip=127.0.0.1`,
        status: 'SUCCESS'
      });
      showToast(targetIsBanned ? 'Khóa tài khoản thành công!' : 'Mở khóa tài khoản thành công!', 'success');
    } catch (err) {
      showToast('Lỗi: ' + (err.message || 'Không thể thực hiện thao tác'), 'error');
      // Revert optimistic update
      setAllUsers(prev => prev.map(u => {
        if (u.userId === user.userId) {
          return { ...u, isBlocked: isCurrentlyBlocked, blocked: isCurrentlyBlocked };
        }
        return u;
      }));
    }
  };

  const handleStaffFormChange = (e) => {
    const { name, value } = e.target;
    setStaffForm(prev => ({ ...prev, [name]: value }));
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setStaffError('');
    if (!staffForm.username || !staffForm.fullName || !staffForm.email || !staffForm.password) {
      setStaffError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }
    if (staffForm.password.length < 6) {
      setStaffError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsSubmittingStaff(true);
    try {
      await createStaff(staffForm);
      showToast('Tạo tài khoản Staff thành công!', 'success');
      setStaffModalOpen(false);
      setStaffForm({ username: '', fullName: '', email: '', phone: '', password: '', roleName: 'STAFF' });
      loadUsers();
    } catch (err) {
      const msg = err.message || 'Không thể tạo tài khoản.';
      setStaffError(msg);
      showToast('Lỗi: ' + msg, 'error');
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <header className="flex justify-between items-center ml-64 px-margin-desktop w-[calc(100%-16rem)] h-20 bg-surface-container-lowest shadow-sm border-b border-outline-variant fixed top-0 z-40">
        <div className="flex items-center gap-stack-lg">
          <h2 className="text-headline-md font-headline-md text-on-surface">Quản lý User</h2>
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined">search</span>
            <input 
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-label-md w-80 focus:ring-2 focus:ring-primary transition-all" 
              placeholder="Tìm kiếm theo tên, email..." 
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-transform active:scale-95">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-lg transition-transform active:scale-95">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
          <img alt="Administrator Profile" className="w-10 h-10 rounded-full border-2 border-primary shadow-sm object-cover" src="https://ui-avatars.com/api/?name=Admin&background=random"/>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 mt-20 p-stack-lg h-[calc(100vh-80px)] overflow-y-auto">
        {/* Filter Controls */}
        <section className="flex flex-wrap items-center justify-between gap-4 mb-stack-lg">
          <div className="flex gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-label-sm text-on-surface-variant ml-1">Vai trò</label>
              <select name="role" value={filters.role} onChange={handleFilterChange} className="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2 text-label-md min-w-[140px] focus:ring-primary">
                <option value="">Tất cả</option>
                <option value="ADMIN">Admin</option>
                <option value="STAFF">Staff</option>
                <option value="ORGANIZATION">Tổ chức</option>
                <option value="MEMBER">Cá nhân</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-label-sm text-on-surface-variant ml-1">Trạng thái</label>
              <select name="status" value={filters.status} onChange={handleFilterChange} className="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2 text-label-md min-w-[140px] focus:ring-primary">
                <option value="">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="blocked">Bị khóa</option>
              </select>
            </div>
          </div>
          <button onClick={() => setStaffModalOpen(true)} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label-md shadow-md hover:opacity-90 transition-all mt-6 active:scale-95">
            <span className="material-symbols-outlined">add</span>
            Thêm User mới
          </button>
        </section>

        {/* Data Table Container */}
        <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-md border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4">
                  <input className="rounded text-primary focus:ring-primary border-outline" type="checkbox"/>
                </th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8 text-on-surface-variant">Đang tải dữ liệu...</td></tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => {
                  const avatarUrl = user.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.userName || 'U')}&background=random`;
                  const isBlocked = isUserBlocked(user);
                  return (
                    <tr key={user.userId} onClick={() => openUserDrawer(user)} className="hover:bg-surface-container transition-colors cursor-pointer group">
                      <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                        <input className="rounded text-primary focus:ring-primary border-outline" type="checkbox"/>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img alt={user.fullName} className="w-10 h-10 rounded-full object-cover shadow-sm" src={avatarUrl}/>
                          <div>
                            <p className="font-bold text-on-surface">{user.fullName || user.userName || 'Không tên'}</p>
                            <p className="text-label-sm text-on-surface-variant">{user.email || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(user.role?.roleName)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusInfo(user)}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                        <button onClick={(e) => openBanModal(e, user)} className={`p-2 text-outline ${isBlocked ? 'hover:text-primary' : 'hover:text-error'} transition-colors`} title={isBlocked ? 'Mở khóa' : 'Khóa'}>
                          <span className="material-symbols-outlined">{isBlocked ? 'lock_open' : 'block'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="5" className="text-center py-8 text-on-surface-variant">Không tìm thấy user phù hợp</td></tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between bg-surface-container-low border-t border-outline-variant">
            <span className="text-label-md text-on-surface-variant">Hiển thị {filteredUsers.length} / {allUsers.length} users</span>
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

      {/* User Detail Side Drawer */}
      <div className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 block' : 'opacity-0 hidden'}`} onClick={() => setIsDrawerOpen(false)}></div>
      <div className={`fixed right-0 top-0 h-full w-[450px] bg-surface-container-lowest z-[70] transition-transform duration-300 drawer-shadow flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex-1 overflow-y-auto w-full h-full">
          {selectedUser && (() => {
            const user = selectedUser;
            const avatarUrl = user.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.userName || 'U')}&background=random`;
            const isBlocked = isUserBlocked(user);
            return (
              <>
                <div className="p-6 border-b border-outline-variant flex items-center justify-between">
                  <h3 className="text-headline-md font-headline-md text-on-surface">Chi tiết User</h3>
                  <button className="p-2 hover:bg-surface-variant rounded-full transition-colors" onClick={() => setIsDrawerOpen(false)}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Profile Header */}
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="relative mb-4">
                      <img alt={user.fullName} className="w-24 h-24 rounded-full border-4 border-surface-container-low shadow-lg object-cover" src={avatarUrl}/>
                      <span className={`absolute bottom-1 right-1 w-6 h-6 ${isBlocked ? 'bg-error' : 'bg-primary'} border-2 border-surface-container-lowest rounded-full`}></span>
                    </div>
                    <h4 className="text-headline-md font-headline-md text-on-surface">{user.fullName || user.userName || 'Không tên'}</h4>
                    <p className="text-on-surface-variant">{user.email || 'N/A'}</p>
                    <div className="flex gap-2 mt-4">
                      {getRoleBadge(user.role?.roleName)}
                      <span className={`px-4 py-1 ${isBlocked ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'} text-label-md rounded-full`}>{isBlocked ? 'Bị khóa' : 'Hoạt động'}</span>
                    </div>
                  </div>
                  {/* Detailed Info */}
                  <div className="space-y-6">
                    <div>
                      <h5 className="text-label-sm text-on-surface-variant font-bold uppercase mb-3 border-b border-outline-variant pb-2">Thông tin tài khoản</h5>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Tên đăng nhập</span>
                          <span className="font-label-md">{user.userName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Số điện thoại</span>
                          <span className="font-label-md">{user.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Xác thực</span>
                          <span className="font-label-md">{user.isVerified || user.verified ? 'Đã xác thực' : 'Chưa xác thực'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Ban/Unban Confirm Modal */}
      {banModal.isOpen && banModal.user && (() => {
        const isBlocked = isUserBlocked(banModal.user);
        return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center">
            <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant p-8 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <span className={`material-symbols-outlined text-3xl ${isBlocked ? 'text-primary' : 'text-error'}`}>{isBlocked ? 'lock_open' : 'gavel'}</span>
                <h3 className="text-headline-sm font-bold text-on-surface">{isBlocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}</h3>
              </div>
              <p className="text-body-md text-on-surface-variant mb-4">
                {isBlocked ? `Bạn có chắc muốn mở khóa tài khoản "${banModal.user.fullName || banModal.user.userName}"? Người dùng sẽ có thể đăng nhập và sử dụng hệ thống bình thường.` : `Bạn có chắc muốn khóa tài khoản "${banModal.user.fullName || banModal.user.userName}"? Người dùng sẽ không thể đăng nhập vào hệ thống.`}
              </p>
              <div className="mb-6">
                <label className="block text-label-md font-semibold text-on-surface mb-1.5">Lý do * (Sẽ gửi đến email của User)</label>
                <input 
                  type="text" 
                  value={banModal.reason}
                  onChange={e => setBanModal({...banModal, reason: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  placeholder="Nhập lý do..." 
                />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setBanModal({...banModal, isOpen: false})} className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-variant transition-colors">Hủy</button>
                <button onClick={confirmBanUser} className={`px-5 py-2.5 rounded-xl ${isBlocked ? 'bg-primary text-on-primary hover:bg-primary/90' : 'bg-error text-on-error hover:bg-error/90'} font-semibold transition-colors`}>
                  {isBlocked ? 'Mở khóa' : 'Khóa tài khoản'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Create Staff Modal */}
      {staffModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant p-8 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-primary">person_add</span>
                <h3 className="text-headline-sm font-bold text-on-surface">Tạo tài khoản Staff</h3>
              </div>
              <button onClick={() => setStaffModalOpen(false)} className="p-2 hover:bg-surface-variant rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleStaffSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface">Tên đăng nhập *</label>
                  <input type="text" name="username" value={staffForm.username} onChange={handleStaffFormChange} className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface">Họ và tên *</label>
                  <input type="text" name="fullName" value={staffForm.fullName} onChange={handleStaffFormChange} className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface">Email *</label>
                  <input type="email" name="email" value={staffForm.email} onChange={handleStaffFormChange} className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface">Số điện thoại</label>
                  <input type="tel" name="phone" value={staffForm.phone} onChange={handleStaffFormChange} className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface">Mật khẩu *</label>
                  <input type="password" name="password" value={staffForm.password} onChange={handleStaffFormChange} className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" required minLength="6" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface">Vai trò</label>
                  <select name="roleName" value={staffForm.roleName} onChange={handleStaffFormChange} className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="STAFF">Staff</option>
                  </select>
                </div>
              </div>
              {staffError && <p className="text-sm text-error">{staffError}</p>}
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button type="button" onClick={() => setStaffModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-variant transition-colors">Hủy</button>
                <button type="submit" disabled={isSubmittingStaff} className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                  {isSubmittingStaff ? <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-lg">person_add</span>}
                  {isSubmittingStaff ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
