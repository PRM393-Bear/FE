/**
 * EcoCycle Web - Staff Categories Tab
 * CRUD table for product categories.
 */

import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../../services/staff.service.js";
import { showToast } from "../../utils/ui.js";

export async function renderCategoriesTab(container) {
  container.innerHTML = `
    <div class="flex flex-col gap-6 animate-fade-in">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
        <div>
          <h3 class="text-headline-sm font-bold text-on-surface">Quản lý Danh mục (Categories)</h3>
          <p class="text-body-md text-on-surface-variant">Thêm, chỉnh sửa hoặc xóa các danh mục sản phẩm thời trang trong hệ thống EcoCycle.</p>
        </div>
        <button id="btn-open-add-cat" class="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold shadow hover:bg-primary/90 transition-all flex items-center gap-2">
          <span class="material-symbols-outlined">add_circle</span> Thêm danh mục mới
        </button>
      </div>

      <!-- Category Form Modal / Inline Box (Hidden by default) -->
      <div id="cat-form-box" class="hidden bg-surface-variant/40 border border-primary/30 p-6 rounded-2xl transition-all">
        <h4 id="cat-form-title" class="text-title-md font-bold text-on-surface mb-4">Thêm Danh Mục Mới</h4>
        <form id="cat-form" class="flex flex-col gap-4">
          <input type="hidden" id="cat-edit-id" value="" />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant">Tên danh mục <span class="text-error">*</span></label>
              <input type="text" id="cat-name-input" required placeholder="VD: Áo thun vintage, Quần jean tái chế..." class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant">Mô tả chi tiết</label>
              <input type="text" id="cat-desc-input" placeholder="Mô tả ngắn gọn về danh mục này..." class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-2">
            <button type="button" id="btn-cancel-cat" class="px-4 py-2 bg-surface text-on-surface border border-outline-variant rounded-xl text-sm font-semibold hover:bg-surface-variant transition-colors">Hủy</button>
            <button type="submit" id="btn-save-cat" class="px-5 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold shadow hover:bg-primary/90 transition-colors">Lưu danh mục</button>
          </div>
        </form>
      </div>

      <!-- Categories Table -->
      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div id="cat-table-wrapper" class="overflow-x-auto min-h-[250px] flex items-center justify-center">
          <span class="material-symbols-outlined text-3xl animate-spin text-primary">progress_activity</span>
        </div>
      </div>
    </div>
  `;

  const formBox = container.querySelector("#cat-form-box");
  const formTitle = container.querySelector("#cat-form-title");
  const catForm = container.querySelector("#cat-form");
  const editIdInput = container.querySelector("#cat-edit-id");
  const nameInput = container.querySelector("#cat-name-input");
  const descInput = container.querySelector("#cat-desc-input");
  const tableWrapper = container.querySelector("#cat-table-wrapper");

  container.querySelector("#btn-open-add-cat")?.addEventListener("click", () => {
    editIdInput.value = "";
    nameInput.value = "";
    descInput.value = "";
    formTitle.textContent = "Thêm Danh Mục Mới";
    formBox.classList.remove("hidden");
    nameInput.focus();
  });

  container.querySelector("#btn-cancel-cat")?.addEventListener("click", () => {
    formBox.classList.add("hidden");
  });

  catForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = editIdInput.value;
    const payload = {
      name: nameInput.value.trim(),
      description: descInput.value.trim(),
    };

    const saveBtn = container.querySelector("#btn-save-cat");
    const origText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = "Đang lưu...";

    try {
      if (id) {
        await updateCategory(id, payload);
        showToast("Cập nhật danh mục thành công!", "success");
      } else {
        await createCategory(payload);
        showToast("Thêm danh mục mới thành công!", "success");
      }
      formBox.classList.add("hidden");
      await loadCategories();
    } catch (err) {
      showToast("Lỗi: " + err.message, "error");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = origText;
    }
  });

  async function loadCategories() {
    tableWrapper.innerHTML = `<div class="p-8 text-center"><span class="material-symbols-outlined text-3xl animate-spin text-primary">progress_activity</span></div>`;
    const categories = await getAllCategories();

    if (categories.length === 0) {
      tableWrapper.innerHTML = `
        <div class="p-12 text-center text-on-surface-variant flex flex-col items-center">
          <span class="material-symbols-outlined text-4xl mb-2 text-outline">category</span>
          <p class="font-bold text-base text-on-surface">Chưa có danh mục nào</p>
          <p class="text-sm mt-1">Hãy nhấn nút "Thêm danh mục mới" ở trên để tạo danh mục đầu tiên.</p>
        </div>
      `;
      return;
    }

    tableWrapper.innerHTML = `
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-variant/50 text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/30">
            <th class="py-3.5 px-6">STT</th>
            <th class="py-3.5 px-6">Tên danh mục</th>
            <th class="py-3.5 px-6">Mô tả</th>
            <th class="py-3.5 px-6 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/20 text-sm">
          ${categories.map((cat, idx) => `
            <tr class="hover:bg-surface-variant/20 transition-colors">
              <td class="py-4 px-6 font-mono text-xs text-on-surface-variant">${idx + 1}</td>
              <td class="py-4 px-6 font-bold text-on-surface">${cat.name || "N/A"}</td>
              <td class="py-4 px-6 text-on-surface-variant max-w-md truncate">${cat.description || "—"}</td>
              <td class="py-4 px-6 text-right space-x-2">
                <button class="btn-edit-cat px-3 py-1.5 rounded-lg bg-surface-variant text-primary font-semibold text-xs hover:bg-primary/10 transition-colors" data-id="${cat.id}" data-name="${encodeURIComponent(cat.name || '')}" data-desc="${encodeURIComponent(cat.description || '')}">
                  Sửa
                </button>
                <button class="btn-del-cat px-3 py-1.5 rounded-lg bg-error/10 text-error font-semibold text-xs hover:bg-error/20 transition-colors" data-id="${cat.id}" data-name="${encodeURIComponent(cat.name || '')}">
                  Xóa
                </button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    tableWrapper.querySelectorAll(".btn-edit-cat").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const name = decodeURIComponent(btn.getAttribute("data-name") || "");
        const desc = decodeURIComponent(btn.getAttribute("data-desc") || "");

        editIdInput.value = id;
        nameInput.value = name;
        descInput.value = desc;
        formTitle.textContent = "Chỉnh Sửa Danh Mục";
        formBox.classList.remove("hidden");
        nameInput.focus();
      });
    });

    tableWrapper.querySelectorAll(".btn-del-cat").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const name = decodeURIComponent(btn.getAttribute("data-name") || "");
        if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}" không?`)) return;

        btn.disabled = true;
        btn.textContent = "...";
        try {
          await deleteCategory(id);
          showToast(`Đã xóa danh mục "${name}"!`, "success");
          await loadCategories();
        } catch (err) {
          showToast("Lỗi xóa: " + err.message, "error");
          btn.disabled = false;
          btn.textContent = "Xóa";
        }
      });
    });
  }

  await loadCategories();
}
