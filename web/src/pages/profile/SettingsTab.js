/**
 * EcoCycle Web - Profile Settings Tab
 * Renders user form to update profile details.
 */

import { updateUserProfile } from "../../services/profile.service.js";
import { showToast } from "../../utils/ui.js";

export function renderSettingsTab(container, { profile, onRefresh }) {
  const html = `
    <div class="settings-tab max-w-3xl bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
      <h3 class="text-headline-sm font-bold text-on-surface mb-2">Cài đặt Thông tin Tài khoản</h3>
      <p class="text-body-md text-on-surface-variant mb-6">Cập nhật họ tên, địa chỉ email, số điện thoại liên lạc.</p>

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
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  `;

  container.innerHTML = html;

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
      showToast("Cập nhật thông tin thành công!", "success");
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast("Lỗi khi lưu thông tin: " + err.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Lưu thay đổi";
    }
  });
}
