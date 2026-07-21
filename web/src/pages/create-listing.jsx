import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import "../styles/create-listing.css";
import {
  createProduct,
  updateProduct,
  getProductById,
  markDraftProductId,
  unmarkDraftProductId,
  isDraftProduct,
  uploadProductImage,
} from "../services/product.service.js";
import { isAuthenticated } from "../services/auth.service.js";
import { getAllCategories } from "../services/staff.service.js";
import { compressImage } from "../utils/image.js";

export default function CreateListing() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditMode = Boolean(editId);

  // States
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [categories, setCategories] = useState([]);
  
  // Form States
  const [category, setCategory] = useState({ id: "", name: "" });
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [tags, setTags] = useState("");
  const [price, setPrice] = useState("");
  const [delivery, setDelivery] = useState("Giao hàng nhanh (GHN)");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type] = useState("ITEM");
  
  // Images State
  const [selectedImages, setSelectedImages] = useState([]); // { file, compressedFile, previewUrl, uploadUrl, status }
  const fileInputRef = useRef(null);

  // Preview Modal State
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const loadInitialData = async () => {
      setLoading(true);
      setLoadingText("Đang tải dữ liệu...");
      
      try {
        let cats = await getAllCategories();
        if (!Array.isArray(cats) || cats.length === 0) {
          cats = [
            { id: "c1", name: "Quần áo" },
            { id: "c2", name: "Áo thun / Sơ mi" },
            { id: "c3", name: "Quần dài / Short" },
            { id: "c4", name: "Váy & Đầm" },
            { id: "c5", name: "Áo khoác / Blazer" },
            { id: "c6", name: "Đồ thể thao" },
            { id: "c7", name: "Đồ ngủ / Mặc nhà" },
          ];
        }
        setCategories(cats);

        if (isEditMode && editId) {
          setLoadingText("Đang tải thông tin sản phẩm...");
          const product = await getProductById(editId);
          if (product) {
            const isDraft = (String(product.status || '').trim().toUpperCase() === 'DRAFT') || isDraftProduct(product);
            if (!isDraft) {
              alert("Chỉ những sản phẩm với trạng thái Bản nháp (DRAFT) mới có thể chỉnh sửa.");
              navigate("/profile?tab=panel-shop");
              return;
            }
            
            setTitle(product.title || "");
            setDescription(product.description || "");
            setBrand(product.brand || "");
            setPrice(product.price || "");
            setColor(product.color || "");
            setCondition(product.condition || "3");
            
            if (product.aiTags && Array.isArray(product.aiTags)) {
              setTags(product.aiTags.join(", "));
            }
            
            // set category
            if (product.category || product.categoryId) {
              setCategory({ id: product.categoryId || "", name: product.category || "" });
            }
            
            // set size
            const pSize = product.size || "";
            if (["XS", "S", "M", "L", "XL"].includes(pSize.toUpperCase())) {
              setSize(pSize.toUpperCase());
            } else if (pSize) {
              setSize("Khác");
              setIsCustomSize(true);
              setCustomSize(pSize);
            }

            // set images
            const existingImages = product.images || (product.imageUrl ? [product.imageUrl] : []);
            if (Array.isArray(existingImages)) {
              setSelectedImages(existingImages.map(url => ({
                file: null,
                compressedFile: null,
                previewUrl: url,
                uploadUrl: url,
                status: 'success'
              })));
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setIsDirty(false); // Reset dirty after load
      }
    };
    
    loadInitialData();
  }, [navigate, isEditMode, editId]);

  // Dirty state tracking
  useEffect(() => {
    const beforeUnload = (e) => {
      if (isDirty && !isSubmitting) {
        e.preventDefault();
        e.returnValue = "Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng trang?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isDirty, isSubmitting]);

  const markDirty = () => !isDirty && setIsDirty(true);

  // Auto-process upload queue
  useEffect(() => {
    const processUploadQueue = async () => {
      const activeUploads = selectedImages.filter(img => img.status === 'uploading').length;
      if (activeUploads >= 3) return;

      const nextImgIdx = selectedImages.findIndex(img => img.status === 'pending');
      if (nextImgIdx === -1) return;

      setSelectedImages(prev => {
        const newArr = [...prev];
        newArr[nextImgIdx] = { ...newArr[nextImgIdx], status: 'uploading' };
        return newArr;
      });

      try {
        const nextImg = selectedImages[nextImgIdx];
        const res = await uploadProductImage(nextImg.compressedFile);
        setSelectedImages(prev => {
          const newArr = [...prev];
          newArr[nextImgIdx] = { ...newArr[nextImgIdx], uploadUrl: res.url, status: 'success' };
          return newArr;
        });
      } catch (err) {
        console.error("Lỗi upload ảnh:", err);
        setSelectedImages(prev => {
          const newArr = [...prev];
          newArr[nextImgIdx] = { ...newArr[nextImgIdx], status: 'error' };
          return newArr;
        });
      }
    };
    processUploadQueue();
  }, [selectedImages]);

  const handleFiles = async (files) => {
    const spaceLeft = 10 - selectedImages.length;
    if (spaceLeft <= 0) {
      alert("Bạn chỉ được tải lên tối đa 10 ảnh sản phẩm.");
      return;
    }
    const filesToProcess = Array.from(files).slice(0, spaceLeft);
    
    setLoading(true);
    setLoadingText("Đang xử lý hình ảnh...");
    
    const newImages = [];
    for (const file of filesToProcess) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.85 });
        const previewUrl = URL.createObjectURL(compressed);
        newImages.push({
          file,
          compressedFile: compressed,
          previewUrl,
          uploadUrl: null,
          status: 'pending'
        });
      } catch (err) {
        console.error("Nén ảnh thất bại:", err);
      }
    }
    
    setSelectedImages(prev => [...prev, ...newImages]);
    markDirty();
    setLoading(false);
  };

  const removeImage = (idx, e) => {
    e.stopPropagation();
    const img = selectedImages[idx];
    if (img.previewUrl && !img.previewUrl.startsWith("http")) {
      URL.revokeObjectURL(img.previewUrl);
    }
    setSelectedImages(prev => prev.filter((_, i) => i !== idx));
    markDirty();
  };

  const retryUpload = (idx, e) => {
    e.stopPropagation();
    setSelectedImages(prev => {
      const newArr = [...prev];
      newArr[idx] = { ...newArr[idx], status: 'pending' };
      return newArr;
    });
  };

  const uploadAllImages = async () => {
    const isUploading = selectedImages.some(img => img.status === 'pending' || img.status === 'uploading');
    if (isUploading) throw new Error("Vui lòng chờ hệ thống tải lên hình ảnh hoàn tất.");
    
    const hasError = selectedImages.some(img => img.status === 'error');
    if (hasError) throw new Error("Có ảnh tải lên bị lỗi. Vui lòng thử lại hoặc xóa ảnh lỗi.");

    const urls = [];
    for (let i = 0; i < selectedImages.length; i++) {
      const img = selectedImages[i];
      if (img.uploadUrl) {
        urls.push(img.uploadUrl);
      } else {
        if (!img.compressedFile) {
          urls.push(img.previewUrl);
        } else {
          setLoading(true);
          setLoadingText(`Đang đăng tải ảnh ${i + 1}/${selectedImages.length} lên máy chủ...`);
          const res = await uploadProductImage(img.compressedFile);
          urls.push(res.url);
        }
      }
    }
    return urls;
  };

  const saveProduct = async (status) => {
    const finalSize = size === "Khác" ? customSize : size;

    if (status === "AVAILABLE") {
      if (selectedImages.length === 0) {
        alert("Vui lòng tải lên ít nhất 1 ảnh sản phẩm.");
        return false;
      }
      if (!category.name || !brand || !condition || !color || !finalSize || !price || !title || !description) {
        alert("Vui lòng điền đầy đủ tất cả các trường thông tin bắt buộc.");
        return false;
      }
    } else {
      if (!title) {
        alert("Vui lòng nhập Tên sản phẩm trước khi lưu bản nháp.");
        return false;
      }
    }

    const nonFashionKeywords = [
      "điện tử", "máy tính", "điện thoại", "laptop", "tủ lạnh", "máy giặt", "xe máy", "ô tô", "đồ gia dụng", "tivi", "ti vi"
    ];
    const lowerTitle = (title || "").toLowerCase();
    const lowerDesc = (description || "").toLowerCase();
    for (const kw of nonFashionKeywords) {
      if (lowerTitle.includes(kw) || lowerDesc.includes(kw)) {
        alert("Hệ thống EcoCycle chỉ hỗ trợ đăng bán các sản phẩm Thời trang. Các mặt hàng điện tử, xe cộ, gia dụng không thuộc phạm vi hỗ trợ.");
        return false;
      }
    }

    try {
      setLoading(true);
      setLoadingText("Đang xử lý dữ liệu...");
      const imageUrls = await uploadAllImages();

      const tagsList = tags ? tags.split(",").map(t => t.trim()).filter(t => t.length > 0) : [];
      const isValidUUID = (idStr) => idStr && typeof idStr === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idStr.trim());
      const cleanCategoryId = isValidUUID(category.id) ? category.id.trim() : null;

      const payload = {
        title,
        description,
        category: category.name,
        categoryId: cleanCategoryId,
        type: "ITEM",
        condition: condition ? parseInt(condition, 10) : 3,
        price: price ? parseInt(price, 10) : 0,
        size: finalSize,
        color,
        images: imageUrls,
        aiTags: tagsList,
        brand,
        status: status
      };

      setLoadingText(isEditMode ? "Đang cập nhật sản phẩm..." : (status === "AVAILABLE" ? "Đang đăng bán sản phẩm..." : "Đang lưu bản nháp..."));
      
      let createdProduct;
      if (isEditMode) {
        createdProduct = await updateProduct(editId, payload);
      } else {
        createdProduct = await createProduct(payload);
      }
      
      const createdProductId = createdProduct?.id ?? createdProduct?.productId ?? createdProduct?.data?.id ?? editId;
      if (createdProductId) {
        if (status === "DRAFT") markDraftProductId(createdProductId);
        else unmarkDraftProductId(createdProductId);
      }

      setIsDirty(false);
      setIsSubmitting(true);
      setLoading(false);

      const finalStatus = (createdProduct?.status || createdProduct?.data?.status || status).toUpperCase();
      let successMsg = "Thao tác thành công!";
      if (isEditMode) {
        successMsg = finalStatus === "PENDING" ? "Cập nhật thành công! Sản phẩm đang chờ quản trị viên duyệt." : "Cập nhật sản phẩm thành công!";
      } else {
        if (status === "DRAFT") successMsg = "Lưu bản nháp thành công!";
        else successMsg = finalStatus === "PENDING" ? "Đăng bán thành công! Sản phẩm đang chờ quản trị viên duyệt." : "Đăng bán sản phẩm thành công!";
      }
      alert(successMsg);
      
      navigate("/profile");
      return true;
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Đã xảy ra lỗi: " + err.message);
      return false;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("dragover");
  };
  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("dragover");
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("dragover");
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const formattedPricePreview = price && !isNaN(Number(price)) ? Number(price).toLocaleString("vi-VN") + " VND" : "";

  return (
    <div className="cl-wrapper">
      <div className="cl-container">
        <div className="cl-card">
          {loading && (
            <div className="cl-loading-overlay">
              <div className="cl-spinner"></div>
              <p style={{ fontWeight: 600, color: '#006B2C' }}>{loadingText}</p>
            </div>
          )}

          <header className="cl-header">
            <h1 className="cl-title">{isEditMode ? 'Cập Nhật Listing' : 'Tạo Listing Mới'}</h1>
            <p className="cl-subtitle">{isEditMode ? 'Chỉnh sửa thông tin bài đăng bán hoặc bản nháp của bạn.' : 'Đăng tải sản phẩm thời trang, phụ kiện cũ của bạn để tái sinh chúng.'}</p>
          </header>

          <form id="cl-form" noValidate onSubmit={(e) => { e.preventDefault(); saveProduct("AVAILABLE"); }}>
            {/* SECTION 1: Image Upload */}
            <div className="cl-form-section">
              <h3 className="cl-section-title">
                <span className="material-symbols-outlined icon">add_a_photo</span>
                Hình ảnh sản phẩm (1 - 10 ảnh)
              </h3>
              
              <div 
                className="cl-dropzone" 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <span className="material-symbols-outlined cl-dropzone-icon">cloud_upload</span>
                <p className="cl-dropzone-text">Kéo thả ảnh vào đây hoặc click để chọn ảnh</p>
                <p className="cl-dropzone-sub">Hỗ trợ định dạng JPG, PNG. Dung lượng tối đa 10MB. Hệ thống sẽ tự động tối ưu hóa chất lượng ảnh.</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  multiple accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = null; }}
                />
              </div>

              <div className="cl-image-grid">
                {selectedImages.map((img, idx) => (
                  <div key={idx} className="cl-image-item">
                    <img src={img.previewUrl} alt="Preview" />
                    {img.status === 'uploading' && <div className="cl-image-status uploading"><span className="material-symbols-outlined">progress_activity</span></div>}
                    {img.status === 'error' && <div className="cl-image-status error cl-retry-btn" title="Lỗi upload. Click để thử lại." onClick={(e) => retryUpload(idx, e)}><span className="material-symbols-outlined">refresh</span></div>}
                    {img.status === 'success' && <div className="cl-image-status success"><span className="material-symbols-outlined">check_circle</span></div>}
                    <button type="button" className="cl-image-remove" onClick={(e) => removeImage(idx, e)}>&times;</button>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: Details */}
            <div className="cl-form-section">
              <h3 className="cl-section-title">
                <span className="material-symbols-outlined icon">description</span>
                Thông tin chi tiết sản phẩm
              </h3>

              <div className="cl-row-2col">
                <div className="cl-group">
                  <label className="cl-label">Phân loại đăng bán</label>
                  <select className="cl-select bg-surface-variant/40 cursor-not-allowed" value={type} disabled>
                    <option value="ITEM">Sản phẩm đơn lẻ (Item)</option>
                  </select>
                  <span className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">info</span>
                    Hệ thống chỉ hỗ trợ đăng bán sản phẩm đơn lẻ
                  </span>
                </div>

                <div className="cl-group">
                  <label className="cl-label">Danh mục</label>
                  <div className="cl-bubble-container">
                    {categories.length === 0 ? (
                      <span className="text-xs text-on-surface-variant flex items-center gap-1.5 py-2">
                        <span className="material-symbols-outlined text-sm animate-spin text-primary">progress_activity</span>
                        Đang tải danh mục...
                      </span>
                    ) : (
                      categories.map(cat => {
                        const isSelected = category.id === cat.id || category.name === cat.name;
                        return (
                          <button 
                            key={cat.id || cat.name} 
                            type="button" 
                            className={`cl-bubble-chip ${isSelected ? 'active' : ''}`}
                            onClick={() => {
                              setCategory({ id: cat.id || "", name: cat.name || "" });
                              markDirty();
                            }}
                          >
                            <span className="material-symbols-outlined text-sm">{isSelected ? 'check_circle' : 'circle'}</span>
                            {cat.name || "Không tên"}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="cl-row-2col">
                <div className="cl-group">
                  <label className="cl-label">Thương hiệu</label>
                  <input type="text" className="cl-input" placeholder="Ví dụ: Nike, Uniqlo, No Brand..." required value={brand} onChange={e => { setBrand(e.target.value); markDirty(); }} />
                </div>

                <div className="cl-group">
                  <label className="cl-label">Tình trạng độ mới</label>
                  <select className="cl-select" required value={condition} onChange={e => { setCondition(e.target.value); markDirty(); }}>
                    <option value="" disabled>Chọn độ mới</option>
                    <option value="1">Mới 100% (Chưa qua sử dụng, còn tag)</option>
                    <option value="2">Mới 99% (Như mới, dùng thử 1-2 lần)</option>
                    <option value="3">Mới 95% (Hao mòn cực ít, chất lượng tốt)</option>
                    <option value="4">Cũ 80% (Hao mòn vừa phải, không lỗi rách)</option>
                    <option value="5">Cũ 60% (Cũ nhiều, giá rẻ)</option>
                  </select>
                </div>
              </div>

              <div className="cl-row-2col">
                <div className="cl-group">
                  <label className="cl-label">Màu sắc</label>
                  <input type="text" className="cl-input" placeholder="Ví dụ: Đen, Trắng sọc xanh..." required value={color} onChange={e => { setColor(e.target.value); markDirty(); }} />
                </div>

                <div className="cl-group">
                  <label className="cl-label">Kích cỡ (Size)</label>
                  <div className="cl-bubble-container">
                    {["XS", "S", "M", "L", "XL"].map(s => (
                      <button key={s} type="button" className={`cl-bubble-chip ${size === s ? 'active' : ''}`} onClick={() => { setSize(s); setIsCustomSize(false); markDirty(); }}>{s}</button>
                    ))}
                    <button type="button" className={`cl-bubble-chip ${size === 'Khác' ? 'active' : ''}`} onClick={() => { setSize("Khác"); setIsCustomSize(true); markDirty(); }}>khác</button>
                  </div>
                  {isCustomSize && (
                    <div className="mt-3 animate-fade-in">
                      <input type="text" className="cl-input" placeholder="Nhập kích cỡ mong muốn..." value={customSize} onChange={e => { setCustomSize(e.target.value); markDirty(); }} />
                    </div>
                  )}
                </div>
              </div>

              <div className="cl-group">
                <label className="cl-label">Tags sản phẩm (cách nhau bằng dấu phẩy)</label>
                <input type="text" className="cl-input" placeholder="Ví dụ: vintage, summer, y2k, denim..." value={tags} onChange={e => { setTags(e.target.value); markDirty(); }} />
              </div>
            </div>

            {/* SECTION 3: Pricing & Delivery */}
            <div className="cl-form-section">
              <h3 className="cl-section-title">
                <span className="material-symbols-outlined icon">local_shipping</span>
                Giá bán & Giao nhận
              </h3>

              <div className="cl-row-2col">
                <div className="cl-group">
                  <label className="cl-label">Giá bán (VNĐ)</label>
                  <input type="number" className="cl-input" min="0" placeholder="Ví dụ: 150000" required value={price} onChange={e => { setPrice(e.target.value); markDirty(); }} />
                  <div className="text-primary font-bold text-sm mt-1.5 min-h-[20px] transition-all">{formattedPricePreview}</div>
                </div>

                <div className="cl-group">
                  <label className="cl-label">Phương thức giao hàng gợi ý</label>
                  <select className="cl-select" value={delivery} onChange={e => { setDelivery(e.target.value); markDirty(); }}>
                    <option value="Giao hàng nhanh (GHN)">Giao hàng nhanh (GHN)</option>
                    <option value="Giao hàng tiết kiệm (GHTK)">Giao hàng tiết kiệm (GHTK)</option>
                    <option value="Tự thỏa thuận">Người mua tự liên hệ thỏa thuận</option>
                  </select>
                </div>
              </div>

              <div className="cl-group">
                <label className="cl-label">Tên sản phẩm (Tiêu đề tin đăng)</label>
                <input type="text" className="cl-input" placeholder="Ví dụ: Áo khoác Blazer dáng rộng màu đen tuyền" required value={title} onChange={e => { setTitle(e.target.value); markDirty(); }} />
              </div>

              <div className="cl-group">
                <label className="cl-label">Mô tả sản phẩm chi tiết</label>
                <textarea className="cl-textarea" rows="5" placeholder="Hãy mô tả chi tiết độ mới..." required value={description} onChange={e => { setDescription(e.target.value); markDirty(); }}></textarea>
              </div>
            </div>

            {/* Actions Row */}
            <div className="cl-actions">
              <button type="button" className="cl-btn cl-btn--outline" onClick={() => setShowPreview(true)}>
                <span className="material-symbols-outlined">visibility</span> Xem trước
              </button>
              <button type="button" className="cl-btn cl-btn--secondary" onClick={() => saveProduct("DRAFT")}>
                <span className="material-symbols-outlined">save</span> Lưu bản nháp
              </button>
              <button type="submit" className="cl-btn cl-btn-primary">
                {isEditMode ? 'Lưu Thay Đổi' : 'Đăng Bán Ngay'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preview Modal Structure */}
      {showPreview && (
        <div className="cl-modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="cl-modal-card" onClick={e => e.stopPropagation()}>
            <div className="cl-modal-header">
              <h2 className="cl-modal-title">Xem trước tin đăng</h2>
              <button type="button" className="cl-modal-close" onClick={() => setShowPreview(false)}>&times;</button>
            </div>
            <div className="cl-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px', fontFamily: "'Be Vietnam Pro',sans-serif" }}>
                <div>
                  <div style={{ width: '100%', aspectRatio: '4/5', borderRadius: '16px', overflow: 'hidden', border: '1px solid #DDE5DB', marginBottom: '12px', background: '#f9f9f9' }}>
                    <img src={selectedImages.length > 0 ? selectedImages[0].previewUrl : "https://placehold.co/400x500/E4EBE4/6E7B6C?text=No+Image"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview Main" />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedImages.map((img, idx) => (
                      <img key={idx} src={img.previewUrl} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #DDE5DB' }} alt="Preview Thumb" />
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ background: '#E5EDE4', color: '#006B2C', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>Sản phẩm đơn lẻ (Item)</span>
                    <span style={{ background: '#F0F5EF', color: '#6E7B6C', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }}>{category.name || "Chưa chọn danh mục"}</span>
                  </div>

                  <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#1E271D', margin: '0 0 12px 0', lineHeight: 1.3 }}>{title || "Tên sản phẩm xem trước"}</h2>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#006B2C', margin: '0 0 24px 0' }}>{formattedPricePreview || "Liên hệ"}</p>

                  <div style={{ background: '#F7FAF6', border: '1px solid #DDE5DB', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', textTransform: 'uppercase', color: '#6E7B6C', letterSpacing: '0.5px' }}>Thông tin thuộc tính</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                      <div><strong style={{ color: '#4A5748' }}>Thương hiệu:</strong> {brand || "Chưa nhập"}</div>
                      <div>
                        <strong style={{ color: '#4A5748' }}>Độ mới:</strong> 
                        {condition === "1" ? " Mới 100%" : condition === "2" ? " Mới 99%" : condition === "3" ? " Mới 95%" : condition === "4" ? " Cũ 80%" : condition === "5" ? " Cũ 60%" : " Chưa chọn"}
                      </div>
                      <div><strong style={{ color: '#4A5748' }}>Màu sắc:</strong> {color || "Chưa nhập"}</div>
                      <div><strong style={{ color: '#4A5748' }}>Kích cỡ (Size):</strong> {size === "Khác" ? customSize : size || "Chưa chọn size"}</div>
                      <div style={{ gridColumn: 'span 2' }}><strong style={{ color: '#4A5748' }}>Vận chuyển gợi ý:</strong> {delivery}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#2E392D' }}>Mô tả sản phẩm</h4>
                    <p style={{ fontSize: '14px', color: '#4A5748', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{description || "Mô tả sản phẩm..."}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {tags && tags.split(",").map(t => t.trim()).filter(t => t).map((t, idx) => (
                      <span key={idx} className="preview-tag">#{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
