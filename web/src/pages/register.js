/**
 * EcoCycle – Register Page
 * Responsive centered-card layout, synchronized with mobile design.
 */

import "../styles/auth.css";
import { registerApi } from "../services/auth.service.js";
import {
  validateFullName,
  validateUsername,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
} from "../utils/validators.js";

import { showToast, setFieldError } from "../utils/ui.js";
import {
  ICON_ECO, ICON_VERIFIED, ICON_USER, ICON_MAIL, ICON_PHONE,
  ICON_LOCK, ICON_SHIELD, ICON_EYE, ICON_EYE_OFF,
  ICON_ARROW_FWD, ICON_GOOGLE, ICON_FACEBOOK
} from "../components/icons.js";

/* ── Render ── */
export function renderRegisterPage(container) {
  container.innerHTML = `
    <main class="auth-wrapper">
      
      <!-- Left Branding Panel -->
      <section class="auth-brand-panel">
        <div class="auth-brand-decor-1"></div>
        <div class="auth-brand-decor-2"></div>
        
        <div class="auth-brand-content" style="align-items: flex-start; text-align: left; max-width: 100%;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: var(--stack-xl);">
            <div style="width: 40px; height: 40px; background: white; border-radius: var(--rounded-md); display: flex; align-items: center; justify-content: center; color: var(--primary);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">${ICON_ECO}</svg>
            </div>
            <span style="font-family: var(--font-display); font-size: 24px; font-weight: 700; color: white; letter-spacing: -0.02em;">Lifecycle Marketplace</span>
          </div>
          
          <h1 style="font-family: var(--font-display); font-size: 48px; font-weight: 700; color: white; line-height: 1.2; margin-bottom: var(--stack-md); max-width: 400px; letter-spacing: -0.02em;">
            Mỗi món đồ đều có vòng đời mới
          </h1>
          <p style="font-family: var(--font-body); font-size: 18px; color: var(--on-primary-container); opacity: 0.9; max-width: 380px; margin-bottom: var(--stack-xl);">
            Tham gia cộng đồng mua bán, trao đổi bền vững lớn nhất. Kết nối giá trị, sẻ chia yêu thương.
          </p>
          
          <div class="auth-brand-illustration" style="margin: 0 auto; width: 100%; max-width: 400px;">
            <img alt="People sharing a donation box illustration" src="https://lh3.googleusercontent.com/aida/AP1WRLtwewqhuiutg-sAzMrjrZMTBUUnQcqojShMdlMu3R9E_Cgbz4D4SHn-r9fG6v1aHoGgG6QKzxmfFvbEqEJaL50wJBpZqNiR6ixNko2MNwYPJOaMg50aiTPlpW8LS82aA8DJ06rzHckrn4vioyFwFywp2wCC2EGNlZ6JrrvBlbVLE2Q0N8_dNeC9tqiSL5kepNSDuQOMHrADhxEnBgn298O_rgnLcdmFe42vYV_H66NjcRSoslyzPNuaUDc"/>
          </div>
          
          <div style="display: flex; align-items: center; gap: 12px; margin-top: var(--stack-xl); color: rgba(255,255,255,0.8); font-size: 14px; font-weight: 500;">
            <div style="width: 20px; height: 20px;">${ICON_VERIFIED}</div>
            <span>Hơn 50,000+ thành viên đã tham gia</span>
          </div>
        </div>
      </section>

      <!-- Right Form Panel -->
      <section class="auth-form-panel">
        <div class="auth-form-container" style="max-width: 560px;">
          
          <!-- Mobile Branding -->
          <div class="auth-mobile-logo">
            <h1>Lifecycle</h1>
          </div>

          <div class="auth-card" style="padding: var(--stack-xl) var(--stack-lg); box-shadow: none; background: transparent;">
            <header class="auth-card-header" style="margin-bottom: var(--stack-xl);">
              <h2 class="auth-card-title" style="font-size: 32px;">Tạo tài khoản mới</h2>
              <p class="auth-card-subtitle">Bắt đầu hành trình bền vững của bạn cùng Lifecycle ngay hôm nay.</p>
            </header>

            <form id="registration-form" novalidate>
              
              <div class="auth-form-grid">
                <!-- Full Name -->
                <div class="auth-form-group auth-col-span-2">
                  <div class="auth-form-label-row">
                    <label class="auth-form-label" for="reg-name">Họ và tên</label>
                  </div>
                  <div class="input-wrapper">
                    <span class="input-icon-left">${ICON_USER}</span>
                    <input id="reg-name" name="full-name" type="text" class="auth-form-input" placeholder="Nguyễn Văn A" autocomplete="name" />
                  </div>
                  <span class="auth-form-error" id="reg-name-error"></span>
                </div>

                <!-- Username -->
                <div class="auth-form-group auth-col-span-1">
                  <div class="auth-form-label-row">
                    <label class="auth-form-label" for="reg-username">Tên đăng nhập</label>
                  </div>
                  <div class="input-wrapper">
                    <span class="input-icon-left">${ICON_USER}</span>
                    <input id="reg-username" name="username" type="text" class="auth-form-input" placeholder="myuser123" autocomplete="username" />
                  </div>
                  <span class="auth-form-error" id="reg-username-error"></span>
                </div>

                <!-- Email -->
                <div class="auth-form-group auth-col-span-1">
                  <div class="auth-form-label-row">
                    <label class="auth-form-label" for="reg-email">Email</label>
                  </div>
                  <div class="input-wrapper">
                    <span class="input-icon-left">${ICON_MAIL}</span>
                    <input id="reg-email" name="email" type="email" class="auth-form-input" placeholder="email@example.com" autocomplete="email" />
                  </div>
                  <span class="auth-form-error" id="reg-email-error"></span>
                </div>

                <!-- Phone -->
                <div class="auth-form-group auth-col-span-2">
                  <div class="auth-form-label-row">
                    <label class="auth-form-label" for="reg-phone">Số điện thoại</label>
                  </div>
                  <div class="input-wrapper">
                    <span class="input-icon-left">${ICON_PHONE}</span>
                    <input id="reg-phone" name="phone" type="tel" class="auth-form-input" placeholder="0123 456 789" autocomplete="tel" />
                  </div>
                  <span class="auth-form-error" id="reg-phone-error"></span>
                </div>

                <!-- Password -->
                <div class="auth-form-group auth-col-span-1">
                  <div class="auth-form-label-row">
                    <label class="auth-form-label" for="reg-password">Mật khẩu</label>
                  </div>
                  <div class="input-wrapper">
                    <span class="input-icon-left">${ICON_LOCK}</span>
                    <input id="reg-password" name="password" type="password" class="auth-form-input has-suffix" placeholder="••••••••" autocomplete="new-password" />
                    <button type="button" class="input-icon-right" id="toggle-password" aria-label="Hiện/ẩn mật khẩu">${ICON_EYE_OFF}</button>
                  </div>
                  <span class="auth-form-error" id="reg-password-error"></span>
                </div>

                <!-- Confirm Password -->
                <div class="auth-form-group auth-col-span-1">
                  <div class="auth-form-label-row">
                    <label class="auth-form-label" for="reg-confirm">Xác nhận mật khẩu</label>
                  </div>
                  <div class="input-wrapper">
                    <span class="input-icon-left">${ICON_SHIELD}</span>
                    <input id="reg-confirm" name="confirm-password" type="password" class="auth-form-input has-suffix" placeholder="••••••••" autocomplete="new-password" />
                    <button type="button" class="input-icon-right" id="toggle-confirm" aria-label="Hiện/ẩn xác nhận mật khẩu">${ICON_EYE_OFF}</button>
                  </div>
                  <span class="auth-form-error" id="reg-confirm-error"></span>
                </div>
              </div>

              <!-- Terms Checkbox -->
              <div class="auth-terms-row">
                <input type="checkbox" id="reg-terms" />
                <label for="reg-terms" class="auth-terms-text">
                  Tôi đồng ý với <a href="#/terms">Điều khoản sử dụng</a> và <a href="#/privacy">Chính sách bảo mật</a> của Lifecycle Marketplace.
                </label>
              </div>
              <span class="auth-form-error" id="reg-terms-error" style="margin-top:-8px; margin-bottom: 16px;"></span>

              <!-- Submit -->
              <button type="submit" id="register-submit" class="btn-primary" style="margin-top: 0; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                <span class="btn-text">Đăng ký</span>
                ${ICON_ARROW_FWD}
              </button>

              <div style="text-align: center; margin-top: var(--stack-md); color: var(--on-surface-variant); font-size: 16px;">
                Đã có tài khoản? <a href="#/login" class="auth-signup-link" style="color: var(--secondary); font-weight: 700;">Đăng nhập</a>
              </div>
            </form>

            <!-- Social Register Divider -->
            <div class="auth-divider-wrapper">
              <div class="auth-divider-line"></div>
              <div class="auth-divider-text">
                <span style="background: var(--surface);">Hoặc đăng ký bằng</span>
              </div>
            </div>

            <!-- Social Buttons -->
            <div class="social-grid">
              <button type="button" class="btn-social btn-google" id="btn-google">
                ${ICON_GOOGLE}
                <span>Google</span>
              </button>
              <button type="button" class="btn-social btn-facebook" id="btn-facebook">
                ${ICON_FACEBOOK}
                <span>Facebook</span>
              </button>
            </div>
            
          </div>
        </div>
      </section>

    </main>
  `;

  /* ── Bind logic ── */
  const form = document.getElementById("registration-form");
  const nameInput = document.getElementById("reg-name");
  const nameError = document.getElementById("reg-name-error");
  const usernameInput = document.getElementById("reg-username");
  const usernameError = document.getElementById("reg-username-error");
  const emailInput = document.getElementById("reg-email");
  const emailError = document.getElementById("reg-email-error");
  const phoneInput = document.getElementById("reg-phone");
  const phoneError = document.getElementById("reg-phone-error");
  const passInput = document.getElementById("reg-password");
  const passError = document.getElementById("reg-password-error");
  const confirmInput = document.getElementById("reg-confirm");
  const confirmError = document.getElementById("reg-confirm-error");
  const termsCheck = document.getElementById("reg-terms");
  const termsError = document.getElementById("reg-terms-error");
  const submitBtn = document.getElementById("register-submit");

  /* ── Password toggles ── */
  let passVisible = false, confirmVisible = false;

  document.getElementById("toggle-password").addEventListener("click", () => {
    passVisible = !passVisible;
    passInput.type = passVisible ? "text" : "password";
    document.getElementById("toggle-password").innerHTML = passVisible ? ICON_EYE : ICON_EYE_OFF;
  });

  document.getElementById("toggle-confirm").addEventListener("click", () => {
    confirmVisible = !confirmVisible;
    confirmInput.type = confirmVisible ? "text" : "password";
    document.getElementById("toggle-confirm").innerHTML = confirmVisible ? ICON_EYE : ICON_EYE_OFF;
  });

  /* ── Real-time validation on blur ── */
  nameInput.addEventListener("blur", () => setFieldError(nameInput, nameError, validateFullName(nameInput.value)));
  usernameInput.addEventListener("blur", () => setFieldError(usernameInput, usernameError, validateUsername(usernameInput.value)));
  emailInput.addEventListener("blur", () => setFieldError(emailInput, emailError, validateEmail(emailInput.value)));
  phoneInput.addEventListener("blur", () => setFieldError(phoneInput, phoneError, validatePhone(phoneInput.value)));
  passInput.addEventListener("blur", () => setFieldError(passInput, passError, validatePassword(passInput.value)));
  confirmInput.addEventListener("blur", () => setFieldError(confirmInput, confirmError, validateConfirmPassword(confirmInput.value, passInput.value)));

  /* ── Social buttons (sidebar) ── */
  document.getElementById("btn-google").addEventListener("click", () => showToast("Đăng ký bằng Google sẽ sớm được hỗ trợ", "error"));
  document.getElementById("btn-facebook").addEventListener("click", () => showToast("Đăng ký bằng Facebook sẽ sớm được hỗ trợ", "error"));

  /* ── Form submit ── */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameOk = setFieldError(nameInput, nameError, validateFullName(nameInput.value));
    const usernameOk = setFieldError(usernameInput, usernameError, validateUsername(usernameInput.value));
    const emailOk = setFieldError(emailInput, emailError, validateEmail(emailInput.value));
    const phoneOk = setFieldError(phoneInput, phoneError, validatePhone(phoneInput.value));
    const passOk = setFieldError(passInput, passError, validatePassword(passInput.value));
    const confirmOk = setFieldError(confirmInput, confirmError, validateConfirmPassword(confirmInput.value, passInput.value));

    // Terms check
    let termsOk = true;
    if (!termsCheck.checked) {
      termsError.textContent = "Vui lòng đồng ý với điều khoản để tiếp tục";
      termsError.classList.add("visible");
      termsOk = false;
    } else {
      termsError.textContent = "";
      termsError.classList.remove("visible");
    }

    if (!nameOk || !usernameOk || !emailOk || !phoneOk || !passOk || !confirmOk || !termsOk) return;

    submitBtn.classList.add("is-loading");
    submitBtn.disabled = true;

    try {
      await registerApi({
        fullName: nameInput.value.trim(),
        username: usernameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        password: passInput.value,
        roleName: "MEMBER",
      });
      showToast("Đăng ký thành công! Chào mừng đến với EcoCycle 🌿", "success");
      sessionStorage.setItem("ecocycle_new_user", nameInput.value.trim());
      setTimeout(() => {
        window.location.hash = "#/profile";
      }, 1000);
    } catch (err) {
      showToast(err.message || "Đăng ký thất bại. Vui lòng thử lại.", "error");
    } finally {
      submitBtn.classList.remove("is-loading");
      submitBtn.disabled = false;
    }
  });
}
