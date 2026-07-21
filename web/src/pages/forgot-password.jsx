import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import {
  isAuthenticated,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPasswordApi,
} from "../services/auth.service.js";
import {
  validateEmail,
  validateOtp,
  validatePassword,
  validateConfirmPassword,
} from "../utils/validators.js";
import { showToast } from "../utils/ui.js";
import { ICON_MAIL, ICON_LOCK, ICON_EYE, ICON_EYE_OFF } from "../components/icons.js";

const ICON_RECYCLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
  <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/>
</svg>`;

const ICON_KEY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" class="social-icon">
  <circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/>
</svg>`;

const ICON_ARROW_BACK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
  <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
</svg>`;

function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 2))}@${domain}`;
}

const IconRenderer = ({ iconStr }) => (
  <span dangerouslySetInnerHTML={{ __html: iconStr }} className="svg-icon-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
);

export default function ForgotPassword() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // Step 2
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Step 3
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassError, setNewPassError] = useState("");
  const [confirmPassError, setConfirmPassError] = useState("");
  const [newPassVisible, setNewPassVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    
    setLoading(true);
    try {
      await sendForgotPasswordOtp(email);
      showToast('Mã OTP đã được gửi đến email của bạn', 'success');
      setStep(2);
    } catch (error) {
      showToast('Không thể gửi OTP. Kiểm tra email và thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    const err = validateOtp(otp);
    if (err) {
      setOtpError(err);
      return;
    }

    setLoading(true);
    try {
      const token = await verifyForgotPasswordOtp(email, otp);
      setResetToken(typeof token === 'string' ? token.trim() : token);
      showToast('Xác nhận OTP thành công', 'success');
      setStep(3);
    } catch (error) {
      showToast('Mã OTP không đúng hoặc đã hết hạn.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendForgotPasswordOtp(email);
      showToast('Mã OTP mới đã được gửi', 'success');
    } catch (error) {
      showToast('Không thể gửi lại OTP. Vui lòng thử lại.', 'error');
    }
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    const newErr = validatePassword(newPassword);
    const confirmErr = validateConfirmPassword(confirmPassword, newPassword);
    
    setNewPassError(newErr || "");
    setConfirmPassError(confirmErr || "");

    if (newErr || confirmErr) return;

    setLoading(true);
    try {
      await resetPasswordApi(resetToken, newPassword, confirmPassword);
      showToast('Đặt lại mật khẩu thành công!', 'success');
      setTimeout(() => { navigate('/login'); }, 1000);
    } catch (error) {
      showToast('Không thể đặt lại mật khẩu. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderBackLink = (href, label) => (
    <div className="auth-forgot-back">
      <Link to={href} className="auth-forgot-back-link">
        <IconRenderer iconStr={ICON_ARROW_BACK} />
        {label}
      </Link>
    </div>
  );

  return (
    <div className="auth-forgot-wrapper">
      <div className="auth-forgot-main">
        <div className="auth-forgot-card">
          <div className="auth-forgot-brand">
            <div className="auth-forgot-logo"><IconRenderer iconStr={ICON_RECYCLE} /></div>
            <h1 className="auth-forgot-brand-name">Lifecycle Marketplace</h1>
          </div>
          
          {step === 1 && (
            <>
              <div className="auth-forgot-heading">
                <h2>Quên mật khẩu?</h2>
                <p>Vui lòng nhập email. Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.</p>
              </div>
              <form onSubmit={handleStep1Submit} className="auth-forgot-form" noValidate>
                <div className="auth-form-group">
                  <label className="auth-form-label" htmlFor="forgot-email">Email</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left"><IconRenderer iconStr={ICON_MAIL} /></span>
                    <input
                      id="forgot-email"
                      type="email"
                      className={`auth-form-input ${emailError ? 'error' : ''}`}
                      placeholder="username@email.com"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      onBlur={() => setEmailError(validateEmail(email) || "")}
                    />
                  </div>
                  <span className={`auth-form-error ${emailError ? 'visible' : ''}`}>{emailError}</span>
                </div>
                <button type="submit" className={`btn-primary ${loading ? 'is-loading' : ''}`} disabled={loading}>
                  <span className="btn-text">Gửi mã OTP</span>
                </button>
              </form>
              {renderBackLink('/login', 'Quay lại đăng nhập')}
            </>
          )}

          {step === 2 && (
            <>
              <div className="auth-forgot-heading">
                <h2>Nhập mã OTP</h2>
                <p>Nhập mã OTP 6 số đã được gửi đến email của bạn.</p>
              </div>
              <p className="auth-forgot-email-hint">Mã đã gửi tới <strong>{maskEmail(email)}</strong></p>
              <form onSubmit={handleStep2Submit} className="auth-forgot-form" noValidate>
                <div className="auth-form-group">
                  <label className="auth-form-label" htmlFor="forgot-otp">Mã OTP</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left"><IconRenderer iconStr={ICON_KEY} /></span>
                    <input
                      id="forgot-otp"
                      type="text"
                      inputMode="numeric"
                      maxLength="6"
                      className={`auth-form-input otp-input has-suffix ${otpError ? 'error' : ''}`}
                      placeholder="000000"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setOtpError("");
                      }}
                      onBlur={() => setOtpError(validateOtp(otp) || "")}
                    />
                  </div>
                  <span className={`auth-form-error ${otpError ? 'visible' : ''}`}>{otpError}</span>
                </div>
                <button type="submit" className={`btn-primary ${loading ? 'is-loading' : ''}`} disabled={loading}>
                  <span className="btn-text">Xác nhận OTP</span>
                </button>
              </form>
              <div className="auth-forgot-resend">
                Chưa nhận được mã?
                <button type="button" onClick={handleResendOtp} disabled={loading}>Gửi lại OTP</button>
              </div>
              {renderBackLink('/login', 'Quay lại đăng nhập')}
            </>
          )}

          {step === 3 && (
            <>
              <div className="auth-forgot-heading">
                <h2>Đặt lại mật khẩu</h2>
                <p>Nhập mật khẩu mới cho tài khoản của bạn.</p>
              </div>
              <form onSubmit={handleStep3Submit} className="auth-forgot-form" noValidate>
                <div className="auth-form-group">
                  <label className="auth-form-label" htmlFor="forgot-new-password">Mật khẩu mới</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left"><IconRenderer iconStr={ICON_LOCK} /></span>
                    <input
                      id="forgot-new-password"
                      type={newPassVisible ? "text" : "password"}
                      className={`auth-form-input has-suffix ${newPassError ? 'error' : ''}`}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setNewPassError("");
                      }}
                      onBlur={() => setNewPassError(validatePassword(newPassword) || "")}
                    />
                    <button type="button" className="input-icon-right" onClick={() => setNewPassVisible(!newPassVisible)} aria-label="Hiện/ẩn mật khẩu">
                      <IconRenderer iconStr={newPassVisible ? ICON_EYE : ICON_EYE_OFF} />
                    </button>
                  </div>
                  <span className={`auth-form-error ${newPassError ? 'visible' : ''}`}>{newPassError}</span>
                </div>
                <div className="auth-form-group">
                  <label className="auth-form-label" htmlFor="forgot-confirm-password">Xác nhận mật khẩu</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left"><IconRenderer iconStr={ICON_LOCK} /></span>
                    <input
                      id="forgot-confirm-password"
                      type={confirmVisible ? "text" : "password"}
                      className={`auth-form-input has-suffix ${confirmPassError ? 'error' : ''}`}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setConfirmPassError("");
                      }}
                      onBlur={() => setConfirmPassError(validateConfirmPassword(confirmPassword, newPassword) || "")}
                    />
                    <button type="button" className="input-icon-right" onClick={() => setConfirmVisible(!confirmVisible)} aria-label="Hiện/ẩn mật khẩu">
                      <IconRenderer iconStr={confirmVisible ? ICON_EYE : ICON_EYE_OFF} />
                    </button>
                  </div>
                  <span className={`auth-form-error ${confirmPassError ? 'visible' : ''}`}>{confirmPassError}</span>
                </div>
                <button type="submit" className={`btn-primary ${loading ? 'is-loading' : ''}`} disabled={loading}>
                  <span className="btn-text">Đặt lại mật khẩu</span>
                </button>
              </form>
              {renderBackLink('/login', 'Quay lại đăng nhập')}
            </>
          )}

        </div>
      </div>
      <footer className="auth-forgot-footer">
        <p>© 2024 Lifecycle Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
}
