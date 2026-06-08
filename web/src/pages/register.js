/**
 * EcoCycle – Register Page
 * Two-column layout: form (left) + green brand sidebar (right)
 * Synchronized with mobile design and validation rules.
 */

import '../styles/auth.css';
import { registerApi } from '../services/auth.service.js';
import {
  validateFullName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
} from '../utils/validators.js';

/* ── SVG Icons ── */
const ICON_LEAF = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2 1-3 8-3 8-3S19 4 17 8Z"/>
</svg>`;

const ICON_RECYCLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
</svg>`;

const ICON_EYE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
</svg>`;

const ICON_EYE_OFF = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
  <line x1="1" y1="1" x2="23" y2="23"/>
</svg>`;

const ICON_GOOGLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
</svg>`;

const ICON_FACEBOOK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
</svg>`;

/* ── Toast helper ── */
function showToast(message, type = 'error') {
  let el = document.getElementById('ecocycle-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ecocycle-toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = `toast toast--${type}`;
  requestAnimationFrame(() => el.classList.add('toast--visible'));
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('toast--visible'), 3500);
}

/* ── Field validation helper ── */
function setFieldError(inputEl, errorEl, message) {
  if (message) {
    inputEl.classList.add('is-error');
    inputEl.classList.remove('is-valid');
    errorEl.textContent = message;
    errorEl.classList.add('visible');
    return false;
  } else {
    inputEl.classList.remove('is-error');
    inputEl.classList.add('is-valid');
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
    return true;
  }
}

/* ── Render ── */
export function renderRegisterPage(container) {
  container.innerHTML = `
    <div class="auth-layout">
      <main class="auth-card auth-card--wide" role="main" aria-label="Đăng ký tài khoản">

        <!-- LEFT: Form column -->
        <div class="register-form-col">

          <!-- Brand (mobile-only, hidden when sidebar is visible) -->
          <a href="#/" class="brand-logo" style="display:none" id="register-mobile-brand" aria-label="EcoCycle">
            <span class="brand-logo__icon">${ICON_LEAF}</span>
            <span class="brand-logo__name">EcoCycle</span>
          </a>

          <h1 class="auth-title">Bắt đầu hành trình mới</h1>
          <p class="auth-subtitle">Hãy cùng chúng tôi xây dựng cộng đồng thời trang bền vững.</p>

          <form id="register-form" novalidate>

            <!-- Full Name -->
            <div class="form-group">
              <label class="form-label" for="reg-name">Họ và tên</label>
              <div class="form-input-wrapper">
                <input id="reg-name" type="text" class="form-input"
                  placeholder="Nhập tên đầy đủ của bạn"
                  autocomplete="name" aria-required="true"
                  aria-describedby="reg-name-error"/>
              </div>
              <span class="form-error" id="reg-name-error" role="alert" aria-live="polite"></span>
            </div>

            <!-- Email + Phone row -->
            <div class="form-row">
              <div class="form-group form-group--half">
                <label class="form-label" for="reg-email">Email</label>
                <div class="form-input-wrapper">
                  <input id="reg-email" type="email" class="form-input"
                    placeholder="email@vongdoi.com"
                    autocomplete="email" aria-required="true"
                    aria-describedby="reg-email-error"/>
                </div>
                <span class="form-error" id="reg-email-error" role="alert" aria-live="polite"></span>
              </div>
              <div class="form-group form-group--half">
                <label class="form-label" for="reg-phone">Số điện thoại</label>
                <div class="form-input-wrapper">
                  <input id="reg-phone" type="tel" class="form-input"
                    placeholder="09xxxxxxxx"
                    autocomplete="tel" aria-required="true"
                    aria-describedby="reg-phone-error"/>
                </div>
                <span class="form-error" id="reg-phone-error" role="alert" aria-live="polite"></span>
              </div>
            </div>

            <!-- Password + Confirm Password row -->
            <div class="form-row">
              <div class="form-group form-group--half">
                <label class="form-label" for="reg-password">Mật khẩu</label>
                <div class="form-input-wrapper">
                  <input id="reg-password" type="password" class="form-input has-suffix"
                    placeholder="Tối thiểu 8 ký tự"
                    autocomplete="new-password" aria-required="true"
                    aria-describedby="reg-password-error"/>
                  <button type="button" class="btn-toggle-password" id="toggle-password" aria-label="Hiện/ẩn mật khẩu">
                    ${ICON_EYE_OFF}
                  </button>
                </div>
                <span class="form-error" id="reg-password-error" role="alert" aria-live="polite"></span>
              </div>
              <div class="form-group form-group--half">
                <label class="form-label" for="reg-confirm">Xác nhận mật khẩu</label>
                <div class="form-input-wrapper">
                  <input id="reg-confirm" type="password" class="form-input has-suffix"
                    placeholder="Nhập lại mật khẩu"
                    autocomplete="new-password" aria-required="true"
                    aria-describedby="reg-confirm-error"/>
                  <button type="button" class="btn-toggle-password" id="toggle-confirm" aria-label="Hiện/ẩn xác nhận mật khẩu">
                    ${ICON_EYE_OFF}
                  </button>
                </div>
                <span class="form-error" id="reg-confirm-error" role="alert" aria-live="polite"></span>
              </div>
            </div>

            <!-- Terms & Privacy -->
            <div class="terms-row">
              <input type="checkbox" id="reg-terms" aria-required="true"/>
              <span class="terms-text">
                Đồng ý với
                <a href="#/terms" target="_blank">Quy chế hoạt động</a>
                và
                <a href="#/privacy" target="_blank">Chính sách bảo mật</a>
                của EcoCycle.
              </span>
            </div>
            <span class="form-error" id="reg-terms-error" role="alert" aria-live="polite" style="margin-top:-16px;margin-bottom:16px"></span>

            <!-- Submit -->
            <button type="submit" id="register-submit" class="btn btn-primary">
              <span class="btn-spinner" aria-hidden="true"></span>
              <span class="btn-text">Hoàn tất đăng ký</span>
            </button>

          </form>

          <!-- Mobile: login link -->
          <p class="auth-footer-text" id="register-mobile-login-link" style="display:none">
            Đã có tài khoản? <a href="#/login">Đăng nhập</a>
          </p>

        </div>

        <!-- RIGHT: Green brand sidebar -->
        <div class="register-sidebar" aria-hidden="true">

          <div class="sidebar-brand">
            <div class="sidebar-brand__icon">${ICON_LEAF}</div>
            <span class="sidebar-brand__name">EcoCycle</span>
          </div>

          <div class="sidebar-content">
            <div class="sidebar-recycle-icon">${ICON_RECYCLE}</div>
            <p class="sidebar-quote">"Mỗi món đồ đều xứng đáng có một vòng đời mới."</p>
            <p class="sidebar-quote-attr">— Cộng đồng EcoCycle</p>
          </div>

          <div class="sidebar-bottom">
            <p class="sidebar-social-label">Hoặc tiếp tục với</p>
            <div class="sidebar-social-row">
              <button type="button" class="btn-social-sidebar" id="sidebar-google" aria-label="Đăng nhập Google">
                ${ICON_GOOGLE} Google
              </button>
              <button type="button" class="btn-social-sidebar" id="sidebar-facebook" aria-label="Đăng nhập Facebook">
                ${ICON_FACEBOOK} Facebook
              </button>
            </div>
            <p class="sidebar-login-link">
              Đã có tài khoản? <a href="#/login">Đăng nhập</a>
            </p>
          </div>

        </div>

      </main>

      <footer style="margin-top:16px; text-align:center; font-size:12px; color:#6E7B6C; padding:8px 16px;">
        © 2024 EcoCycle Marketplace. Made for a sustainable future.
      </footer>
    </div>
  `;

  /* ── Show mobile brand on small screens ── */
  const mq = window.matchMedia('(max-width: 800px)');
  function handleMQ(e) {
    const show = e.matches;
    document.getElementById('register-mobile-brand').style.display = show ? 'flex' : 'none';
    document.getElementById('register-mobile-login-link').style.display = show ? 'block' : 'none';
  }
  handleMQ(mq);
  mq.addEventListener('change', handleMQ);

  /* ── Elements ── */
  const form        = document.getElementById('register-form');
  const nameInput   = document.getElementById('reg-name');
  const nameError   = document.getElementById('reg-name-error');
  const emailInput  = document.getElementById('reg-email');
  const emailError  = document.getElementById('reg-email-error');
  const phoneInput  = document.getElementById('reg-phone');
  const phoneError  = document.getElementById('reg-phone-error');
  const passInput   = document.getElementById('reg-password');
  const passError   = document.getElementById('reg-password-error');
  const confirmInput= document.getElementById('reg-confirm');
  const confirmError= document.getElementById('reg-confirm-error');
  const termsCheck  = document.getElementById('reg-terms');
  const termsError  = document.getElementById('reg-terms-error');
  const submitBtn   = document.getElementById('register-submit');

  /* ── Password toggles ── */
  let passVisible = false, confirmVisible = false;

  document.getElementById('toggle-password').addEventListener('click', () => {
    passVisible = !passVisible;
    passInput.type = passVisible ? 'text' : 'password';
    document.getElementById('toggle-password').innerHTML = passVisible ? ICON_EYE : ICON_EYE_OFF;
  });

  document.getElementById('toggle-confirm').addEventListener('click', () => {
    confirmVisible = !confirmVisible;
    confirmInput.type = confirmVisible ? 'text' : 'password';
    document.getElementById('toggle-confirm').innerHTML = confirmVisible ? ICON_EYE : ICON_EYE_OFF;
  });

  /* ── Real-time validation on blur ── */
  nameInput.addEventListener('blur',    () => setFieldError(nameInput,    nameError,    validateFullName(nameInput.value)));
  emailInput.addEventListener('blur',   () => setFieldError(emailInput,   emailError,   validateEmail(emailInput.value)));
  phoneInput.addEventListener('blur',   () => setFieldError(phoneInput,   phoneError,   validatePhone(phoneInput.value)));
  passInput.addEventListener('blur',    () => setFieldError(passInput,    passError,    validatePassword(passInput.value)));
  confirmInput.addEventListener('blur', () => setFieldError(confirmInput, confirmError, validateConfirmPassword(confirmInput.value, passInput.value)));

  /* ── Social buttons (sidebar) ── */
  document.getElementById('sidebar-google').addEventListener('click', () =>
    showToast('Đăng nhập bằng Google sẽ sớm được hỗ trợ', 'error'));
  document.getElementById('sidebar-facebook').addEventListener('click', () =>
    showToast('Đăng nhập bằng Facebook sẽ sớm được hỗ trợ', 'error'));

  /* ── Form submit ── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameOk    = setFieldError(nameInput,    nameError,    validateFullName(nameInput.value));
    const emailOk   = setFieldError(emailInput,   emailError,   validateEmail(emailInput.value));
    const phoneOk   = setFieldError(phoneInput,   phoneError,   validatePhone(phoneInput.value));
    const passOk    = setFieldError(passInput,    passError,    validatePassword(passInput.value));
    const confirmOk = setFieldError(confirmInput, confirmError, validateConfirmPassword(confirmInput.value, passInput.value));

    // Terms check
    let termsOk = true;
    if (!termsCheck.checked) {
      termsError.textContent = 'Vui lòng đồng ý với điều khoản để tiếp tục';
      termsError.classList.add('visible');
      termsOk = false;
    } else {
      termsError.textContent = '';
      termsError.classList.remove('visible');
    }

    if (!nameOk || !emailOk || !phoneOk || !passOk || !confirmOk || !termsOk) return;

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    try {
      await registerApi({
        fullName: nameInput.value.trim(),
        email:    emailInput.value.trim(),
        phone:    phoneInput.value.trim(),
        password: passInput.value,
      });
      showToast('Đăng ký thành công! Chào mừng đến với EcoCycle 🌿', 'success');
      setTimeout(() => { window.location.hash = '#/login'; }, 1000);
    } catch (err) {
      showToast(err.message || 'Đăng ký thất bại. Vui lòng thử lại.', 'error');
    } finally {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  });
}
