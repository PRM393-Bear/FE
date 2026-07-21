import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { registerApi, sendRegisterOtp, verifyRegisterOtp } from "../services/auth.service.js";
import {
  validateFullName,
  validateUsername,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  validateOtp,
} from "../utils/validators.js";
import { showToast } from "../utils/ui.js";
import {
  ICON_ECO, ICON_VERIFIED, ICON_USER, ICON_MAIL, ICON_PHONE,
  ICON_LOCK, ICON_SHIELD, ICON_EYE, ICON_EYE_OFF,
  ICON_ARROW_FWD, ICON_GOOGLE, ICON_FACEBOOK
} from "../components/icons.js";

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = form, 2 = otp
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: "",
    otp: ""
  });

  const [otp, setOtp] = useState("");
  const [passVisible, setPassVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error on change
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (field) => {
    let err = "";
    switch(field) {
      case 'fullName': err = validateFullName(formData.fullName); break;
      case 'username': err = validateUsername(formData.username); break;
      case 'email': err = validateEmail(formData.email); break;
      case 'phone': err = validatePhone(formData.phone); break;
      case 'password': err = validatePassword(formData.password); break;
      case 'confirmPassword': err = validateConfirmPassword(formData.confirmPassword, formData.password); break;
      default: break;
    }
    if (err) {
      setErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all
    const nameErr = validateFullName(formData.fullName);
    const userErr = validateUsername(formData.username);
    const emailErr = validateEmail(formData.email);
    const phoneErr = validatePhone(formData.phone);
    const passErr = validatePassword(formData.password);
    const confirmErr = validateConfirmPassword(formData.confirmPassword, formData.password);
    const termsErr = formData.terms ? "" : "Vui lòng đồng ý với điều khoản để tiếp tục";

    if (nameErr || userErr || emailErr || phoneErr || passErr || confirmErr || termsErr) {
      setErrors({
        fullName: nameErr || "",
        username: userErr || "",
        email: emailErr || "",
        phone: phoneErr || "",
        password: passErr || "",
        confirmPassword: confirmErr || "",
        terms: termsErr || "",
        otp: ""
      });
      return;
    }

    setLoading(true);
    try {
      await registerApi({
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        roleName: "MEMBER",
      });
      showToast("Đăng ký thành công! Vui lòng xác thực email.", "success");
      setRegisteredEmail(formData.email.trim());
      setStep(2);
    } catch (err) {
      showToast(err.message || "Đăng ký thất bại. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(val);
    setErrors(prev => ({ ...prev, otp: "" }));
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpErr = validateOtp(otp);
    if (otpErr) {
      setErrors(prev => ({ ...prev, otp: otpErr }));
      return;
    }

    setLoading(true);
    try {
      await verifyRegisterOtp(registeredEmail, otp);
      showToast("Xác thực thành công! Đang chuyển hướng...", "success");
      sessionStorage.setItem("ecocycle_new_user", formData.username.trim());
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      showToast(err.message || "Mã OTP không hợp lệ hoặc đã hết hạn", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendRegisterOtp(registeredEmail);
      showToast("Mã OTP mới đã được gửi", "success");
    } catch (err) {
      showToast("Không thể gửi lại OTP. Vui lòng thử lại.", "error");
    }
  };

  const IconRenderer = ({ iconStr }) => (
    <span dangerouslySetInnerHTML={{ __html: iconStr }} className="svg-icon-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
  );

  return (
    <main className="auth-wrapper">
      
      {/* Left Branding Panel */}
      <section className="auth-brand-panel">
        <div className="auth-brand-decor-1"></div>
        <div className="auth-brand-decor-2"></div>
        
        <div className="auth-brand-content" style={{ alignItems: 'flex-start', textAlign: 'left', maxWidth: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--stack-xl)' }}>
            <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: 'var(--rounded-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" dangerouslySetInnerHTML={{ __html: ICON_ECO }}></svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>Lifecycle Marketplace</span>
          </div>
          
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 'var(--stack-md)', maxWidth: '400px', letterSpacing: '-0.02em' }}>
            Mỗi món đồ đều có vòng đời mới
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', color: 'var(--on-primary-container)', opacity: 0.9, maxWidth: '380px', marginBottom: 'var(--stack-xl)' }}>
            Tham gia cộng đồng mua bán, trao đổi bền vững lớn nhất. Kết nối giá trị, sẻ chia yêu thương.
          </p>
          
          <div className="auth-brand-illustration" style={{ margin: '0 auto', width: '100%', maxWidth: '400px' }}>
            <img alt="People sharing a donation box illustration" src="/home-community.jpg"/>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'var(--stack-xl)', color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 500 }}>
            <div style={{ width: '20px', height: '20px' }}><IconRenderer iconStr={ICON_VERIFIED} /></div>
            <span>Hơn 50,000+ thành viên đã tham gia</span>
          </div>
        </div>
      </section>

      {/* Right Form Panel */}
      <section className="auth-form-panel">
        <div className="auth-form-container" style={{ maxWidth: '560px' }}>
          
          <div className="auth-mobile-logo">
            <h1>Lifecycle</h1>
          </div>

          <div className="auth-card" style={{ padding: 'var(--stack-xl) var(--stack-lg)', boxShadow: 'none', background: 'transparent' }}>
            {step === 1 && (
              <>
                <header className="auth-card-header" style={{ marginBottom: 'var(--stack-xl)' }}>
                  <h2 className="auth-card-title" style={{ fontSize: '32px' }}>Tạo tài khoản mới</h2>
                  <p className="auth-card-subtitle">Bắt đầu hành trình bền vững của bạn cùng Lifecycle ngay hôm nay.</p>
                </header>

                <div>
                  <form noValidate onSubmit={handleSubmit}>
                    <div className="auth-form-grid">
                      {/* Full Name */}
                      <div className="auth-form-group auth-col-span-2">
                        <div className="auth-form-label-row">
                          <label className="auth-form-label" htmlFor="reg-name">Họ và tên</label>
                        </div>
                        <div className="input-wrapper">
                          <span className="input-icon-left"><IconRenderer iconStr={ICON_USER} /></span>
                          <input 
                            id="reg-name" 
                            name="fullName" 
                            type="text" 
                            className={`auth-form-input ${errors.fullName ? 'error' : ''}`}
                            placeholder="Nguyễn Văn A" 
                            autoComplete="name" 
                            value={formData.fullName}
                            onChange={handleChange}
                            onBlur={() => handleBlur("fullName")}
                          />
                        </div>
                        <span className={`auth-form-error ${errors.fullName ? 'visible' : ''}`}>{errors.fullName}</span>
                      </div>

                      {/* Username */}
                      <div className="auth-form-group auth-col-span-1">
                        <div className="auth-form-label-row">
                          <label className="auth-form-label" htmlFor="reg-username">Tên đăng nhập</label>
                        </div>
                        <div className="input-wrapper">
                          <span className="input-icon-left"><IconRenderer iconStr={ICON_USER} /></span>
                          <input 
                            id="reg-username" 
                            name="username" 
                            type="text" 
                            className={`auth-form-input ${errors.username ? 'error' : ''}`}
                            placeholder="myuser123" 
                            autoComplete="username" 
                            value={formData.username}
                            onChange={handleChange}
                            onBlur={() => handleBlur("username")}
                          />
                        </div>
                        <span className={`auth-form-error ${errors.username ? 'visible' : ''}`}>{errors.username}</span>
                      </div>

                      {/* Email */}
                      <div className="auth-form-group auth-col-span-1">
                        <div className="auth-form-label-row">
                          <label className="auth-form-label" htmlFor="reg-email">Email</label>
                        </div>
                        <div className="input-wrapper">
                          <span className="input-icon-left"><IconRenderer iconStr={ICON_MAIL} /></span>
                          <input 
                            id="reg-email" 
                            name="email" 
                            type="email" 
                            className={`auth-form-input ${errors.email ? 'error' : ''}`}
                            placeholder="email@example.com" 
                            autoComplete="email" 
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={() => handleBlur("email")}
                          />
                        </div>
                        <span className={`auth-form-error ${errors.email ? 'visible' : ''}`}>{errors.email}</span>
                      </div>

                      {/* Phone */}
                      <div className="auth-form-group auth-col-span-2">
                        <div className="auth-form-label-row">
                          <label className="auth-form-label" htmlFor="reg-phone">Số điện thoại</label>
                        </div>
                        <div className="input-wrapper">
                          <span className="input-icon-left"><IconRenderer iconStr={ICON_PHONE} /></span>
                          <input 
                            id="reg-phone" 
                            name="phone" 
                            type="tel" 
                            className={`auth-form-input ${errors.phone ? 'error' : ''}`}
                            placeholder="0123 456 789" 
                            autoComplete="tel" 
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={() => handleBlur("phone")}
                          />
                        </div>
                        <span className={`auth-form-error ${errors.phone ? 'visible' : ''}`}>{errors.phone}</span>
                      </div>

                      {/* Password */}
                      <div className="auth-form-group auth-col-span-1">
                        <div className="auth-form-label-row">
                          <label className="auth-form-label" htmlFor="reg-password">Mật khẩu</label>
                        </div>
                        <div className="input-wrapper">
                          <span className="input-icon-left"><IconRenderer iconStr={ICON_LOCK} /></span>
                          <input 
                            id="reg-password" 
                            name="password" 
                            type={passVisible ? "text" : "password"} 
                            className={`auth-form-input has-suffix ${errors.password ? 'error' : ''}`} 
                            placeholder="••••••••" 
                            autoComplete="new-password" 
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={() => handleBlur("password")}
                          />
                          <button 
                            type="button" 
                            className="input-icon-right" 
                            onClick={() => setPassVisible(!passVisible)}
                            aria-label="Hiện/ẩn mật khẩu"
                          >
                            <IconRenderer iconStr={passVisible ? ICON_EYE : ICON_EYE_OFF} />
                          </button>
                        </div>
                        <span className={`auth-form-error ${errors.password ? 'visible' : ''}`}>{errors.password}</span>
                      </div>

                      {/* Confirm Password */}
                      <div className="auth-form-group auth-col-span-1">
                        <div className="auth-form-label-row">
                          <label className="auth-form-label" htmlFor="reg-confirm">Xác nhận mật khẩu</label>
                        </div>
                        <div className="input-wrapper">
                          <span className="input-icon-left"><IconRenderer iconStr={ICON_SHIELD} /></span>
                          <input 
                            id="reg-confirm" 
                            name="confirmPassword" 
                            type={confirmVisible ? "text" : "password"} 
                            className={`auth-form-input has-suffix ${errors.confirmPassword ? 'error' : ''}`}
                            placeholder="••••••••" 
                            autoComplete="new-password" 
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={() => handleBlur("confirmPassword")}
                          />
                          <button 
                            type="button" 
                            className="input-icon-right" 
                            onClick={() => setConfirmVisible(!confirmVisible)}
                            aria-label="Hiện/ẩn xác nhận mật khẩu"
                          >
                            <IconRenderer iconStr={confirmVisible ? ICON_EYE : ICON_EYE_OFF} />
                          </button>
                        </div>
                        <span className={`auth-form-error ${errors.confirmPassword ? 'visible' : ''}`}>{errors.confirmPassword}</span>
                      </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="auth-terms-row">
                      <input 
                        type="checkbox" 
                        id="reg-terms" 
                        name="terms"
                        checked={formData.terms}
                        onChange={handleChange}
                      />
                      <label htmlFor="reg-terms" className="auth-terms-text">
                        Tôi đồng ý với <Link to="/terms">Điều khoản sử dụng</Link> và <Link to="/privacy">Chính sách bảo mật</Link> của Lifecycle Marketplace.
                      </label>
                    </div>
                    <span className={`auth-form-error ${errors.terms ? 'visible' : ''}`} style={{ marginTop: '-8px', marginBottom: '16px' }}>{errors.terms}</span>

                    {/* Submit */}
                    <button type="submit" className={`btn-primary ${loading ? 'is-loading' : ''}`} disabled={loading} style={{ marginTop: 0, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                      <span className="btn-text">Đăng ký</span>
                      <IconRenderer iconStr={ICON_ARROW_FWD} />
                    </button>

                    <div style={{ textAlign: 'center', marginTop: 'var(--stack-md)', color: 'var(--on-surface-variant)', fontSize: '16px' }}>
                      Đã có tài khoản? <Link to="/login" className="auth-signup-link" style={{ color: 'var(--secondary)', fontWeight: 700 }}>Đăng nhập</Link>
                    </div>
                  </form>

                  <div className="auth-divider-wrapper">
                    <div className="auth-divider-line"></div>
                    <div className="auth-divider-text">
                      <span style={{ background: 'var(--surface)' }}>Hoặc đăng ký bằng</span>
                    </div>
                  </div>

                  <div className="social-grid">
                    <button type="button" className="btn-social btn-google" onClick={() => showToast("Đăng ký bằng Google sẽ sớm được hỗ trợ", "error")}>
                      <IconRenderer iconStr={ICON_GOOGLE} />
                      <span>Google</span>
                    </button>
                    <button type="button" className="btn-social btn-facebook" onClick={() => showToast("Đăng ký bằng Facebook sẽ sớm được hỗ trợ", "error")}>
                      <IconRenderer iconStr={ICON_FACEBOOK} />
                      <span>Facebook</span>
                    </button>
                  </div>
                </div> 
              </>
            )}
            
            {step === 2 && (
              <div style={{ textAlign: 'center' }}>
                <h2 className="auth-card-title" style={{ fontSize: '28px', marginBottom: '8px' }}>Xác thực Email</h2>
                <p className="auth-card-subtitle" style={{ marginBottom: '24px' }}>Vui lòng nhập mã gồm 6 chữ số đã được gửi đến email <strong style={{ color: 'var(--on-surface)' }}>{registeredEmail}</strong></p>
                
                <form noValidate onSubmit={handleVerifyOtp}>
                  <div className="auth-form-group">
                    <div className="input-wrapper" style={{ justifyContent: 'center' }}>
                      <input 
                        name="otp" 
                        type="text" 
                        className={`auth-form-input ${errors.otp ? 'error' : ''}`}
                        style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '24px', fontWeight: 700, padding: '12px' }} 
                        placeholder="000000" 
                        maxLength="6" 
                        autoComplete="one-time-code"
                        value={otp}
                        onChange={handleOtpChange}
                        onBlur={() => {
                          const err = validateOtp(otp);
                          if (err) setErrors(prev => ({ ...prev, otp: err }));
                        }}
                      />
                    </div>
                    <span className={`auth-form-error ${errors.otp ? 'visible' : ''}`}>{errors.otp}</span>
                  </div>
                  <button type="submit" className={`btn-primary ${loading ? 'is-loading' : ''}`} disabled={loading} style={{ marginTop: '16px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                    <span className="btn-text">Xác thực</span>
                    <IconRenderer iconStr={ICON_ARROW_FWD} />
                  </button>
                </form>
                <div style={{ marginTop: '24px', color: 'var(--on-surface-variant)', fontSize: '14px' }}>
                  Chưa nhận được mã? <button type="button" onClick={handleResendOtp} className="auth-signup-link" style={{ color: 'var(--secondary)', fontWeight: 700, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>Gửi lại</button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </section>
    </main>
  );
}
