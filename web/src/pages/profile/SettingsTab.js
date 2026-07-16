/**
 * EcoCycle Web - Profile Settings Tab
 * Renders user form to update profile details, change password, and Organization Detail settings.
 */

import { updateUserProfile, changePassword, getMyOrganizationDetailApi, updateOrganizationDetailApi } from "../../services/profile.service.js";
import { showToast } from "../../utils/ui.js";

const DEFAULT_ACCEPTED_TYPES = [
  "Quần áo",
  "Sách vở & Văn phòng phẩm",
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

    if (status === "APPROVED") {
      statusBannerHtml = `
        <div class="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 mb-6 shadow-2xs">
          <span class="material-symbols-outlined text-2xl flex-shrink-0 text-emerald-600">verified</span>
          <div>
            <p class="font-bold text-sm">Hồ sơ đã được phê duyệt hợp lệ</p>
            <p class="text-xs text-emerald-700 mt-0.5">Tổ chức của bạn có đầy đủ quyền tiếp nhận quyên góp và tổ chức các chiến dịch thiện nguyện.</p>
          </div>
        </div>
      `;
    } else if (status === "REJECTED") {
      statusBannerHtml = `
        <div class="flex items-start gap-3 p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 mb-6 shadow-2xs">
          <span class="material-symbols-outlined text-2xl flex-shrink-0 text-rose-600">error</span>
          <div>
            <p class="font-bold text-sm">Hồ sơ bị từ chối phê duyệt</p>
            <p class="text-xs text-rose-700 mt-0.5"><strong>Lý do từ chối:</strong> ${orgDetail?.reason || orgDetail?.rejectedReason || "Thông tin hoặc tài liệu minh chứng chưa hợp lệ."}</p>
            <p class="text-xs text-rose-700 mt-1">Vui lòng chỉnh sửa lại thông tin và minh chứng bên dưới để xin xét duyệt lại.</p>
          </div>
        </div>
      `;
    } else {
      statusBannerHtml = `
        <div class="flex items-center gap-3 p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 mb-6 shadow-2xs">
          <span class="material-symbols-outlined text-2xl flex-shrink-0 text-amber-600">pending</span>
          <div>
            <p class="font-bold text-sm">Hồ sơ đang chờ thẩm định (PENDING)</p>
            <p class="text-xs text-amber-700 mt-0.5">Hồ sơ của bạn đang được nhân viên (Staff) kiểm duyệt. Vui lòng cập nhật chính xác và đầy đủ các thông tin bên dưới.</p>
          </div>
        </div>
      `;
    }

    const currentAcceptedTypes = Array.isArray(orgDetail?.acceptedTypes) ? orgDetail.acceptedTypes : [];
    const customTypesList = currentAcceptedTypes.filter(t => !DEFAULT_ACCEPTED_TYPES.includes(t));
    const customTypesStr = customTypesList.join(", ");

    const currentDocs = Array.isArray(orgDetail?.verificationDocs) ? orgDetail.verificationDocs.join("\n") : "";

    orgSectionHtml = `
      <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
        <div class="flex items-center justify-between gap-4 mb-2">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-2xl text-primary">domain</span>
            <h3 class="text-headline-sm font-bold text-on-surface">Cài đặt Hồ sơ & Hoạt động Tổ chức</h3>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase bg-primary/10 text-primary">Tổ chức từ thiện</span>
        </div>
        <p class="text-body-md text-on-surface-variant mb-6">Cập nhật thông tin công khai của tổ chức, địa chỉ trụ sở, và danh mục quyên góp cần tiếp nhận.</p>

        ${statusBannerHtml}

        <form id="form-org-settings" class="flex flex-col gap-6">
          <!-- Logo & Tên tổ chức -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-outline-variant/30">
            <img id="preview-org-logo" src="${orgDetail?.avtOrg || profile?.avatar || 'https://ui-avatars.com/api/?name=ORG&background=006B2C&color=fff'}" class="w-24 h-24 rounded-2xl object-cover shadow-sm border border-outline-variant/30 flex-shrink-0 bg-surface-variant" />
            <div class="flex-1 w-full flex flex-col gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-label-md font-semibold text-on-surface">Tên Tổ chức / Đơn vị từ thiện *</label>
                <input type="text" name="orgName" value="${orgDetail?.orgName || profile?.name || ""}" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" placeholder="Nhập tên tổ chức của bạn" required />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-label-md font-semibold text-on-surface">URL Logo / Ảnh đại diện Tổ chức</label>
                <input type="url" name="avtOrg" value="${orgDetail?.avtOrg || ""}" class="px-4 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm" placeholder="https://example.com/logo.png" />
              </div>
            </div>
          </div>

          <!-- Mô tả hoạt động -->
          <div class="flex flex-col gap-1.5">
            <label class="text-label-md font-semibold text-on-surface">Mô tả giới thiệu & Sứ mệnh *</label>
            <textarea name="description" rows="3" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm" placeholder="Giới thiệu về mục tiêu, hoạt động thiện nguyện và đối tượng hỗ trợ của tổ chức..." required>${orgDetail?.description || ""}</textarea>
          </div>

          <!-- Địa chỉ & Website -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="flex flex-col gap-1.5">
              <label class="text-label-md font-semibold text-on-surface">Địa chỉ Trụ sở *</label>
              <input type="text" name="address" value="${orgDetail?.address || ""}" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" required />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-label-md font-semibold text-on-surface">Website hoặc Fanpage chính thức</label>
              <input type="url" name="websiteUrl" value="${orgDetail?.websiteUrl || ""}" class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" placeholder="https://facebook.com/your-org" />
            </div>
          </div>

          <!-- Tọa độ bản đồ -->
          <div class="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col gap-4">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div>
                <label class="text-label-md font-semibold text-on-surface">Tọa độ Bản đồ (Latitude & Longitude) *</label>
                <p class="text-xs text-on-surface-variant">Giúp người quyên góp dễ dàng tìm thấy tổ chức trên bản đồ gần họ.</p>
              </div>
              <button type="button" id="btn-get-gps" class="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs">
                <span class="material-symbols-outlined text-sm">my_location</span> Lấy tọa độ GPS hiện tại
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-on-surface-variant">Vĩ độ (Latitude)</label>
                <input type="number" step="any" name="latitude" value="${orgDetail?.latitude ?? ""}" class="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm" placeholder="Ví dụ: 10.762622" required />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-on-surface-variant">Kinh độ (Longitude)</label>
                <input type="number" step="any" name="longitude" value="${orgDetail?.longitude ?? ""}" class="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm" placeholder="Ví dụ: 106.660172" required />
              </div>
            </div>
          </div>

          <!-- Danh mục tiếp nhận -->
          <div class="flex flex-col gap-2">
            <label class="text-label-md font-semibold text-on-surface">Danh mục Vật phẩm Tiếp nhận quyên góp</label>
            <p class="text-xs text-on-surface-variant mb-1">Chọn các loại vật phẩm mà tổ chức đang có nhu cầu nhận ủng hộ từ cộng đồng:</p>
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
              <input type="text" name="customAcceptedTypes" value="${customTypesStr}" class="px-4 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm" placeholder="Ví dụ: Chăn màn ấm, Xe lăn, Dụng cụ thể thao..." />
            </div>
          </div>

          <!-- Tài liệu minh chứng -->
          <div class="flex flex-col gap-1.5">
            <label class="text-label-md font-semibold text-on-surface">Danh sách link Tài liệu / Giấy tờ minh chứng hợp pháp</label>
            <p class="text-xs text-on-surface-variant">Nhập các đường dẫn URL tài liệu hoặc ảnh chụp giấy phép hoạt động từ thiện (mỗi URL một dòng):</p>
            <textarea name="verificationDocsText" rows="2" class="px-4 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm font-mono" placeholder="https://example.com/giay-phep-hoat-dong.jpg">${currentDocs}</textarea>
          </div>

          <div class="flex justify-end pt-4 border-t border-outline-variant/30">
            <button type="submit" class="px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
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
      <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
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
            <button type="submit" class="px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
              Lưu thay đổi cá nhân
            </button>
          </div>
        </form>
      </div>

      <!-- Section 2/3: Change Password -->
      <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
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
            <button type="submit" id="btn-change-password" class="px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
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
  if (orgForm && orgDetail) {
    // Dynamic preview logo on input change
    const inputAvtOrg = orgForm.querySelector("input[name='avtOrg']");
    const imgAvtPreview = orgForm.querySelector("#preview-org-logo");
    if (inputAvtOrg && imgAvtPreview) {
      inputAvtOrg.addEventListener("input", () => {
        const url = inputAvtOrg.value.trim();
        if (url) imgAvtPreview.src = url;
      });
    }

    // Interactive checkbox chips styling when toggled
    orgForm.querySelectorAll("input[name='acceptedTypeCheckbox']").forEach(chk => {
      chk.addEventListener("change", () => {
        const parentLabel = chk.closest("label");
        if (chk.checked) {
          parentLabel.className = "flex items-center gap-2.5 p-3 rounded-xl border border-primary bg-primary/5 text-primary font-semibold hover:border-primary transition-colors cursor-pointer text-sm";
        } else {
          parentLabel.className = "flex items-center gap-2.5 p-3 rounded-xl border border-outline-variant bg-surface text-on-surface hover:border-primary transition-colors cursor-pointer text-sm";
        }
      });
    });

    // GPS location picker
    const btnGps = orgForm.querySelector("#btn-get-gps");
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

    // Handle org form submission
    orgForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = orgForm.querySelector("button[type='submit']");
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="material-symbols-outlined text-lg animate-spin">progress_activity</span> Đang lưu...`;

      const formData = new FormData(orgForm);

      const checkedBoxes = Array.from(orgForm.querySelectorAll("input[name='acceptedTypeCheckbox']:checked")).map(cb => cb.value.trim()).filter(Boolean);
      const customTypesRaw = formData.get("customAcceptedTypes") || "";
      const customTypes = customTypesRaw.split(",").map(t => t.trim()).filter(Boolean);
      const acceptedTypes = [...new Set([...checkedBoxes, ...customTypes])];

      const docsRaw = formData.get("verificationDocsText") || "";
      const verificationDocs = docsRaw.split(/\r?\n|,/).map(d => d.trim()).filter(Boolean);

      const latVal = formData.get("latitude")?.trim();
      const lngVal = formData.get("longitude")?.trim();

      const payload = {
        orgName: formData.get("orgName")?.trim() || orgDetail.orgName || "",
        avtOrg: formData.get("avtOrg")?.trim() || orgDetail.avtOrg || "",
        description: formData.get("description")?.trim() || orgDetail.description || "",
        address: formData.get("address")?.trim() || orgDetail.address || "",
        websiteUrl: formData.get("websiteUrl")?.trim() || orgDetail.websiteUrl || "",
        latitude: latVal !== "" && !isNaN(Number(latVal)) ? Number(latVal) : null,
        longitude: lngVal !== "" && !isNaN(Number(lngVal)) ? Number(lngVal) : null,
        acceptedTypes: acceptedTypes.length > 0 ? acceptedTypes : (orgDetail.acceptedTypes || []),
        verificationDocs: verificationDocs.length > 0 ? verificationDocs : (orgDetail.verificationDocs || []),
      };

      try {
        await updateOrganizationDetailApi(orgDetail.id, payload);
        const newStatus = String(orgDetail.status).toUpperCase() === "REJECTED" ? "PENDING" : orgDetail.status;
        if (profile?.id) {
          localStorage.setItem("org_custom_fields_" + profile.id, JSON.stringify({
            avtOrg: payload.avtOrg,
            acceptedTypes: payload.acceptedTypes,
            verificationDocs: payload.verificationDocs,
            status: newStatus
          }));
        }
        if (String(orgDetail.status).toUpperCase() === "REJECTED") {
          orgDetail.status = "PENDING";
        }
        showToast("Cập nhật hồ sơ tổ chức thành công! Hồ sơ đã chuyển sang trạng thái chờ thẩm định lại.", "success");
        if (onRefresh) onRefresh();
      } catch (err) {
        showToast("Lỗi khi lưu hồ sơ tổ chức: " + err.message, "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
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
