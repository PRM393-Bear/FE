import React, { useState, useEffect } from "react";
import { getPendingProducts, approveProduct, rejectProduct } from "../../services/staff.service.js";
import { showToast } from "../../utils/ui.js";

function formatPrice(num) {
  if (num === undefined || num === null || isNaN(num)) return "0đ";
  return Number(num).toLocaleString("vi-VN") + "đ";
}

export default function PendingProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [rejectModal, setRejectModal] = useState({ isOpen: false, id: null, reason: "" });
  const [processingApproveId, setProcessingApproveId] = useState(null);
  const [processingReject, setProcessingReject] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const prods = await getPendingProducts();
      setProducts(prods || []);
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi tải danh sách sản phẩm chờ duyệt", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id, title) => {
    if (!window.confirm(`Xác nhận duyệt cho phép hiển thị bài đăng "${title}"?`)) return;
    setProcessingApproveId(id);
    try {
      await approveProduct(id);
      showToast(`Đã duyệt thành công bài đăng "${title}"!`, "success");
      await loadData();
    } catch (err) {
      showToast("Lỗi duyệt: " + err.message, "error");
    } finally {
      setProcessingApproveId(null);
    }
  };

  const handleRejectConfirm = async () => {
    const { id, reason } = rejectModal;
    if (!reason.trim()) {
      showToast("Vui lòng nhập lý do từ chối!", "warning");
      return;
    }

    setProcessingReject(true);
    try {
      await rejectProduct(id, reason.trim());
      showToast("Đã từ chối bài đăng!", "info");
      setRejectModal({ isOpen: false, id: null, reason: "" });
      await loadData();
    } catch (err) {
      showToast("Lỗi: " + err.message, "error");
    } finally {
      setProcessingReject(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in relative">
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex justify-between items-center">
        <div>
          <h3 className="text-headline-sm font-bold text-on-surface">Duyệt bài đăng sản phẩm bán/trao đổi</h3>
          <p className="text-body-md text-on-surface-variant">Kiểm duyệt các bài đăng mới từ cộng đồng trước khi hiển thị công khai trên chợ EcoCycle.</p>
        </div>
        <button onClick={loadData} className="px-4 py-2 rounded-xl bg-surface-variant text-primary font-bold text-sm hover:bg-primary/10 transition-colors flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">refresh</span> Làm mới
        </button>
      </div>

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface border border-outline-variant rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-up">
            <h4 className="text-title-lg font-bold text-error flex items-center gap-2">
              <span className="material-symbols-outlined">warning</span> Từ chối bài đăng
            </h4>
            <p className="text-body-sm text-on-surface-variant mt-1">Vui lòng nhập rõ lý do từ chối bài đăng này để người bán nắm thông tin và chỉnh sửa phù hợp.</p>
            
            <textarea 
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              rows="4" 
              placeholder="VD: Hình ảnh mờ nhạt không rõ chi tiết, thông tin không chính xác hoặc vi phạm chính sách cộng đồng..." 
              className="w-full mt-4 p-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:border-error"
            ></textarea>
            
            <div className="flex justify-end gap-3 mt-5">
              <button 
                onClick={() => setRejectModal({ isOpen: false, id: null, reason: "" })} 
                className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface-variant text-sm font-semibold hover:bg-surface-variant transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleRejectConfirm} 
                disabled={processingReject}
                className="px-5 py-2 rounded-xl bg-error text-on-error text-sm font-bold shadow hover:bg-error/90 transition-colors disabled:opacity-50"
              >
                {processingReject ? "Đang xử lý..." : "Xác nhận Từ Chối"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending List Grid */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="p-12 text-center"><span className="material-symbols-outlined text-4xl animate-spin text-primary">progress_activity</span></div>
        ) : products.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-16 text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-emerald-600 mb-3">task_alt</span>
            <h4 className="text-title-lg font-bold text-on-surface">Không có bài đăng chờ duyệt nào!</h4>
            <p className="text-body-sm text-on-surface-variant mt-1">Toàn bộ danh sách bài đăng từ cộng đồng đều đã được kiểm duyệt xong.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(prod => {
              const img = prod.images && prod.images.length > 0 ? prod.images[0] : (prod.imageUrl || "https://placehold.co/400x300/E4EBE4/6E7B6C?text=No+Image");
              return (
                <div key={prod.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="aspect-[4/3] w-full bg-surface-variant relative overflow-hidden">
                      <img src={img} alt={prod.title} className="w-full h-full object-cover" loading="lazy" />
                      <span className="absolute top-2.5 right-2.5 bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">Chờ kiểm duyệt</span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                        <span>Người bán: <strong>{prod.sellerName || "Thành viên"}</strong></span>
                        <span>{prod.category || "Chung"}</span>
                      </div>
                      <h4 className="text-title-md font-bold text-on-surface line-clamp-1" title={prod.title}>{prod.title || "Không tên"}</h4>
                      <p className="text-primary font-bold text-base mt-1">{formatPrice(prod.price)}</p>
                      <div className="mt-3 p-3 bg-surface rounded-xl border border-outline-variant/20 text-xs text-on-surface-variant max-h-24 overflow-y-auto">
                        <p className="font-bold text-on-surface mb-1">Mô tả sản phẩm:</p>
                        {prod.description || "Người bán không để lại mô tả chi tiết."}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 pt-0 flex items-center gap-3">
                    <button 
                      onClick={() => handleApprove(prod.id, prod.title || "Sản phẩm")} 
                      disabled={processingApproveId === prod.id}
                      className="flex-1 py-2.5 px-4 bg-primary text-on-primary rounded-xl font-bold text-xs shadow hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {processingApproveId === prod.id ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-base">check_circle</span>}
                      Duyệt ngay
                    </button>
                    <button 
                      onClick={() => setRejectModal({ isOpen: true, id: prod.id, reason: "" })}
                      disabled={processingApproveId === prod.id}
                      className="flex-1 py-2.5 px-4 bg-error/10 text-error border border-error/20 rounded-xl font-bold text-xs hover:bg-error/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base">cancel</span> Từ chối
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
