import { registerApi } from "../services/auth.service.js";

export function renderRegisterOrgPage(container) {
  container.innerHTML = `
    <main class="max-w-[1280px] mx-auto px-margin-desktop py-[40px] bg-[#fff8f5] min-h-screen font-body-md text-on-surface">
      <!-- Stepper Progress Bar -->
      <div class="mb-[40px] max-w-3xl mx-auto">
        <div class="flex justify-between items-center relative">
          <!-- Step 1 -->
          <div class="flex flex-col items-center z-10 flex-1 relative" style="position: relative;">
            <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-[8px]" style="background-color: #006b2c; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);">1</div>
            <span class="text-[14px] font-semibold text-primary" style="color: #006b2c;">Thông tin Tổ chức</span>
            <div class="absolute top-5 left-1/2 w-full h-[2px] -z-10" style="background: #e2d8d2;"></div>
          </div>
          <!-- Step 2 -->
          <div class="flex flex-col items-center z-10 flex-1 relative">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold mb-[8px]" style="background-color: #f0e6e0; color: #3e4a3d;">2</div>
            <span class="text-[14px] font-semibold text-on-surface-variant">Giấy tờ xác minh</span>
            <div class="absolute top-5 left-1/2 w-full h-[2px] -z-10" style="background: #e2d8d2;"></div>
          </div>
          <!-- Step 3 -->
          <div class="flex flex-col items-center z-10 flex-1">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold mb-[8px]" style="background-color: #f0e6e0; color: #3e4a3d;">3</div>
            <span class="text-[14px] font-semibold text-on-surface-variant">Xác nhận</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-10 gap-[40px] items-start">
        <!-- Left Column: Form -->
        <section class="lg:col-span-6 bg-white p-[24px] rounded-xl border border-outline-variant" style="box-shadow: 0 4px 20px -2px rgba(28, 25, 23, 0.05);">
          <header class="mb-[24px]">
            <h1 class="text-[32px] font-bold text-on-surface mb-[4px]">Thông tin Tổ chức</h1>
            <p class="text-[16px] text-on-surface-variant">Vui lòng cung cấp thông tin chính xác để xây dựng niềm tin với cộng đồng.</p>
          </header>
          
          <form class="space-y-[24px]" id="orgForm">
            <!-- Account Info for Auth -->
            <div class="p-[16px] border rounded-lg" style="background-color: #fafaf9; border-color: #e2d8d2;">
                <h3 class="font-bold text-[16px] mb-[16px]">Tài khoản Quản trị</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                  <div>
                      <label class="block font-semibold text-[14px] mb-[4px]">Tên đăng nhập *</label>
                      <input id="org-username" type="text" required class="w-full px-[16px] py-[8px] border rounded-lg outline-none focus:border-[#006b2c]" placeholder="admin_tochuc"/>
                  </div>
                  <div>
                      <label class="block font-semibold text-[14px] mb-[4px]">Email *</label>
                      <input id="org-email" type="email" required class="w-full px-[16px] py-[8px] border rounded-lg outline-none focus:border-[#006b2c]" placeholder="contact@tochuc.org"/>
                  </div>
                  <div class="col-span-2">
                      <label class="block font-semibold text-[14px] mb-[4px]">Mật khẩu *</label>
                      <input id="org-password" type="password" required class="w-full px-[16px] py-[8px] border rounded-lg outline-none focus:border-[#006b2c]" placeholder="••••••••"/>
                  </div>
                </div>
            </div>

            <!-- Org Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <div class="col-span-2">
                <label class="block font-semibold text-[14px] mb-[4px]">Tên tổ chức *</label>
                <input id="inputName" type="text" required class="w-full px-[16px] py-[8px] border rounded-lg outline-none focus:border-[#006b2c]" placeholder="Ví dụ: Mái ấm Hoa Hồng"/>
              </div>
              <div>
                <label class="block font-semibold text-[14px] mb-[4px]">Loại tổ chức</label>
                <select class="w-full px-[16px] py-[8px] border rounded-lg outline-none focus:border-[#006b2c] bg-white">
                  <option value="">Chọn loại tổ chức</option>
                  <option value="Mái ấm">Mái ấm / Trại trẻ mồ côi</option>
                  <option value="NGO">Tổ chức phi chính phủ (NGO)</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-[14px] mb-[4px]">SĐT liên hệ *</label>
                <input id="inputPhone" type="tel" required class="w-full px-[16px] py-[8px] border rounded-lg outline-none focus:border-[#006b2c]" placeholder="09xx xxx xxx"/>
              </div>
            </div>

            <div>
              <label class="block font-semibold text-[14px] mb-[4px]">Mô tả hoạt động</label>
              <textarea id="inputDesc" rows="3" class="w-full px-[16px] py-[8px] border rounded-lg outline-none focus:border-[#006b2c] resize-none" placeholder="Chia sẻ về mục tiêu và các hoạt động thiện nguyện của tổ chức..."></textarea>
            </div>

            <div>
              <label class="block font-semibold text-[14px] mb-[4px]">Loại đồ dùng cần nhận</label>
              <div class="flex flex-wrap gap-[8px]" id="chipContainer">
                <button type="button" class="px-[16px] py-[4px] rounded-full border border-outline-variant text-[14px] toggle-chip">Quần áo</button>
                <button type="button" class="px-[16px] py-[4px] rounded-full border border-outline-variant text-[14px] toggle-chip">Giày dép</button>
                <button type="button" class="px-[16px] py-[4px] rounded-full border border-outline-variant text-[14px] toggle-chip">Sách vở</button>
              </div>
            </div>

            <div class="pt-[16px] border-t flex justify-end">
              <button type="submit" class="text-white px-[40px] py-[16px] rounded-lg font-semibold flex items-center gap-[8px] shadow-md transition-all active:scale-95" style="background-color: #006b2c;">
                Đăng ký & Tiếp theo
                <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </form>
        </section>

        <!-- Right Column: Live Preview -->
        <aside class="lg:col-span-4 sticky top-24 hidden lg:block">
          <div class="bg-white p-[24px] rounded-xl border" style="border-color: rgba(189, 202, 186, 0.3);">
            <h2 class="font-semibold text-[14px] uppercase tracking-wider mb-[24px] flex items-center gap-[4px] text-gray-500">
              <span class="material-symbols-outlined text-[18px]">visibility</span>
              Xem trước hồ sơ
            </h2>
            <div class="bg-white rounded-xl overflow-hidden shadow-xl border border-gray-200">
              <div class="h-32 flex items-center justify-center relative" style="background-color: rgba(0, 107, 44, 0.1);">
                <span class="material-symbols-outlined text-4xl" style="color: rgba(0, 107, 44, 0.3);">volunteer_activism</span>
              </div>
              <div class="p-[24px] -mt-12 relative">
                <div class="w-20 h-20 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center mb-[16px]">
                  <span class="text-[24px] font-bold text-[#006b2c]" id="previewLogoInitials">LC</span>
                </div>
                <h3 class="text-[20px] font-semibold text-gray-800 mb-[4px]" id="previewName">Tên tổ chức của bạn</h3>
                <div class="flex items-center gap-[4px] text-gray-500 mb-[16px]">
                  <span class="material-symbols-outlined text-[16px]">location_on</span>
                  <span class="text-[14px]">Địa chỉ của tổ chức</span>
                </div>
                <p class="text-[16px] text-gray-500 line-clamp-3 mb-[24px] italic" id="previewDesc">
                  "Phần mô tả về mục tiêu và sứ mệnh cao cả của tổ chức bạn sẽ xuất hiện tại đây..."
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  `;

  // Live Preview Logic
  const inputName = document.getElementById('inputName');
  const previewName = document.getElementById('previewName');
  const inputDesc = document.getElementById('inputDesc');
  const previewDesc = document.getElementById('previewDesc');
  const previewLogoInitials = document.getElementById('previewLogoInitials');

  if (inputName) {
    inputName.addEventListener('input', (e) => {
        if (previewName) previewName.innerText = e.target.value || "Tên tổ chức của bạn";
        if (e.target.value && previewLogoInitials) {
            const initials = e.target.value.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            previewLogoInitials.innerText = initials;
        } else if (previewLogoInitials) {
            previewLogoInitials.innerText = "LC";
        }
    });
  }

  if (inputDesc) {
    inputDesc.addEventListener('input', (e) => {
        if (previewDesc) previewDesc.innerText = e.target.value || '"Phần mô tả về mục tiêu và sứ mệnh cao cả của tổ chức bạn sẽ xuất hiện tại đây..."';
    });
  }

  const chips = document.querySelectorAll('.toggle-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      if (chip.classList.contains('active')) {
        chip.style.backgroundColor = 'rgba(0, 107, 44, 0.1)';
        chip.style.borderColor = '#006b2c';
        chip.style.color = '#006b2c';
      } else {
        chip.style.backgroundColor = 'transparent';
        chip.style.borderColor = '#bdcaba';
        chip.style.color = 'inherit';
      }
    });
  });

  const form = document.getElementById('orgForm');
  form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById("org-username").value.trim();
      const email = document.getElementById("org-email").value.trim();
      const password = document.getElementById("org-password").value;
      const fullName = document.getElementById("inputName").value.trim();
      const phone = document.getElementById("inputPhone").value.trim();

      const btn = e.target.querySelector('button[type="submit"]');
      const originalContent = btn.innerHTML;
      
      btn.disabled = true;
      btn.innerHTML = `<span class="material-symbols-outlined animate-spin">sync</span> Đang lưu...`;

      try {
        await registerApi({
          fullName,
          username,
          email,
          phone,
          password,
          roleName: "ORGANIZATION"
        });
        alert('Đăng ký Tổ chức thành công! Chuyển hướng đến Đăng nhập...');
        window.location.hash = '#/login';
      } catch (err) {
        alert(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
      } finally {
        btn.innerHTML = originalContent;
        btn.disabled = false;
      }
  });
}
