/**
 * EcoCycle – Login Page
 * Responsive centered-card layout, synchronized with mobile design.
 */

import '../styles/auth.css';
import { loginApi, isAuthenticated } from '../services/auth.service.js';
import { validateEmail, validatePassword } from '../utils/validators.js';

/* ── SVG Icons ── */
const ICON_LEAF = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2 1-3 8-3 8-3S19 4 17 8Z"/>
</svg>`;

const ICON_EMAIL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
</svg>`;

const ICON_LOCK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
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

const ICON_FACEBOOK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2">
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
  el._timer = setTimeout(() => el.classList.remove('toast--visible'), 3000);
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
export function renderLoginPage(container) {
  // Redirect if already logged in
  if (isAuthenticated()) {
    window.location.hash = '#/dashboard';
    return;
  }

  container.innerHTML = `
    <div class="auth-layout">
      <main class="auth-card" role="main" aria-label="Đăng nhập">

        <!-- Brand -->
        <a href="#/" class="brand-logo" aria-label="EcoCycle trang chủ">
          <span class="brand-logo__icon">${ICON_LEAF}</span>
          <span class="brand-logo__name">EcoCycle</span>
        </a>

        <!-- Heading -->
        <h1 class="auth-title">Tham gia cộng đồng</h1>
        <p class="auth-subtitle">Đăng nhập để tiếp tục hành trình sống xanh cùng chúng tôi.</p>

        <!-- Form -->
        <form id="login-form" novalidate>

          <!-- Email -->
          <div class="form-group">
            <label class="form-label" for="login-email">Địa chỉ Email</label>
            <div class="form-input-wrapper">
              <span class="input-icon">${ICON_EMAIL}</span>
              <input
                id="login-email"
                type="email"
                class="form-input has-icon"
                placeholder="name@company.com"
                autocomplete="email"
                aria-required="true"
                aria-describedby="login-email-error"
              />
            </div>
            <span class="form-error" id="login-email-error" role="alert" aria-live="polite"></span>
          </div>

          <!-- Password -->
          <div class="form-group">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <label class="form-label" for="login-password">Mật khẩu</label>
              <a href="#/forgot-password" class="forgot-link">Quên mật khẩu?</a>
            </div>
            <div class="form-input-wrapper">
              <span class="input-icon">${ICON_LOCK}</span>
              <input
                id="login-password"
                type="password"
                class="form-input has-icon has-suffix"
                placeholder="••••••••"
                autocomplete="current-password"
                aria-required="true"
                aria-describedby="login-password-error"
              />
              <button type="button" class="btn-toggle-password" id="toggle-password" aria-label="Hiện/ẩn mật khẩu">
                ${ICON_EYE_OFF}
              </button>
            </div>
            <span class="form-error" id="login-password-error" role="alert" aria-live="polite"></span>
          </div>

          <!-- Remember me -->
          <div class="form-row-inline">
            <label class="checkbox-label">
              <input type="checkbox" id="login-remember" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
          </div>

          <!-- Submit -->
          <button type="submit" id="login-submit" class="btn btn-primary">
            <span class="btn-spinner" aria-hidden="true"></span>
            <span class="btn-text">Đăng nhập ngay &nbsp;→</span>
          </button>

        </form>

        <!-- Divider -->
        <div class="auth-divider">Hoặc đăng nhập bằng mạng xã hội</div>

        <!-- Social -->
        <div class="social-row">
          <button type="button" class="btn btn-social" id="btn-google" aria-label="Đăng nhập bằng Google">
            ${ICON_GOOGLE}
            <span>Google Account</span>
          </button>
          <button type="button" class="btn btn-social" id="btn-facebook" aria-label="Đăng nhập bằng Facebook">
            ${ICON_FACEBOOK}
            <span>Facebook ID</span>
          </button>
        </div>

        <!-- Register link -->
        <p class="auth-footer-text">
          Bạn là người mới? <a href="#/register"><strong>Tạo tài khoản miễn phí</strong></a>
        </p>

      </main>
    </div>
  `;

  /* ── Bind logic ── */
  const form        = document.getElementById('login-form');
  const emailInput  = document.getElementById('login-email');
  const emailError  = document.getElementById('login-email-error');
  const passInput   = document.getElementById('login-password');
  const passError   = document.getElementById('login-password-error');
  const toggleBtn   = document.getElementById('toggle-password');
  const submitBtn   = document.getElementById('login-submit');
  let passwordVisible = false;

  // Toggle password visibility
  toggleBtn.addEventListener('click', () => {
    passwordVisible = !passwordVisible;
    passInput.type = passwordVisible ? 'text' : 'password';
    toggleBtn.innerHTML = passwordVisible ? ICON_EYE : ICON_EYE_OFF;
  });

  // Real-time validation on blur
  emailInput.addEventListener('blur', () => setFieldError(emailInput, emailError, validateEmail(emailInput.value)));
  passInput.addEventListener('blur',  () => setFieldError(passInput,  passError,  validatePassword(passInput.value)));

  // Social buttons (placeholder)
  document.getElementById('btn-google').addEventListener('click', () =>
    showToast('Đăng nhập bằng Google sẽ sớm được hỗ trợ', 'error'));
  document.getElementById('btn-facebook').addEventListener('click', () =>
    showToast('Đăng nhập bằng Facebook sẽ sớm được hỗ trợ', 'error'));

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailOk = setFieldError(emailInput, emailError, validateEmail(emailInput.value));
    const passOk  = setFieldError(passInput,  passError,  validatePassword(passInput.value));
    if (!emailOk || !passOk) return;

    // Loading state
    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    try {
      await loginApi({
        email:      emailInput.value.trim(),
        password:   passInput.value,
        rememberMe: document.getElementById('login-remember').checked,
      });
      showToast('Đăng nhập thành công! Chào mừng bạn 🌿', 'success');
      setTimeout(() => { window.location.hash = '#/dashboard'; }, 800);
    } catch (err) {
      showToast(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.', 'error');
    } finally {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  });
}
