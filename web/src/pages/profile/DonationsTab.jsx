import React, { useState, useEffect } from "react";
import { 
  acceptDonationRequest, 
  rejectDonationRequest, 
  shippingDonationRequest,
  shippedDonationRequest,
  receivedDonationRequest, 
  completedDonationRequest,
  cancelDonationRequest,
  createDonationEventApi,
  updateDonationEventApi,
  cancelDonationEventApi,
  completeDonationEventApi,
  ongoingDonationEventApi,
  getDonationEventsByOrgIdApi,
  getAllDonationEventsApi,
  getOrgDonationRequestsApi
} from "../../services/profile.service.js";
import { apiFetch, formatApiError } from "../../utils/api.js";
import { showToast } from "../../utils/ui.js";

function getDonationStatusBadge(status) {
  const st = String(status || "PENDING").toUpperCase();
  if (st === "PENDING") return <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>Chờ tiếp nhận</span>;
  if (st === "ACCEPTED") return <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit"><span className="material-symbols-outlined text-sm">thumb_up</span>Đã tiếp nhận</span>;
  if (st === "SHIPPING") return <span className="px-3 py-1 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit"><span className="material-symbols-outlined text-sm">box</span>Chuẩn bị giao hàng</span>;
  if (st === "SHIPPED") return <span className="px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit"><span className="material-symbols-outlined text-sm">local_shipping</span>Đã gửi hàng</span>;
  if (st === "RECEIVED") return <span className="px-3 py-1 bg-teal-100 text-teal-800 border border-teal-200 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit"><span className="material-symbols-outlined text-sm">inventory_2</span>Tổ chức đã nhận</span>;
  if (st === "COMPLETED") return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit"><span className="material-symbols-outlined text-sm">verified</span>Hoàn tất quyên góp</span>;
  if (st === "REJECTED") return <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit"><span className="material-symbols-outlined text-sm">cancel</span>Đã từ chối</span>;
  if (st === "CANCELLED") return <span className="px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit"><span className="material-symbols-outlined text-sm">block</span>Đã hủy</span>;
  return <span className="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-xs font-semibold">{st}</span>;
}

function getEventStatusBadge(status) {
  const st = String(status || "UPCOMING").toUpperCase();
  if (st === "UPCOMING") return <span className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-semibold">Sắp diễn ra</span>;
  if (st === "ONGOING") return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold animate-pulse">Đang diễn ra</span>;
  if (st === "COMPLETED") return <span className="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-xs font-semibold">Đã kết thúc</span>;
  if (st === "CANCELLED") return <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-semibold">Đã hủy</span>;
  return <span className="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-xs font-semibold">{st}</span>;
}

export default function DonationsTab({ profile, orgDetail, events: initialEvents = [], requests: initialRequests = [], onRefresh, onOpenModal }) {
  const isOrg = profile?.role === "org";
  const [activeSubTab, setActiveSubTab] = useState(isOrg ? "campaigns" : "requests");
  const [activeRequestFilter, setActiveRequestFilter] = useState("ALL");
  const [events, setEvents] = useState(initialEvents);
  const [requests, setRequests] = useState(initialRequests);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [campaignModal, setCampaignModal] = useState({ open: false, isEdit: false, data: {} });
  const [shippingModal, setShippingModal] = useState({ open: false, id: null });
  const [receiveModal, setReceiveModal] = useState({ open: false, id: null, tracking: null, proof: null });

  const syncDonationData = async () => {
    setLoading(true);
    try {
      const isOrgRole = profile?.role === "org";
      const [latestEvents, latestRequests] = await Promise.all([
        isOrgRole && orgDetail?.id
          ? getDonationEventsByOrgIdApi(orgDetail.id).catch(() => events)
          : getAllDonationEventsApi().catch(() => events),
        isOrgRole && orgDetail?.id
          ? getOrgDonationRequestsApi(orgDetail.id).catch(() => requests)
          : apiFetch("/api/donation-requests/my-member").catch(() => apiFetch("/api/donation-requests/lists").catch(() => requests))
      ]);
      if (Array.isArray(latestEvents)) setEvents(latestEvents);
      if (Array.isArray(latestRequests)) setRequests(latestRequests);
    } catch (err) {
      console.warn("Lỗi đồng bộ dữ liệu chiến dịch:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusAction = async (id, action) => {
    try {
      if (action === "ongoing") await ongoingDonationEventApi(id);
      else if (action === "complete") await completeDonationEventApi(id);
      else if (action === "cancel") await cancelDonationEventApi(id);
      showToast("Cập nhật trạng thái chiến dịch thành công!", "success");
      await syncDonationData();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(formatApiError(err, "cập nhật trạng thái chiến dịch"), "error");
    }
  };

  const handleRequestAction = async (id, action, additionalData = {}) => {
    try {
      if (action === "accept") {
        await acceptDonationRequest(id);
        showToast("Đã tiếp nhận yêu cầu quyên góp!", "success");
      } else if (action === "reject") {
        await rejectDonationRequest(id, "Tổ chức tạm ngừng tiếp nhận vật phẩm này vào lúc này.");
        showToast("Đã từ chối yêu cầu quyên góp.", "info");
      } else if (action === "cancel") {
        await cancelDonationRequest(id, "Người dùng hủy yêu cầu");
        showToast("Đã hủy yêu cầu quyên góp.", "info");
      } else if (action === "shipping") {
        await shippingDonationRequest(id);
        showToast("Đã chuyển sang trạng thái đang chuẩn bị giao hàng!", "success");
      } else if (action === "complete") {
        await completedDonationRequest(id);
        showToast("Đã hoàn tất quy trình quyên góp!", "success");
      }
      await syncDonationData();
    } catch (err) {
      showToast(formatApiError(err, "cập nhật trạng thái"), "error");
    }
  };

  let filteredRequests = requests;
  if (isOrg && activeRequestFilter !== "ALL") {
    if (activeRequestFilter === "PENDING") {
      filteredRequests = requests.filter(r => String(r.status || "PENDING").toUpperCase() === "PENDING");
    } else if (activeRequestFilter === "ACCEPTED") {
      filteredRequests = requests.filter(r => String(r.status || "").toUpperCase() === "ACCEPTED");
    } else if (activeRequestFilter === "SHIPPED") {
      filteredRequests = requests.filter(r => ["SHIPPING", "SHIPPED"].includes(String(r.status || "").toUpperCase()));
    } else if (activeRequestFilter === "RECEIVED") {
      filteredRequests = requests.filter(r => ["RECEIVED", "COMPLETED"].includes(String(r.status || "").toUpperCase()));
    }
  }

  return (
    <>
      <div className="donations-tab flex flex-col gap-6 relative">
        {loading && (
          <div className="absolute inset-0 bg-surface/50 z-10 flex items-center justify-center">
            <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
          </div>
        )}
        
        {/* Header Banner */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-headline-sm font-bold text-on-surface mb-1">{isOrg ? "Quản lý Quyên góp & Chiến dịch" : "Hành trình Quyên góp của bạn"}</h3>
            <p className="text-body-md text-on-surface-variant">{isOrg ? "Đăng tải chiến dịch mới và quản lý các yêu cầu quyên góp từ người dùng." : "Mỗi vật phẩm trao đi là một vòng đời mới được thắp sáng cho Trái Đất."}</p>
          </div>
          {!isOrg && (
            <button onClick={onOpenModal} className="px-4 py-2.5 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">
              <span className="material-symbols-outlined text-sm">volunteer_activism</span> Tạo quyên góp mới
            </button>
          )}
        </div>

        {/* Sub-tab Navigation for Org */}
        {isOrg && (
          <div className="flex border-b border-outline-variant/30 gap-6 px-2">
            <button onClick={() => setActiveSubTab("campaigns")} className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${activeSubTab === 'campaigns' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
              📢 Chiến dịch của tôi ({events.length})
            </button>
            <button onClick={() => setActiveSubTab("requests")} className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${activeSubTab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
              📦 Yêu cầu tiếp nhận ({requests.length})
            </button>
          </div>
        )}

        {/* Sub-tab 1: Campaigns */}
        {isOrg && activeSubTab === "campaigns" && (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h4 className="text-title-lg font-bold text-on-surface">Danh sách Chiến dịch Quyên góp</h4>
              <button onClick={() => setCampaignModal({ open: true, isEdit: false, data: {} })} className="w-full sm:w-auto justify-center px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-sm">add</span> Tạo chiến dịch mới
              </button>
            </div>

            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-outline-variant/50 rounded-2xl bg-gradient-to-br from-surface-variant/20 to-surface-container-lowest w-full">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5 shadow-sm text-primary">
                  <span className="material-symbols-outlined text-4xl">campaign</span>
                </div>
                <h5 className="font-bold text-on-surface text-xl mb-2">Chưa có chiến dịch nào được khởi tạo</h5>
                <p className="text-body-md text-on-surface-variant max-w-lg mb-6 leading-relaxed">Hãy bấm nút <strong>"Tạo chiến dịch mới"</strong> ở góc trên bên phải để bắt đầu kêu gọi cộng đồng chung tay quyên góp vật phẩm.</p>
                <button onClick={() => setCampaignModal({ open: true, isEdit: false, data: {} })} className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md">
                  <span className="material-symbols-outlined text-sm">add</span> Bắt đầu tạo ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map(ev => {
                  const st = String(ev.status || "UPCOMING").toUpperCase();
                  const target = Number(ev.targetQuantity) || 100;
                  let current = 0;
                  if (ev.currentQuantity !== undefined && ev.currentQuantity !== null && !isNaN(ev.currentQuantity)) {
                    current = Number(ev.currentQuantity);
                  } else {
                    const receivedCount = requests
                      .filter(r => r.donationEventId === (ev.id || ev.donationEventId) && ['ACCEPTED', 'RECEIVED', 'COMPLETED', 'SHIPPING', 'SHIPPED'].includes(String(r.status || '').toUpperCase()))
                      .reduce((sum, r) => sum + (r.items?.length || 1), 0);
                    current = Math.max(0, receivedCount);
                  }
                  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                  const banner = ev.bannerUrl || ev.imageUrl || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80';

                  return (
                    <div key={ev.id || ev.donationEventId} className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                      <div>
                        <div className="h-40 w-full relative bg-surface-variant">
                          <img src={banner} className="w-full h-full object-cover" alt="Banner" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80'; }}/>
                          <div className="absolute top-3 right-3">{getEventStatusBadge(ev.status)}</div>
                        </div>
                        <div className="p-5 flex flex-col gap-3">
                          <h5 className="font-bold text-on-surface text-lg line-clamp-1">{ev.title || "Chiến dịch quyên góp"}</h5>
                          <p className="text-body-sm text-on-surface-variant line-clamp-2">{ev.description || "Không có mô tả chi tiết."}</p>
                          
                          <div className="flex flex-col gap-1.5 mt-3">
                            <div className="flex justify-between items-center text-xs font-semibold">
                              <span className="text-on-surface-variant">Đã tiếp nhận <strong className="text-primary text-sm">{current}</strong> <span className="mx-1 font-normal opacity-50">/</span> Mục tiêu <strong className="text-on-surface">{target}</strong></span>
                              <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">{percent}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-surface-variant/60 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-700 ease-out" style={{ width: `${percent}%` }}></div>
                            </div>
                          </div>

                          <div className="text-xs text-outline flex flex-col gap-1 mt-1">
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">calendar_today</span>
                              <span>{ev.startDate ? ev.startDate.split('T')[0] : 'N/A'} - {ev.endDate ? ev.endDate.split('T')[0] : 'N/A'}</span>
                            </div>
                            {ev.location && (
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                <span className="line-clamp-1">{ev.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-3.5 border-t border-outline-variant/30 bg-surface-container-lowest flex flex-wrap justify-end gap-2">
                        <button onClick={() => setCampaignModal({ open: true, isEdit: true, data: ev })} className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                          Sửa
                        </button>
                        {st === "UPCOMING" && (
                          <button onClick={() => handleStatusAction(ev.id || ev.donationEventId, 'ongoing')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors">Bắt đầu ngay</button>
                        )}
                        {st === "ONGOING" && (
                          <button onClick={() => handleStatusAction(ev.id || ev.donationEventId, 'complete')} className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors">Hoàn thành</button>
                        )}
                        {(st === "UPCOMING" || st === "ONGOING") && (
                          <button onClick={() => handleStatusAction(ev.id || ev.donationEventId, 'cancel')} className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors">Đóng chiến dịch</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Sub-tab 2: Requests */}
        {(!isOrg || activeSubTab === "requests") && (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h4 className="text-title-lg font-bold text-on-surface">Danh sách Yêu cầu Quyên góp ({filteredRequests.length})</h4>
              {isOrg && (
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button onClick={() => setActiveRequestFilter('ALL')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeRequestFilter === 'ALL' ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'}`}>Tất cả</button>
                  <button onClick={() => setActiveRequestFilter('PENDING')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeRequestFilter === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-surface-variant text-on-surface-variant'}`}>Chờ tiếp nhận</button>
                  <button onClick={() => setActiveRequestFilter('ACCEPTED')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeRequestFilter === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' : 'bg-surface-variant text-on-surface-variant'}`}>Đã tiếp nhận</button>
                  <button onClick={() => setActiveRequestFilter('SHIPPED')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeRequestFilter === 'SHIPPED' ? 'bg-indigo-100 text-indigo-800' : 'bg-surface-variant text-on-surface-variant'}`}>Đang giao hàng</button>
                  <button onClick={() => setActiveRequestFilter('RECEIVED')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeRequestFilter === 'RECEIVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-variant text-on-surface-variant'}`}>Hoàn tất & Nhận</button>
                </div>
              )}
            </div>

            {filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-outline-variant/50 rounded-2xl bg-gradient-to-br from-surface-variant/20 to-surface-container-lowest w-full">
                <div className={`w-20 h-20 ${isOrg ? 'bg-amber-50 text-amber-600' : 'bg-primary/10 text-primary'} rounded-full flex items-center justify-center mb-5 shadow-sm`}>
                  <span className="material-symbols-outlined text-4xl">{isOrg ? 'clean_hands' : 'volunteer_activism'}</span>
                </div>
                <h5 className="font-bold text-on-surface text-xl mb-2">{isOrg ? 'Chưa có yêu cầu quyên góp nào' : 'Bạn chưa thực hiện quyên góp nào'}</h5>
                <p className="text-body-md text-on-surface-variant max-w-lg mb-6 leading-relaxed">{isOrg ? 'Hiện tại chưa có vật phẩm nào được người dùng quyên góp tới tổ chức của bạn.' : 'Hãy bắt đầu hành trình xanh của bạn.'}</p>
                {!isOrg && (
                  <button onClick={onOpenModal} className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md">
                    <span className="material-symbols-outlined text-sm">volunteer_activism</span> Bắt đầu quyên góp ngay
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredRequests.map(req => {
                  const st = String(req.status || "PENDING").toUpperCase();
                  const reqId = req.id || req.donationRequestId;
                  return (
                    <div key={reqId} className="p-4 sm:p-5 rounded-xl border border-outline-variant/30 hover:border-primary/40 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface w-full overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-start gap-4 flex-1 w-full md:w-auto">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-2xl">favorite</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h5 className="font-bold text-on-surface text-base">{req.title || req.items || "Vật phẩm quyên góp #" + (reqId ? String(reqId).substring(0,6) : "")}</h5>
                            {getDonationStatusBadge(req.status)}
                          </div>
                          <p className="text-body-sm text-on-surface-variant mt-1">{req.description || "Quyên góp quần áo/vật phẩm tái chế cho tổ chức."}</p>
                          
                          {(st === "SHIPPING" || st === "SHIPPED" || req.trackingCode) && (
                            <div className="mt-3 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
                              <div className="text-xs text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">local_shipping</span>
                                <span>Mã vận đơn: <strong className="font-mono text-primary">{req.trackingCode || "Chưa cập nhật tracking"}</strong></span>
                              </div>
                              {req.shippingProofUrl ? (
                                <a href={req.shippingProofUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline font-semibold flex items-center gap-1 hover:text-primary/80">
                                  <span className="material-symbols-outlined text-xs">image</span> Xem ảnh gửi hàng
                                </a>
                              ) : (
                                <span className="text-xs text-outline italic">Chưa có ảnh chứng minh gửi</span>
                              )}
                            </div>
                          )}

                          {(st === "RECEIVED" || st === "COMPLETED") && (
                            <div className="mt-2 text-xs text-emerald-700 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              <span>Tổ chức đã xác nhận tiếp nhận thành công.</span>
                              {req.receiptProofUrl && <a href={req.receiptProofUrl} target="_blank" rel="noreferrer" className="underline font-semibold ml-1">Xem ảnh biên nhận</a>}
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-outline">
                            <span>Ngày tạo: {req.createdAt ? req.createdAt.split('T')[0] : req.date || "Gần đây"}</span>
                            {req.username && <span>• Người gửi: <strong className="text-on-surface-variant">{req.username}</strong></span>}
                            {req.organizationName && <span>• Tổ chức: <strong className="text-on-surface-variant">{req.organizationName}</strong></span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 self-start md:self-center w-full md:w-auto mt-4 md:mt-0 flex-shrink-0">
                        {isOrg && st === "PENDING" && (
                          <>
                            <button onClick={() => handleRequestAction(reqId, 'accept')} className="w-full sm:w-auto justify-center px-3.5 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">check_circle</span> Tiếp nhận</button>
                            <button onClick={() => handleRequestAction(reqId, 'reject')} className="w-full sm:w-auto justify-center px-3.5 py-2 bg-error text-on-error rounded-lg text-xs font-semibold hover:bg-error/90 transition-colors shadow-sm flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">cancel</span> Từ chối</button>
                          </>
                        )}
                        {isOrg && st === "ACCEPTED" && (
                          <span className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-medium flex items-center gap-1.5"><span className="material-symbols-outlined text-sm animate-spin">sync</span> Đang chờ người gửi đồ</span>
                        )}
                        {isOrg && (st === "SHIPPING" || st === "SHIPPED") && (
                          <button onClick={() => setReceiveModal({ open: true, id: reqId, tracking: req.trackingCode, proof: req.shippingProofUrl })} className="w-full sm:w-auto justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">inventory_2</span> Xác nhận nhận hàng
                          </button>
                        )}
                        {isOrg && st === "RECEIVED" && (
                          <button onClick={() => handleRequestAction(reqId, 'complete')} className="w-full sm:w-auto justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">task_alt</span> Hoàn tất quyên góp
                          </button>
                        )}
                        
                        {!isOrg && st === "PENDING" && (
                          <button onClick={() => handleRequestAction(reqId, 'cancel')} className="w-full sm:w-auto justify-center px-3.5 py-2 bg-surface-variant text-on-surface-variant rounded-lg text-xs font-medium hover:bg-outline-variant transition-colors flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">cancel</span> Hủy yêu cầu</button>
                        )}
                        {!isOrg && st === "ACCEPTED" && (
                          <>
                            <button onClick={() => handleRequestAction(reqId, 'shipping')} className="w-full sm:w-auto justify-center px-3.5 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm">box</span> Chuẩn bị gửi đồ
                            </button>
                            <button onClick={() => setShippingModal({ open: true, id: reqId })} className="w-full sm:w-auto justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm">local_shipping</span> Gửi hàng & Nhập tracking
                            </button>
                          </>
                        )}
                        {!isOrg && st === "SHIPPING" && (
                          <button onClick={() => setShippingModal({ open: true, id: reqId })} className="w-full sm:w-auto justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5 animate-pulse">
                            <span className="material-symbols-outlined text-sm">local_shipping</span> Nhập tracking & Ảnh gửi
                          </button>
                        )}
                        {!isOrg && st === "SHIPPED" && (
                          <button onClick={() => setShippingModal({ open: true, id: reqId })} className="w-full sm:w-auto justify-center px-3.5 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-variant transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">edit</span> Sửa thông tin gửi
                          </button>
                        )}
                        {!isOrg && st === "RECEIVED" && (
                          <span className="px-3 py-1.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-xl text-xs font-medium flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">check_circle</span> Tổ chức đã nhận vật phẩm</span>
                        )}
                        {st === "COMPLETED" && (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1"><span className="material-symbols-outlined text-sm">verified</span> Đã hoàn tất</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {campaignModal.open && (
        <CampaignModal 
          isOpen={campaignModal.open}
          isEdit={campaignModal.isEdit}
          eventData={campaignModal.data}
          orgId={orgDetail?.id}
          onClose={() => setCampaignModal({ open: false, isEdit: false, data: {} })}
          onSuccess={syncDonationData}
        />
      )}

      {shippingModal.open && (
        <ShippingModal
          isOpen={shippingModal.open}
          id={shippingModal.id}
          onClose={() => setShippingModal({ open: false, id: null })}
          onSuccess={syncDonationData}
        />
      )}

      {receiveModal.open && (
        <ReceiveModal
          isOpen={receiveModal.open}
          id={receiveModal.id}
          tracking={receiveModal.tracking}
          proof={receiveModal.proof}
          onClose={() => setReceiveModal({ open: false, id: null, tracking: null, proof: null })}
          onSuccess={syncDonationData}
        />
      )}
    </>
  );
}

function CampaignModal({ isOpen, isEdit, eventData, orgId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: eventData.title || "",
    description: eventData.description || "",
    location: eventData.location || "",
    targetQuantity: eventData.targetQuantity || 100,
    startDate: eventData.startDate ? eventData.startDate.split('T')[0] : "",
    endDate: eventData.endDate ? eventData.endDate.split('T')[0] : "",
    bannerUrl: eventData.bannerUrl || eventData.imageUrl || "",
    latitude: eventData.latitude || "",
    longitude: eventData.longitude || ""
  });
  const [loading, setLoading] = useState(false);

  const formatToOffsetDateTime = (dateStr) => {
    if (!dateStr) return null;
    return dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00+07:00`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !formData.targetQuantity || !formData.startDate || !formData.endDate) {
      showToast("Vui lòng điền đủ các trường bắt buộc", "warning");
      return;
    }
    if (formData.endDate < formData.startDate) {
      showToast("Ngày kết thúc không được trước ngày bắt đầu!", "warning");
      return;
    }

    setLoading(true);
    const payload = {
      ...formData,
      targetQuantity: Number(formData.targetQuantity),
      startDate: formatToOffsetDateTime(formData.startDate),
      endDate: formatToOffsetDateTime(formData.endDate),
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      status: isEdit ? (eventData.status || "UPCOMING") : "UPCOMING"
    };

    try {
      if (isEdit) {
        const evId = eventData.id || eventData.donationEventId;
        await updateDonationEventApi(evId, payload);
        showToast("Cập nhật chiến dịch quyên góp thành công!", "success");
      } else {
        if (!orgId) throw new Error("Không xác định được ID của tổ chức!");
        await createDonationEventApi(payload, orgId);
        showToast("Khởi tạo chiến dịch quyên góp mới thành công!", "success");
      }
      onSuccess();
      onClose();
    } catch (err) {
      showToast(formatApiError(err, "lưu chiến dịch"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
          <h3 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">{isEdit ? 'edit_document' : 'campaign'}</span>
            {isEdit ? 'Chỉnh sửa Chiến dịch Quyên góp' : 'Khởi tạo Chiến dịch Quyên góp mới'}
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-variant/50">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tiêu đề chiến dịch <span className="text-error">*</span></label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="VD: Chiến dịch Áo ấm vùng cao 2026" className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Mô tả chi tiết <span className="text-error">*</span></label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required rows="3" placeholder="Nội dung, mục đích ý nghĩa của chiến dịch..." className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:outline-none transition-colors"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Địa điểm tiếp nhận <span className="text-error">*</span></label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Mục tiêu số lượng <span className="text-error">*</span></label>
              <input type="number" min="1" value={formData.targetQuantity} onChange={e => setFormData({...formData, targetQuantity: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:outline-none transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Ngày bắt đầu <span className="text-error">*</span></label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Ngày kết thúc <span className="text-error">*</span></label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:outline-none transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">URL Ảnh Banner Chiến dịch</label>
            <input type="url" value={formData.bannerUrl} onChange={e => setFormData({...formData, bannerUrl: e.target.value})} placeholder="https://example.com/banner.jpg" className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tọa độ GPS (Tùy chọn)</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" step="any" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} placeholder="Latitude (Vĩ độ)" className="px-3 py-2 rounded-xl border border-outline-variant bg-surface text-xs focus:border-primary focus:outline-none transition-colors" />
              <input type="number" step="any" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} placeholder="Longitude (Kinh độ)" className="px-3 py-2 rounded-xl border border-outline-variant bg-surface text-xs focus:border-primary focus:outline-none transition-colors" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-outline-variant font-semibold text-sm hover:bg-surface-variant/50 transition-colors">Hủy bỏ</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
              {loading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">save</span>}
              {isEdit ? 'Lưu thay đổi' : 'Tạo chiến dịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ShippingModal({ isOpen, id, onClose, onSuccess }) {
  const [trackingCode, setTrackingCode] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trackingCode) return showToast("Vui lòng nhập mã vận đơn tracking!", "warning");
    if (!file) return showToast("Vui lòng chọn ảnh minh chứng gửi hàng!", "warning");

    setLoading(true);
    try {
      await shippedDonationRequest(id, trackingCode, file);
      showToast("Cập nhật trạng thái gửi hàng thành công!", "success");
      onSuccess();
      onClose();
    } catch (err) {
      showToast(formatApiError(err, "cập nhật vận đơn & ảnh gửi hàng"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xl max-w-md w-full p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
          <h3 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600">local_shipping</span> Gửi hàng & Vận đơn
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Mã vận đơn <span className="text-error">*</span></label>
            <input type="text" value={trackingCode} onChange={e => setTrackingCode(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:outline-none font-mono" />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Ảnh phiếu gửi hàng <span className="text-error">*</span></label>
            <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center bg-surface hover:bg-surface-variant/20 transition-colors cursor-pointer relative">
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center pointer-events-none">
                <span className="material-symbols-outlined text-4xl text-indigo-600 mb-1">{file ? 'check_circle' : 'add_a_photo'}</span>
                {file ? (
                  <p className="text-xs font-bold text-on-surface truncate max-w-[200px]">{file.name}</p>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-on-surface">Nhấn để tải lên file ảnh</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">Hỗ trợ PNG, JPG (Tối đa 5MB)</p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-outline-variant font-semibold text-xs hover:bg-surface-variant/50 transition-colors">Hủy</button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-xs hover:bg-indigo-700 transition-colors flex items-center gap-1.5">
              {loading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">send</span>}
              Xác nhận đã gửi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReceiveModal({ isOpen, id, tracking, proof, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return showToast("Vui lòng chọn file ảnh chụp biên nhận!", "warning");
    
    setLoading(true);
    try {
      await receivedDonationRequest(id, file);
      showToast("Xác nhận đã tiếp nhận vật phẩm thành công!", "success");
      onSuccess();
      onClose();
    } catch (err) {
      showToast(formatApiError(err, "xác nhận tiếp nhận vật phẩm"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xl max-w-md w-full p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
          <h3 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">inventory_2</span> Xác nhận Nhận hàng
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="text-body-sm text-on-surface-variant flex flex-col gap-2 bg-surface p-3 rounded-xl border border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">local_shipping</span>
            <span>Tracking: <strong className="text-on-surface">{tracking || 'Chưa cập nhật'}</strong></span>
          </div>
          {proof && <a href={proof} target="_blank" rel="noreferrer" className="text-primary underline font-semibold text-xs flex items-center gap-1"><span className="material-symbols-outlined text-xs">image</span> Xem ảnh gửi hàng từ Member</a>}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Ảnh chụp biên nhận / vật phẩm <span className="text-error">*</span></label>
            <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center bg-surface hover:bg-surface-variant/20 transition-colors cursor-pointer relative">
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center pointer-events-none">
                <span className="material-symbols-outlined text-4xl text-primary mb-1">{file ? 'check_circle' : 'add_a_photo'}</span>
                {file ? (
                  <p className="text-xs font-bold text-on-surface truncate max-w-[200px]">{file.name}</p>
                ) : (
                  <p className="text-xs font-semibold text-on-surface">Nhấn để tải lên file ảnh</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-outline-variant font-semibold text-xs hover:bg-surface-variant/50 transition-colors">Hủy</button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-semibold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5">
              {loading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">check</span>}
              Xác nhận tiếp nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
