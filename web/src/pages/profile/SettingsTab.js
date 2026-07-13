/**
 * EcoCycle Web - Profile Settings Tab
 * Renders user form to update profile details and change password.
 */

import { updateUserProfile, changePassword } from "../../services/profile.service.js";
import { showToast } from "../../utils/ui.js";

export function renderSettingsTab(container, { profile, onRefresh }) {
  const html = `
    <div class="settings-tab flex flex-col gap-8 max-w-3xl">

      <!-- Section 1: Profile Info -->
      <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
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

      <!-- Section 2: Change Password -->
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

  // ── Profile Settings Form ──
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

    // Client-side validation
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
