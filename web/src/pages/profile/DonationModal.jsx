import React, { useState, useEffect } from "react";
import {
  createDonationRequestApi,
  createDonationRequestCustomApi,
  getAllDonationEventsApi,
  getMyWardrobeItemsApi
} from "../../services/profile.service.js";
import { showToast } from "../../utils/ui.js";
import { formatApiError } from "../../utils/api.js";

export default function DonationModal({ organizations = [], onSuccess, onClose }) {
  const [activeTab, setActiveTab] = useState("wardrobe"); // "wardrobe" | "custom"
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [events, setEvents] = useState([]);
  const [wardrobeItems, setWardrobeItems] = useState([]);

  // Form State - Wardrobe Tab
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedWardrobeIds, setSelectedWardrobeIds] = useState([]);
  const [description, setDescription] = useState("");

  // Form State - Custom Tab
  const [customEventId, setCustomEventId] = useState("");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Quần áo");
  const [condition, setCondition] = useState("Mới 100%");
  const [conditionNote, setConditionNote] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customImage, setCustomImage] = useState(null);
  const [customImagePreview, setCustomImagePreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, wardrobeData] = await Promise.all([
          getAllDonationEventsApi(),
          getMyWardrobeItemsApi()
        ]);
        
        if (Array.isArray(eventsData)) {
          setEvents(eventsData.filter(ev => {
            const st = String(ev.status || "").toUpperCase();
            return st === "ONGOING" || st === "UPCOMING" || !st;
          }));
        }
        
        if (Array.isArray(wardrobeData)) {
          const items = wardrobeData.filter(w => String(w.status || "").toUpperCase() === "OWNED" || !w.status);
          setWardrobeItems(items);
          if (items.length === 0) {
            setActiveTab("custom");
          }
        }
      } catch (err) {
        console.warn("Lỗi tải dữ liệu cho Modal quyên góp:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleWardrobeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEventId) return showToast("Vui lòng chọn Chiến dịch Quyên góp!", "warning");
    if (selectedWardrobeIds.length === 0) return showToast("Vui lòng chọn ít nhất 1 vật phẩm!", "warning");

    setSubmitting(true);
    try {
      await createDonationRequestApi({
        donationEventId: selectedEventId,
        description: description,
        wardrobeItemIds: selectedWardrobeIds
      });
      showToast("Gửi yêu cầu quyên góp thành công!", "success");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      showToast(formatApiError(err, "gửi yêu cầu"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEventId) return showToast("Vui lòng chọn Chiến dịch Quyên góp!", "warning");
    if (!itemName) return showToast("Tên vật phẩm không được để trống!", "warning");
    if (!customImage) return showToast("Vui lòng đính kèm ảnh chụp!", "warning");

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("donationEventId", customEventId);
      fd.append("itemName", itemName);
      fd.append("category", category);
      fd.append("condition", condition);
      fd.append("conditionNote", conditionNote);
      fd.append("description", customDesc);
      fd.append("image", customImage);

      await createDonationRequestCustomApi(fd);
      showToast("Tạo & quyên góp thành công!", "success");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      showToast(formatApiError(err, "gửi yêu cầu"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Kích thước ảnh vượt quá 5MB!", "warning");
        return;
      }
      setCustomImage(file);
      setCustomImagePreview(URL.createObjectURL(file));
    }
  };

  const removeCustomImage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCustomImage(null);
    setCustomImagePreview(null);
  };

  const toggleWardrobeItem = (id) => {
    setSelectedWardrobeIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl border border-outline-variant/30 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-on-surface">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="modal-backdrop" className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={(e) => { if(e.target.id === 'modal-backdrop' && onClose) onClose(); }}>
      <div className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-outline-variant/30 relative flex flex-col gap-5 max-h-[92vh] overflow-hidden">
        
        <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30">
          <div>
            <h4 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">volunteer_activism</span> Đăng ký Quyên góp
            </h4>
            <p className="text-xs text-on-surface-variant mt-0.5">Chọn vật phẩm từ tủ đồ hoặc tải lên đồ mới để gửi tới các chiến dịch từ thiện.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-outline-variant transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="flex border border-outline-variant/30 rounded-xl p-1 bg-surface-variant/30 gap-1">
          <button type="button" onClick={() => setActiveTab("wardrobe")} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'wardrobe' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <span className="material-symbols-outlined text-sm">checkroom</span> Chọn từ Tủ đồ ({wardrobeItems.length})
          </button>
          <button type="button" onClick={() => setActiveTab("custom")} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'custom' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <span className="material-symbols-outlined text-sm">add_circle</span> Quyên góp Đồ mới
          </button>
        </div>

        <div className="overflow-y-auto pr-1 flex-1">
          
          {activeTab === 'wardrobe' && (
            <form onSubmit={handleWardrobeSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Chiến dịch <span className="text-error">*</span></label>
                <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} required className="px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                  <option value="">-- Chọn Chiến dịch --</option>
                  {events.map(ev => (
                    <option key={ev.id || ev.donationEventId} value={ev.id || ev.donationEventId}>
                      {ev.title} {ev.orgName ? `• ${ev.orgName}` : ""} {String(ev.status).toUpperCase() === 'ONGOING' ? '[Đang diễn ra]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Chọn vật phẩm <span className="text-error">*</span></label>
                  <span className="text-[11px] text-primary font-semibold">Đã chọn: {selectedWardrobeIds.length} món</span>
                </div>
                <div className="rounded-xl transition-colors">
                  {wardrobeItems.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-outline-variant rounded-xl bg-surface-variant/20 flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-3xl text-outline">checkroom</span>
                      <p className="text-xs font-semibold text-on-surface">Tủ đồ trống.</p>
                      <p className="text-[11px] text-on-surface-variant">Hãy chuyển sang tab quyên góp đồ mới.</p>
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto flex flex-col gap-2.5 pr-1 border border-outline-variant/30 p-3 rounded-xl bg-surface/50">
                      {wardrobeItems.map(item => (
                        <label key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-outline-variant/30 hover:border-primary/50 bg-surface-container-lowest cursor-pointer transition-all">
                          <input 
                            type="checkbox" 
                            checked={selectedWardrobeIds.includes(item.id)}
                            onChange={() => toggleWardrobeItem(item.id)}
                            className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary focus:ring-2 cursor-pointer" 
                          />
                          <img src={item.imageUrl || item.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=150&q=80"} className="w-11 h-11 object-cover rounded-lg bg-surface-variant flex-shrink-0" alt="Item" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-on-surface truncate">{item.name || "Vật phẩm"}</p>
                            <p className="text-xs text-on-surface-variant truncate">{item.category} • {item.condition}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Mô tả / Lời nhắn</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows="2" className="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30 mt-1">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-surface-variant text-on-surface-variant font-medium text-xs hover:bg-outline-variant">Hủy</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center gap-1.5">
                  {submitting ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-sm">send</span>}
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          )}

          {activeTab === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Chiến dịch <span className="text-error">*</span></label>
                <select value={customEventId} onChange={e => setCustomEventId(e.target.value)} required className="px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                  <option value="">-- Chọn Chiến dịch --</option>
                  {events.map(ev => (
                    <option key={ev.id || ev.donationEventId} value={ev.id || ev.donationEventId}>
                      {ev.title} {ev.orgName ? `• ${ev.orgName}` : ""} {String(ev.status).toUpperCase() === 'ONGOING' ? '[Đang diễn ra]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Tên vật phẩm <span className="text-error">*</span></label>
                  <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} required className="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Danh mục</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                    <option value="Quần áo">Quần áo</option>
                    <option value="Giày dép">Giày dép</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Tình trạng đồ</label>
                  <select value={condition} onChange={e => setCondition(e.target.value)} className="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                    <option value="Mới 100%">Mới 100% (Chưa qua sử dụng)</option>
                    <option value="Gần như mới (90-95%)">Gần như mới (90-95%)</option>
                    <option value="Đã qua sử dụng (Tốt)">Đã qua sử dụng (Tốt)</option>
                    <option value="Cần tân trang nhẹ">Cần tân trang nhẹ</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Ghi chú tình trạng</label>
                  <input type="text" value={conditionNote} onChange={e => setConditionNote(e.target.value)} className="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Ảnh chụp thực tế <span className="text-error">*</span></label>
                <div className="border-2 border-dashed border-outline-variant rounded-xl p-4 text-center bg-surface hover:bg-surface-variant/20 transition-all cursor-pointer relative">
                  {!customImagePreview && (
                    <input type="file" accept="image/*" onChange={handleImageChange} required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  )}
                  {customImagePreview ? (
                    <div className="flex items-center gap-3 w-full p-2.5 bg-surface-container-lowest rounded-xl border border-emerald-500/30 text-left shadow-xs">
                      <img src={customImagePreview} className="w-14 h-14 object-cover rounded-lg border border-outline-variant/30 flex-shrink-0" alt="Preview" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-on-surface truncate">{customImage?.name}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-xs">check_circle</span> Đã chọn ảnh
                        </p>
                      </div>
                      <button type="button" onClick={removeCustomImage} className="p-1.5 rounded-lg text-error hover:bg-error/10 transition-colors pointer-events-auto z-20 relative">
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center pointer-events-none">
                      <span className="material-symbols-outlined text-3xl text-primary mb-1">add_a_photo</span>
                      <p className="text-xs font-bold text-on-surface">Nhấn để tải lên ảnh</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Mô tả / Lời nhắn</label>
                <textarea value={customDesc} onChange={e => setCustomDesc(e.target.value)} rows="2" className="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30 mt-1">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-surface-variant text-on-surface-variant font-medium text-xs hover:bg-outline-variant">Hủy</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center gap-1.5">
                  {submitting ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-sm">send</span>}
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
