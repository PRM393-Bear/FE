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

/* ── SVG Icons ── */
const ICON_ECO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2 1-3 8-3 8-3S19 4 17 8Z"/>
</svg>`;

const ICON_VERIFIED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="m23 12-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-13 5-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
</svg>`;

const ICON_USER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="social-icon">
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
</svg>`;

const ICON_MAIL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="social-icon">
  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>
</svg>`;

const ICON_PHONE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="social-icon">
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
</svg>`;

const ICON_LOCK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="social-icon">
  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
</svg>`;

const ICON_SHIELD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="social-icon">
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M8 11l3 3 5-5"></path>
</svg>`;

const ICON_EYE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="social-icon">
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
</svg>`;

const ICON_EYE_OFF = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="social-icon">
  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
  <line x1="1" y1="1" x2="23" y2="23"/>
</svg>`;

const ICON_ARROW_FWD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="social-icon">
  <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
</svg>`;

const ICON_GOOGLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="social-icon">
  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
</svg>`;

const ICON_FACEBOOK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" class="social-icon">
  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
</svg>`;

/* ── Toast helper ── */
function showToast(message, type = "error") {
  let el = document.getElementById("ecocycle-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "ecocycle-toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = `toast toast--${type}`;
  requestAnimationFrame(() => el.classList.add("toast--visible"));
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("toast--visible"), 3500);
}

/* ── Field validation helper ── */
function setFieldError(inputEl, errorEl, message) {
  if (message) {
    inputEl.classList.add("is-error");
    inputEl.classList.remove("is-valid");
    errorEl.textContent = message;
    errorEl.classList.add("visible");
    return false;
  } else {
    inputEl.classList.remove("is-error");
    inputEl.classList.add("is-valid");
    errorEl.textContent = "";
    errorEl.classList.remove("visible");
    return true;
  }
}

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
