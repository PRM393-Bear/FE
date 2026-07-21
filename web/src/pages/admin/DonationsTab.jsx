import React, { useState, useEffect } from "react";
import { showToast } from "../../utils/ui.js";
import { getAllDonationRequests } from "../../services/admin.service.js";
import { BASE_URL, formatApiError } from "../../utils/api.js";
import { useConfirm } from "../../hooks/useConfirm.jsx";

export default function DonationsTab() {
  const [donationRequests, setDonationRequests] = useState([]);
  const [approvedOrganizations, setApprovedOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { confirm, ConfirmComponent } = useConfirm();
  const [reassignModal, setReassignModal] = useState({ isOpen: false, donationId: null, selectedOrg: "" });

  const loadData = async () => {
    setLoading(true);
    let backendPending = [];
    try {
      backendPending = await getAllDonationRequests();
    } catch (e) {
      console.warn("Failed to load backend pending overdue requests:", e);
    }

    let trackedRequests = [];
    try {
      const stored = localStorage.getItem("ecocycle_tracked_donations");
      if (stored) {
        trackedRequests = JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }

    if (Array.isArray(backendPending)) {
      backendPending.forEach(bp => {
        const exists = trackedRequests.some(tr => tr.id === bp.id);
        if (!exists) {
          trackedRequests.unshift({
            id: bp.id,
            org: bp.organizationName,
            items: bp.itemName || "Vật phẩm quyên góp",
            date: new Date(bp.createdAt).toLocaleDateString("vi-VN"),
            status: "PENDING",
            orgAvatar: "/user-avatar.jpg",
            description: bp.description,
            username: bp.username,
            trackingCode: bp.trackingCode
          });
        }
      });
      localStorage.setItem("ecocycle_tracked_donations", JSON.stringify(trackedRequests));
    }

    setDonationRequests(trackedRequests);

    try {
      const token = localStorage.getItem("ecocycle_token");
      const res = await fetch(`${BASE_URL}/api/organization-details`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const orgs = await res.json();
        setApprovedOrganizations(orgs);
        if (orgs.length > 0) {
          setReassignModal(prev => ({ ...prev, selectedOrg: orgs[0].id.toString() }));
        }
      }
    } catch (err) {
      console.error("Failed to load organizations for assignment:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleComplete = async (id) => {
    const ok = await confirm({
      title: "Hoàn tất quyên góp",
      message: "Bạn có chắc chắn muốn hoàn tất yêu cầu quyên góp này?",
      confirmText: "Hoàn tất"
    });
    if (!ok) return;

    try {
      const token = localStorage.getItem("ecocycle_token");
      const res = await fetch(`${BASE_URL}/api/donation-requests/${id}/completed`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(await res.text() || `HTTP ${res.status}`);
      }

      const list = JSON.parse(localStorage.getItem("ecocycle_tracked_donations") || "[]");
      const item = list.find(d => d.id === id);
      if (item) item.status = "COMPLETED";
      localStorage.setItem("ecocycle_tracked_donations", JSON.stringify(list));

      showToast("Đã hoàn tất yêu cầu quyên góp thành công!", "success");
      loadData();
    } catch (e) {
      showToast(formatApiError(e, "hoàn tất"), "error");
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    const { donationId, selectedOrg } = reassignModal;
    const org = approvedOrganizations.find(o => o.id.toString() === selectedOrg);
    if (!org) return;

    try {
      const token = localStorage.getItem("ecocycle_token");
      const res = await fetch(`${BASE_URL}/api/donation-requests/${donationId}/assign-organization/${org.id}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error(await res.text() || `HTTP ${res.status}`);
      }

      const list = JSON.parse(localStorage.getItem("ecocycle_tracked_donations") || "[]");
      const item = list.find(d => d.id === donationId);
      if (item) {
        item.org = org.orgName;
        item.date = new Date().toLocaleDateString("vi-VN"); 
      }
      localStorage.setItem("ecocycle_tracked_donations", JSON.stringify(list));

      showToast(`Đã điều phối thành công sang tổ chức ${org.orgName}!`, "success");
      setReassignModal({ isOpen: false, donationId: null, selectedOrg: approvedOrganizations[0]?.id.toString() || "" });
      loadData();
    } catch (err) {
      showToast(formatApiError(err, "điều phối"), "error");
    }
  };

  const filteredRequests = donationRequests.filter(item => {
    if (currentFilter !== "all" && item.status !== currentFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.org?.toLowerCase().includes(q) || 
        item.username?.toLowerCase().includes(q) ||
        item.items?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <main className="ml-64 flex-1 flex flex-col min-h-screen bg-surface w-full max-w-[calc(100%-16rem)]" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      {ConfirmComponent}
      {/* TopNavBar */}
      <header className="flex justify-between items-center px-margin-desktop bg-surface-container-lowest shadow-sm border-b border-outline-variant h-20 sticky top-0 z-40">
        <div className="flex items-center flex-1 max-w-xl">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-body-md transition-soft" 
              placeholder="Tìm kiếm donation, người tặng..." 
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center space-x-6 ml-gutter">
          <div className="flex items-center space-x-3 border-l border-outline-variant pl-6">
            <div className="text-right">
              <p className="text-label-md font-bold text-on-surface leading-none">Admin Nguyễn</p>
              <p className="text-label-sm text-on-surface-variant opacity-70">Quản trị viên</p>
            </div>
            <img alt="Administrator Profile" className="w-10 h-10 rounded-full border-2 border-primary/20" src="/user-avatar.jpg"/>
          </div>
        </div>
      </header>

      {/* Page Header & Tabs */}
      <section className="px-margin-desktop py-stack-lg bg-surface">
        <div className="mb-stack-lg">
          <h2 className="text-headline-lg font-headline-md text-on-surface text-2xl font-bold">Quản lý Quyên góp (Donation)</h2>
          <p className="text-body-md text-on-surface-variant">Theo dõi, điều phối lại và xác nhận hoàn tất các khoản quyên góp từ cộng đồng.</p>
        </div>
        <div className="flex items-center space-x-gutter border-b border-outline-variant">
          {[
            { id: "all", label: "Tất cả" },
            { id: "PENDING", label: "Chờ xử lý" },
            { id: "SHIPPED", label: "Đã gửi hàng" },
            { id: "RECEIVED", label: "Chờ hoàn thành (RECEIVED)" },
            { id: "COMPLETED", label: "Hoàn tất" }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setCurrentFilter(tab.id)}
              className={`pb-4 px-2 text-label-md transition-soft border-b-2 ${currentFilter === tab.id ? 'font-bold text-primary border-primary' : 'font-medium text-on-surface-variant hover:text-primary border-transparent'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Donation Table Section */}
      <section className="px-margin-desktop pb-stack-xl flex-1">
        <div className="glass-card rounded-xl overflow-hidden shadow-sm border border-outline-variant/30 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-outline-variant">
                  <th className="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Người tặng</th>
                  <th className="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Tổ chức nhận</th>
                  <th className="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Mô tả món đồ</th>
                  <th className="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Trạng thái</th>
                  <th className="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Mã vận đơn / Chi tiết</th>
                  <th className="px-6 py-4 font-headline-md text-label-md text-on-surface-variant text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-5 text-center text-on-surface-variant">Đang tải dữ liệu...</td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant">Không có yêu cầu quyên góp nào phù hợp.</td>
                  </tr>
                ) : (
                  filteredRequests.map(item => {
                    let statusLabel = item.status || "PENDING";
                    let statusClass = "bg-warning-container text-on-warning-container";
                    let badgeStyle = {};
                    if (item.status === "ACCEPTED") { statusClass = "bg-success-container text-on-success-container"; statusLabel = "Đã chấp nhận"; }
                    else if (item.status === "REJECTED") { badgeStyle = { background: 'rgba(211, 47, 47, 0.1)', color: '#d32f2f' }; statusLabel = "Đã từ chối"; }
                    else if (item.status === "SHIPPING") { statusClass = "bg-warning-container text-on-warning-container"; statusLabel = "Đang vận chuyển"; }
                    else if (item.status === "SHIPPED") { statusClass = "bg-warning-container text-on-warning-container"; statusLabel = "Đã gửi hàng"; }
                    else if (item.status === "RECEIVED" || item.status === "COMPLETED") { statusClass = "bg-success-container text-on-success-container"; statusLabel = item.status === "RECEIVED" ? "Đã nhận hàng" : "Hoàn thành"; }
                    else if (item.status === "CANCELLED") { badgeStyle = { background: 'rgba(211, 47, 47, 0.1)', color: '#d32f2f' }; statusLabel = "Đã hủy"; }

                    return (
                      <tr key={item.id} className="hover:bg-surface-container transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-label-md font-bold text-on-surface">{item.username || "Thành viên"}</p>
                            <p className="text-label-sm text-on-surface-variant opacity-60">ID: #{item.id?.toString().substring(0, 8)}...</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-label-md font-medium text-on-surface">{item.org || "Chưa xác định"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-body-md text-on-surface font-semibold">{item.items}</p>
                          {item.description && <p className="text-body-sm text-on-surface-variant line-clamp-1 opacity-70">{item.description}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${statusClass}`} style={badgeStyle}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {item.trackingCode && <p className="text-body-sm font-mono font-bold text-secondary">Vận đơn: {item.trackingCode}</p>}
                          <p className="text-body-xs text-on-surface-variant opacity-60">{item.date}</p>
                          {item.cancelReason && <p className="text-error text-body-xs">Lý do hủy: {item.cancelReason}</p>}
                          {item.rejectedReason && <p className="text-error text-body-xs">Lý do từ chối: {item.rejectedReason}</p>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.status === "PENDING" && (
                            <button 
                              onClick={() => {
                                if (approvedOrganizations.length === 0) {
                                  showToast("Không tìm thấy danh sách tổ chức để điều phối lại!", "error");
                                  return;
                                }
                                setReassignModal({ isOpen: true, donationId: item.id, selectedOrg: approvedOrganizations[0]?.id.toString() || "" });
                              }}
                              className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-label-sm font-bold shadow-sm hover:opacity-90 transition-soft"
                            >
                              Chỉ định Org khác
                            </button>
                          )}
                          {item.status === "RECEIVED" && (
                            <button 
                              onClick={() => handleComplete(item.id)}
                              className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-label-sm font-bold shadow-sm hover:opacity-90 transition-soft" 
                              style={{ backgroundColor: '#006b2c' }}
                            >
                              Hoàn tất
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Reassign Organization Modal */}
      {reassignModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl text-left" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            <div className="flex justify-between items-center border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-headline-sm font-bold text-on-surface text-lg">Điều phối Tổ chức khác (Fallback)</h3>
              <button onClick={() => setReassignModal(prev => ({ ...prev, isOpen: false }))} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <p className="text-body-md text-on-surface-variant mb-4">
              Chọn tổ chức từ thiện thay thế để xử lý yêu cầu quyên góp này:
            </p>

            <form onSubmit={handleReassignSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="block text-label-md font-bold mb-1.5 text-sm">Chọn tổ chức mới *</label>
                <select 
                  value={reassignModal.selectedOrg}
                  onChange={e => setReassignModal(prev => ({ ...prev, selectedOrg: e.target.value }))}
                  className="w-full border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary focus:outline-none text-body-sm" 
                  required
                >
                  {approvedOrganizations.map(org => (
                    <option key={org.id} value={org.id}>{org.orgName} - {org.address || ''}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-3 border-t border-outline-variant mt-4">
                <button type="button" onClick={() => setReassignModal(prev => ({ ...prev, isOpen: false }))} className="px-4 py-2 rounded-xl text-label-md font-bold border border-outline hover:bg-surface-variant transition-all text-sm">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-label-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-all text-sm" style={{ backgroundColor: '#006b2c', color: 'white' }}>Xác nhận chỉ định</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
