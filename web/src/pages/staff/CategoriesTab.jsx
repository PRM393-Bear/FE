import React, { useState, useEffect } from "react";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../../services/staff.service.js";
import { showToast } from "../../utils/ui.js";

export default function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formState, setFormState] = useState({ id: "", name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const cats = await getAllCategories();
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenForm = (cat = null) => {
    if (cat) {
      setFormState({ id: cat.id, name: cat.name || "", description: cat.description || "" });
    } else {
      setFormState({ id: "", name: "", description: "" });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formState.name.trim(),
        description: formState.description.trim(),
      };
      
      if (formState.id) {
        await updateCategory(formState.id, payload);
        showToast("Cập nhật danh mục thành công!", "success");
      } else {
        await createCategory(payload);
        showToast("Thêm danh mục mới thành công!", "success");
      }
      setShowForm(false);
      await loadCategories();
    } catch (err) {
      showToast("Lỗi: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}" không?`)) return;
    setDeletingId(id);
    try {
      await deleteCategory(id);
      showToast(`Đã xóa danh mục "${name}"!`, "success");
      await loadCategories();
    } catch (err) {
      showToast("Lỗi xóa: " + err.message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
        <div>
          <h3 className="text-headline-sm font-bold text-on-surface">Quản lý Danh mục (Categories)</h3>
          <p className="text-body-md text-on-surface-variant">Thêm, chỉnh sửa hoặc xóa các danh mục sản phẩm thời trang trong hệ thống EcoCycle.</p>
        </div>
        <button onClick={() => handleOpenForm()} className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold shadow hover:bg-primary/90 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined">add_circle</span> Thêm danh mục mới
        </button>
      </div>

      {/* Category Form Modal / Inline Box */}
      {showForm && (
        <div className="bg-surface-variant/40 border border-primary/30 p-6 rounded-2xl transition-all">
          <h4 className="text-title-md font-bold text-on-surface mb-4">{formState.id ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}</h4>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant">Tên danh mục <span className="text-error">*</span></label>
                <input type="text" name="name" value={formState.name} onChange={handleChange} required placeholder="VD: Áo thun vintage, Quần jean tái chế..." className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant">Mô tả chi tiết</label>
                <input type="text" name="description" value={formState.description} onChange={handleChange} placeholder="Mô tả ngắn gọn về danh mục này..." className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <button type="button" onClick={handleCloseForm} className="px-4 py-2 bg-surface text-on-surface border border-outline-variant rounded-xl text-sm font-semibold hover:bg-surface-variant transition-colors">Hủy</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold shadow hover:bg-primary/90 transition-colors">
                {isSubmitting ? "Đang lưu..." : "Lưu danh mục"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[250px] flex items-center justify-center">
          {loading ? (
            <div className="p-8 text-center"><span className="material-symbols-outlined text-3xl animate-spin text-primary">progress_activity</span></div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
              <span className="material-symbols-outlined text-4xl mb-2 text-outline">category</span>
              <p className="font-bold text-base text-on-surface">Chưa có danh mục nào</p>
              <p className="text-sm mt-1">Hãy nhấn nút "Thêm danh mục mới" ở trên để tạo danh mục đầu tiên.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse self-start">
              <thead>
                <tr className="bg-surface-variant/50 text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/30">
                  <th className="py-3.5 px-6">STT</th>
                  <th className="py-3.5 px-6">Tên danh mục</th>
                  <th className="py-3.5 px-6">Mô tả</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {categories.map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-surface-variant/20 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-on-surface-variant">{idx + 1}</td>
                    <td className="py-4 px-6 font-bold text-on-surface">{cat.name || "N/A"}</td>
                    <td className="py-4 px-6 text-on-surface-variant max-w-md truncate">{cat.description || "—"}</td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button onClick={() => handleOpenForm(cat)} className="px-3 py-1.5 rounded-lg bg-surface-variant text-primary font-semibold text-xs hover:bg-primary/10 transition-colors">
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} disabled={deletingId === cat.id} className="px-3 py-1.5 rounded-lg bg-error/10 text-error font-semibold text-xs hover:bg-error/20 transition-colors disabled:opacity-50">
                        {deletingId === cat.id ? "..." : "Xóa"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
