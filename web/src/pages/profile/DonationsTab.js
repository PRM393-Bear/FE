/**
 * EcoCycle Web - Profile Donations & Campaigns Tab
 * Supports both Member (Donation Journey) and Organization (Campaigns & Request Processing with Sub-tabs).
 */

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
  if (st === "PENDING") return `<span class="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit"><span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>Chờ tiếp nhận</span>`;
  if (st === "ACCEPTED") return `<span class="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit"><span class="material-symbols-outlined text-sm">thumb_up</span>Đã tiếp nhận</span>`;
  if (st === "SHIPPING") return `<span class="px-3 py-1 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit"><span class="material-symbols-outlined text-sm">box</span>Chuẩn bị giao hàng</span>`;
  if (st === "SHIPPED") return `<span class="px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit"><span class="material-symbols-outlined text-sm">local_shipping</span>Đã gửi hàng</span>`;
  if (st === "RECEIVED") return `<span class="px-3 py-1 bg-teal-100 text-teal-800 border border-teal-200 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit"><span class="material-symbols-outlined text-sm">inventory_2</span>Tổ chức đã nhận</span>`;
  if (st === "COMPLETED") return `<span class="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit"><span class="material-symbols-outlined text-sm">verified</span>Hoàn tất quyên góp</span>`;
  if (st === "REJECTED") return `<span class="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit"><span class="material-symbols-outlined text-sm">cancel</span>Đã từ chối</span>`;
  if (st === "CANCELLED") return `<span class="px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit"><span class="material-symbols-outlined text-sm">block</span>Đã hủy</span>`;
  return `<span class="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-xs font-semibold">${st}</span>`;
}

function getEventStatusBadge(status) {
  const st = String(status || "UPCOMING").toUpperCase();
  if (st === "UPCOMING") return `<span class="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-semibold">Sắp diễn ra</span>`;
  if (st === "ONGOING") return `<span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold animate-pulse">Đang diễn ra</span>`;
  if (st === "COMPLETED") return `<span class="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-xs font-semibold">Đã kết thúc</span>`;
  if (st === "CANCELLED") return `<span class="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-semibold">Đã hủy</span>`;
  return `<span class="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-xs font-semibold">${st}</span>`;
}

export function renderDonationsTab(container, { profile, orgDetail, events: initialEvents = [], requests: initialRequests = [], onRefresh, onOpenModal }) {
  const isOrg = profile?.role === "org";
  let activeSubTab = isOrg ? "campaigns" : "requests";
  let activeRequestFilter = "ALL";
  let events = Array.isArray(initialEvents) ? [...initialEvents] : [];
  let requests = Array.isArray(initialRequests) ? [...initialRequests] : [];

  const syncDonationData = async () => {
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
      if (Array.isArray(latestEvents)) events = latestEvents;
      if (Array.isArray(latestRequests)) requests = latestRequests;
      renderContent();
    } catch (err) {
      console.warn("Lỗi đồng bộ dữ liệu chiến dịch:", err);
      // Xử lý trường hợp dữ liệu backend trả về chậm hoặc lỗi: duy trì state cũ và render lại an toàn
      renderContent();
    }
  };

  const renderContent = () => {
    let html = `
      <div class="donations-tab flex flex-col gap-6">
        <!-- Header Banner -->
        <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 class="text-headline-sm font-bold text-on-surface mb-1">${isOrg ? "Quản lý Quyên góp & Chiến dịch" : "Hành trình Quyên góp của bạn"}</h3>
            <p class="text-body-md text-on-surface-variant">${isOrg ? "Đăng tải chiến dịch mới và quản lý các yêu cầu quyên góp từ người dùng." : "Mỗi vật phẩm trao đi là một vòng đời mới được thắp sáng cho Trái Đất."}</p>
          </div>
          ${
            !isOrg
              ? `<button id="btn-open-donate-modal" class="px-4 py-2.5 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">
                   <span class="material-symbols-outlined text-sm">volunteer_activism</span> Tạo quyên góp mới
                 </button>`
              : ""
          }
        </div>
    `;

    // Sub-tab Navigation for Org
    if (isOrg) {
      html += `
        <div class="flex border-b border-outline-variant/30 gap-6 px-2">
          <button class="org-subtab-btn pb-3 font-semibold text-sm transition-colors border-b-2 ${activeSubTab === 'campaigns' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}" data-subtab="campaigns">
            📢 Chiến dịch của tôi (${events.length})
          </button>
          <button class="org-subtab-btn pb-3 font-semibold text-sm transition-colors border-b-2 ${activeSubTab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}" data-subtab="requests">
            📦 Yêu cầu tiếp nhận (${requests.length})
          </button>
        </div>
      `;
    }

    // Sub-tab 1: Campaigns Management (Only visible when isOrg && activeSubTab === 'campaigns')
    if (isOrg && activeSubTab === "campaigns") {
      html += `
        <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div class="flex justify-between items-center">
            <h4 class="text-title-lg font-bold text-on-surface">Danh sách Chiến dịch Quyên góp</h4>
            <button id="btn-open-create-campaign" class="px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm">
              <span class="material-symbols-outlined text-sm">add</span> Tạo chiến dịch mới
            </button>
          </div>
      `;

      if (events.length === 0) {
        html += `
          <div class="flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-outline-variant/50 rounded-2xl bg-gradient-to-br from-surface-variant/20 to-surface-container-lowest w-full">
            <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5 shadow-sm text-primary">
              <span class="material-symbols-outlined text-4xl">campaign</span>
            </div>
            <h5 class="font-bold text-on-surface text-xl mb-2">Chưa có chiến dịch nào được khởi tạo</h5>
            <p class="text-body-md text-on-surface-variant max-w-lg mb-6 leading-relaxed">Hãy bấm nút <strong>"Tạo chiến dịch mới"</strong> ở góc trên bên phải để bắt đầu kêu gọi cộng đồng chung tay quyên góp vật phẩm. Các chiến dịch của tổ chức sẽ được hiển thị công khai cho mọi người.</p>
            <button onclick="document.getElementById('btn-open-create-campaign')?.click()" class="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md">
              <span class="material-symbols-outlined text-sm">add</span> Bắt đầu tạo ngay
            </button>
          </div>
        `;
      } else {
        html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-6">`;
        events.forEach((ev) => {
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

          html += `
            <div class="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <div class="h-40 w-full relative bg-surface-variant">
                  <img src="${banner}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80'"/>
                  <div class="absolute top-3 right-3">${getEventStatusBadge(ev.status)}</div>
                </div>
                <div class="p-5 flex flex-col gap-3">
                  <h5 class="font-bold text-on-surface text-lg line-clamp-1">${ev.title || "Chiến dịch quyên góp"}</h5>
                  <p class="text-body-sm text-on-surface-variant line-clamp-2">${ev.description || "Không có mô tả chi tiết."}</p>
                  
                  <!-- Progress bar -->
                  <div class="flex flex-col gap-1.5 mt-3">
                    <div class="flex justify-between items-center text-xs font-semibold">
                      <span class="text-on-surface-variant">Đã tiếp nhận <strong class="text-primary text-sm">${current}</strong> <span class="mx-1 font-normal opacity-50">/</span> Mục tiêu <strong class="text-on-surface">${target}</strong></span>
                      <span class="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">${percent}%</span>
                    </div>
                    <div class="w-full h-2.5 bg-surface-variant/60 rounded-full overflow-hidden shadow-inner">
                      <div class="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-700 ease-out" style="width: ${percent}%"></div>
                    </div>
                  </div>

                  <!-- Dates & Location -->
                  <div class="text-xs text-outline flex flex-col gap-1 mt-1">
                    <div class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">calendar_today</span>
                      <span>${ev.startDate ? ev.startDate.split('T')[0] : 'N/A'} -> ${ev.endDate ? ev.endDate.split('T')[0] : 'N/A'}</span>
                    </div>
                    ${ev.location ? `<div class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">location_on</span><span class="line-clamp-1">${ev.location}</span></div>` : ''}
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="px-5 py-3.5 border-t border-outline-variant/30 bg-surface-container-lowest flex flex-wrap justify-end gap-2">
                <button class="btn-edit-campaign px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-variant/50 transition-colors" data-ev='${JSON.stringify(ev).replace(/'/g, "&#39;")}'>
                  Sửa
                </button>
                ${
                  st === "UPCOMING"
                    ? `<button class="btn-event-status px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors" data-id="${ev.id || ev.donationEventId}" data-action="ongoing">Bắt đầu ngay</button>`
                    : ""
                }
                ${
                  st === "ONGOING"
                    ? `<button class="btn-event-status px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors" data-id="${ev.id || ev.donationEventId}" data-action="complete">Hoàn thành</button>`
                    : ""
                }
                ${
                  st === "UPCOMING" || st === "ONGOING"
                    ? `<button class="btn-event-status px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors" data-id="${ev.id || ev.donationEventId}" data-action="cancel">Đóng chiến dịch</button>`
                    : ""
                }
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }
      html += `</div>`;
    }

    // Sub-tab 2: Requests Management (Or Member requests view)
    if (!isOrg || activeSubTab === "requests") {
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

      html += `
        <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h4 class="text-title-lg font-bold text-on-surface">Danh sách Yêu cầu Quyên góp (${filteredRequests.length})</h4>
            ${
              isOrg
                ? `
              <div class="flex flex-wrap gap-2">
                <button class="req-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeRequestFilter === 'ALL' ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'}" data-filter="ALL">Tất cả</button>
                <button class="req-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeRequestFilter === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-surface-variant text-on-surface-variant'}" data-filter="PENDING">Chờ tiếp nhận</button>
                <button class="req-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeRequestFilter === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' : 'bg-surface-variant text-on-surface-variant'}" data-filter="ACCEPTED">Đã tiếp nhận</button>
                <button class="req-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeRequestFilter === 'SHIPPED' ? 'bg-indigo-100 text-indigo-800' : 'bg-surface-variant text-on-surface-variant'}" data-filter="SHIPPED">Đang giao hàng</button>
                <button class="req-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeRequestFilter === 'RECEIVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-variant text-on-surface-variant'}" data-filter="RECEIVED">Hoàn tất & Nhận</button>
              </div>
            `
                : ""
            }
          </div>
      `;

      if (filteredRequests.length === 0) {
        html += `
          <div class="flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-outline-variant/50 rounded-2xl bg-gradient-to-br from-surface-variant/20 to-surface-container-lowest w-full">
            <div class="w-20 h-20 ${isOrg ? 'bg-amber-50 text-amber-600' : 'bg-primary/10 text-primary'} rounded-full flex items-center justify-center mb-5 shadow-sm">
              <span class="material-symbols-outlined text-4xl">${isOrg ? 'clean_hands' : 'volunteer_activism'}</span>
            </div>
            <h5 class="font-bold text-on-surface text-xl mb-2">${isOrg ? 'Chưa có yêu cầu quyên góp nào' : 'Bạn chưa thực hiện quyên góp nào'}</h5>
            <p class="text-body-md text-on-surface-variant max-w-lg mb-6 leading-relaxed">${isOrg ? 'Hiện tại chưa có vật phẩm nào được người dùng quyên góp tới tổ chức của bạn. Các yêu cầu mới sẽ xuất hiện tại đây khi người dùng gửi thông tin.' : 'Hãy bắt đầu hành trình xanh của bạn bằng cách gửi những vật phẩm không còn sử dụng cho các tổ chức để bảo vệ môi trường và lan tỏa yêu thương.'}</p>
            ${!isOrg ? `
            <button onclick="document.getElementById('btn-open-donate-modal')?.click()" class="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md">
              <span class="material-symbols-outlined text-sm">volunteer_activism</span> Bắt đầu quyên góp ngay
            </button>
            ` : ''}
          </div>
        `;
      } else {
        html += `<div class="flex flex-col gap-4">`;
        filteredRequests.forEach((req) => {
          const st = String(req.status || "PENDING").toUpperCase();
          html += `
            <div class="p-5 rounded-xl border border-outline-variant/30 hover:border-primary/40 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface w-full overflow-hidden">
              <div class="flex items-start gap-4 flex-1 w-full md:w-auto">
                <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <span class="material-symbols-outlined text-2xl">favorite</span>
                </div>
                <div class="flex-1">
                  <div class="flex flex-wrap items-center gap-3">
                    <h5 class="font-bold text-on-surface text-base">${req.title || req.items || "Vật phẩm quyên góp #" + (req.id ? String(req.id).substring(0,6) : "")}</h5>
                    ${getDonationStatusBadge(req.status)}
                  </div>
                  <p class="text-body-sm text-on-surface-variant mt-1">${req.description || "Quyên góp quần áo/vật phẩm tái chế cho tổ chức."}</p>
                  
                  <!-- Shipping tracking details for SHIPPED/SHIPPING -->
                  ${
                    st === "SHIPPING" || st === "SHIPPED" || req.trackingCode
                      ? `
                    <div class="mt-3 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
                      <div class="text-xs text-on-surface flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm text-primary">local_shipping</span>
                        <span>Mã vận đơn: <strong class="font-mono text-primary">${req.trackingCode || "Chưa cập nhật tracking"}</strong></span>
                      </div>
                      ${
                        req.shippingProofUrl
                          ? `<a href="${req.shippingProofUrl}" target="_blank" class="text-xs text-primary underline font-semibold flex items-center gap-1 hover:text-primary/80">
                               <span class="material-symbols-outlined text-xs">image</span> Xem ảnh gửi hàng
                             </a>`
                          : `<span class="text-xs text-outline italic">Chưa có ảnh chứng minh gửi</span>`
                      }
                    </div>
                  `
                      : ""
                  }

                  <!-- Receipt proof for RECEIVED/COMPLETED -->
                  ${
                    st === "RECEIVED" || st === "COMPLETED"
                      ? `
                    <div class="mt-2 text-xs text-emerald-700 flex items-center gap-2">
                      <span class="material-symbols-outlined text-sm">check_circle</span>
                      <span>Tổ chức đã xác nhận tiếp nhận thành công.</span>
                      ${req.receiptProofUrl ? `<a href="${req.receiptProofUrl}" target="_blank" class="underline font-semibold ml-1">Xem ảnh biên nhận</a>` : ""}
                    </div>
                  `
                      : ""
                  }

                  <div class="flex flex-wrap items-center gap-4 mt-2 text-xs text-outline">
                    <span>Ngày tạo: ${req.createdAt ? req.createdAt.split('T')[0] : req.date || "Gần đây"}</span>
                    ${req.username ? `<span>• Người gửi: <strong class="text-on-surface-variant">${req.username}</strong></span>` : ""}
                    ${req.organizationName ? `<span>• Tổ chức: <strong class="text-on-surface-variant">${req.organizationName}</strong></span>` : ""}
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-2 self-start md:self-center w-full md:w-auto mt-2 md:mt-0 flex-shrink-0">
                ${
                  isOrg && st === "PENDING"
                    ? `
                  <button class="btn-accept-req px-3.5 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5" data-id="${req.id}"><span class="material-symbols-outlined text-sm">check_circle</span> Tiếp nhận</button>
                  <button class="btn-reject-req px-3.5 py-2 bg-error text-on-error rounded-lg text-xs font-semibold hover:bg-error/90 transition-colors shadow-sm flex items-center gap-1.5" data-id="${req.id}"><span class="material-symbols-outlined text-sm">cancel</span> Từ chối</button>
                `
                    : ""
                }
                ${
                  isOrg && st === "ACCEPTED"
                    ? `<span class="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-medium flex items-center gap-1.5"><span class="material-symbols-outlined text-sm animate-spin">sync</span> Đang chờ người gửi đồ</span>`
                    : ""
                }
                ${
                  isOrg && (st === "SHIPPING" || st === "SHIPPED")
                    ? `
                  <button class="btn-open-receive-modal px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5" data-id="${req.id}" data-tracking="${req.trackingCode || ''}" data-proof="${req.shippingProofUrl || ''}">
                    <span class="material-symbols-outlined text-sm">inventory_2</span> Xác nhận nhận hàng
                  </button>
                `
                    : ""
                }
                ${
                  isOrg && st === "RECEIVED"
                    ? `
                  <button class="btn-complete-req px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5" data-id="${req.id}">
                    <span class="material-symbols-outlined text-sm">task_alt</span> Hoàn tất quyên góp
                  </button>
                `
                    : ""
                }
                ${
                  !isOrg && st === "PENDING"
                    ? `<button class="btn-cancel-req px-3.5 py-2 bg-surface-variant text-on-surface-variant rounded-lg text-xs font-medium hover:bg-outline-variant transition-colors flex items-center gap-1.5" data-id="${req.id}"><span class="material-symbols-outlined text-sm">cancel</span> Hủy yêu cầu</button>`
                    : ""
                }
                ${
                  !isOrg && st === "ACCEPTED"
                    ? `
                  <button class="btn-shipping-status px-3.5 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-1.5" data-id="${req.id}">
                    <span class="material-symbols-outlined text-sm">box</span> Chuẩn bị gửi đồ
                  </button>
                  <button class="btn-open-shipping-modal px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5" data-id="${req.id}">
                    <span class="material-symbols-outlined text-sm">local_shipping</span> Gửi hàng & Nhập tracking
                  </button>
                `
                    : ""
                }
                ${
                  !isOrg && st === "SHIPPING"
                    ? `
                  <button class="btn-open-shipping-modal px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5 animate-pulse" data-id="${req.id}">
                    <span class="material-symbols-outlined text-sm">local_shipping</span> Nhập tracking & Ảnh gửi
                  </button>
                `
                    : ""
                }
                ${
                  !isOrg && st === "SHIPPED"
                    ? `
                  <button class="btn-open-shipping-modal px-3.5 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-variant transition-colors flex items-center gap-1" data-id="${req.id}">
                    <span class="material-symbols-outlined text-xs">edit</span> Sửa thông tin gửi
                  </button>
                `
                    : ""
                }
                ${
                  !isOrg && st === "RECEIVED"
                    ? `<span class="px-3 py-1.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-xl text-xs font-medium flex items-center gap-1.5"><span class="material-symbols-outlined text-sm">check_circle</span> Tổ chức đã nhận vật phẩm</span>`
                    : ""
                }
                ${
                  st === "COMPLETED"
                    ? `<span class="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1"><span class="material-symbols-outlined text-sm">verified</span> Đã hoàn tất</span>`
                    : ""
                }
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }
      html += `</div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
    bindEvents();
  };

  // Bind UI interactive events
  const bindEvents = () => {
    // Sub-tab switching for org
    container.querySelectorAll(".org-subtab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        activeSubTab = btn.getAttribute("data-subtab");
        renderContent();
      });
    });

    // Request status filter switching for org
    container.querySelectorAll(".req-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        activeRequestFilter = btn.getAttribute("data-filter");
        renderContent();
      });
    });

    // Open donate modal for member
    const openModalBtn = container.querySelector("#btn-open-donate-modal");
    if (openModalBtn && onOpenModal) {
      openModalBtn.addEventListener("click", () => onOpenModal());
    }

    // Open create campaign modal for org
    container.querySelector("#btn-open-create-campaign")?.addEventListener("click", () => {
      openCampaignModal({ isEdit: false });
    });

    // Open edit campaign modal for org
    container.querySelectorAll(".btn-edit-campaign").forEach(btn => {
      btn.addEventListener("click", () => {
        try {
          const evData = JSON.parse(btn.getAttribute("data-ev"));
          openCampaignModal({ isEdit: true, eventData: evData });
        } catch (e) {
          console.error("Parse event error:", e);
        }
      });
    });

    // Campaign status actions
    container.querySelectorAll(".btn-event-status").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const action = btn.getAttribute("data-action");
        if (!id) return;
        btn.disabled = true;
        try {
          if (action === "ongoing") await ongoingDonationEventApi(id);
          else if (action === "complete") await completeDonationEventApi(id);
          else if (action === "cancel") await cancelDonationEventApi(id);
          showToast("Cập nhật trạng thái chiến dịch thành công!", "success");
          await syncDonationData();
          if (onRefresh) onRefresh();
          setTimeout(() => { syncDonationData(); if (onRefresh) onRefresh(); }, 800);
        } catch (err) {
          showToast(formatApiError(err, "cập nhật trạng thái chiến dịch"), "error");
          btn.disabled = false;
        }
      });
    });

    // Org accept request
    container.querySelectorAll(".btn-accept-req").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (!id) return;
        btn.disabled = true;
        try {
          await acceptDonationRequest(id);
          showToast("Đã tiếp nhận yêu cầu quyên góp!", "success");
          const targetReq = requests.find(r => String(r.id || r.donationRequestId) === String(id));
          if (targetReq) targetReq.status = "ACCEPTED";
          renderContent();
          await syncDonationData();
          setTimeout(() => syncDonationData(), 800);
        } catch (err) {
          showToast(formatApiError(err, "tiếp nhận yêu cầu quyên góp"), "error");
          btn.disabled = false;
        }
      });
    });

    // Org reject request
    container.querySelectorAll(".btn-reject-req").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (!id) return;
        btn.disabled = true;
        try {
          await rejectDonationRequest(id, "Tổ chức tạm ngừng tiếp nhận vật phẩm này vào lúc này.");
          showToast("Đã từ chối yêu cầu quyên góp.", "info");
          const targetReq = requests.find(r => String(r.id || r.donationRequestId) === String(id));
          if (targetReq) targetReq.status = "REJECTED";
          renderContent();
          await syncDonationData();
          setTimeout(() => syncDonationData(), 800);
        } catch (err) {
          showToast(formatApiError(err, "từ chối yêu cầu quyên góp"), "error");
          btn.disabled = false;
        }
      });
    });

    // Org open receive proof upload modal
    container.querySelectorAll(".btn-open-receive-modal").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const tracking = btn.getAttribute("data-tracking");
        const proof = btn.getAttribute("data-proof");
        openReceiveProofModal({ id, tracking, proof });
      });
    });

    // Member cancel request
    container.querySelectorAll(".btn-cancel-req").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (!id) return;
        btn.disabled = true;
        try {
          await cancelDonationRequest(id, "Người dùng hủy yêu cầu");
          showToast("Đã hủy yêu cầu quyên góp.", "info");
          const targetReq = requests.find(r => String(r.id || r.donationRequestId) === String(id));
          if (targetReq) targetReq.status = "CANCELLED";
          renderContent();
          await syncDonationData();
          setTimeout(() => syncDonationData(), 800);
        } catch (err) {
          showToast(formatApiError(err, "hủy yêu cầu quyên góp"), "error");
          btn.disabled = false;
        }
      });
    });

    // Member mark status as SHIPPING (`shippingDonationRequest`)
    container.querySelectorAll(".btn-shipping-status").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (!id) return;
        btn.disabled = true;
        try {
          await shippingDonationRequest(id);
          showToast("Đã chuyển sang trạng thái đang chuẩn bị giao hàng!", "success");
          const targetReq = requests.find(r => String(r.id || r.donationRequestId) === String(id));
          if (targetReq) targetReq.status = "SHIPPING";
          renderContent();
          await syncDonationData();
          setTimeout(() => syncDonationData(), 800);
        } catch (err) {
          showToast(formatApiError(err, "chuyển trạng thái giao hàng"), "error");
          btn.disabled = false;
        }
      });
    });

    // Complete donation request (`completedDonationRequest`)
    container.querySelectorAll(".btn-complete-req").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (!id) return;
        btn.disabled = true;
        try {
          await completedDonationRequest(id);
          showToast("Đã hoàn tất quy trình quyên góp!", "success");
          const targetReq = requests.find(r => String(r.id || r.donationRequestId) === String(id));
          if (targetReq) targetReq.status = "COMPLETED";
          renderContent();
          await syncDonationData();
          setTimeout(() => syncDonationData(), 800);
        } catch (err) {
          showToast(formatApiError(err, "hoàn tất quy trình quyên góp"), "error");
          btn.disabled = false;
        }
      });
    });

    // Member open shipping modal (`openShippingProofModal`)
    container.querySelectorAll(".btn-open-shipping-modal").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (id) openShippingProofModal({ id });
      });
    });
  };

  // Modal: Create/Edit Campaign
  const openCampaignModal = ({ isEdit, eventData = {} }) => {
    const modalId = "campaign-modal-overlay";
    document.getElementById(modalId)?.remove();

    const overlay = document.createElement("div");
    overlay.id = modalId;
    overlay.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-sm";
    
    overlay.innerHTML = `
      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-6">
        <div class="flex justify-between items-center border-b border-outline-variant/30 pb-4">
          <h3 class="text-title-lg font-bold text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">${isEdit ? 'edit_document' : 'campaign'}</span>
            ${isEdit ? 'Chỉnh sửa Chiến dịch Quyên góp' : 'Khởi tạo Chiến dịch Quyên góp mới'}
          </h3>
          <button id="btn-close-campaign-modal" class="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-variant/50">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form id="form-campaign" class="flex flex-col gap-4" novalidate>
          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tiêu đề chiến dịch <span class="text-error">*</span></label>
            <input type="text" name="title" value="${eventData.title || ''}" placeholder="VD: Chiến dịch Áo ấm vùng cao 2026" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:outline-none transition-colors" />
            <p class="error-inline text-xs font-semibold text-error mt-1.5 hidden"></p>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Mô tả chi tiết <span class="text-error">*</span></label>
            <textarea name="description" rows="3" placeholder="Nội dung, mục đích ý nghĩa của chiến dịch..." class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:outline-none transition-colors">${eventData.description || ''}</textarea>
            <p class="error-inline text-xs font-semibold text-error mt-1.5 hidden"></p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Địa điểm tiếp nhận <span class="text-error">*</span></label>
              <input type="text" name="location" value="${eventData.location || ''}" placeholder="VD: 123 Cầu Giấy, Hà Nội" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:outline-none transition-colors" />
              <p class="error-inline text-xs font-semibold text-error mt-1.5 hidden"></p>
            </div>
            <div>
              <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Mục tiêu số lượng vật phẩm <span class="text-error">*</span></label>
              <input type="number" name="targetQuantity" min="1" value="${eventData.targetQuantity || 100}" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:outline-none transition-colors" />
              <p class="error-inline text-xs font-semibold text-error mt-1.5 hidden"></p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Ngày bắt đầu <span class="text-error">*</span></label>
              <input type="date" name="startDate" value="${eventData.startDate ? eventData.startDate.split('T')[0] : ''}" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:outline-none transition-colors" />
              <p class="error-inline text-xs font-semibold text-error mt-1.5 hidden"></p>
            </div>
            <div>
              <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Ngày kết thúc <span class="text-error">*</span></label>
              <input type="date" name="endDate" value="${eventData.endDate ? eventData.endDate.split('T')[0] : ''}" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:outline-none transition-colors" />
              <p class="error-inline text-xs font-semibold text-error mt-1.5 hidden"></p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">URL Ảnh Banner Chiến dịch</label>
            <input type="url" name="bannerUrl" value="${eventData.bannerUrl || eventData.imageUrl || ''}" placeholder="https://example.com/banner.jpg" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:outline-none transition-colors" />
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tọa độ GPS (Tùy chọn)</label>
            <div class="grid grid-cols-2 gap-3">
              <input type="number" step="any" name="latitude" value="${eventData.latitude || ''}" placeholder="Latitude (Vĩ độ)" class="px-3 py-2 rounded-xl border border-outline-variant bg-surface text-xs focus:border-primary focus:outline-none transition-colors" />
              <input type="number" step="any" name="longitude" value="${eventData.longitude || ''}" placeholder="Longitude (Kinh độ)" class="px-3 py-2 rounded-xl border border-outline-variant bg-surface text-xs focus:border-primary focus:outline-none transition-colors" />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <button type="button" id="btn-cancel-campaign-modal" class="px-5 py-2.5 rounded-xl border border-outline-variant font-semibold text-sm hover:bg-surface-variant/50 transition-colors">Hủy bỏ</button>
            <button type="submit" class="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">save</span> ${isEdit ? 'Lưu thay đổi' : 'Tạo chiến dịch'}
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeModal = () => overlay.remove();
    overlay.querySelector("#btn-close-campaign-modal")?.addEventListener("click", closeModal);
    overlay.querySelector("#btn-cancel-campaign-modal")?.addEventListener("click", closeModal);

    const form = overlay.querySelector("#form-campaign");

    // Live clear inline errors when user inputs data
    form?.querySelectorAll("input, textarea").forEach(input => {
      input.addEventListener("input", () => {
        input.classList.remove("border-error", "bg-error/5");
        const err = input.parentElement.querySelector(".error-inline");
        if (err) {
          err.textContent = "";
          err.classList.add("hidden");
        }
      });
    });

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);

      // Reset all errors before validation
      form.querySelectorAll(".error-inline").forEach(el => {
        el.textContent = "";
        el.classList.add("hidden");
      });
      form.querySelectorAll("input, textarea").forEach(el => {
        el.classList.remove("border-error", "bg-error/5");
      });

      let firstErrorInput = null;
      const showError = (name, msg) => {
        const input = form.querySelector(`[name='${name}']`);
        if (input) {
          input.classList.add("border-error", "bg-error/5");
          if (!firstErrorInput) firstErrorInput = input;
          const errorEl = input.parentElement.querySelector(".error-inline");
          if (errorEl) {
            errorEl.textContent = msg;
            errorEl.classList.remove("hidden");
          }
        }
      };

      const title = fd.get("title")?.trim() || "";
      const description = fd.get("description")?.trim() || "";
      const location = fd.get("location")?.trim() || "";
      const targetQuantityVal = fd.get("targetQuantity")?.trim() || "";
      const targetQuantity = parseInt(targetQuantityVal, 10);
      const startDateVal = fd.get("startDate")?.trim() || "";
      const endDateVal = fd.get("endDate")?.trim() || "";

      let hasError = false;

      if (!title) {
        showError("title", "Tiêu đề chiến dịch không được để trống!");
        hasError = true;
      } else if (title.length < 5) {
        showError("title", "Tiêu đề chiến dịch phải có ít nhất 5 ký tự!");
        hasError = true;
      }

      if (!description) {
        showError("description", "Mô tả chi tiết không được để trống!");
        hasError = true;
      } else if (description.length < 10) {
        showError("description", "Mô tả chi tiết phải có ít nhất 10 ký tự!");
        hasError = true;
      }

      if (!location) {
        showError("location", "Địa điểm tiếp nhận không được để trống!");
        hasError = true;
      }

      if (!targetQuantityVal || isNaN(targetQuantity) || targetQuantity <= 0) {
        showError("targetQuantity", "Mục tiêu số lượng phải là số nguyên dương lớn hơn 0!");
        hasError = true;
      }

      if (!startDateVal) {
        showError("startDate", "Vui lòng chọn ngày bắt đầu chiến dịch!");
        hasError = true;
      }

      if (!endDateVal) {
        showError("endDate", "Vui lòng chọn ngày kết thúc chiến dịch!");
        hasError = true;
      } else if (startDateVal && endDateVal < startDateVal) {
        showError("endDate", "Ngày kết thúc không được trước ngày bắt đầu!");
        hasError = true;
      }

      if (hasError) {
        if (firstErrorInput) firstErrorInput.focus();
        showToast("Vui lòng kiểm tra và sửa các lỗi trên form!", "warning");
        return;
      }

      const formatToOffsetDateTime = (dateStr) => {
        if (!dateStr) return null;
        return dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00+07:00`;
      };

      const payload = {
        title,
        description,
        location,
        targetQuantity,
        startDate: formatToOffsetDateTime(startDateVal),
        endDate: formatToOffsetDateTime(endDateVal),
        bannerUrl: fd.get("bannerUrl")?.trim() || null,
        latitude: fd.get("latitude") ? parseFloat(fd.get("latitude")) : null,
        longitude: fd.get("longitude") ? parseFloat(fd.get("longitude")) : null,
        status: isEdit ? (eventData.status || "UPCOMING") : "UPCOMING"
      };

      const submitBtn = form.querySelector("button[type='submit']");
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("opacity-60", "cursor-not-allowed");
        submitBtn.innerHTML = `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> ${isEdit ? 'Đang cập nhật...' : 'Đang khởi tạo...'}`;
      }

      try {
        if (isEdit) {
          const evId = eventData.id || eventData.donationEventId;
          await updateDonationEventApi(evId, payload);
          showToast("Cập nhật chiến dịch quyên góp thành công!", "success");
        } else {
          if (!orgDetail?.id) {
            throw new Error("Không xác định được ID của tổ chức để tạo chiến dịch!");
          }
          await createDonationEventApi(payload, orgDetail.id);
          showToast("Khởi tạo chiến dịch quyên góp mới thành công!", "success");
        }
        closeModal();
        await syncDonationData();
        setTimeout(() => syncDonationData(), 800);
      } catch (err) {
        showToast(formatApiError(err, isEdit ? "cập nhật chiến dịch" : "khởi tạo chiến dịch"), "error");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove("opacity-60", "cursor-not-allowed");
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  };

  // Modal: Member Upload Shipping Tracking & Proof (`shippedDonationRequest`)
  const openShippingProofModal = ({ id }) => {
    const modalId = "shipping-proof-modal-overlay";
    document.getElementById(modalId)?.remove();

    const overlay = document.createElement("div");
    overlay.id = modalId;
    overlay.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-sm";
    
    overlay.innerHTML = `
      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xl max-w-md w-full p-6 flex flex-col gap-6">
        <div class="flex justify-between items-center border-b border-outline-variant/30 pb-3">
          <h3 class="text-title-lg font-bold text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-indigo-600">local_shipping</span> Gửi hàng & Vận đơn
          </h3>
          <button id="btn-close-shipping-modal" class="text-on-surface-variant hover:text-on-surface p-1 rounded-full">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form id="form-shipping-proof" class="flex flex-col gap-4">
          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Mã vận đơn (Tracking Code) <span class="text-error">*</span></label>
            <input type="text" id="input-tracking-code" name="trackingCode" required placeholder="VD: SPXVN123456789, GHN98765432" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:border-primary focus:outline-none font-mono" />
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Ảnh chụp phiếu gửi hàng / bưu kiện <span class="text-error">*</span></label>
            <div class="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center bg-surface hover:bg-surface-variant/20 transition-colors cursor-pointer relative">
              <input type="file" id="input-shipping-file" name="shippingProofFile" accept="image/*" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div id="shipping-preview-container" class="flex flex-col items-center pointer-events-none">
                <span class="material-symbols-outlined text-4xl text-indigo-600 mb-1">add_a_photo</span>
                <p class="text-xs font-semibold text-on-surface">Nhấn hoặc kéo thả file ảnh gửi hàng vào đây</p>
                <p class="text-[11px] text-on-surface-variant mt-0.5">Hỗ trợ PNG, JPG (Tối đa 5MB)</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button type="button" id="btn-cancel-shipping-modal" class="px-4 py-2 rounded-xl border border-outline-variant font-semibold text-xs hover:bg-surface-variant/50 transition-colors">Hủy</button>
            <button type="submit" class="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-xs hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm">send</span> Xác nhận đã gửi hàng
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const fileInput = overlay.querySelector("#input-shipping-file");
    const previewContainer = overlay.querySelector("#shipping-preview-container");

    fileInput?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file && previewContainer) {
        previewContainer.innerHTML = `
          <span class="material-symbols-outlined text-3xl text-indigo-600 mb-1">check_circle</span>
          <p class="text-xs font-bold text-on-surface truncate max-w-[200px]">${file.name}</p>
          <p class="text-[11px] text-indigo-600 font-semibold mt-0.5">Đã đính kèm ảnh bưu kiện</p>
        `;
      }
    });

    const closeModal = () => overlay.remove();
    overlay.querySelector("#btn-close-shipping-modal")?.addEventListener("click", closeModal);
    overlay.querySelector("#btn-cancel-shipping-modal")?.addEventListener("click", closeModal);

    overlay.querySelector("#form-shipping-proof")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const trackingCode = overlay.querySelector("#input-tracking-code")?.value?.trim();
      const file = fileInput?.files?.[0];
      if (!trackingCode) {
        showToast("Vui lòng nhập mã vận đơn tracking!", "warning");
        return;
      }
      if (!file) {
        showToast("Vui lòng chọn ảnh minh chứng gửi hàng!", "warning");
        return;
      }

      const submitBtn = e.target.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.disabled = true;

      try {
        await shippedDonationRequest(id, trackingCode, file);
        showToast("Cập nhật trạng thái gửi hàng thành công!", "success");
        closeModal();
        const targetReq = requests.find(r => String(r.id || r.donationRequestId) === String(id));
        if (targetReq) {
          targetReq.status = "SHIPPED";
          targetReq.trackingCode = trackingCode;
        }
        renderContent();
        await syncDonationData();
        setTimeout(() => syncDonationData(), 800);
      } catch (err) {
        showToast(formatApiError(err, "cập nhật vận đơn & ảnh gửi hàng"), "error");
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  };

  // Modal: Confirm Receipt Proof Upload (`receivedDonationRequest`)
  const openReceiveProofModal = ({ id, tracking, proof }) => {
    const modalId = "receive-proof-modal-overlay";
    document.getElementById(modalId)?.remove();

    const overlay = document.createElement("div");
    overlay.id = modalId;
    overlay.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-sm";
    
    overlay.innerHTML = `
      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xl max-w-md w-full p-6 flex flex-col gap-6">
        <div class="flex justify-between items-center border-b border-outline-variant/30 pb-3">
          <h3 class="text-title-lg font-bold text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-600">inventory_2</span> Xác nhận Nhận hàng
          </h3>
          <button id="btn-close-receive-modal" class="text-on-surface-variant hover:text-on-surface p-1 rounded-full">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="text-body-sm text-on-surface-variant flex flex-col gap-2 bg-surface p-3 rounded-xl border border-outline-variant/30">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-sm text-primary">local_shipping</span>
            <span>Tracking: <strong class="text-on-surface">${tracking || 'Chưa cập nhật'}</strong></span>
          </div>
          ${proof ? `<a href="${proof}" target="_blank" class="text-primary underline font-semibold text-xs flex items-center gap-1"><span class="material-symbols-outlined text-xs">image</span> Xem ảnh gửi hàng từ Member</a>` : ''}
        </div>

        <form id="form-receive-proof" class="flex flex-col gap-4">
          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Ảnh chụp biên nhận / vật phẩm nhận được <span class="text-error">*</span></label>
            <div class="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center bg-surface hover:bg-surface-variant/20 transition-colors cursor-pointer relative">
              <input type="file" id="input-receipt-file" name="receiptProofFile" accept="image/*" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div id="preview-container" class="flex flex-col items-center pointer-events-none">
                <span class="material-symbols-outlined text-4xl text-primary mb-1">add_a_photo</span>
                <p class="text-xs font-semibold text-on-surface">Nhấn hoặc kéo thả file ảnh biên nhận vào đây</p>
                <p class="text-[11px] text-on-surface-variant mt-0.5">Hỗ trợ PNG, JPG (Tối đa 5MB)</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button type="button" id="btn-cancel-receive-modal" class="px-4 py-2 rounded-xl border border-outline-variant font-semibold text-xs hover:bg-surface-variant/50 transition-colors">Hủy</button>
            <button type="submit" class="px-5 py-2 bg-emerald-600 text-white rounded-xl font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm">check</span> Xác nhận tiếp nhận
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const fileInput = overlay.querySelector("#input-receipt-file");
    const previewContainer = overlay.querySelector("#preview-container");

    fileInput?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file && previewContainer) {
        previewContainer.innerHTML = `
          <span class="material-symbols-outlined text-3xl text-emerald-600 mb-1">check_circle</span>
          <p class="text-xs font-bold text-on-surface truncate max-w-[200px]">${file.name}</p>
          <p class="text-[11px] text-emerald-600 font-semibold mt-0.5">Đã đính kèm ảnh biên nhận</p>
        `;
      }
    });

    const closeModal = () => overlay.remove();
    overlay.querySelector("#btn-close-receive-modal")?.addEventListener("click", closeModal);
    overlay.querySelector("#btn-cancel-receive-modal")?.addEventListener("click", closeModal);

    overlay.querySelector("#form-receive-proof")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const file = fileInput?.files?.[0];
      if (!file) {
        showToast("Vui lòng chọn file ảnh chụp biên nhận!", "warning");
        return;
      }

      const submitBtn = e.target.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.disabled = true;

      try {
        await receivedDonationRequest(id, file);
        showToast("Xác nhận đã tiếp nhận vật phẩm thành công!", "success");
        closeModal();
        const targetReq = requests.find(r => String(r.id || r.donationRequestId) === String(id));
        if (targetReq) targetReq.status = "RECEIVED";
        renderContent();
        await syncDonationData();
        setTimeout(() => syncDonationData(), 800);
      } catch (err) {
        showToast(formatApiError(err, "xác nhận tiếp nhận vật phẩm"), "error");
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  };

  // Initial render
  renderContent();
}
