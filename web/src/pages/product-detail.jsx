import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../styles/product-detail.css";
import { getProductById, getAllProducts, isDraftProduct, hideProduct, unhideProduct, submitProductForReview } from "../services/product.service.js";
import { getConditionLabel, getConditionPercentage } from "../utils/conditionMapping.js";
import { createOrder } from "../services/order.service.js";
import { addToCart } from "../services/cart.service.js";
import { getUser, getUserIdFromToken } from "../services/auth.service.js";
import { showToast } from "../utils/ui.js";

export default function ProductDetail() {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [product, setProduct] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  
  const [activeThumb, setActiveThumb] = useState(0);
  const [activeTab, setActiveTab] = useState("desc"); // 'desc' or 'ai'
  
  const [isFavorited, setIsFavorited] = useState(false);
  
  const [buying, setBuying] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isCartSuccess, setIsCartSuccess] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [togglingHide, setTogglingHide] = useState(false);

  const fetchProductData = async () => {
    setLoading(true);
    setError(false);
    try {
      const prod = await getProductById(productId);
      setProduct(prod);
      
      // Load similar and seller products
      try {
        const allProds = await getAllProducts();
        const sellerProds = allProds.filter(
          p => p.sellerId === prod.sellerId && p.id !== prod.id
        ).slice(0, 4);
        
        let similarProds = allProds.filter(
          p => p.category === prod.category && p.id !== prod.id && p.sellerId !== prod.sellerId
        ).slice(0, 4);
        
        if (similarProds.length < 4) {
          const extraSimilar = allProds.filter(
            p => p.category === prod.category && p.id !== prod.id && !similarProds.some(s => s.id === p.id)
          ).slice(0, 4 - similarProds.length);
          similarProds = [...similarProds, ...extraSimilar];
        }
        
        setSellerProducts(sellerProds);
        setSimilarProducts(similarProds);
      } catch (err) {
        console.error("Failed to load seller/similar listings:", err);
      }
      
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
    // reset state
    setActiveThumb(0);
    setActiveTab("desc");
  }, [productId]);

  const formatPrice = (price) => {
    if (!price && price !== 0) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getConditionText = (cond) => {
    const percentage = getConditionPercentage(cond);
    const label = getConditionLabel(cond);
    return `${label} (${percentage}%)`;
  };

  const getLifecycleText = (gen) => {
    switch (gen) {
      case 1: return "Vòng đời thứ 1 🌱";
      case 2: return "Vòng đời thứ 2 🔄";
      case 3: return "Vòng đời thứ 3+ ♻️";
      default: return "Vòng đời thứ 2 🔄";
    }
  };

  const handleBuyNow = async () => {
    try {
      setBuying(true);
      await createOrder(product.id);
      showToast("Đơn hàng đã được gửi tới người bán. Hãy theo dõi tại Tủ đồ cá nhân -> Đơn mua hàng!", "success");
      navigate("/profile?tab=panel-wardrobe&sub=wardrobe-orders");
    } catch (err) {
      console.error("Lỗi đặt mua hàng:", err);
      showToast(`Đặt mua thất bại: ${err.message}`, "error");
    } finally {
      setBuying(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await addToCart(product.id);
      showToast("Đã thêm sản phẩm vào giỏ hàng!", "success");
      window.dispatchEvent(new CustomEvent("ecocycle:cart-updated"));
      setIsCartSuccess(true);
      setTimeout(() => {
        setAddingToCart(false);
        setIsCartSuccess(false);
      }, 1500); // keep the success state briefly
    } catch (err) {
      console.error("Lỗi thêm giỏ hàng:", err);
      showToast(`Thêm vào giỏ thất bại: ${err.message}`, "error");
      setAddingToCart(false);
      setIsCartSuccess(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn gửi yêu cầu duyệt sản phẩm này không?")) return;
    try {
      setSubmittingReview(true);
      await submitProductForReview(product.id);
      showToast("Đã gửi yêu cầu duyệt thành công!", "success");
      await fetchProductData();
    } catch (err) {
      showToast("Lỗi khi gửi duyệt: " + err.message, "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleHide = async (isHidden) => {
    try {
      setTogglingHide(true);
      if (isHidden) {
        await unhideProduct(product.id);
        showToast("Đã hiển thị lại sản phẩm!", "success");
      } else {
        await hideProduct(product.id);
        showToast("Đã ẩn sản phẩm khỏi cửa hàng!", "info");
      }
      await fetchProductData();
    } catch (err) {
      showToast("Lỗi khi thao tác: " + err.message, "error");
    } finally {
      setTogglingHide(false);
    }
  };

  if (loading) {
    return (
      <div className="pd-container">
        <div className="pd-breadcrumb">
          <Link to="/">Trang chủ</Link> <span className="separator">chevron_right</span>
          <Link to="/products">Sản phẩm</Link> <span className="separator">chevron_right</span>
          <span className="current">Đang tải...</span>
        </div>
        <div className="pd-loading-layout">
          <div className="pd-skeleton-img pulse"></div>
          <div>
            <div className="pd-skeleton-line pulse" style={{ width: '30%' }}></div>
            <div className="pd-skeleton-line pulse tall" style={{ width: '70%', marginTop: '24px' }}></div>
            <div className="pd-skeleton-line pulse" style={{ width: '40%', marginTop: '16px' }}></div>
            <div className="pd-skeleton-line pulse" style={{ width: '100%', height: '120px', marginTop: '40px' }}></div>
            <div className="pd-skeleton-line pulse" style={{ width: '100%', height: '60px', marginTop: '24px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-container">
        <div className="pd-error">
          <h2>Không tìm thấy sản phẩm!</h2>
          <p>Sản phẩm này có thể đã bị xóa hoặc đường dẫn không hợp lệ.</p>
          <br/>
          <Link to="/products" className="pd-btn-primary" style={{ textDecoration: 'none', display: 'inline-block', maxWidth: '200px' }}>Quay lại danh sách</Link>
        </div>
      </div>
    );
  }

  const priceFormatted = formatPrice(product.price);
  const conditionText = getConditionText(product.condition);
  const lifecycleText = getLifecycleText(product.lifecycleGeneration);
  const sellerName = product.sellerName || "Eco Seller";
  const sellerAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=006B2C&color=fff`;
  
  const imageCount = product.images ? product.images.length : 0;
  const mainImageUrl = imageCount > 0 ? product.images[activeThumb] : "https://placehold.co/800x800/E4EBE4/6E7B6C?text=No+Image";

  const aiTagsList = product.aiTags && product.aiTags.length > 0
    ? product.aiTags.map((tag, idx) => (
      <span key={idx} className="pd-attr-tag" style={{ background: 'rgba(0,107,44,0.05)', color: 'var(--primary)', margin: '0 4px 4px 0', display: 'inline-block', fontSize: '13px', fontWeight: '500' }}>#{tag}</span>
    )) : null;

  const localUser = getUser() || {};
  const tokenUserId = getUserIdFromToken();
  const myUsername = localUser.username || localUser.userName;
  const myUserId = tokenUserId || localUser.id || localUser.userId;
  const sellerChatId = product.sellerId || product.sellerUserId || product.userId || product.ownerId || "";

  const isOwner = Boolean(
    (myUserId && (
      String(product.sellerId) === String(myUserId) ||
      String(product.sellerUserId) === String(myUserId) ||
      String(product.userId) === String(myUserId) ||
      String(product.ownerId) === String(myUserId)
    )) ||
    (myUsername && (
      String(product.sellerName || "").toLowerCase() === String(myUsername).toLowerCase() ||
      String(product.sellerUsername || "").toLowerCase() === String(myUsername).toLowerCase() ||
      String(product.seller || "").toLowerCase() === String(myUsername).toLowerCase() ||
      String(product.username || "").toLowerCase() === String(myUsername).toLowerCase() ||
      String(product.userName || "").toLowerCase() === String(myUsername).toLowerCase() ||
      String(product.createdBy || "").toLowerCase() === String(myUsername).toLowerCase()
    ))
  );

  const isDraft = (String(product.status || '').trim().toUpperCase() === 'DRAFT') || isDraftProduct(product);
  const statusStr = (product.status || "AVAILABLE").toUpperCase();
  const isHidden = statusStr === 'HIDDEN';
  const isPending = statusStr === 'PENDING';
  const isRejected = statusStr === 'REJECTED';
  const rejectionReason = product.rejectionReason || "Không đạt tiêu chuẩn kiểm duyệt.";
  const auditLogs = product.auditLogs || product.logs || [];

  return (
    <div className="pd-container">
      {/* Breadcrumbs */}
      <nav className="pd-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="material-symbols-outlined separator">chevron_right</span>
        <Link to="/products">Sản phẩm</Link>
        <span className="material-symbols-outlined separator">chevron_right</span>
        <span className="current">{product.title || "Chi tiết sản phẩm"}</span>
      </nav>
      
      <div className="pd-layout">
        {/* Left Side: Image Gallery */}
        <div className="pd-gallery-section">
          <div className="pd-gallery">
            <div className="pd-image-wrapper">
              <img src={mainImageUrl} alt={product.title || "Product Image"} className="pd-image-main" />
              <button className="pd-zoom-btn" onClick={() => alert('Đang hiển thị ảnh kích thước đầy đủ!')}>
                <span className="material-symbols-outlined">zoom_in</span>
              </button>
            </div>
            {imageCount > 1 && (
              <div className="pd-thumbnails">
                {product.images.slice(0, 4).map((img, idx) => {
                  const isLast = idx === 3 && imageCount > 4;
                  const remaining = imageCount - 4;
                  return (
                    <div 
                      key={idx}
                      className={`pd-thumb-container ${activeThumb === idx ? 'is-active' : ''}`} 
                      onClick={() => setActiveThumb(idx)}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="pd-thumb-img" />
                      {isLast && <div className="pd-thumb-overlay">+{remaining + 1}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Product Buy Panel */}
        <div className="pd-info-section">
          <div className="pd-sticky-panel">
            <div className="pd-meta-header">
              <span className="pd-lifecycle-badge">
                {lifecycleText}
              </span>
              <div className="pd-rating-badge">
                <span className="material-symbols-outlined star-icon">star</span>
                <span className="pd-rating-text">4.5</span>
                <span className="pd-rating-count">(8 đánh giá)</span>
              </div>
            </div>

            <h1 className="pd-title">{product.title || "Sản phẩm không có tên"}</h1>
            
            <div className="pd-price-row">
              <p className="pd-price">{priceFormatted}</p>
              <span className="pd-ai-badge">AI đánh giá: {product.condition >= 4 ? "Khá" : "Tốt"}</span>
            </div>

            {/* Attributes Grid */}
            <div className="pd-attributes-grid">
              <div className="pd-attribute-item">
                <p className="pd-attribute-label">Kích cỡ</p>
                <p className="pd-attribute-value">Size {product.size || "Free Size"}</p>
              </div>
              <div className="pd-attribute-item">
                <p className="pd-attribute-label">Màu sắc</p>
                <p className="pd-attribute-value">{product.color || "Khác"}</p>
              </div>
              <div className="pd-attribute-item">
                <p className="pd-attribute-label">Danh mục</p>
                <p className="pd-attribute-value">{product.category || "Quần áo"}</p>
              </div>
            </div>

            {/* Seller Card */}
            <div className="pd-seller-card">
              <div className="pd-seller-left">
                <div className="pd-seller-img-wrapper">
                  <img src={sellerAvatarUrl} alt={sellerName} className="pd-seller-img" />
                </div>
                <div className="pd-seller-details">
                  <h4 className="pd-seller-title">{sellerName}</h4>
                  <div className="pd-seller-rating">
                    <span className="material-symbols-outlined star-icon">star</span>
                    <span>4.8</span>
                  </div>
                </div>
              </div>
              <Link className="pd-seller-link" to="/products">Xem shop →</Link>
            </div>

            {/* Shipping Info */}
            <div className="pd-shipping-info">
              <div className="pd-shipping-item">
                <span className="material-symbols-outlined icon">location_on</span>
                <span className="pd-shipping-text">Quận 1, TP. Hồ Chí Minh</span>
              </div>
              <div className="pd-shipping-item">
                <span className="material-symbols-outlined icon">local_shipping</span>
                <span className="pd-shipping-text">Giao hàng toàn quốc (25.000₫)</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pd-actions-wrapper">
              {!isOwner ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button 
                      onClick={handleAddToCart}
                      disabled={addingToCart || isCartSuccess}
                      className="pd-btn-buy flex-1 !bg-surface-variant !text-primary border border-primary/40 hover:!bg-primary/10 transition-colors flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl shadow-sm disabled:opacity-70"
                    >
                      <span className={`material-symbols-outlined ${addingToCart && !isCartSuccess ? 'animate-spin' : ''}`}>
                        {isCartSuccess ? 'check' : addingToCart ? 'progress_activity' : 'add_shopping_cart'}
                      </span>
                      {isCartSuccess ? 'Đã thêm' : addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
                    </button>
                    <button 
                      onClick={handleBuyNow}
                      disabled={buying}
                      className="pd-btn-buy flex-1 !bg-primary !text-on-primary hover:!bg-primary/90 transition-colors flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl shadow-sm disabled:opacity-70"
                    >
                      <span className={`material-symbols-outlined ${buying ? 'animate-spin' : ''}`}>
                        {buying ? 'progress_activity' : 'shopping_bag'}
                      </span>
                      {buying ? 'Đang đặt...' : 'Đặt hàng ngay'}
                    </button>
                  </div>
                  <div className="pd-secondary-actions mt-3">
                    <button 
                      className="pd-btn-chat" 
                      onClick={() => window.openChatWith && sellerChatId ? window.openChatWith(sellerChatId, sellerName) : alert('Vui lòng tải lại trang để sử dụng chat.')}
                      disabled={!sellerChatId}
                    >
                      <span className="material-symbols-outlined">chat</span>
                      {sellerChatId ? 'Chat với seller' : 'Chat không khả dụng'}
                    </button>
                    <button 
                      className={`pd-btn-fav ${isFavorited ? 'is-favorited' : ''}`}
                      onClick={() => setIsFavorited(!isFavorited)}
                    >
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3 w-full">
                  {/* Status Banner */}
                  {isDraft ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-start gap-3">
                      <span className="material-symbols-outlined text-amber-600 shrink-0">drafts</span>
                      <div>
                        <p className="font-bold">Bản nháp</p>
                        <p className="mt-1">Sản phẩm này chưa được gửi đi kiểm duyệt. Vui lòng hoàn tất thông tin và gửi yêu cầu phê duyệt để đưa lên cửa hàng.</p>
                      </div>
                    </div>
                  ) : isRejected ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-start gap-3">
                      <span className="material-symbols-outlined text-red-600 shrink-0">error</span>
                      <div>
                        <p className="font-bold">Đã bị từ chối</p>
                        <p className="mt-1">Lý do: <strong>{rejectionReason}</strong></p>
                        <p className="mt-1">Bạn cần chỉnh sửa lại sản phẩm và gửi duyệt lại.</p>
                      </div>
                    </div>
                  ) : isPending ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-sm flex items-start gap-3">
                      <span className="material-symbols-outlined text-blue-600 shrink-0">pending_actions</span>
                      <div>
                        <p className="font-bold">Chờ duyệt</p>
                        <p className="mt-1">Sản phẩm đang được quản trị viên kiểm tra. Không thể chỉnh sửa lúc này.</p>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-4 ${isHidden ? 'bg-gray-50 border-gray-200 text-gray-800' : 'bg-surface-variant/40 border-outline-variant/60 text-on-surface'} border rounded-xl text-sm flex items-start gap-3`}>
                      <span className={`material-symbols-outlined ${isHidden ? 'text-gray-600' : 'text-primary'} text-2xl shrink-0`}>
                        {isHidden ? 'visibility_off' : 'checkroom'}
                      </span>
                      <div>
                        <p className="font-bold text-base">{isHidden ? 'Đã ẩn' : 'Đang hiển thị'}</p>
                        <p className={`text-xs ${isHidden ? 'text-gray-600' : 'text-on-surface-variant'} mt-1 leading-relaxed`}>
                          Bạn là người đăng bán sản phẩm này. {isHidden ? 'Sản phẩm đang bị ẩn khỏi cửa hàng.' : 'Người khác có thể thấy và mua.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Audit Logs */}
                  {auditLogs.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-current/20">
                      <p className="font-bold text-sm mb-2 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">history</span> Lịch sử duyệt</p>
                      <ul className="text-xs space-y-2 opacity-90">
                        {auditLogs.map((log, idx) => (
                          <li key={idx}><span className="font-semibold">{log.date || log.createdAt}:</span> {log.action || log.message} {log.reason ? `(Lý do: ${log.reason})` : ''}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {isDraft ? (
                    <div className="flex gap-2">
                      <Link to={`/edit-listing?id=${product.id}`} className="pd-btn-buy flex-1 !bg-surface-variant !text-primary border border-primary/40 hover:!bg-primary/10 transition-colors flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl shadow-sm text-center">
                        <span className="material-symbols-outlined">edit</span> Sửa
                      </Link>
                      <button 
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="pd-btn-buy flex-1 !bg-primary !text-on-primary hover:!bg-primary/90 transition-colors flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl shadow-sm text-center disabled:opacity-70"
                      >
                        <span className={`material-symbols-outlined ${submittingReview ? 'animate-spin' : ''}`}>
                          {submittingReview ? 'progress_activity' : 'send'}
                        </span>
                        {submittingReview ? 'Đang gửi...' : 'Gửi duyệt'}
                      </button>
                    </div>
                  ) : isRejected ? (
                    <Link to={`/edit-listing?id=${product.id}`} className="pd-btn-buy w-full !bg-primary !text-on-primary hover:!bg-primary/90 transition-colors flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl shadow-sm text-center">
                      <span className="material-symbols-outlined">edit</span> Sửa sản phẩm
                    </Link>
                  ) : isPending ? null : (
                    <div className="flex gap-2">
                      <Link to={`/edit-listing?id=${product.id}`} className="pd-btn-buy flex-1 !bg-surface-variant !text-primary border border-primary/40 hover:!bg-primary/10 transition-colors flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl shadow-sm text-center">
                        <span className="material-symbols-outlined">edit</span> Sửa
                      </Link>
                      <button 
                        onClick={() => handleToggleHide(isHidden)}
                        disabled={togglingHide}
                        className={`pd-btn-buy flex-1 ${isHidden ? '!bg-primary !text-on-primary' : 'bg-red-50 text-red-700 border border-red-200'} hover:opacity-90 transition-colors flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl shadow-sm text-center disabled:opacity-70`}
                      >
                        <span className={`material-symbols-outlined ${togglingHide ? 'animate-spin' : ''}`}>
                          {togglingHide ? 'progress_activity' : isHidden ? 'visibility' : 'visibility_off'}
                        </span> 
                        {togglingHide ? 'Đang xử lý...' : isHidden ? 'Hiện' : 'Ẩn'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Tabs */}
      <div className="pd-tabs-section">
        <div className="pd-tabs-header">
          <button 
            className={`pd-tab-btn ${activeTab === 'desc' ? 'is-active' : ''}`} 
            onClick={() => setActiveTab('desc')}
          >
            Mô tả sản phẩm
          </button>
          <button 
            className={`pd-tab-btn ${activeTab === 'ai' ? 'is-active' : ''}`} 
            onClick={() => setActiveTab('ai')}
          >
            AI Analysis
          </button>
        </div>
        <div className="pd-tabs-content">
          {/* Description Panel */}
          {activeTab === 'desc' && (
            <div className="pd-tab-panel is-active">
              <div className="pd-description-content">
                <h3>Thông tin chi tiết</h3>
                <p>{product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}</p>
                <ul>
                  <li>Độ mới: {conditionText}</li>
                  <li>Hình thức: {product.type === "BUNDLE" ? "Kiện đồ (Bundle)" : "Món lẻ"}</li>
                  <li>Nguồn gốc: Đồ cũ tuyển chọn bảo vệ môi trường</li>
                </ul>
              </div>
            </div>
          )}
          {/* AI Panel */}
          {activeTab === 'ai' && (
            <div className="pd-tab-panel is-active">
              <div className="pd-ai-content">
                <div className="pd-ai-header">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  <h3>Kết quả giám định AI</h3>
                </div>
                <p className="pd-ai-text">
                  Hệ thống AI đã phân tích cấu trúc sợi vải, đường may và tag nhãn qua hình ảnh cung cấp. Kết quả giám định cho thấy đây là sản phẩm thuộc danh mục <strong>{product.category || "Khác"}</strong>. Tình trạng vải đạt chất lượng tốt, form dáng được bảo tồn ở mức <strong>{conditionText}</strong>.
                  {aiTagsList && (
                    <>
                      <br/><br/><strong>Nhãn AI nhận diện:</strong><br/>
                      {aiTagsList}
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Other Listings from Seller */}
      {sellerProducts.length > 0 && (
        <section className="pd-listings-section">
          <div className="pd-listings-header">
            <h2 className="pd-listings-title">Sản phẩm khác từ {sellerName}</h2>
            <Link className="pd-listings-link" to="/products">Tất cả sản phẩm <span className="material-symbols-outlined icon">arrow_right_alt</span></Link>
          </div>
          <div className="pd-listings-grid">
            {sellerProducts.map(p => {
              const img = p.images && p.images.length > 0 ? p.images[0] : "https://placehold.co/400x533/E4EBE4/6E7B6C?text=No+Image";
              const priceK = p.price ? `${Math.round(p.price / 1000)}k` : "Liên hệ";
              return (
                <Link to={`/product/${p.id}`} key={p.id} className="pd-card">
                  <div className="pd-card-img-wrapper">
                    <img src={img} alt={p.title} className="pd-card-img" loading="lazy" />
                    <span className="pd-card-price-badge">{priceK}</span>
                  </div>
                  <h4 className="pd-card-title">{p.title || "Sản phẩm không có tên"}</h4>
                  <p className="pd-card-meta">Size {p.size || "Free"} | {getConditionText(p.condition)}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="pd-listings-section">
          <h2 className="pd-listings-title" style={{ marginBottom: '24px' }}>Sản phẩm tương tự</h2>
          <div className="pd-listings-grid">
            {similarProducts.map(p => {
              const img = p.images && p.images.length > 0 ? p.images[0] : "https://placehold.co/400x533/E4EBE4/6E7B6C?text=No+Image";
              return (
                <Link to={`/product/${p.id}`} key={p.id} className="pd-similar-card pd-card">
                  <div className="pd-card-img-wrapper">
                    <img src={img} alt={p.title} className="pd-card-img" loading="lazy" />
                  </div>
                  <span className="pd-similar-category">{p.category || "Khác"}</span>
                  <h3 className="pd-similar-title">{p.title || "Sản phẩm không có tên"}</h3>
                  <p className="pd-similar-price">{p.price ? p.price.toLocaleString("vi") + "₫" : "Liên hệ"}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
