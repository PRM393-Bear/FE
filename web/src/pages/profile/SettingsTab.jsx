import React, { useState, useEffect, useRef } from "react";
import { 
  updateUserProfile, 
  changePassword, 
  getMyOrganizationDetailApi, 
  updateOrganizationDetailApi 
} from "../../services/profile.service.js";
import { createOrganizationDetailApi } from "../../services/auth.service.js";
import { showToast } from "../../utils/ui.js";

const DEFAULT_ACCEPTED_TYPES = [
  "Quần áo",
  "Đồ gia dụng",
  "Thiết bị điện tử",
  "Nhu yếu phẩm & Thực phẩm",
  "Đồ chơi trẻ em"
];

export default function SettingsTab({ profile, orgDetail: passedOrgDetail, onRefresh }) {
  const isOrg = profile?.role === "org";

  const [orgDetail, setOrgDetail] = useState(passedOrgDetail || null);
  const [loadingOrg, setLoadingOrg] = useState(isOrg && !passedOrgDetail);
  const [savingOrg, setSavingOrg] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    username: profile?.username || "",
    fullName: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || ""
  });

  // Password Form State
  const [pwForm, setPwForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [pwError, setPwError] = useState("");
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Org Form State
  const [orgForm, setOrgForm] = useState({
    orgName: "",
    avtOrg: "",
    description: "",
    address: "",
    websiteUrl: "",
    latitude: "",
    longitude: "",
    verificationDocsText: "",
    customAcceptedTypes: ""
  });
  const [acceptedTypes, setAcceptedTypes] = useState([]);
  const [logoPreview, setLogoPreview] = useState('https://ui-avatars.com/api/?name=ORG&background=006B2C&color=fff');
  const [logoValid, setLogoValid] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    if (isOrg && !passedOrgDetail) {
      const fetchOrg = async () => {
        try {
          const detail = await getMyOrganizationDetailApi();
          let merged = { ...detail };
          try {
            const cached = JSON.parse(localStorage.getItem("org_custom_fields_" + profile?.id) || "null");
            if (cached) {
              if (!merged.avtOrg && cached.avtOrg) merged.avtOrg = cached.avtOrg;
              if ((!merged.acceptedTypes || merged.acceptedTypes.length === 0) && cached.acceptedTypes) {
                merged.acceptedTypes = cached.acceptedTypes;
              }
              if ((!merged.verificationDocs || merged.verificationDocs.length === 0) && cached.verificationDocs) {
                merged.verificationDocs = cached.verificationDocs;
              }
              if (cached.status && String(merged.status).toUpperCase() === "REJECTED") {
                merged.status = cached.status;
              }
            }
          } catch (e) {}
          setOrgDetail(merged);
        } catch (err) {
          console.warn(err);
        } finally {
          setLoadingOrg(false);
        }
      };
      fetchOrg();
    }
  }, [isOrg, passedOrgDetail, profile?.id]);

  useEffect(() => {
    if (orgDetail) {
      const currentAcceptedTypes = Array.isArray(orgDetail.acceptedTypes) ? orgDetail.acceptedTypes : [];
      const customTypesList = currentAcceptedTypes.filter(t => !DEFAULT_ACCEPTED_TYPES.includes(t));
      
      setOrgForm({
        orgName: orgDetail.orgName || profile?.name || "",
        avtOrg: orgDetail.avtOrg || "",
        description: orgDetail.description || "",
        address: orgDetail.address || "",
        websiteUrl: orgDetail.websiteUrl || "",
        latitude: orgDetail.latitude ?? "",
        longitude: orgDetail.longitude ?? "",
        verificationDocsText: Array.isArray(orgDetail.verificationDocs) ? orgDetail.verificationDocs.join("\n") : "",
        customAcceptedTypes: customTypesList.join(", ")
      });
      setAcceptedTypes(currentAcceptedTypes.filter(t => DEFAULT_ACCEPTED_TYPES.includes(t)));
      
      const avt = orgDetail.avtOrg || profile?.avatar;
      if (avt) {
        verifyAndSetLogo(avt);
      }
    } else if (isOrg) {
      setOrgForm(prev => ({ ...prev, orgName: profile?.name || "" }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgDetail, isOrg, profile]);

  const verifyAndSetLogo = (url) => {
    if (!url) {
      setLogoPreview('https://ui-avatars.com/api/?name=ORG&background=006B2C&color=fff');
      setLogoValid(false);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setLogoPreview(url);
      setLogoValid(true);
    };
    img.onerror = () => {
      setLogoPreview('https://ui-avatars.com/api/?name=ORG&background=006B2C&color=fff');
      setLogoValid(false);
      showToast("Không thể tải ảnh từ URL logo này.", "warning");
    };
    img.src = url;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateUserProfile(profile.id, profileForm);
      showToast("Cập nhật thông tin cá nhân thành công!", "success");
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast("Lỗi khi lưu thông tin: " + err.message, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError("");
    
    if (!pwForm.oldPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError("Vui lòng điền đầy đủ các trường mật khẩu.");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Mật khẩu mới và xác nhận không khớp.");
      return;
    }
    if (pwForm.oldPassword === pwForm.newPassword) {
      setPwError("Mật khẩu mới phải khác mật khẩu hiện tại.");
      return;
    }

    setSavingPw(true);
    try {
      await changePassword(pwForm.oldPassword, pwForm.newPassword, pwForm.confirmPassword);
      showToast("Đổi mật khẩu thành công!", "success");
      setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg = err.message || "Không thể đổi mật khẩu.";
      setPwError(msg);
      showToast("Đổi mật khẩu thất bại: " + msg, "error");
    } finally {
      setSavingPw(false);
    }
  };

  const handleGetGps = () => {
    if (!navigator.geolocation) {
      showToast("Trình duyệt không hỗ trợ định vị GPS.", "error");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrgForm(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(8),
          longitude: pos.coords.longitude.toFixed(8)
        }));
        showToast("Đã lấy chính xác tọa độ GPS!", "success");
        setGpsLoading(false);
      },
      (err) => {
        showToast("Không thể lấy tọa độ: " + err.message, "error");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    const { orgName, description, address, latitude, longitude, customAcceptedTypes } = orgForm;

    if (!orgName || orgName.length < 3) return showToast("Tên tổ chức phải >= 3 ký tự", "warning");
    if (!description || description.length < 15) return showToast("Mô tả phải >= 15 ký tự", "warning");
    if (!address || address.length < 5) return showToast("Địa chỉ phải >= 5 ký tự", "warning");
    if (latitude === "" || isNaN(Number(latitude)) || longitude === "" || isNaN(Number(longitude))) {
      return showToast("Tọa độ không hợp lệ", "warning");
    }

    const customTypes = customAcceptedTypes.split(",").map(t => t.trim()).filter(Boolean);
    const finalAcceptedTypes = [...new Set([...acceptedTypes, ...customTypes])];

    if (finalAcceptedTypes.length === 0) {
      return showToast("Vui lòng chọn hoặc nhập danh mục tiếp nhận", "warning");
    }

    const verificationDocs = orgForm.verificationDocsText.split(/\r?\n|,/).map(d => d.trim()).filter(Boolean);

    const payload = {
      orgName,
      avtOrg: orgForm.avtOrg || orgDetail?.avtOrg || "",
      description,
      address,
      websiteUrl: orgForm.websiteUrl || "",
      latitude: Number(latitude),
      longitude: Number(longitude),
      acceptedTypes: finalAcceptedTypes,
      verificationDocs: verificationDocs.length > 0 ? verificationDocs : (orgDetail?.verificationDocs || [])
    };

    setSavingOrg(true);
    try {
      if (orgDetail && orgDetail.id) {
        await updateOrganizationDetailApi(orgDetail.id, payload);
        showToast("Cập nhật hồ sơ tổ chức thành công!", "success");
      } else {
        await createOrganizationDetailApi(payload);
        showToast("Khởi tạo hồ sơ tổ chức thành công!", "success");
      }

      const newStatus = (!orgDetail || String(orgDetail.status).toUpperCase() === "REJECTED") ? "PENDING" : orgDetail.status;
      if (profile?.id) {
        localStorage.setItem("org_custom_fields_" + profile.id, JSON.stringify({
          avtOrg: payload.avtOrg,
          acceptedTypes: payload.acceptedTypes,
          verificationDocs: payload.verificationDocs,
          status: newStatus
        }));
      }
      
      if (onRefresh) onRefresh("settings");
    } catch (err) {
      showToast("Lỗi khi lưu hồ sơ: " + err.message, "error");
    } finally {
      setSavingOrg(false);
    }
  };

  const renderStatusBanner = () => {
    const status = String(orgDetail?.status || "PENDING").toUpperCase();
    if (!orgDetail || !orgDetail.id) {
      return (
        <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-blue-500/10 border-2 border-indigo-500/30 rounded-2xl text-indigo-900 mb-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0 text-indigo-600">
            <span className="material-symbols-outlined text-3xl">add_business</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-bold text-base text-indigo-900">Chưa có Hồ sơ Tổ chức</h4>
              <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span> EMPTY
              </span>
            </div>
            <p className="text-xs text-indigo-800 mt-1.5 leading-relaxed">Bạn hiện đang có quyền truy cập dành cho Tổ chức nhưng chưa hoàn thiện hồ sơ.</p>
          </div>
        </div>
      );
    }
    if (status === "APPROVED") {
      return (
        <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border-2 border-emerald-500/30 rounded-2xl text-emerald-900 mb-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0 text-emerald-600">
            <span className="material-symbols-outlined text-3xl">verified</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-bold text-base text-emerald-900">Hồ sơ đã được phê duyệt hợp lệ (APPROVED)</h4>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span> APPROVED
              </span>
            </div>
          </div>
        </div>
      );
    }
    if (status === "REJECTED") {
      return (
        <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-red-500/10 border-2 border-rose-500/30 rounded-2xl text-rose-900 mb-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-rose-500/15 flex items-center justify-center flex-shrink-0 text-rose-600">
            <span className="material-symbols-outlined text-3xl">gpp_bad</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-bold text-base text-rose-900">Hồ sơ bị từ chối phê duyệt (REJECTED)</h4>
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">error</span> REJECTED
              </span>
            </div>
            <div className="p-3.5 bg-white/90 rounded-xl border border-rose-200 mt-2 text-rose-800 text-xs font-semibold flex items-start gap-2.5 shadow-2xs">
              <span className="material-symbols-outlined text-base text-rose-600 shrink-0 mt-0.5">info</span>
              <span><strong>Lý do từ chối:</strong> {orgDetail?.reason || orgDetail?.rejectedReason || "Chưa đủ thông tin."}</span>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 border-2 border-amber-500/30 rounded-2xl text-amber-900 mb-6 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0 text-amber-600">
          <span className="material-symbols-outlined text-3xl">pending_actions</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-bold text-base text-amber-900">Hồ sơ đang chờ thẩm định (PENDING)</h4>
            <span className="px-3 py-1 rounded-full bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1 animate-pulse">
              <span className="material-symbols-outlined text-sm">schedule</span> PENDING
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loadingOrg) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 max-w-3xl">
        <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></span>
        <p className="text-body-md text-on-surface-variant font-medium">Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="settings-tab flex flex-col gap-8 max-w-3xl">
      
      {isOrg && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-primary">domain</span>
              <h3 className="text-headline-sm font-bold text-on-surface">Cài đặt Hồ sơ Tổ chức</h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-primary/10 text-primary">Tổ chức từ thiện</span>
          </div>
          <p className="text-body-md text-on-surface-variant mb-6">Cập nhật thông tin công khai của tổ chức.</p>
          
          {renderStatusBanner()}

          <form onSubmit={handleOrgSubmit} className="flex flex-col gap-6" noValidate>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-outline-variant/30">
              <div className="flex flex-col items-center gap-2">
                <img src={logoPreview} className="w-24 h-24 rounded-2xl object-cover shadow-sm border border-outline-variant/30 flex-shrink-0 bg-surface-variant" alt="Logo" />
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${logoValid ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-on-surface-variant bg-surface-variant border-outline-variant/30'} px-2.5 py-0.5 rounded-full border`}>
                  <span className="material-symbols-outlined text-xs">{logoValid ? 'check_circle' : 'image'}</span>
                  {logoValid ? 'Logo hợp lệ' : 'Logo mặc định'}
                </span>
              </div>
              <div className="flex-1 w-full flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface">Tên Tổ chức <span className="text-error">*</span></label>
                  <input type="text" value={orgForm.orgName} onChange={e => setOrgForm({...orgForm, orgName: e.target.value})} className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium transition-colors" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface">URL Logo</label>
                  <div className="flex gap-2">
                    <input type="url" value={orgForm.avtOrg} onChange={e => setOrgForm({...orgForm, avtOrg: e.target.value})} onBlur={() => verifyAndSetLogo(orgForm.avtOrg)} className="flex-1 px-4 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm transition-colors" />
                    <button type="button" onClick={() => verifyAndSetLogo(orgForm.avtOrg)} className="px-3.5 py-2 bg-surface-variant hover:bg-outline-variant text-on-surface-variant font-semibold rounded-xl text-xs transition-colors flex items-center gap-1 shrink-0">
                      <span className="material-symbols-outlined text-sm">visibility</span> Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-semibold text-on-surface">Mô tả giới thiệu & Sứ mệnh <span className="text-error">*</span></label>
              <textarea value={orgForm.description} onChange={e => setOrgForm({...orgForm, description: e.target.value})} rows="3" className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm transition-colors" required></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-md font-semibold text-on-surface">Địa chỉ Trụ sở <span className="text-error">*</span></label>
                <input type="text" value={orgForm.address} onChange={e => setOrgForm({...orgForm, address: e.target.value})} className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium transition-colors" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label-md font-semibold text-on-surface">Website</label>
                <input type="url" value={orgForm.websiteUrl} onChange={e => setOrgForm({...orgForm, websiteUrl: e.target.value})} className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium transition-colors" />
              </div>
            </div>

            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <label className="text-label-md font-semibold text-on-surface">Tọa độ Bản đồ <span className="text-error">*</span></label>
                </div>
                <button type="button" onClick={handleGetGps} disabled={gpsLoading} className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs">
                  <span className={`material-symbols-outlined text-sm ${gpsLoading ? 'animate-spin' : ''}`}>{gpsLoading ? 'progress_activity' : 'my_location'}</span> Lấy tọa độ GPS
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Vĩ độ</label>
                  <input type="number" step="any" value={orgForm.latitude} onChange={e => setOrgForm({...orgForm, latitude: e.target.value})} className="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm transition-colors" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Kinh độ</label>
                  <input type="number" step="any" value={orgForm.longitude} onChange={e => setOrgForm({...orgForm, longitude: e.target.value})} className="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm transition-colors" required />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label-md font-semibold text-on-surface">Danh mục Vật phẩm <span className="text-error">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {DEFAULT_ACCEPTED_TYPES.map(type => {
                  const checked = acceptedTypes.includes(type);
                  return (
                    <label key={type} className={`flex items-center gap-2.5 p-3 rounded-xl border ${checked ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-outline-variant bg-surface text-on-surface'} hover:border-primary transition-colors cursor-pointer text-sm`}>
                      <input 
                        type="checkbox" 
                        value={type} 
                        checked={checked}
                        onChange={e => {
                          if (e.target.checked) setAcceptedTypes([...acceptedTypes, type]);
                          else setAcceptedTypes(acceptedTypes.filter(t => t !== type));
                        }}
                        className="rounded text-primary focus:ring-primary w-4 h-4" 
                      />
                      <span>{type}</span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-2 flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface-variant">Danh mục tiếp nhận khác</label>
                <input type="text" value={orgForm.customAcceptedTypes} onChange={e => setOrgForm({...orgForm, customAcceptedTypes: e.target.value})} className="px-4 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm transition-colors" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-semibold text-on-surface">Link Tài liệu minh chứng</label>
              <textarea value={orgForm.verificationDocsText} onChange={e => setOrgForm({...orgForm, verificationDocsText: e.target.value})} rows="2" className="px-4 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm font-mono transition-colors"></textarea>
            </div>

            <div className="flex justify-end pt-4 border-t border-outline-variant/30">
              <button type="submit" disabled={savingOrg} className="w-full sm:w-auto px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2">
                {savingOrg ? <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-lg">save</span>}
                Lưu Hồ sơ Tổ chức
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Profile Setting */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-8 shadow-sm">
        <h3 className="text-headline-sm font-bold text-on-surface mb-2">Cài đặt Thông tin Cá nhân</h3>
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6">
          <div className="flex items-center gap-6 pb-6 border-b border-outline-variant/30">
            <img src={profile?.avatar || 'https://i.pravatar.cc/150'} className="w-20 h-20 rounded-full object-cover shadow-sm border border-outline-variant/30" alt="Avatar" />
            <div>
              <p className="font-bold text-on-surface text-base">{profile?.name || profile?.username || "Thành viên"}</p>
              <p className="text-xs text-on-surface-variant uppercase mt-0.5">Vai trò: <strong className="text-primary">{profile?.role || "MEMBER"}</strong></p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-semibold text-on-surface">Username</label>
              <input type="text" value={profileForm.username} onChange={e => setProfileForm({...profileForm, username: e.target.value})} className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-semibold text-on-surface">Họ và tên</label>
              <input type="text" value={profileForm.fullName} onChange={e => setProfileForm({...profileForm, fullName: e.target.value})} className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-semibold text-on-surface">Email</label>
              <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-semibold text-on-surface">Số điện thoại</label>
              <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-outline-variant/30">
            <button type="submit" disabled={savingProfile} className="w-full sm:w-auto px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
              {savingProfile ? "Đang lưu..." : "Lưu thay đổi cá nhân"}
            </button>
          </div>
        </form>
      </div>

      {/* Change PW */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-2xl text-primary">lock</span>
          <h3 className="text-headline-sm font-bold text-on-surface">Đổi mật khẩu</h3>
        </div>
        <form onSubmit={handlePwSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-label-md font-semibold text-on-surface">Mật khẩu hiện tại</label>
            <div className="relative">
              <input type={showOldPw ? "text" : "password"} value={pwForm.oldPassword} onChange={e => setPwForm({...pwForm, oldPassword: e.target.value})} className="w-full px-4 py-2.5 pr-12 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" required />
              <button type="button" onClick={() => setShowOldPw(!showOldPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-xl">{showOldPw ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-semibold text-on-surface">Mật khẩu mới</label>
              <div className="relative">
                <input type={showNewPw ? "text" : "password"} value={pwForm.newPassword} onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} className="w-full px-4 py-2.5 pr-12 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" required minLength={6} />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-xl">{showNewPw ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-semibold text-on-surface">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <input type={showConfirmPw ? "text" : "password"} value={pwForm.confirmPassword} onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})} className="w-full px-4 py-2.5 pr-12 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" required minLength={6} />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-xl">{showConfirmPw ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>
          </div>
          {pwError && <p className="text-sm text-error">{pwError}</p>}
          <div className="flex justify-end pt-4 border-t border-outline-variant/30">
            <button type="submit" disabled={savingPw} className="w-full sm:w-auto px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2">
              {savingPw ? <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-lg">key</span>}
              Đổi mật khẩu
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
