import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';
import { loginApi } from '../services/auth.service.js';
import { validateUsername, validatePassword } from '../utils/validators.js';
import { showToast, setFieldError } from "../utils/ui.js";
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleBlur = (field) => {
    if (field === 'username') {
      const err = validateUsername(username);
      setErrors(prev => ({ ...prev, username: err }));
    }
    if (field === 'password') {
      const err = validatePassword(password);
      setErrors(prev => ({ ...prev, password: err }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const uErr = validateUsername(username);
    const pErr = validatePassword(password);
    
    setErrors({ username: uErr, password: pErr });
    
    if (uErr || pErr) return;

    setIsLoading(true);

    try {
      await loginApi({
        username: username.trim(),
        password,
        rememberMe: remember,
      });
      refreshAuth();
      showToast('Đăng nhập thành công! Chào mừng bạn 🌿', 'success');
      
      setTimeout(() => { 
        // Let the PrivateRoute handle redirection based on roles when navigating to /
        // Actually, since we want specific redirects:
        const user = JSON.parse(localStorage.getItem('ecocycle_user'));
        if (user && user.role === 'admin') navigate('/admin');
        else if (user && user.role === 'staff') navigate('/staff');
        else if (user && (user.role === 'organization' || user.role === 'org') && user.status === 'pending') navigate('/pending-approval');
        else if (user && (user.role === 'organization' || user.role === 'org') && user.status === 'rejected') {
          showToast('Hồ sơ tổ chức của bạn đã bị từ chối xét duyệt.', 'error');
          navigate('/pending-approval');
        }
        else if (user && (user.role === 'organization' || user.role === 'org')) navigate('/profile');
        else navigate('/');
      }, 800);
    } catch (err) {
      showToast(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-wrapper">
      {/* Left Branding Panel */}
      <section className="auth-brand-panel">
        <div className="auth-brand-decor-1"></div>
        <div className="auth-brand-decor-2"></div>
        
        <div className="auth-brand-content">
          <h1 className="auth-brand-title">Lifecycle Marketplace</h1>
          <p className="auth-brand-subtitle">"Mỗi món đồ đều có vòng đời mới"</p>
          <div className="auth-brand-illustration">
            <img alt="Virtual Wardrobe Illustration" src="/login.png" />
          </div>
          
          <div className="auth-brand-tagline">
            Tham gia cộng đồng thời trang bền vững để trao đổi, mua bán và tái sinh tủ đồ của bạn.
          </div>
        </div>
      </section>

      {/* Right Login Form Panel */}
      <section className="auth-form-panel">
        <div className="auth-form-container">
          
          <div className="auth-mobile-logo">
            <h1>Lifecycle</h1>
          </div>

          <div className="auth-card">
            <header className="auth-card-header">
              <h2 className="auth-card-title">Chào mừng trở lại</h2>
              <p className="auth-card-subtitle">Vui lòng đăng nhập để tiếp tục</p>
            </header>

            <form id="login-form" noValidate onSubmit={handleSubmit}>
              
              <div className="auth-form-group">
                <div className="auth-form-label-row">
                  <label className="auth-form-label" htmlFor="login-username">Tên đăng nhập</label>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <span className="material-symbols-outlined">person</span>
                  </span>
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    className={`auth-form-input ${errors.username ? 'is-invalid' : ''}`}
                    placeholder="Nhập tên đăng nhập"
                    autoComplete="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onBlur={() => handleBlur('username')}
                  />
                </div>
                {errors.username && <span className="auth-form-error" style={{display:'block'}}>{errors.username}</span>}
              </div>

              <div className="auth-form-group">
                <div className="auth-form-label-row">
                  <label className="auth-form-label" htmlFor="login-password">Mật khẩu</label>
                  <Link to="/forgot-password" className="forgot-link">Quên mật khẩu?</Link>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <span className="material-symbols-outlined">lock</span>
                  </span>
                  <input
                    id="login-password"
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    className={`auth-form-input has-suffix ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                  />
                  <button type="button" className="input-icon-right" onClick={() => setPasswordVisible(!passwordVisible)}>
                    <span className="material-symbols-outlined">{passwordVisible ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
                {errors.password && <span className="auth-form-error" style={{display:'block'}}>{errors.password}</span>}
              </div>

              <div className="checkbox-row">
                <input type="checkbox" id="login-remember" checked={remember} onChange={e => setRemember(e.target.checked)} />
                <label htmlFor="login-remember">Ghi nhớ đăng nhập</label>
              </div>

              <button type="submit" className={`btn-primary ${isLoading ? 'is-loading' : ''}`} disabled={isLoading}>
                <span className="btn-text">Đăng nhập</span>
              </button>
            </form>

            <div className="auth-divider-wrapper">
              <div className="auth-divider-line"></div>
              <div className="auth-divider-text">
                <span>hoặc đăng nhập với</span>
              </div>
            </div>

            <div className="social-grid">
              <button type="button" className="btn-social btn-google" onClick={() => showToast('Đăng nhập bằng Google sẽ sớm được hỗ trợ', 'error')}>
                <span className="material-symbols-outlined">g_mobiledata</span>
                <span>Google</span>
              </button>
              <button type="button" className="btn-social btn-facebook" onClick={() => showToast('Đăng nhập bằng Facebook sẽ sớm được hỗ trợ', 'error')}>
                <span className="material-symbols-outlined">facebook</span>
                <span>Facebook</span>
              </button>
            </div>

            <footer className="auth-card-footer">
              <p>
                Chưa có tài khoản? 
                <Link to="/register" className="auth-signup-link">Đăng ký ngay</Link>
              </p>
            </footer>
          </div>

          <div className="auth-support-links">
            <a href="#">Điều khoản</a>
            <a href="#">Bảo mật</a>
            <a href="#">Trợ giúp</a>
          </div>
          
        </div>
      </section>

    </main>
  );
}
