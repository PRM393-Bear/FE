import React, { useState, useEffect } from "react";
import { getPendingOrganizations, approveOrganization, rejectOrganization } from "../../services/staff.service.js";
import { showToast } from "../../utils/ui.js";
import { formatApiError } from "../../utils/api.js";
import { useConfirm } from "../../hooks/useConfirm.jsx";

export default function OrganizationsTab() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { confirm, ConfirmComponent } = useConfirm();

  const loadData = async () => {
    setLoading(true);
    try {
      const orgs = await getPendingOrganizations();
      setOrganizations(orgs || []);
    } catch (err) {
      console.error("Error loading pending organizations for staff:", err);
      showToast(formatApiError(err, "tải dữ liệu từ máy chủ"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getApprovalErrorMessage = (error) => {
    const message = error?.message || "";
    if (message.includes("not in pending status")) {
      return "Tổ chức này không còn ở trạng thái chờ duyệt. Vui lòng làm mới danh sách.";
    }
    return formatApiError(error, "kiểm duyệt tổ chức");
  };

  const handleApprove = async (id) => {
    const ok = await confirm({
      title: "Phê duyệt tổ chức",
      message: "Bạn có chắc chắn muốn PHÊ DUYỆT tài khoản tổ chức này để họ tham gia nhận quyên góp?",
      confirmText: "Phê duyệt"
    });
    if (!ok) return;

    setProcessingId(id);
    try {
      await approveOrganization(id);
      showToast("Phê duyệt tổ chức thành công!", "success");
      await loadData();
    } catch (err) {
      showToast("Lỗi khi duyệt tổ chức: " + getApprovalErrorMessage(err), "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = await confirm({
      type: "prompt",
      title: "Từ chối tổ chức",
      message: "Bạn có chắc chắn muốn TỪ CHỐI tài khoản tổ chức này?",
      promptPlaceholder: "Nhập lý do từ chối hồ sơ (sẽ gửi đến email người dùng)...",
      defaultValue: "Hồ sơ không đáp ứng đủ điều kiện xác thực hoặc minh chứng chưa hợp lệ",
      confirmText: "Từ chối",
      cancelText: "Hủy"
    });
    if (reason === null) return;

    setProcessingId(id);
    try {
      await rejectOrganization(id, reason.trim() || "Hồ sơ không hợp lệ");
      showToast("Từ chối tổ chức thành công!", "success");
      await loadData();
    } catch (err) {
      showToast("Lỗi khi từ chối tổ chức: " + getApprovalErrorMessage(err), "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {ConfirmComponent}
      {/* Header banner */}
      <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">domain_verification</span>
            Xét duyệt tài khoản tổ chức (Quyên góp & Thiện nguyện)
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">Kiểm tra thông tin pháp lý, giấy phép và phê duyệt tài khoản tổ chức tham gia nhận quyên góp quần áo.</p>
        </div>
        <button onClick={loadData} className="px-4 py-2 bg-surface rounded-xl border border-outline-variant/50 text-xs font-bold text-on-surface hover:bg-surface-variant flex items-center gap-1.5 transition-colors">
          <span className="material-symbols-outlined text-sm">refresh</span> Tải lại danh sách
        </button>
      </div>

      {/* Organizations Table Card */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/50 border-b border-outline-variant/30 text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                <th className="px-6 py-4">Tổ chức / Đơn vị</th>
                <th className="px-6 py-4">Đại diện liên hệ</th>
                <th className="px-6 py-4">Nhu cầu tiếp nhận</th>
                <th className="px-6 py-4">Tài liệu pháp lý / Xác minh</th>
                <th className="px-6 py-4 text-right">Thao tác duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-on-surface-variant">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-3xl animate-spin text-primary">progress_activity</span>
                      <span>Đang tải dữ liệu tổ chức chờ xét duyệt...</span>
                    </div>
                  </td>
                </tr>
              ) : organizations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-surface-variant/50 flex items-center justify-center text-on-surface-variant mb-1">
                        <span className="material-symbols-outlined text-2xl">verified</span>
                      </div>
                      <p className="font-bold text-base text-on-surface">Không có hồ sơ nào chờ duyệt</p>
                      <p className="text-xs text-on-surface-variant text-center">Tất cả tài khoản tổ chức đăng ký mới đã được kiểm duyệt hoặc chưa có yêu cầu mới.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                organizations.map(org => {
                  const canModerate = org.status === "PENDING";
                  const logoUrl = org.avtOrg || `https://ui-avatars.com/api/?name=${encodeURIComponent(org.orgName || "O")}&background=006B2C&color=fff`;
                  
                  return (
                    <tr key={org.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-5 align-top">
                        <div className="flex items-start gap-3.5">
                          <img alt="Org Logo" className="w-11 h-11 rounded-xl object-cover border border-outline-variant/30 shrink-0 shadow-sm" src={logoUrl}/>
                          <div className="min-w-0">
                            <p className="font-bold text-on-surface text-base leading-snug">{org.orgName || "Chưa đặt tên tổ chức"}</p>
                            <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">location_on</span>
                              {org.address || "Không có địa chỉ"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <p className="font-bold text-on-surface">{org.userFullName || "N/A"}</p>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">mail</span>
                          {org.userEmail || "N/A"}
                        </p>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {org.acceptedTypes && org.acceptedTypes.length > 0 ? (
                            org.acceptedTypes.map((t, i) => (
                              <span key={i} className="px-2.5 py-1 bg-surface-variant/80 text-on-surface font-semibold rounded-lg text-xs inline-block my-0.5">{t}</span>
                            ))
                          ) : (
                            <span className="text-xs text-on-surface-variant italic">Tất cả quần áo</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="flex flex-col gap-1.5 items-start">
                          {org.verificationDocs && org.verificationDocs.length > 0 ? (
                            org.verificationDocs.map((doc, idx) => (
                              <a key={idx} href={doc} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline font-semibold text-xs py-1 px-2 rounded bg-primary/5 hover:bg-primary/10 transition-colors" onClick={e => e.stopPropagation()}>
                                <span className="material-symbols-outlined text-xs">description</span> Tài liệu {idx + 1}
                              </a>
                            ))
                          ) : (
                            <span className="text-xs text-on-surface-variant italic">Không tải kèm tài liệu</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleApprove(org.id); }}
                            disabled={!canModerate || processingId === org.id}
                            className={`px-3.5 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs shadow-sm hover:opacity-90 transition-all active:scale-95 flex items-center gap-1 ${canModerate ? "" : "opacity-50 cursor-not-allowed"}`}
                          >
                            {processingId === org.id ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">check</span>}
                            Phê duyệt
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleReject(org.id); }}
                            disabled={!canModerate || processingId === org.id}
                            className={`px-3 py-2 bg-error/10 text-error rounded-xl font-bold text-xs hover:bg-error/20 transition-all active:scale-95 flex items-center gap-1 ${canModerate ? "" : "opacity-50 cursor-not-allowed"}`}
                          >
                            <span className="material-symbols-outlined text-sm">close</span> Từ chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
