import React, { useState } from "react";
import { Link } from "react-router-dom";
import { confirmOrder, shipOrder, updatePickupPhoto } from "../../services/order.service.js";
import { hideProduct, unhideProduct, isDraftProduct, submitProductForReview, deleteProductApi, uploadProductImage } from "../../services/product.service.js";
import { showToast } from "../../utils/ui.js";
import { formatApiError } from "../../utils/api.js";
import { useConfirm } from "../../hooks/useConfirm.jsx";

function formatPrice(num) {
  if (num === undefined || num === null || isNaN(num)) return "0đ";
  return Number(num).toLocaleString("vi-VN") + "đ";
}

export default function ShopPanel({ sellerOrders = [], myDrafts = [], myProducts = [], onRefresh }) {
  const [currentShopFilter, setCurrentShopFilter] = useState("ALL");
  const [currentProductFilter, setCurrentProductFilter] = useState("ALL");
  const { confirm, ConfirmComponent } = useConfirm();

  const handleConfirmOrder = async (orderId) => {
    try {
      await confirmOrder(orderId);
      showToast("Xác nhận bán hàng thành công!", "success");
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(formatApiError(err, "duyệt đơn"), "error");
    }
  };

  const handleShipOrder = async (orderId) => {
    try {
      await shipOrder(orderId, "TRACKING-" + Math.floor(Math.random() * 100000));
      showToast("Đã cập nhật trạng thái đang giao hàng!", "success");
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(formatApiError(err, "cập nhật đơn hàng"), "error");
    }
  };

  const handleUploadPickupPhoto = async (e, orderId) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      showToast("Đang tải ảnh lên...", "info");
      const res = await uploadProductImage(file);
      const url = res?.url || res?.imageUrl || res;
      if (typeof url === 'string') {
        await updatePickupPhoto(orderId, url);
        showToast("Đã cập nhật ảnh lấy hàng!", "success");
        if (onRefresh) onRefresh();
      } else {
        throw new Error("Không nhận được URL ảnh");
      }
    } catch (err) {
      showToast(formatApiError(err, "tải ảnh"), "error");
    }
  };

  const handleToggleHide = async (productId, isHidden) => {
    try {
      if (isHidden) {
        await unhideProduct(productId);
        showToast("Đã hiển thị lại bài đăng sản phẩm!", "success");
      } else {
        await hideProduct(productId);
        showToast("Đã ẩn bài đăng sản phẩm khỏi cửa hàng!", "info");
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(formatApiError(err, "thao tác bài đăng"), "error");
    }
  };

  const handleSubmitReview = async (productId) => {
    const ok = await confirm({
      title: "Gửi yêu cầu duyệt",
      message: "Bạn có chắc chắn muốn gửi yêu cầu duyệt sản phẩm này không?",
      confirmText: "Gửi duyệt"
    });
    if (!ok) return;

    try {
      await submitProductForReview(productId);
      showToast("Đã gửi yêu cầu duyệt thành công! Vui lòng chờ phản hồi.", "success");
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(formatApiError(err, "gửi duyệt"), "error");
    }
  };

  const handleDeleteProduct = async (productId) => {
    const ok = await confirm({
      title: "Xóa sản phẩm",
      message: "Bạn có chắc chắn muốn xóa sản phẩm này không? Thao tác này không thể hoàn tác.",
      confirmText: "Xóa",
      isDanger: true,
    });
    if (!ok) return;

    try {
      await deleteProductApi(productId);
      showToast("Đã xóa sản phẩm thành công!", "success");
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(formatApiError(err, "xóa sản phẩm"), "error");
    }
  };

  const filteredOrders = currentShopFilter === "ALL"
    ? sellerOrders
    : sellerOrders.filter(ord => {
        const st = String(ord.status || "PENDING").toUpperCase();
        if (currentShopFilter === "COMPLETED") {
          return st === "COMPLETED" || st === "RECEIVED";
        }
        return st === currentShopFilter;
      });

  const allProducts = [...myProducts, ...myDrafts];
  const counts = {
    ALL: allProducts.length,
    PENDING: allProducts.filter(p => !isDraftProduct(p) && (p.status || "").toUpperCase() === "PENDING").length,
    AVAILABLE: allProducts.filter(p => !isDraftProduct(p) && (!p.status || p.status.toUpperCase() === "AVAILABLE")).length,
    HIDDEN: allProducts.filter(p => !isDraftProduct(p) && (p.status || "").toUpperCase() === "HIDDEN").length,
    REJECTED: allProducts.filter(p => !isDraftProduct(p) && (p.status || "").toUpperCase() === "REJECTED").length,
    DRAFT: myDrafts.length
  };

  const filteredProducts = currentProductFilter === "ALL"
    ? allProducts
    : allProducts.filter(p => {
        if (currentProductFilter === "DRAFT") return isDraftProduct(p);
        if (isDraftProduct(p)) return false;
        
        const st = (p.status || "AVAILABLE").toUpperCase();
        return st === currentProductFilter;
      });

  return (
    <div className="shop-panel flex flex-col gap-8">
      {ConfirmComponent}
      {/* Header banner */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-headline-sm font-bold text-on-surface mb-1">Quản lý Bán hàng</h3>
          <p className="text-body-md text-on-surface-variant">Xử lý toàn bộ đơn đặt mua, theo dõi lịch sử bán, chỉnh sửa/ẩn hiện bài đăng và quản lý bản nháp.</p>
        </div>
        <Link to="/create-listing" className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-medium shadow hover:bg-primary/90 transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-base">add_circle</span> Đăng bán mới
        </Link>
      </div>

      {/* Section 1: Seller Orders & History */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h4 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            Lịch sử và Đơn hàng bán ({sellerOrders.length})
          </h4>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 bg-surface-variant/40 p-1 rounded-xl">
            <button onClick={() => setCurrentShopFilter('ALL')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentShopFilter === 'ALL' ? 'bg-surface shadow-sm text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>Tất cả ({sellerOrders.length})</button>
            <button onClick={() => setCurrentShopFilter('PENDING')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentShopFilter === 'PENDING' ? 'bg-surface shadow-sm text-blue-700 font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>Chờ duyệt</button>
            <button onClick={() => setCurrentShopFilter('CONFIRMED')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentShopFilter === 'CONFIRMED' ? 'bg-surface shadow-sm text-amber-700 font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>Chờ gửi hàng</button>
            <button onClick={() => setCurrentShopFilter('SHIPPING')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentShopFilter === 'SHIPPING' ? 'bg-surface shadow-sm text-purple-700 font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>Đang giao</button>
            <button onClick={() => setCurrentShopFilter('COMPLETED')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentShopFilter === 'COMPLETED' ? 'bg-surface shadow-sm text-emerald-700 font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>Hoàn tất</button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest/50 w-full">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">storefront</span>
            <p className="font-medium text-on-surface">Chưa có đơn hàng nào ở trạng thái này</p>
            <p className="text-body-sm text-on-surface-variant mt-1">Khi khách hàng đặt mua món đồ của bạn, thông tin và lịch sử xử lý sẽ hiển thị tại đây.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredOrders.map(ord => {
              const statusStr = String(ord.status || "PENDING").toUpperCase();
              let statusBadge = <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-variant text-on-surface-variant">{statusStr}</span>;
              if (statusStr === "PENDING") {
                statusBadge = <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>Chờ duyệt</span>;
              } else if (statusStr === "CONFIRMED") {
                statusBadge = <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>Chờ gửi hàng</span>;
              } else if (statusStr === "SHIPPING") {
                statusBadge = <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>Đang giao</span>;
              } else if (statusStr === "RECEIVED" || statusStr === "COMPLETED") {
                statusBadge = <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>Hoàn tất</span>;
              }

              return (
                <div key={ord.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-outline-variant/30 gap-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={ord.productImage || 'https://placehold.co/100x100/E4EBE4/6E7B6C?text=Order'} className="w-16 h-16 rounded-lg object-cover border border-outline-variant/30 shrink-0" alt="Order" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded">#{ord.id?.slice(0, 8) || "N/A"}</span>
                        <span className="text-xs text-on-surface-variant">{ord.createdAt || ord.date ? new Date(ord.createdAt || ord.date).toLocaleDateString("vi-VN") : "Gần đây"}</span>
                      </div>
                      <h5 className="font-bold text-on-surface mt-1">{ord.productTitle || ord.productName || "Sản phẩm không có tên"}</h5>
                      <p className="text-primary font-semibold text-sm mt-1">{formatPrice(ord.price || ord.totalAmount)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                    {statusBadge}
                    <div className="flex gap-2 mt-1">
                      {statusStr === "PENDING" && (
                        <button onClick={() => handleConfirmOrder(ord.id)} className="px-3.5 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">check</span> Xác nhận bán
                        </button>
                      )}
                      {statusStr === "CONFIRMED" && (
                        <div className="flex gap-2">
                          <label className="px-3.5 py-1.5 bg-surface-variant text-on-surface-variant rounded-lg text-xs font-semibold hover:bg-outline-variant transition-colors shadow-sm flex items-center gap-1 cursor-pointer">
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadPickupPhoto(e, ord.id)} />
                            <span className="material-symbols-outlined text-sm">add_a_photo</span> Ảnh gửi
                          </label>
                          <button onClick={() => handleShipOrder(ord.id)} className="px-3.5 py-1.5 bg-secondary text-on-secondary rounded-lg text-xs font-semibold hover:bg-secondary/90 transition-colors shadow-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">local_shipping</span> Giao hàng
                          </button>
                        </div>
                      )}
                      {statusStr === "SHIPPING" && (
                        <label className="px-3.5 py-1.5 bg-surface-variant text-on-surface-variant rounded-lg text-xs font-semibold hover:bg-outline-variant transition-colors shadow-sm flex items-center gap-1 cursor-pointer">
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadPickupPhoto(e, ord.id)} />
                          <span className="material-symbols-outlined text-sm">add_a_photo</span> Cập nhật ảnh
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: My Products with Status Tabs */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h4 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">inventory_2</span>
            Sản phẩm của bạn ({counts.ALL})
          </h4>

          {/* Product Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 bg-surface-variant/40 p-1 rounded-xl">
            <button onClick={() => setCurrentProductFilter('ALL')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentProductFilter === 'ALL' ? 'bg-surface shadow-sm text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>Tất cả</button>
            <button onClick={() => setCurrentProductFilter('PENDING')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentProductFilter === 'PENDING' ? 'bg-surface shadow-sm text-blue-700 font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>Chờ duyệt ({counts.PENDING})</button>
            <button onClick={() => setCurrentProductFilter('AVAILABLE')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentProductFilter === 'AVAILABLE' ? 'bg-surface shadow-sm text-emerald-700 font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>Đang hiển thị ({counts.AVAILABLE})</button>
            <button onClick={() => setCurrentProductFilter('HIDDEN')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentProductFilter === 'HIDDEN' ? 'bg-surface shadow-sm text-gray-700 font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>Đã ẩn ({counts.HIDDEN})</button>
            <button onClick={() => setCurrentProductFilter('REJECTED')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentProductFilter === 'REJECTED' ? 'bg-surface shadow-sm text-red-700 font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>Từ chối ({counts.REJECTED})</button>
            <button onClick={() => setCurrentProductFilter('DRAFT')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentProductFilter === 'DRAFT' ? 'bg-surface shadow-sm text-amber-700 font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>Bản nháp ({counts.DRAFT})</button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest/50 w-full">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">checkroom</span>
            <p className="font-medium text-on-surface">Không tìm thấy sản phẩm nào</p>
            <p className="text-body-sm text-on-surface-variant mt-1">Chưa có sản phẩm nào ở trạng thái này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(prod => {
              const isDraft = isDraftProduct(prod);
              const statusStr = (prod.status || "AVAILABLE").toUpperCase();
              const isHidden = statusStr === 'HIDDEN';
              const isPending = statusStr === 'PENDING';
              const isRejected = statusStr === 'REJECTED';
              
              let statusBadge = null;
              if (isDraft) {
                statusBadge = <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">Bản nháp</span>;
              } else if (isHidden) {
                statusBadge = <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>Đã ẩn</span>;
              } else if (isPending) {
                statusBadge = <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>Chờ duyệt</span>;
              } else if (isRejected) {
                statusBadge = <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>Từ chối</span>;
              } else {
                statusBadge = <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>Đang hiển thị</span>;
              }

              return (
                <div key={prod.id} className={`border border-outline-variant/30 rounded-xl overflow-hidden bg-surface flex flex-col justify-between hover:shadow-md transition-all group ${isHidden || isDraft ? 'opacity-80 hover:opacity-100 bg-surface-variant/20' : ''}`}>
                  <div>
                    <div className="aspect-[4/3] w-full bg-surface-variant relative overflow-hidden">
                      <img src={prod.imageUrl || 'https://placehold.co/400x300/E4EBE4/6E7B6C?text=Product'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={prod.title} />
                      <div className="absolute top-2.5 right-2.5">
                        {statusBadge}
                      </div>
                    </div>
                    <div className="p-4">
                      <h5 className="font-bold text-on-surface text-base truncate" title={prod.title}>{prod.title || "Không tên"}</h5>
                      <p className="text-primary font-bold text-sm mt-1">{formatPrice(prod.price)}</p>
                      {!isDraft && <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">{prod.description || 'Không có mô tả'}</p>}
                    </div>
                  </div>
                    <div className="px-4 pb-4 pt-2 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-2">
                    {isDraft ? (
                      <>
                        <Link to={`/edit-listing?id=${prod.id}`} className="flex-1 min-w-[70px] py-2 px-2 text-center rounded-lg border border-primary text-primary font-semibold text-xs hover:bg-primary/10 transition-colors flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">edit</span> Sửa
                        </Link>
                        <button onClick={() => handleSubmitReview(prod.id)} className="flex-1 min-w-[80px] py-2 px-2 text-center rounded-lg border border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold text-xs transition-colors flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">send</span> Duyệt
                        </button>
                        <button onClick={() => handleDeleteProduct(prod.id)} className="min-w-[60px] py-2 px-2 text-center rounded-lg border border-error/50 text-error hover:bg-error/10 font-semibold text-xs transition-colors flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </>
                    ) : isRejected ? (
                      <>
                        <Link to={`/edit-listing?id=${prod.id}`} className="flex-1 min-w-[100px] py-2 px-2 text-center rounded-lg border border-primary text-primary font-semibold text-xs hover:bg-primary/10 transition-colors flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">edit</span> Sửa lại
                        </Link>
                        <button onClick={() => handleDeleteProduct(prod.id)} className="min-w-[60px] py-2 px-2 text-center rounded-lg border border-error/50 text-error hover:bg-error/10 font-semibold text-xs transition-colors flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to={`/edit-listing?id=${prod.id}`} style={isPending ? { pointerEvents: 'none', opacity: 0.5 } : {}} title={isPending ? "Sản phẩm đang chờ duyệt, không thể sửa" : ""} className="flex-1 min-w-[70px] py-2 px-2 text-center rounded-lg border border-outline-variant text-on-surface font-semibold text-xs hover:bg-surface-variant hover:border-primary/50 transition-colors flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">edit</span> Sửa
                        </Link>
                        <button onClick={() => handleToggleHide(prod.id, isHidden)} disabled={isPending} style={isPending ? { opacity: 0.5, cursor: 'not-allowed' } : {}} title={isPending ? "Sản phẩm đang chờ duyệt, không thể ẩn/hiện" : ""} className={`flex-1 min-w-[70px] py-2 px-2 text-center rounded-lg border ${isHidden ? 'border-primary text-primary hover:bg-primary/10' : 'border-outline-variant text-on-surface hover:bg-surface-variant'} font-semibold text-xs transition-colors flex items-center justify-center gap-1`}>
                          <span className="material-symbols-outlined text-[14px]">{isHidden ? 'visibility' : 'visibility_off'}</span> {isHidden ? 'Hiện' : 'Ẩn'}
                        </button>
                        <button onClick={() => handleDeleteProduct(prod.id)} disabled={isPending} style={isPending ? { opacity: 0.5, cursor: 'not-allowed' } : {}} className="min-w-[60px] py-2 px-2 text-center rounded-lg border border-error/50 text-error hover:bg-error/10 font-semibold text-xs transition-colors flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </>
                    )}
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
