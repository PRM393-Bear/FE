/**
 * EcoCycle – Forgot Password Page
 * 3-step OTP flow: email → OTP → new password
 */

import '../styles/auth.css';
import {
  isAuthenticated,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPasswordApi,
} from '../services/auth.service.js';
import {
  validateEmail,
  validateOtp,
  validatePassword,
  validateConfirmPassword,
} from '../utils/validators.js';

import { showToast, setFieldError } from "../utils/ui.js";
import { ICON_MAIL, ICON_LOCK, ICON_EYE, ICON_EYE_OFF } from "../components/icons.js";

const ICON_RECYCLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/>
</svg>`;

const ICON_KEY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="social-icon">
  <circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/>
</svg>`;

const ICON_ARROW_BACK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
</svg>`;

function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 2))}@${domain}`;
}

function renderShell(contentHtml) {
  return `
    <div class="auth-forgot-wrapper">
      <div class="auth-forgot-main">
        <div class="auth-forgot-card">
          <div class="auth-forgot-brand">
            <div class="auth-forgot-logo">${ICON_RECYCLE}</div>
            <h1 class="auth-forgot-brand-name">Lifecycle Marketplace</h1>
          </div>
          ${contentHtml}
        </div>
      </div>
      <footer class="auth-forgot-footer">
        <p>© 2024 Lifecycle Marketplace. All rights reserved.</p>
      </footer>
    </div>
  `;
}

function renderBackLink(href, label) {
  return `
    <div class="auth-forgot-back">
      <a href="${href}" class="auth-forgot-back-link">
        ${ICON_ARROW_BACK}
        ${label}
      </a>
    </div>
  `;
}

/* ── Step 1: Email ── */
function renderStep1(state, container) {
  container.innerHTML = renderShell(`
    <div class="auth-forgot-heading">
      <h2>Quên mật khẩu?</h2>
      <p>Vui lòng nhập email. Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.</p>
    </div>
    <form id="forgot-step1-form" class="auth-forgot-form" novalidate>
      <div class="auth-form-group">
        <label class="auth-form-label" for="forgot-email">Email</label>
        <div class="input-wrapper">
          <span class="input-icon-left">${ICON_MAIL}</span>
          <input
            id="forgot-email"
            name="email"
            type="email"
            class="auth-form-input"
            placeholder="username@email.com"
            autocomplete="email"
            value="${state.email}"
            aria-required="true"
            aria-describedby="forgot-email-error"
          />
        </div>
        <span class="auth-form-error" id="forgot-email-error" role="alert" aria-live="polite"></span>
      </div>
      <button type="submit" id="forgot-step1-submit" class="btn-primary">
        <span class="btn-text">Gửi mã OTP</span>
      </button>
    </form>
    ${renderBackLink('#/login', 'Quay lại đăng nhập')}
  `);

  const form = document.getElementById('forgot-step1-form');
  const emailInput = document.getElementById('forgot-email');
  const emailError = document.getElementById('forgot-email-error');
  const submitBtn = document.getElementById('forgot-step1-submit');

  emailInput.addEventListener('blur', () =>
    setFieldError(emailInput, emailError, validateEmail(emailInput.value))
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const emailOk = setFieldError(emailInput, emailError, validateEmail(email));
    if (!emailOk) return;

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    try {
      await sendForgotPasswordOtp(email);
      state.email = email;
      state.step = 2;
      showToast('Mã OTP đã được gửi đến email của bạn', 'success');
      renderStep2(state, container);
    } catch (error) {
      showToast('Không thể gửi OTP. Kiểm tra email và thử lại.', 'error');
    } finally {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  });
}

/* ── Step 2: OTP ── */
function renderStep2(state, container) {
  container.innerHTML = renderShell(`
    <div class="auth-forgot-heading">
      <h2>Nhập mã OTP</h2>
      <p>Nhập mã OTP 6 số đã được gửi đến email của bạn.</p>
    </div>
    <p class="auth-forgot-email-hint">Mã đã gửi tới <strong>${maskEmail(state.email)}</strong></p>
    <form id="forgot-step2-form" class="auth-forgot-form" novalidate>
      <div class="auth-form-group">
        <label class="auth-form-label" for="forgot-otp">Mã OTP</label>
        <div class="input-wrapper">
          <span class="input-icon-left">${ICON_KEY}</span>
          <input
            id="forgot-otp"
            name="otp"
            type="text"
            inputmode="numeric"
            maxlength="6"
            class="auth-form-input otp-input has-suffix"
            placeholder="000000"
            autocomplete="one-time-code"
            aria-required="true"
            aria-describedby="forgot-otp-error"
          />
        </div>
        <span class="auth-form-error" id="forgot-otp-error" role="alert" aria-live="polite"></span>
      </div>
      <button type="submit" id="forgot-step2-submit" class="btn-primary">
        <span class="btn-text">Xác nhận OTP</span>
      </button>
    </form>
    <div class="auth-forgot-resend">
      Chưa nhận được mã?
      <button type="button" id="forgot-resend-btn">Gửi lại OTP</button>
    </div>
    ${renderBackLink('#/login', 'Quay lại đăng nhập')}
  `);

  const form = document.getElementById('forgot-step2-form');
  const otpInput = document.getElementById('forgot-otp');
  const otpError = document.getElementById('forgot-otp-error');
  const submitBtn = document.getElementById('forgot-step2-submit');
  const resendBtn = document.getElementById('forgot-resend-btn');

  otpInput.addEventListener('input', () => {
    otpInput.value = otpInput.value.replace(/\D/g, '').slice(0, 6);
  });

  otpInput.addEventListener('blur', () =>
    setFieldError(otpInput, otpError, validateOtp(otpInput.value))
  );

  resendBtn.addEventListener('click', async () => {
    resendBtn.disabled = true;
    try {
      await sendForgotPasswordOtp(state.email);
      showToast('Mã OTP mới đã được gửi', 'success');
    } catch (error) {
      showToast('Không thể gửi lại OTP. Vui lòng thử lại.', 'error');
    } finally {
      resendBtn.disabled = false;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = otpInput.value.trim();
    const otpOk = setFieldError(otpInput, otpError, validateOtp(otp));
    if (!otpOk) return;

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    try {
      const resetToken = await verifyForgotPasswordOtp(state.email, otp);
      state.resetToken = typeof resetToken === 'string' ? resetToken.trim() : resetToken;
      state.step = 3;
      showToast('Xác nhận OTP thành công', 'success');
      renderStep3(state, container);
    } catch (error) {
      showToast('Mã OTP không đúng hoặc đã hết hạn.', 'error');
    } finally {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  });
}

/* ── Step 3: New Password ── */
function renderStep3(state, container) {
  container.innerHTML = renderShell(`
    <div class="auth-forgot-heading">
      <h2>Đặt lại mật khẩu</h2>
      <p>Nhập mật khẩu mới cho tài khoản của bạn.</p>
    </div>
    <form id="forgot-step3-form" class="auth-forgot-form" novalidate>
      <div class="auth-form-group">
        <label class="auth-form-label" for="forgot-new-password">Mật khẩu mới</label>
        <div class="input-wrapper">
          <span class="input-icon-left">${ICON_LOCK}</span>
          <input
            id="forgot-new-password"
            name="newPassword"
            type="password"
            class="auth-form-input has-suffix"
            placeholder="••••••••"
            autocomplete="new-password"
            aria-required="true"
            aria-describedby="forgot-new-password-error"
          />
          <button type="button" class="input-icon-right" id="toggle-new-password" aria-label="Hiện/ẩn mật khẩu">
            ${ICON_EYE_OFF}
          </button>
        </div>
        <span class="auth-form-error" id="forgot-new-password-error" role="alert" aria-live="polite"></span>
      </div>
      <div class="auth-form-group">
        <label class="auth-form-label" for="forgot-confirm-password">Xác nhận mật khẩu</label>
        <div class="input-wrapper">
          <span class="input-icon-left">${ICON_LOCK}</span>
          <input
            id="forgot-confirm-password"
            name="confirmPassword"
            type="password"
            class="auth-form-input has-suffix"
            placeholder="••••••••"
            autocomplete="new-password"
            aria-required="true"
            aria-describedby="forgot-confirm-password-error"
          />
          <button type="button" class="input-icon-right" id="toggle-confirm-password" aria-label="Hiện/ẩn mật khẩu">
            ${ICON_EYE_OFF}
          </button>
        </div>
        <span class="auth-form-error" id="forgot-confirm-password-error" role="alert" aria-live="polite"></span>
      </div>
      <button type="submit" id="forgot-step3-submit" class="btn-primary">
        <span class="btn-text">Đặt lại mật khẩu</span>
      </button>
    </form>
    ${renderBackLink('#/login', 'Quay lại đăng nhập')}
  `);

  const form = document.getElementById('forgot-step3-form');
  const newPassInput = document.getElementById('forgot-new-password');
  const newPassError = document.getElementById('forgot-new-password-error');
  const confirmInput = document.getElementById('forgot-confirm-password');
  const confirmError = document.getElementById('forgot-confirm-password-error');
  const submitBtn = document.getElementById('forgot-step3-submit');
  let newPassVisible = false;
  let confirmVisible = false;

  function bindToggle(btnId, inputEl, getVisible, setVisible) {
    document.getElementById(btnId).addEventListener('click', () => {
      const next = !getVisible();
      setVisible(next);
      inputEl.type = next ? 'text' : 'password';
      document.getElementById(btnId).innerHTML = next ? ICON_EYE : ICON_EYE_OFF;
    });
  }

  bindToggle('toggle-new-password', newPassInput, () => newPassVisible, (v) => { newPassVisible = v; });
  bindToggle('toggle-confirm-password', confirmInput, () => confirmVisible, (v) => { confirmVisible = v; });

  newPassInput.addEventListener('blur', () =>
    setFieldError(newPassInput, newPassError, validatePassword(newPassInput.value))
  );
  confirmInput.addEventListener('blur', () =>
    setFieldError(
      confirmInput,
      confirmError,
      validateConfirmPassword(confirmInput.value, newPassInput.value)
    )
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = newPassInput.value;
    const confirmPassword = confirmInput.value;
    const newOk = setFieldError(newPassInput, newPassError, validatePassword(newPassword));
    const confirmOk = setFieldError(
      confirmInput,
      confirmError,
      validateConfirmPassword(confirmPassword, newPassword)
    );
    if (!newOk || !confirmOk) return;

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    try {
      await resetPasswordApi(state.resetToken, newPassword, confirmPassword);
      showToast('Đặt lại mật khẩu thành công!', 'success');
      setTimeout(() => { window.location.hash = '#/login'; }, 1000);
    } catch (error) {
      showToast('Không thể đặt lại mật khẩu. Vui lòng thử lại.', 'error');
    } finally {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  });
}

/* ── Render entry ── */
export function renderForgotPasswordPage(container) {
  if (isAuthenticated()) {
    window.location.hash = '#/';
    return;
  }

  const state = { step: 1, email: '', resetToken: '' };
  renderStep1(state, container);
}
