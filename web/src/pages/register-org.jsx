import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register-org.css";
import { 
  registerApi, 
  loginApi, 
  verifyRegisterOtp, 
  uploadImageApi, 
  createOrganizationDetailApi,
  getUser,
  saveUser
} from "../services/auth.service.js";
import { showToast } from "../utils/ui.js";

export default function RegisterOrg() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Phase 1 Data
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phone: ""
  });

  // Phase 2 Data
  const [otp, setOtp] = useState("");

  // Phase 3 Data
  const [orgData, setOrgData] = useState({
    name: "",
    desc: "",
    address: ""
  });
  const [selectedChips, setSelectedChips] = useState(new Set());
  const [coords, setCoords] = useState({ lat: null, lon: null });
  
  // Images
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  
  const [uploadedDocs, setUploadedDocs] = useState([]); // Array of { url, boxId, label }
  
  // Phase 4
  const [agreed, setAgreed] = useState(false);

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.replace('reg', '').toLowerCase()]: value }));
  };

  const handleOrgChange = (e) => {
    const { id, value } = e.target;
    setOrgData(prev => ({ ...prev, [id.replace('input', '').toLowerCase()]: value }));
  };

  const submitPhase1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerApi({
        username: formData.username,
        password: formData.password,
        fullName: formData.fullname,
        email: formData.email,
        phone: formData.phone,
        roleName: 'ORGANIZATION'
      });
      showToast("Đăng ký thành công, vui lòng kiểm tra email!", "success");
      setCurrentStep(2);
    } catch (error) {
      showToast(error.message || "Đăng ký thất bại", "error");
    } finally {
      setLoading(false);
    }
  };

  const submitPhase2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyRegisterOtp(formData.email, otp);
      await loginApi({
        username: formData.username,
        password: formData.password
      });
      setOrgData(prev => ({ ...prev, name: formData.fullname }));
      showToast("Xác thực và đăng nhập thành công!", "success");
      setCurrentStep(3);
    } catch (error) {
      showToast(error.message || "Xác thực OTP thất bại", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGeocode = async () => {
    const addr = orgData.address.trim();
    if (!addr) {
      showToast('Vui lòng nhập địa chỉ trước khi tìm tọa độ.', 'error');
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        showToast('Đã lấy tọa độ thành công.', 'success');
      } else {
        showToast('Không tìm thấy tọa độ. Vui lòng thử địa chỉ khác.', 'error');
        setCoords({ lat: null, lon: null });
      }
    } catch (err) {
      showToast('Lỗi khi gọi API bản đồ.', 'error');
    }
  };

  const toggleChip = (label) => {
    const newSet = new Set(selectedChips);
    if (newSet.has(label)) {
      newSet.delete(label);
    } else {
      newSet.add(label);
    }
    setSelectedChips(newSet);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDocUpload = async (e, boxId, label) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setLoading(true);
    const newDocs = [];
    for (const file of files) {
      try {
        const url = await uploadImageApi(file);
        newDocs.push({ url, boxId, label });
      } catch (err) {
        showToast("Lỗi tải ảnh: " + err.message, "error");
      }
    }
    setUploadedDocs(prev => [...prev, ...newDocs]);
    e.target.value = '';
    setLoading(false);
  };

  const removeDoc = (url) => {
    setUploadedDocs(prev => prev.filter(d => d.url !== url));
  };

  const submitPhase3 = (e) => {
    e.preventDefault();
    if (!coords.lat || !coords.lon) {
      showToast('Vui lòng nhấn "Tìm tọa độ" để xác định vị trí.', 'error');
      return;
    }
    if (uploadedDocs.length === 0) {
      showToast('Vui lòng tải lên ít nhất 1 giấy tờ xác minh (Hình ảnh).', 'error');
      return;
    }
    setCurrentStep(4);
  };

  const submitPhase4 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let logoUrl = "";
      if (logoFile) {
        logoUrl = await uploadImageApi(logoFile);
      }
      
      const payload = {
        orgName: orgData.name,
        avtOrg: logoUrl,
        description: orgData.desc,
        address: orgData.address,
        latitude: coords.lat,
        longitude: coords.lon,
        acceptedTypes: Array.from(selectedChips),
        verificationDocs: uploadedDocs.map(d => d.url), 
        isVerified: false
      };

      await createOrganizationDetailApi(payload);
      
      const u = getUser();
      if (u) {
        u.status = "pending";
        saveUser(u);
      }

      showToast("Đăng ký hồ sơ Tổ chức thành công!", "success");
      setTimeout(() => {
        navigate("/pending-approval");
      }, 1500);
    } catch (error) {
      showToast(error.message || "Lỗi tạo hồ sơ Tổ chức.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Preview computed values
  const previewNameInitials = orgData.name 
    ? orgData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : "LC";

  const renderStepper = () => (
    <div className="org-stepper-wrapper">
      <div className="org-stepper">
        {[
          { num: 1, text: "Tạo tài khoản" },
          { num: 2, text: "Xác thực Email" },
          { num: 3, text: "Thông tin Tổ chức" },
          { num: 4, text: "Xác nhận" }
        ].map(step => (
          <div key={step.num} className={`org-stepper-item ${step.num < 4 ? 'org-stepper-line' : ''}`}>
            <div className={`org-stepper-circle ${currentStep > step.num ? 'completed' : currentStep === step.num ? 'active' : 'future'}`}>
              {currentStep > step.num ? <span className="material-symbols-outlined">check</span> : step.num}
            </div>
            <span className={`org-stepper-text ${currentStep > step.num ? 'completed' : currentStep === step.num ? 'active' : 'future'}`}>
              {step.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="org-container">
      {renderStepper()}

      <div className="org-grid">
        <section className="org-form-panel">
          
          {/* Phase 1 */}
          <div className={`phase-section ${currentStep === 1 ? 'phase-active' : 'phase-hidden'}`}>
            <header>
              <h1 className="org-title">Đăng ký tài khoản Tổ chức</h1>
              <p className="org-subtitle">Khởi tạo tài khoản đại diện cho tổ chức của bạn trên hệ thống.</p>
            </header>
            <form onSubmit={submitPhase1}>
              <div className="org-form-row">
                <div>
                  <label className="org-label">Tên đăng nhập</label>
                  <input type="text" id="regUsername" required className="org-input" placeholder="user_tochuc" value={formData.username} onChange={handleFormChange} />
                </div>
                <div>
                  <label className="org-label">Mật khẩu</label>
                  <input type="password" id="regPassword" required className="org-input" placeholder="••••••••" value={formData.password} onChange={handleFormChange} />
                </div>
                <div className="org-form-full">
                  <label className="org-label">Tên người đại diện</label>
                  <input type="text" id="regFullName" required className="org-input" placeholder="Ví dụ: Nguyễn Văn A" value={formData.fullname || ''} onChange={handleFormChange} />
                </div>
                <div>
                  <label className="org-label">Email liên hệ</label>
                  <input type="email" id="regEmail" required className="org-input" placeholder="email@tochuc.org" value={formData.email} onChange={handleFormChange} />
                </div>
                <div>
                  <label className="org-label">SĐT liên hệ</label>
                  <input type="tel" id="regPhone" required className="org-input" placeholder="09xx xxx xxx" value={formData.phone} onChange={handleFormChange} />
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid var(--outline-variant)', marginTop: '32px', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={loading} className="org-btn-primary">
                  {loading ? 'Đang xử lý...' : <>Tiếp theo <span className="material-symbols-outlined">arrow_forward</span></>}
                </button>
              </div>
            </form>
          </div>

          {/* Phase 2 */}
          <div className={`phase-section ${currentStep === 2 ? 'phase-active' : 'phase-hidden'}`}>
            <header>
              <h1 className="org-title">Xác thực Email</h1>
              <p className="org-subtitle">Chúng tôi đã gửi mã OTP đến email <strong style={{ color: 'var(--primary)' }}>{formData.email}</strong>. Vui lòng kiểm tra hộp thư.</p>
            </header>
            <form style={{ marginTop: '40px' }} onSubmit={submitPhase2}>
              <div>
                <label className="org-label" style={{ display: 'block', textAlign: 'center', marginBottom: '8px' }}>Nhập mã OTP</label>
                <input 
                  type="text" 
                  required 
                  maxLength="6" 
                  className="org-input" 
                  style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '0.5em', padding: '16px', fontFamily: 'monospace' }} 
                  placeholder="------" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--outline-variant)', marginTop: '32px', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Gửi lại mã</button>
                <button type="submit" disabled={loading} className="org-btn-primary">
                  {loading ? 'Đang xử lý...' : <>Xác thực & Đăng nhập <span className="material-symbols-outlined">check_circle</span></>}
                </button>
              </div>
            </form>
          </div>

          {/* Phase 3 */}
          <div className={`phase-section ${currentStep === 3 ? 'phase-active' : 'phase-hidden'}`}>
            <header>
              <h1 className="org-title">Thông tin Tổ chức</h1>
              <p className="org-subtitle">Vui lòng cung cấp thông tin chính xác để xây dựng niềm tin với cộng đồng.</p>
            </header>
            <form onSubmit={submitPhase3}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                <div className="org-logo-upload" onClick={() => document.getElementById('logoInput').click()}>
                  {!logoPreview && <span className="material-symbols-outlined" style={{ color: 'var(--outline)' }}>add_a_photo</span>}
                  {logoPreview && <img style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} src={logoPreview} alt="Logo" />}
                </div>
                <input type="file" id="logoInput" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleLogoUpload} />
                <div>
                  <p className="org-label">Logo Tổ chức</p>
                  <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>Định dạng JPG, PNG, WEBP. Tối đa 5MB.</p>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label className="org-label">Tên tổ chức</label>
                <input type="text" id="inputName" required className="org-input" placeholder="Ví dụ: Mái ấm Hoa Hồng" value={orgData.name} onChange={handleOrgChange} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="org-label">Mô tả hoạt động</label>
                <textarea id="inputDesc" required rows="4" className="org-textarea" placeholder="Chia sẻ về mục tiêu và các hoạt động thiện nguyện của tổ chức..." value={orgData.desc} onChange={handleOrgChange}></textarea>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="org-label" style={{ display: 'block', marginBottom: '8px' }}>Loại đồ dùng cần nhận</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {["Quần áo người lớn", "Quần áo trẻ em", "Áo khoác / Áo ấm", "Váy đầm", "Đồ đồng phục"].map(chip => (
                    <button 
                      key={chip}
                      type="button" 
                      className={`org-chip ${selectedChips.has(chip) ? 'active' : ''}`}
                      onClick={() => toggleChip(chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="org-label">Địa chỉ hoạt động</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="text" id="inputAddress" required className="org-input" style={{ marginTop: 0 }} placeholder="Số nhà, tên đường, phường/xã..." value={orgData.address} onChange={handleOrgChange} />
                  <button type="button" onClick={handleGeocode} className="org-btn-secondary">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>location_searching</span>
                    Tìm tọa độ
                  </button>
                </div>
                {coords.lat && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontSize: '12px', marginTop: '8px', fontWeight: 500 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span> 
                    Đã lấy tọa độ: <span>{coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}</span>
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '24px', marginTop: '24px', borderTop: '1px solid var(--outline-variant)', paddingTop: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '4px' }}>Giấy tờ xác minh</h1>
                  <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>Vui lòng cung cấp các giấy tờ cần thiết để đảm bảo tính minh bạch và tin cậy trên nền tảng của chúng tôi.</p>
                </div>

                <div style={{ background: 'rgba(0, 107, 44, 0.1)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  <p style={{ fontSize: '14px', color: 'var(--on-surface)', margin: 0, lineHeight: 1.5 }}>Thông tin của bạn được mã hóa, bảo mật tuyệt đối và chỉ sử dụng cho mục đích xác thực danh tính tổ chức.</p>
                </div>

                <div className="org-verification-grid">
                  {[
                    { id: 'cccd', label: 'CCCD Người đại diện', required: true, icon: 'add_a_photo', desc: 'Tải lên mặt trước & mặt sau' },
                    { id: 'license', label: 'Giấy phép hoạt động', required: true, icon: 'description', desc: 'File ảnh rõ nét' },
                    { id: 'hq', label: 'Ảnh trụ sở', required: false, icon: 'home_work', desc: 'Ảnh bảng hiệu, mặt tiền' },
                    { id: 'activity', label: 'Ảnh hoạt động', required: false, icon: 'volunteer_activism', desc: 'Ảnh các chương trình đã thực hiện', tag: 'Khuyến nghị' }
                  ].map(box => {
                    const count = uploadedDocs.filter(d => d.boxId === box.id).length;
                    const lastDoc = uploadedDocs.slice().reverse().find(d => d.boxId === box.id);
                    return (
                      <div className="org-verify-box-wrapper" key={box.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <label className="org-verify-label" style={{ marginBottom: 0 }}>
                            {box.label} {box.required && <span style={{ color: 'var(--error)' }}>*</span>} {!box.required && <span style={{ color: 'var(--on-surface-variant)', fontWeight: 'normal' }}>(Tùy chọn)</span>}
                          </label>
                          {box.tag && <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', fontSize: '10px', padding: '2px 6px', borderRadius: '9999px', fontWeight: 'bold', textTransform: 'uppercase' }}>{box.tag}</span>}
                        </div>
                        <div className={`org-verify-box ${count > 0 ? 'has-files' : ''}`} onClick={() => document.getElementById(`file_${box.id}`).click()}>
                          {count > 0 && lastDoc ? (
                            <img className="org-verify-box-preview" src={lastDoc.url} alt="Preview" />
                          ) : (
                            <>
                              <span className="material-symbols-outlined org-verify-icon">{box.icon}</span>
                              <span className="org-verify-desc">{box.desc}</span>
                            </>
                          )}
                          {count > 0 && <span className="org-verify-box-count" style={{ display: 'block' }}>{count} ảnh</span>}
                          <input type="file" id={`file_${box.id}`} className="org-verify-input" accept="image/jpeg, image/png, image/webp" multiple onChange={(e) => handleDocUpload(e, box.id, box.label)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {uploadedDocs.length > 0 && (
                  <div id="previewContainer" style={{ marginTop: '24px', padding: '16px', background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--on-surface)' }}>Đã tải lên</h3>
                    <div className="org-docs-grid">
                      {uploadedDocs.map(doc => (
                        <div key={doc.url} className="org-doc-item">
                          <img src={doc.url} alt="Doc" />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '4px 8px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {doc.label}
                          </div>
                          <button type="button" className="org-doc-remove" onClick={(e) => { e.stopPropagation(); removeDoc(doc.url); }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--outline-variant)', marginTop: '32px', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={loading} className="org-btn-primary">
                  Tiếp theo
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>

          {/* Phase 4 */}
          <div className={`phase-section ${currentStep === 4 ? 'phase-active' : 'phase-hidden'}`}>
            <header style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--on-surface)' }}>Xác nhận nộp hồ sơ</h2>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginTop: '4px' }}>Vui lòng kiểm tra lại thông tin và xác nhận trước khi gửi yêu cầu xét duyệt.</p>
            </header>
            
            <form onSubmit={submitPhase4}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
                
                <div style={{ background: 'var(--surface-container-lowest)', padding: '24px', borderRadius: '12px', border: '1px solid var(--outline-variant)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)' }}>Kiểm tra thông tin</h3>
                    <button type="button" onClick={() => setCurrentStep(3)} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '14px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span> Chỉnh sửa
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', background: 'var(--surface-container)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {logoPreview ? (
                          <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src={logoPreview} alt="Logo" />
                        ) : (
                          <span style={{ fontSize: '20px', color: 'var(--primary)', fontWeight: 'bold' }}>{previewNameInitials}</span>
                        )}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{orgData.name}</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {Array.from(selectedChips).map(chip => (
                            <span key={chip} style={{ background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500 }}>{chip}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ background: 'var(--surface-container-low)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface)' }}>
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>location_on</span>
                        <span style={{ fontSize: '14px' }}>{orgData.address}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface)' }}>
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>mail</span>
                        <span style={{ fontSize: '14px' }}>{formData.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface)' }}>
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>phone</span>
                        <span style={{ fontSize: '14px' }}>{formData.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--surface-container-lowest)', padding: '24px', borderRadius: '12px', border: '1px solid var(--outline-variant)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '16px' }}>Giấy tờ xác minh</h3>
                  <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {uploadedDocs.map(doc => (
                      <div key={doc.url} style={{ flexShrink: 0, position: 'relative', width: '120px', aspectRatio: '3/4', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--outline-variant)', background: 'var(--surface-container-high)' }}>
                        <img src={doc.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Doc" />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '4px 8px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {doc.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={{ background: 'var(--surface-container-highest)', padding: '24px', borderRadius: '12px', borderTop: '4px solid var(--primary)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '24px' }}>
                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: '4px', width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                    <span style={{ fontSize: '14px', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>Tôi cam kết thông tin cung cấp là chính xác và tổ chức hoạt động hợp pháp theo quy định của pháp luật Việt Nam.</span>
                  </label>
                  
                  <button type="submit" disabled={!agreed || loading} className="org-btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: !agreed || loading ? '0.5' : '1', transition: 'all 0.3s' }}>
                    {loading ? 'Đang xử lý...' : <>Gửi yêu cầu xét duyệt <span className="material-symbols-outlined">send</span></>}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '16px' }}>Thời gian xét duyệt dự kiến: 24h - 48h làm việc.</p>
                </div>

                <div style={{ background: 'var(--surface-container-low)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(121, 116, 126, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706', marginBottom: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>info</span>
                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Lưu ý quan trọng</h4>
                  </div>
                  <ul style={{ fontSize: '14px', color: 'var(--on-surface-variant)', paddingLeft: '20px', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>Hồ sơ sau khi gửi sẽ không thể chỉnh sửa cho đến khi có kết quả xét duyệt.</li>
                    <li>Thông tin sẽ được bảo mật theo Chính sách Quyền riêng tư của hệ thống.</li>
                  </ul>
                </div>
              </div>
            </form>
          </div>

        </section>

        {/* Right Preview Panel */}
        <aside className="org-preview-panel">
          <div className="org-preview-wrapper">
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
              Xem trước hồ sơ
            </h2>
            
            <div className="org-preview-card">
              <div style={{ height: '128px', background: 'rgba(0, 107, 44, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: 'rgba(0, 107, 44, 0.3)', fontSize: '40px' }}>volunteer_activism</span>
              </div>
              <div style={{ padding: '24px', marginTop: '-48px', position: 'relative' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid white', background: 'var(--surface)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {logoPreview ? (
                    <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src={logoPreview} alt="Logo" />
                  ) : (
                    <span style={{ fontSize: '24px', color: 'var(--primary)', fontWeight: 'bold' }}>{previewNameInitials}</span>
                  )}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px', color: 'var(--on-surface)' }}>{orgData.name || "Tên tổ chức của bạn"}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--on-surface-variant)', marginBottom: '16px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                  <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{orgData.address || "Địa chỉ của tổ chức"}</span>
                </div>
                <p style={{ fontSize: '16px', color: 'var(--on-surface-variant)', marginBottom: '24px', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {orgData.desc || '"Phần mô tả về mục tiêu và sứ mệnh cao cả của tổ chức bạn sẽ xuất hiện tại đây..."'}
                </p>
                
                <div style={{ marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--on-surface)', marginBottom: '8px' }}>Đồ dùng nhận hỗ trợ</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedChips.size === 0 ? (
                      <span style={{ background: 'var(--surface-container)', color: 'var(--on-surface-variant)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500 }}>Chưa chọn</span>
                    ) : (
                      Array.from(selectedChips).map(chip => (
                        <span key={chip} style={{ background: 'rgba(0, 107, 44, 0.1)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', border: '1px solid rgba(0, 107, 44, 0.2)' }}>{chip}</span>
                      ))
                    )}
                  </div>
                </div>
                
                <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', marginLeft: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', marginLeft: '-8px' }}>JD</div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', background: 'var(--secondary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', marginLeft: '-8px' }}>MT</div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', background: 'var(--tertiary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', marginLeft: '-8px' }}>3+</div>
                  </div>
                  <button type="button" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Xem chi tiết
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
