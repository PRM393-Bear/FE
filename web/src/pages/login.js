/**
 * EcoCycle – Login Page
 * Responsive centered-card layout, synchronized with mobile design.
 */

import '../styles/auth.css';
import { loginApi, isAuthenticated, getUser } from '../services/auth.service.js';
import { validateUsername, validatePassword } from '../utils/validators.js';

import { showToast, setFieldError } from "../utils/ui.js";
import { ICON_USER, ICON_LOCK, ICON_EYE, ICON_EYE_OFF, ICON_GOOGLE, ICON_FACEBOOK } from "../components/icons.js";

/* ── Render ── */
export function renderLoginPage(container) {
  // Redirect if already logged in
  if (isAuthenticated()) {
    window.location.hash = '#/';
    return;
  }

  container.innerHTML = `
    <main class="auth-wrapper">
      
      <!-- Left Branding Panel -->
      <section class="auth-brand-panel">
        <div class="auth-brand-decor-1"></div>
        <div class="auth-brand-decor-2"></div>
        
        <div class="auth-brand-content">
          <h1 class="auth-brand-title">Lifecycle Marketplace</h1>
          <p class="auth-brand-subtitle">"Mỗi món đồ đều có vòng đời mới"</p>
          
          <div class="auth-brand-illustration">
            <img alt="Virtual Wardrobe Illustration" src="https://lh3.googleusercontent.com/aida/AP1WRLtwewqhuiutg-sAzMrjrZMTBUUnQcqojShMdlMu3R9E_Cgbz4D4SHn-r9fG6v1aHoGgG6QKzxmfFvbEqEJaL50wJBpZqNiR6ixNko2MNwYPJOaMg50aiTPlpW8LS82aA8DJ06rzHckrn4vioyFwFywp2wCC2EGNlZ6JrrvBlbVLE2Q0N8_dNeC9tqiSL5kepNSDuQOMHrADhxEnBgn298O_rgnLcdmFe42vYV_H66NjcRSoslyzPNuaUDc"/>
          </div>
          
          <div class="auth-brand-tagline">
            Tham gia cộng đồng thời trang bền vững để trao đổi, mua bán và tái sinh tủ đồ của bạn.
          </div>
        </div>
      </section>

      <!-- Right Login Form Panel -->
      <section class="auth-form-panel">
        <div class="auth-form-container">
          
          <!-- Mobile Branding -->
          <div class="auth-mobile-logo">
            <h1>Lifecycle</h1>
          </div>

          <div class="auth-card">
            <header class="auth-card-header">
              <h2 class="auth-card-title">Chào mừng trở lại</h2>
              <p class="auth-card-subtitle">Vui lòng đăng nhập để tiếp tục</p>
            </header>

            <form id="login-form" novalidate>
              
              <!-- Username (kept logic but styled like Figma) -->
              <div class="auth-form-group">
                <div class="auth-form-label-row">
                  <label class="auth-form-label" for="login-username">Tên đăng nhập</label>
                </div>
                <div class="input-wrapper">
                  <span class="input-icon-left">${ICON_USER}</span>
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    class="auth-form-input"
                    placeholder="Nhập tên đăng nhập"
                    autocomplete="username"
                    aria-required="true"
                    aria-describedby="login-username-error"
                  />
                </div>
                <span class="auth-form-error" id="login-username-error" role="alert" aria-live="polite"></span>
              </div>

              <!-- Password -->
              <div class="auth-form-group">
                <div class="auth-form-label-row">
                  <label class="auth-form-label" for="login-password">Mật khẩu</label>
                  <a href="#/forgot-password" class="forgot-link">Quên mật khẩu?</a>
                </div>
                <div class="input-wrapper">
                  <span class="input-icon-left">${ICON_LOCK}</span>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    class="auth-form-input has-suffix"
                    placeholder="••••••••"
                    autocomplete="current-password"
                    aria-required="true"
                    aria-describedby="login-password-error"
                  />
                  <button type="button" class="input-icon-right" id="toggle-password" aria-label="Hiện/ẩn mật khẩu">
                    ${ICON_EYE_OFF}
                  </button>
                </div>
                <span class="auth-form-error" id="login-password-error" role="alert" aria-live="polite"></span>
              </div>

              <!-- Remember me -->
              <div class="checkbox-row">
                <input type="checkbox" id="login-remember" />
                <label for="login-remember">Ghi nhớ đăng nhập</label>
              </div>

              <!-- Submit -->
              <button type="submit" id="login-submit" class="btn-primary">
                <span class="btn-text">Đăng nhập</span>
              </button>
            </form>

            <!-- Divider -->
            <div class="auth-divider-wrapper">
              <div class="auth-divider-line"></div>
              <div class="auth-divider-text">
                <span>hoặc đăng nhập với</span>
              </div>
            </div>

            <!-- Social Logins -->
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

            <!-- Sign Up Link -->
            <footer class="auth-card-footer">
              <p>
                Chưa có tài khoản? 
                <a href="#/register" class="auth-signup-link">Đăng ký ngay</a>
              </p>
            </footer>
          </div>

          <!-- Footer Support Links -->
          <div class="auth-support-links">
            <a href="#">Điều khoản</a>
            <a href="#">Bảo mật</a>
            <a href="#">Trợ giúp</a>
          </div>
          
        </div>
      </section>

    </main>
  `;

  /* ── Bind logic ── */
  const form = document.getElementById('login-form');
  const usernameInput = document.getElementById('login-username');
  const usernameError = document.getElementById('login-username-error');
  const passInput = document.getElementById('login-password');
  const passError = document.getElementById('login-password-error');
  const toggleBtn = document.getElementById('toggle-password');
  const submitBtn = document.getElementById('login-submit');
  let passwordVisible = false;

  // Toggle password visibility
  toggleBtn.addEventListener('click', () => {
    passwordVisible = !passwordVisible;
    passInput.type = passwordVisible ? 'text' : 'password';
    toggleBtn.innerHTML = passwordVisible ? ICON_EYE : ICON_EYE_OFF;
  });

  // Real-time validation on blur
  usernameInput.addEventListener('blur', () => setFieldError(usernameInput, usernameError, validateUsername(usernameInput.value)));
  passInput.addEventListener('blur', () => setFieldError(passInput, passError, validatePassword(passInput.value)));

  // Social buttons (placeholder)
  document.getElementById('btn-google').addEventListener('click', () =>
    showToast('Đăng nhập bằng Google sẽ sớm được hỗ trợ', 'error'));
  document.getElementById('btn-facebook').addEventListener('click', () =>
    showToast('Đăng nhập bằng Facebook sẽ sớm được hỗ trợ', 'error'));

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameOk = setFieldError(usernameInput, usernameError, validateUsername(usernameInput.value));
    const passOk = setFieldError(passInput, passError, validatePassword(passInput.value));
    if (!usernameOk || !passOk) return;

    // Loading state
    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    try {
      await loginApi({
        username: usernameInput.value.trim(),
        password: passInput.value,
        rememberMe: document.getElementById('login-remember').checked,
      });
      showToast('Đăng nhập thành công! Chào mừng bạn 🌿', 'success');
      const user = getUser();
      if (user && user.role === 'admin') {
        setTimeout(() => { window.location.hash = '#/admin'; }, 800);
      } else {
        setTimeout(() => { window.location.hash = '#/'; }, 800);
      }
    } catch (err) {
      showToast(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.', 'error');
    } finally {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  });
}
