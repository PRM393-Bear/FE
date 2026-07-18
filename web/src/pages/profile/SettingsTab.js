/**
 * EcoCycle Web - Profile Settings Tab
 * Renders user form to update profile details, change password, and Organization Detail settings.
 */

import { updateUserProfile, changePassword, getMyOrganizationDetailApi, updateOrganizationDetailApi } from "../../services/profile.service.js";
import { createOrganizationDetailApi } from "../../services/auth.service.js";
import { showToast } from "../../utils/ui.js";

const DEFAULT_ACCEPTED_TYPES = [
  "Quần áo",
  "Đồ gia dụng",
  "Thiết bị điện tử",
  "Nhu yếu phẩm & Thực phẩm",
  "Đồ chơi trẻ em"
];

export async function renderSettingsTab(container, { profile, orgDetail: passedOrgDetail, onRefresh }) {
  const isOrg = profile?.role === "org";

  if (isOrg && !passedOrgDetail) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 gap-3 max-w-3xl">
        <span class="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></span>
        <p class="text-body-md text-on-surface-variant font-medium">Đang tải thông tin hồ sơ tổ chức...</p>
      </div>
    `;
  }

  let orgDetail = passedOrgDetail || null;
  if (isOrg) {
    try {
      if (!orgDetail) {
        orgDetail = await getMyOrganizationDetailApi();
      }
      if (orgDetail && profile?.id) {
        try {
          const cached = JSON.parse(localStorage.getItem("org_custom_fields_" + profile.id) || "null");
          if (cached) {
            if (!orgDetail.avtOrg && cached.avtOrg) orgDetail.avtOrg = cached.avtOrg;
            if ((!orgDetail.acceptedTypes || orgDetail.acceptedTypes.length === 0) && cached.acceptedTypes) {
              orgDetail.acceptedTypes = cached.acceptedTypes;
            }
            if ((!orgDetail.verificationDocs || orgDetail.verificationDocs.length === 0) && cached.verificationDocs) {
              orgDetail.verificationDocs = cached.verificationDocs;
            }
            if (cached.status && String(orgDetail.status).toUpperCase() === "REJECTED") {
              orgDetail.status = cached.status;
            }
          }
        } catch (e) {
          console.warn("Could not parse org custom cache:", e);
        }
      }
    } catch (e) {
      console.warn("Could not load organization detail:", e);
    }
  }

  let orgSectionHtml = "";
  if (isOrg) {
    const status = String(orgDetail?.status || "PENDING").toUpperCase();
    let statusBannerHtml = "";

    if (!orgDetail || !orgDetail.id) {
      statusBannerHtml = `
        <div class="flex items-start gap-4 p-5 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-blue-500/10 border-2 border-indigo-500/30 rounded-2xl text-indigo-900 mb-6 shadow-sm">
          <div class="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0 text-indigo-600">
            <span class="material-symbols-outlined text-3xl">add_business</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <h4 class="font-bold text-base text-indigo-900">Chưa có Hồ sơ Tổ chức</h4>
              <span class="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">info</span> EMPTY
              </span>
            </div>
            <p class="text-xs text-indigo-800 mt-1.5 leading-relaxed">Bạn hiện đang có quyền truy cập dành cho Tổ chức nhưng chưa hoàn thiện hồ sơ. Vui lòng điền đầy đủ các thông tin bên dưới và nhấn lưu để gửi yêu cầu phê duyệt lên Ban Quản Trị.</p>
          </div>
        </div>
      `;
    } else if (status === "APPROVED") {
      statusBannerHtml = `
        <div class="flex items-start gap-4 p-5 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border-2 border-emerald-500/30 rounded-2xl text-emerald-900 mb-6 shadow-sm">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0 text-emerald-600">
            <span class="material-symbols-outlined text-3xl">verified</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <h4 class="font-bold text-base text-emerald-900">Hồ sơ đã được phê duyệt hợp lệ (APPROVED)</h4>
              <span class="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">check_circle</span> APPROVED
              </span>
            </div>
            <p class="text-xs text-emerald-800 mt-1.5 leading-relaxed">Tổ chức của bạn có đầy đủ quyền hạn để tạo các chiến dịch quyên góp công khai, tiếp nhận đóng góp vật phẩm từ cộng đồng và quản lý yêu cầu quyên góp trên toàn hệ thống EcoCycle.</p>
          </div>
        </div>
      `;
    } else if (status === "REJECTED") {
      statusBannerHtml = `
        <div class="flex items-start gap-4 p-5 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-red-500/10 border-2 border-rose-500/30 rounded-2xl text-rose-900 mb-6 shadow-sm">
          <div class="w-12 h-12 rounded-xl bg-rose-500/15 flex items-center justify-center flex-shrink-0 text-rose-600">
            <span class="material-symbols-outlined text-3xl">gpp_bad</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <h4 class="font-bold text-base text-rose-900">Hồ sơ bị từ chối phê duyệt (REJECTED)</h4>
              <span class="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">error</span> REJECTED
              </span>
            </div>
            <div class="p-3.5 bg-white/90 rounded-xl border border-rose-200 mt-2 text-rose-800 text-xs font-semibold flex items-start gap-2.5 shadow-2xs">
              <span class="material-symbols-outlined text-base text-rose-600 shrink-0 mt-0.5">info</span>
              <span><strong>Lý do từ chối từ Ban Quản Trị:</strong> ${orgDetail?.reason || orgDetail?.rejectedReason || "Thông tin giới thiệu, địa chỉ trụ sở hoặc link giấy tờ minh chứng chưa đầy đủ/chính xác."}</span>
            </div>
            <p class="text-xs text-rose-800 mt-2 leading-relaxed">Vui lòng kiểm tra và chỉnh sửa lại thông tin, cập nhật link minh chứng hợp pháp bên dưới và bấm <strong>"Lưu Hồ sơ Tổ chức"</strong> để gửi xin thẩm định lại.</p>
          </div>
        </div>
      `;
    } else {
      statusBannerHtml = `
        <div class="flex items-start gap-4 p-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 border-2 border-amber-500/30 rounded-2xl text-amber-900 mb-6 shadow-sm">
          <div class="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0 text-amber-600">
            <span class="material-symbols-outlined text-3xl">pending_actions</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <h4 class="font-bold text-base text-amber-900">Hồ sơ đang chờ thẩm định (PENDING)</h4>
              <span class="px-3 py-1 rounded-full bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1 animate-pulse">
                <span class="material-symbols-outlined text-sm">schedule</span> PENDING
              </span>
            </div>
            <p class="text-xs text-amber-800 mt-1.5 leading-relaxed">Hồ sơ của bạn đang được Ban Quản Trị (Staff/Admin) kiểm duyệt tính xác thực. Trong thời gian chờ xét duyệt, bạn vẫn có thể cập nhật và hoàn thiện thêm thông tin bên dưới để đẩy nhanh tiến độ.</p>
          </div>
        </div>
      `;
    }

    const currentAcceptedTypes = Array.isArray(orgDetail?.acceptedTypes) ? orgDetail.acceptedTypes : [];
    const customTypesList = currentAcceptedTypes.filter(t => !DEFAULT_ACCEPTED_TYPES.includes(t));
    const customTypesStr = customTypesList.join(", ");

    const currentDocs = Array.isArray(orgDetail?.verificationDocs) ? orgDetail.verificationDocs.join("\n") : "";

    orgSectionHtml = `
      <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-8 shadow-sm">
        <div class="flex items-center justify-between gap-4 mb-2">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-2xl text-primary">domain</span>
            <h3 class="text-headline-sm font-bold text-on-surface">Cài đặt Hồ sơ & Hoạt động Tổ chức</h3>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase bg-primary/10 text-primary">Tổ chức từ thiện</span>
        </div>
        <p class="text-body-md text-on-surface-variant mb-6">Cập nhật thông tin công khai của tổ chức, địa chỉ trụ sở, và danh mục quyên góp cần tiếp nhận.</p>

        ${statusBannerHtml}

        <form id="form-org-settings" class="flex flex-col gap-6" novalidate>
          <!-- Logo & Tên tổ chức -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-outline-variant/30">
            <div class="flex flex-col items-center gap-2">
              <img id="preview-org-logo" src="${orgDetail?.avtOrg || profile?.avatar || 'https://ui-avatars.com/api/?name=ORG&background=006B2C&color=fff'}" class="w-24 h-24 rounded-2xl object-cover shadow-sm border border-outline-variant/30 flex-shrink-0 bg-surface-variant" />
              <span id="logo-status-badge" class="inline-flex items-center gap-1 text-[11px] font-bold ${orgDetail?.avtOrg ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-on-surface-variant bg-surface-variant border-outline-variant/30'} px-2.5 py-0.5 rounded-full border">
                <span class="material-symbols-outlined text-xs">${orgDetail?.avtOrg ? 'check_circle' : 'image'}</span>
                ${orgDetail?.avtOrg ? 'Logo hợp lệ' : 'Logo mặc định'}
              </span>
            </div>
            <div class="flex-1 w-full flex flex-col gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-label-md font-semibold text-on-surface">Tên Tổ chức / Đơn vị từ thiện <span class="text-error">*</span></label>
                <input type="text" name="orgName" value="${orgDetail?.orgName || profile?.name || ""}" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium transition-colors" placeholder="Nhập tên tổ chức của bạn" required />
                <p class="error-inline text-xs font-semibold text-error mt-1 hidden"></p>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-label-md font-semibold text-on-surface">URL Logo / Ảnh đại diện Tổ chức</label>
                <div class="flex gap-2">
                  <input type="url" name="avtOrg" id="input-avt-org" value="${orgDetail?.avtOrg || ""}" class="flex-1 px-4 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm transition-colors" placeholder="https://example.com/logo.png" />
                  <button type="button" id="btn-preview-logo" class="px-3.5 py-2 bg-surface-variant hover:bg-outline-variant text-on-surface-variant font-semibold rounded-xl text-xs transition-colors flex items-center gap-1 shrink-0" title="Xem trước ảnh logo">
                    <span class="material-symbols-outlined text-sm">visibility</span> Preview
                  </button>
                </div>
                <p class="error-inline text-xs font-semibold text-error mt-1 hidden"></p>
              </div>
            </div>
          </div>

          <!-- Mô tả hoạt động -->
          <div class="flex flex-col gap-1.5">
            <label class="text-label-md font-semibold text-on-surface">Mô tả giới thiệu & Sứ mệnh <span class="text-error">*</span></label>
            <textarea name="description" rows="3" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm transition-colors" placeholder="Giới thiệu về mục tiêu, hoạt động thiện nguyện và đối tượng hỗ trợ của tổ chức (tối thiểu 15 ký tự)..." required>${orgDetail?.description || ""}</textarea>
            <p class="error-inline text-xs font-semibold text-error mt-1 hidden"></p>
          </div>

          <!-- Địa chỉ & Website -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="flex flex-col gap-1.5">
              <label class="text-label-md font-semibold text-on-surface">Địa chỉ Trụ sở <span class="text-error">*</span></label>
              <input type="text" name="address" value="${orgDetail?.address || ""}" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium transition-colors" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" required />
              <p class="error-inline text-xs font-semibold text-error mt-1 hidden"></p>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-label-md font-semibold text-on-surface">Website hoặc Fanpage chính thức</label>
              <input type="url" name="websiteUrl" value="${orgDetail?.websiteUrl || ""}" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium transition-colors" placeholder="https://facebook.com/your-org" />
            </div>
          </div>

          <!-- Tọa độ bản đồ -->
          <div class="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col gap-4">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div>
                <label class="text-label-md font-semibold text-on-surface">Tọa độ Bản đồ (Latitude & Longitude) <span class="text-error">*</span></label>
                <p class="text-xs text-on-surface-variant">Giúp người quyên góp dễ dàng tìm thấy tổ chức trên bản đồ gần họ.</p>
              </div>
              <button type="button" id="btn-get-gps" class="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs">
                <span class="material-symbols-outlined text-sm">my_location</span> Lấy tọa độ GPS hiện tại
              </button>
            </div>
            <div id="gps-coord-container" class="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl transition-colors">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-on-surface-variant">Vĩ độ (Latitude) <span class="text-error">*</span></label>
                <input type="number" step="any" name="latitude" value="${orgDetail?.latitude ?? ""}" class="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm transition-colors" placeholder="Ví dụ: 10.762622" required />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-on-surface-variant">Kinh độ (Longitude) <span class="text-error">*</span></label>
                <input type="number" step="any" name="longitude" value="${orgDetail?.longitude ?? ""}" class="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm transition-colors" placeholder="Ví dụ: 106.660172" required />
              </div>
            </div>
            <p class="error-inline text-xs font-semibold text-error mt-1 hidden"></p>
          </div>

          <!-- Danh mục tiếp nhận -->
          <div class="flex flex-col gap-2">
            <label class="text-label-md font-semibold text-on-surface">Danh mục Vật phẩm Tiếp nhận quyên góp <span class="text-error">*</span></label>
            <p class="text-xs text-on-surface-variant mb-1">Chọn hoặc nhập các loại vật phẩm mà tổ chức đang có nhu cầu nhận ủng hộ từ cộng đồng:</p>
            <div id="accepted-types-container" class="rounded-xl transition-colors p-1">
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                ${DEFAULT_ACCEPTED_TYPES.map(type => {
      const checked = currentAcceptedTypes.includes(type);
      return `
                    <label class="flex items-center gap-2.5 p-3 rounded-xl border ${checked ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-outline-variant bg-surface text-on-surface'} hover:border-primary transition-colors cursor-pointer text-sm">
                      <input type="checkbox" name="acceptedTypeCheckbox" value="${type}" class="rounded text-primary focus:ring-primary w-4 h-4" ${checked ? 'checked' : ''} />
                      <span>${type}</span>
                    </label>
                  `;
    }).join("")}
              </div>
              <div class="mt-2 flex flex-col gap-1">
                <label class="text-xs font-semibold text-on-surface-variant">Danh mục tiếp nhận khác (nếu có, phân cách bởi dấu phẩy)</label>
                <input type="text" name="customAcceptedTypes" value="${customTypesStr}" class="px-4 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm transition-colors" placeholder="Ví dụ: Chăn màn ấm, Xe lăn, Dụng cụ thể thao..." />
              </div>
            </div>
            <p class="error-inline text-xs font-semibold text-error mt-1 hidden"></p>
          </div>

          <!-- Tài liệu minh chứng -->
          <div class="flex flex-col gap-1.5">
            <label class="text-label-md font-semibold text-on-surface">Danh sách link Tài liệu / Giấy tờ minh chứng hợp pháp</label>
            <p class="text-xs text-on-surface-variant">Nhập các đường dẫn URL tài liệu hoặc ảnh chụp giấy phép hoạt động từ thiện (mỗi URL một dòng):</p>
            <textarea name="verificationDocsText" rows="2" class="px-4 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm font-mono transition-colors" placeholder="https://example.com/giay-phep-hoat-dong.jpg">${currentDocs}</textarea>
          </div>

          <div class="flex justify-end pt-4 border-t border-outline-variant/30">
            <button type="submit" class="w-full sm:w-auto px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-lg">save</span>
              Lưu Hồ sơ Tổ chức
            </button>
          </div>
        </form>
      </div>
    `;
  }

  const html = `
    <div class="settings-tab flex flex-col gap-8 max-w-3xl">

      ${orgSectionHtml}

      <!-- Section 1: Profile Info -->
      <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-8 shadow-sm">
        <h3 class="text-headline-sm font-bold text-on-surface mb-2">Cài đặt Thông tin Cá nhân Đăng nhập</h3>
        <p class="text-body-md text-on-surface-variant mb-6">Cập nhật họ tên, địa chỉ email, số điện thoại liên lạc tài khoản cá nhân.</p>

        <form id="form-profile-settings" class="flex flex-col gap-6">
          <div class="flex items-center gap-6 pb-6 border-b border-outline-variant/30">
            <img src="${profile?.avatar || 'https://i.pravatar.cc/150'}" class="w-20 h-20 rounded-full object-cover shadow-sm border border-outline-variant/30" />
            <div>
              <p class="font-bold text-on-surface text-base">${profile?.name || profile?.username || "Thành viên EcoCycle"}</p>
              <p class="text-xs text-on-surface-variant uppercase mt-0.5">Vai trò: <strong class="text-primary">${profile?.role || "MEMBER"}</strong></p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="flex flex-col gap-1.5">
              <label class="text-label-md font-semibold text-on-surface">Tên đăng nhập (Username)</label>
              <input type="text" name="username" value="${profile?.username || ""}" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" required />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-label-md font-semibold text-on-surface">Họ và tên</label>
              <input type="text" name="fullName" value="${profile?.name || ""}" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" required />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-label-md font-semibold text-on-surface">Email liên hệ</label>
              <input type="email" name="email" value="${profile?.email || ""}" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" placeholder="example@gmail.com" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-label-md font-semibold text-on-surface">Số điện thoại</label>
              <input type="tel" name="phone" value="${profile?.phone || ""}" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" placeholder="09xx xxx xxx" />
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-outline-variant/30">
            <button type="submit" class="w-full sm:w-auto px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
              Lưu thay đổi cá nhân
            </button>
          </div>
        </form>
      </div>

      <!-- Section 2/3: Change Password -->
      <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-8 shadow-sm">
        <div class="flex items-center gap-3 mb-2">
          <span class="material-symbols-outlined text-2xl text-primary">lock</span>
          <h3 class="text-headline-sm font-bold text-on-surface">Đổi mật khẩu</h3>
        </div>
        <p class="text-body-md text-on-surface-variant mb-6">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.</p>

        <form id="form-change-password" class="flex flex-col gap-5">
          <div class="flex flex-col gap-1.5">
            <label class="text-label-md font-semibold text-on-surface">Mật khẩu hiện tại</label>
            <div class="relative">
              <input type="password" name="oldPassword" id="input-old-password"
                class="w-full px-4 py-2.5 pr-12 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                placeholder="Nhập mật khẩu hiện tại" required />
              <button type="button" class="toggle-pw-btn absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" data-target="input-old-password">
                <span class="material-symbols-outlined text-xl">visibility_off</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div class="flex flex-col gap-1.5">
              <label class="text-label-md font-semibold text-on-surface">Mật khẩu mới</label>
              <div class="relative">
                <input type="password" name="newPassword" id="input-new-password"
                  class="w-full px-4 py-2.5 pr-12 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                  placeholder="Nhập mật khẩu mới" required minlength="6" />
                <button type="button" class="toggle-pw-btn absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" data-target="input-new-password">
                  <span class="material-symbols-outlined text-xl">visibility_off</span>
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-label-md font-semibold text-on-surface">Xác nhận mật khẩu mới</label>
              <div class="relative">
                <input type="password" name="confirmPassword" id="input-confirm-password"
                  class="w-full px-4 py-2.5 pr-12 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                  placeholder="Nhập lại mật khẩu mới" required minlength="6" />
                <button type="button" class="toggle-pw-btn absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" data-target="input-confirm-password">
                  <span class="material-symbols-outlined text-xl">visibility_off</span>
                </button>
              </div>
            </div>
          </div>

          <p id="pw-error-msg" class="text-sm text-error hidden"></p>

          <div class="flex justify-end pt-4 border-t border-outline-variant/30">
            <button type="submit" id="btn-change-password" class="w-full sm:w-auto px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-lg">key</span>
              Đổi mật khẩu
            </button>
          </div>
        </form>
      </div>

    </div>
  `;

  container.innerHTML = html;

  // ── Organization Settings Form Event Bindings ──
  const orgForm = container.querySelector("#form-org-settings");
  if (orgForm) {
    // Helper to reset error styling
    const clearOrgInlineErrors = () => {
      orgForm.querySelectorAll(".error-inline").forEach(el => {
        el.textContent = "";
        el.classList.add("hidden");
      });
      orgForm.querySelectorAll("input, textarea").forEach(el => {
        el.classList.remove("border-error", "bg-error/5");
      });
      orgForm.querySelector("#gps-coord-container")?.classList.remove("border", "border-error", "bg-error/5", "p-2");
      orgForm.querySelector("#accepted-types-container")?.classList.remove("border", "border-error", "bg-error/5", "p-2");
    };

    // Live clear inline errors when user types
    orgForm.querySelectorAll("input, textarea").forEach(input => {
      input.addEventListener("input", () => {
        input.classList.remove("border-error", "bg-error/5");
        const err = input.parentElement?.querySelector(".error-inline");
        if (err) {
          err.textContent = "";
          err.classList.add("hidden");
        }
      });
    });

    // Dynamic preview logo before saving with verification status badge
    const inputAvtOrg = orgForm.querySelector("input[name='avtOrg']");
    const imgAvtPreview = orgForm.querySelector("#preview-org-logo");
    const logoStatusBadge = orgForm.querySelector("#logo-status-badge");
    const btnPreviewLogo = orgForm.querySelector("#btn-preview-logo");

    const verifyAndPreviewLogo = (url) => {
      if (!url) {
        if (imgAvtPreview) imgAvtPreview.src = 'https://ui-avatars.com/api/?name=ORG&background=006B2C&color=fff';
        if (logoStatusBadge) {
          logoStatusBadge.className = "inline-flex items-center gap-1 text-[11px] font-bold text-on-surface-variant bg-surface-variant border border-outline-variant/30 px-2.5 py-0.5 rounded-full";
          logoStatusBadge.innerHTML = `<span class="material-symbols-outlined text-xs">image</span> Logo mặc định`;
        }
        return;
      }

      if (imgAvtPreview) {
        const testImg = new Image();
        testImg.onload = () => {
          imgAvtPreview.src = url;
          if (logoStatusBadge) {
            logoStatusBadge.className = "inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs";
            logoStatusBadge.innerHTML = `<span class="material-symbols-outlined text-xs">check_circle</span> Logo hợp lệ`;
          }
        };
        testImg.onerror = () => {
          imgAvtPreview.src = 'https://ui-avatars.com/api/?name=ORG&background=006B2C&color=fff';
          if (logoStatusBadge) {
            logoStatusBadge.className = "inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full shadow-2xs";
            logoStatusBadge.innerHTML = `<span class="material-symbols-outlined text-xs">warning</span> Không tải được ảnh`;
          }
          showToast("Không thể tải ảnh từ URL logo này. Vui lòng kiểm tra lại đường dẫn!", "warning");
        };
        testImg.src = url;
      }
    };

    if (inputAvtOrg) {
      inputAvtOrg.addEventListener("change", () => verifyAndPreviewLogo(inputAvtOrg.value.trim()));
      btnPreviewLogo?.addEventListener("click", () => verifyAndPreviewLogo(inputAvtOrg.value.trim()));
    }

    // Interactive checkbox chips styling when toggled & error clearing
    const acceptedTypesContainer = orgForm.querySelector("#accepted-types-container");
    orgForm.querySelectorAll("input[name='acceptedTypeCheckbox']").forEach(chk => {
      chk.addEventListener("change", () => {
        const parentLabel = chk.closest("label");
        if (chk.checked) {
          parentLabel.className = "flex items-center gap-2.5 p-3 rounded-xl border border-primary bg-primary/5 text-primary font-semibold hover:border-primary transition-colors cursor-pointer text-sm";
        } else {
          parentLabel.className = "flex items-center gap-2.5 p-3 rounded-xl border border-outline-variant bg-surface text-on-surface hover:border-primary transition-colors cursor-pointer text-sm";
        }
        acceptedTypesContainer?.classList.remove("border", "border-error", "bg-error/5", "p-2");
        const err = acceptedTypesContainer?.parentElement?.querySelector(".error-inline");
        if (err) {
          err.textContent = "";
          err.classList.add("hidden");
        }
      });
    });

    // GPS location picker
    const btnGps = orgForm.querySelector("#btn-get-gps");
    const gpsContainer = orgForm.querySelector("#gps-coord-container");
    if (btnGps) {
      btnGps.addEventListener("click", () => {
        if (!navigator.geolocation) {
          showToast("Trình duyệt của bạn không hỗ trợ định vị GPS.", "error");
          return;
        }
        btnGps.disabled = true;
        btnGps.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> Đang định vị...`;
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const inputLat = orgForm.querySelector("input[name='latitude']");
            const inputLng = orgForm.querySelector("input[name='longitude']");
            if (inputLat) inputLat.value = pos.coords.latitude.toFixed(8);
            if (inputLng) inputLng.value = pos.coords.longitude.toFixed(8);
            gpsContainer?.classList.remove("border", "border-error", "bg-error/5", "p-2");
            const err = gpsContainer?.parentElement?.querySelector(".error-inline");
            if (err) {
              err.textContent = "";
              err.classList.add("hidden");
            }
            showToast("Đã lấy chính xác tọa độ GPS hiện tại!", "success");
            btnGps.disabled = false;
            btnGps.innerHTML = `<span class="material-symbols-outlined text-sm">my_location</span> Lấy tọa độ GPS hiện tại`;
          },
          (err) => {
            showToast("Không thể lấy tọa độ GPS: " + err.message, "error");
            btnGps.disabled = false;
            btnGps.innerHTML = `<span class="material-symbols-outlined text-sm">my_location</span> Lấy tọa độ GPS hiện tại`;
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    }

    // Handle org form submission with strict required field validation
    orgForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearOrgInlineErrors();

      let firstErrorEl = null;
      const showFieldError = (name, msg) => {
        const input = orgForm.querySelector(`[name='${name}']`);
        if (input) {
          input.classList.add("border-error", "bg-error/5");
          if (!firstErrorEl) firstErrorEl = input;
          const errEl = input.parentElement?.querySelector(".error-inline");
          if (errEl) {
            errEl.textContent = msg;
            errEl.classList.remove("hidden");
          }
        }
      };

      const formData = new FormData(orgForm);
      const orgNameVal = formData.get("orgName")?.trim() || "";
      const descriptionVal = formData.get("description")?.trim() || "";
      const addressVal = formData.get("address")?.trim() || "";
      const latVal = formData.get("latitude")?.trim();
      const lngVal = formData.get("longitude")?.trim();

      const checkedBoxes = Array.from(orgForm.querySelectorAll("input[name='acceptedTypeCheckbox']:checked")).map(cb => cb.value.trim()).filter(Boolean);
      const customTypesRaw = formData.get("customAcceptedTypes") || "";
      const customTypes = customTypesRaw.split(",").map(t => t.trim()).filter(Boolean);
      const acceptedTypes = [...new Set([...checkedBoxes, ...customTypes])];

      let hasError = false;

      if (!orgNameVal) {
        showFieldError("orgName", "Tên tổ chức / Đơn vị từ thiện không được để trống!");
        hasError = true;
      } else if (orgNameVal.length < 3) {
        showFieldError("orgName", "Tên tổ chức phải có ít nhất 3 ký tự!");
        hasError = true;
      }

      if (!descriptionVal) {
        showFieldError("description", "Mô tả giới thiệu & Sứ mệnh không được để trống!");
        hasError = true;
      } else if (descriptionVal.length < 15) {
        showFieldError("description", "Mô tả giới thiệu phải có ít nhất 15 ký tự!");
        hasError = true;
      }

      if (!addressVal) {
        showFieldError("address", "Địa chỉ Trụ sở không được để trống!");
        hasError = true;
      } else if (addressVal.length < 5) {
        showFieldError("address", "Địa chỉ Trụ sở phải có ít nhất 5 ký tự!");
        hasError = true;
      }

      if (latVal === "" || isNaN(Number(latVal)) || lngVal === "" || isNaN(Number(lngVal))) {
        gpsContainer?.classList.add("border", "border-error", "bg-error/5", "p-2");
        const err = gpsContainer?.parentElement?.querySelector(".error-inline");
        if (err) {
          err.textContent = "Vui lòng nhập cả Vĩ độ (Latitude) và Kinh độ (Longitude) hợp lệ!";
          err.classList.remove("hidden");
        }
        if (!firstErrorEl) firstErrorEl = orgForm.querySelector("input[name='latitude']");
        hasError = true;
      }

      if (acceptedTypes.length === 0) {
        acceptedTypesContainer?.classList.add("border", "border-error", "bg-error/5", "p-2");
        const err = acceptedTypesContainer?.parentElement?.querySelector(".error-inline");
        if (err) {
          err.textContent = "Vui lòng tích chọn hoặc nhập ít nhất 1 danh mục vật phẩm tiếp nhận quyên góp!";
          err.classList.remove("hidden");
        }
        if (!firstErrorEl) firstErrorEl = acceptedTypesContainer;
        hasError = true;
      }

      if (hasError) {
        if (firstErrorEl) firstErrorEl.focus();
        showToast("Vui lòng kiểm tra và điền đầy đủ thông tin bắt buộc cho hồ sơ tổ chức!", "warning");
        return;
      }

      const submitBtn = orgForm.querySelector("button[type='submit']");
      const originalText = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="material-symbols-outlined text-lg animate-spin">progress_activity</span> Đang lưu...`;
      }

      const docsRaw = formData.get("verificationDocsText") || "";
      const verificationDocs = docsRaw.split(/\r?\n|,/).map(d => d.trim()).filter(Boolean);

      const payload = {
        orgName: orgNameVal,
        avtOrg: formData.get("avtOrg")?.trim() || orgDetail?.avtOrg || "",
        description: descriptionVal,
        address: addressVal,
        websiteUrl: formData.get("websiteUrl")?.trim() || orgDetail?.websiteUrl || "",
        latitude: Number(latVal),
        longitude: Number(lngVal),
        acceptedTypes: acceptedTypes,
        verificationDocs: verificationDocs.length > 0 ? verificationDocs : (orgDetail?.verificationDocs || []),
      };

      try {
        if (orgDetail && orgDetail.id) {
          await updateOrganizationDetailApi(orgDetail.id, payload);
          showToast("Cập nhật hồ sơ tổ chức thành công! Dữ liệu đã được đồng bộ.", "success");
        } else {
          await createOrganizationDetailApi(payload);
          showToast("Khởi tạo hồ sơ tổ chức thành công!", "success");
        }
        
        const newStatus = (!orgDetail || String(orgDetail.status).toUpperCase() === "REJECTED") ? "PENDING" : orgDetail.status;
        if (profile?.id) {
          localStorage.setItem("org_custom_fields_" + profile.id, JSON.stringify({
            avtOrg: payload.avtOrg,
            acceptedTypes: payload.acceptedTypes,
            verificationDocs: payload.verificationDocs,
            status: newStatus
          }));
        }
        if (orgDetail && String(orgDetail.status).toUpperCase() === "REJECTED") {
          orgDetail.status = "PENDING";
        }
        if (onRefresh) {
          onRefresh("settings");
          setTimeout(() => onRefresh("settings"), 600);
        }
      } catch (err) {
        showToast("Lỗi khi lưu hồ sơ tổ chức: " + err.message, "error");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  }

  // ── Profile Settings Form (User Account) ──
  const form = container.querySelector("#form-profile-settings");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Đang lưu...";

    const formData = new FormData(form);
    const payload = {
      username: formData.get("username")?.trim() || profile?.username,
      fullName: formData.get("fullName")?.trim() || profile?.name,
      email: formData.get("email")?.trim() || profile?.email,
      phone: formData.get("phone")?.trim() || profile?.phone,
    };

    try {
      await updateUserProfile(profile.id, payload);
      showToast("Cập nhật thông tin cá nhân thành công!", "success");
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast("Lỗi khi lưu thông tin: " + err.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Lưu thay đổi cá nhân";
    }
  });

  // ── Change Password Form ──
  const pwForm = container.querySelector("#form-change-password");
  const pwErrorMsg = container.querySelector("#pw-error-msg");

  pwForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    pwErrorMsg.classList.add("hidden");
    pwErrorMsg.textContent = "";

    const formData = new FormData(pwForm);
    const oldPassword = formData.get("oldPassword")?.trim();
    const newPassword = formData.get("newPassword")?.trim();
    const confirmPassword = formData.get("confirmPassword")?.trim();

    if (!oldPassword || !newPassword || !confirmPassword) {
      pwErrorMsg.textContent = "Vui lòng điền đầy đủ các trường mật khẩu.";
      pwErrorMsg.classList.remove("hidden");
      return;
    }

    if (newPassword.length < 6) {
      pwErrorMsg.textContent = "Mật khẩu mới phải có ít nhất 6 ký tự.";
      pwErrorMsg.classList.remove("hidden");
      return;
    }

    if (newPassword !== confirmPassword) {
      pwErrorMsg.textContent = "Mật khẩu mới và xác nhận không khớp.";
      pwErrorMsg.classList.remove("hidden");
      return;
    }

    if (oldPassword === newPassword) {
      pwErrorMsg.textContent = "Mật khẩu mới phải khác mật khẩu hiện tại.";
      pwErrorMsg.classList.remove("hidden");
      return;
    }

    const submitBtn = container.querySelector("#btn-change-password");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="material-symbols-outlined text-lg animate-spin">progress_activity</span> Đang xử lý...`;

    try {
      await changePassword(oldPassword, newPassword, confirmPassword);
      showToast("Đổi mật khẩu thành công!", "success");
      pwForm.reset();
    } catch (err) {
      const msg = err.message || "Không thể đổi mật khẩu. Vui lòng thử lại.";
      pwErrorMsg.textContent = msg;
      pwErrorMsg.classList.remove("hidden");
      showToast("Đổi mật khẩu thất bại: " + msg, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span class="material-symbols-outlined text-lg">key</span> Đổi mật khẩu`;
    }
  });

  // ── Toggle Password Visibility ──
  container.querySelectorAll(".toggle-pw-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = container.querySelector(`#${targetId}`);
      if (!input) return;
      const icon = btn.querySelector(".material-symbols-outlined");
      if (input.type === "password") {
        input.type = "text";
        icon.textContent = "visibility";
      } else {
        input.type = "password";
        icon.textContent = "visibility_off";
      }
    });
  });
}
