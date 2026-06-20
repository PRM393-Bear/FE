import { registerApi } from "../services/auth.service.js";

export function renderRegisterShopPage(container) {
  container.innerHTML = `
    <main class="max-w-[1280px] mx-auto px-margin-desktop py-stack-xl min-h-screen bg-background text-on-background font-body-md">
      <!-- Step Progress Bar -->
      <div class="flex items-center justify-between mb-stack-xl max-w-3xl mx-auto">
        <div class="flex flex-col items-center gap-2">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold" style="background-color: #006b2c; color: #ffffff;">1</div>
          <span class="font-label-sm text-[12px] text-primary">Thông tin Shop & Tài khoản</span>
        </div>
        <div class="h-[2px] flex-grow mx-4" style="background-color: #bdcaba;"></div>
        <div class="flex flex-col items-center gap-2">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold" style="background-color: #e9f0e5; color: #3e4a3d;">2</div>
          <span class="font-label-sm text-[12px] text-on-surface-variant">Giấy tờ xác minh</span>
        </div>
        <div class="h-[2px] flex-grow mx-4" style="background-color: #bdcaba;"></div>
        <div class="flex flex-col items-center gap-2">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold" style="background-color: #e9f0e5; color: #3e4a3d;">3</div>
          <span class="font-label-sm text-[12px] text-on-surface-variant">Xác nhận</span>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
        <!-- Left Column: Form -->
        <div class="lg:col-span-7 bg-white p-[48px] rounded-xl shadow-sm border border-outline-variant/30">
          <h2 class="font-headline-md text-[24px] font-semibold text-on-surface mb-[24px]">Bắt đầu kinh doanh cùng Lifecycle</h2>
          <p class="text-on-surface-variant mb-[48px]">Vui lòng cung cấp thông tin chính xác để chúng tôi có thể hỗ trợ bạn tốt nhất trong quá trình vận hành Shop.</p>
          
          <form class="space-y-[24px]" id="shop-form">
            <!-- Account Credentials (Added for backend integration) -->
            <div class="space-y-[16px] pb-[16px] border-b border-outline-variant/30">
                <h3 class="font-label-md text-[16px] font-semibold text-on-surface">Thông tin đăng nhập</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                  <div class="space-y-1">
                      <label class="block font-label-md text-[14px] text-on-surface-variant">Tên đăng nhập *</label>
                      <input id="shop-username" type="text" required class="w-full h-12 px-4 rounded-xl border border-outline-variant focus:border-primary outline-none" placeholder="my_shop_123"/>
                  </div>
                  <div class="space-y-1">
                      <label class="block font-label-md text-[14px] text-on-surface-variant">Email *</label>
                      <input id="shop-email" type="email" required class="w-full h-12 px-4 rounded-xl border border-outline-variant focus:border-primary outline-none" placeholder="shop@example.com"/>
                  </div>
                </div>
                <div class="space-y-1">
                    <label class="block font-label-md text-[14px] text-on-surface-variant">Mật khẩu *</label>
                    <input id="shop-password" type="password" required class="w-full h-12 px-4 rounded-xl border border-outline-variant focus:border-primary outline-none" placeholder="••••••••"/>
                </div>
            </div>

            <!-- Shop Info -->
            <div class="space-y-[16px] pt-[8px]">
              <h3 class="font-label-md text-[16px] font-semibold text-on-surface">Thông tin cửa hàng</h3>
              <!-- Shop Name -->
              <div class="space-y-1">
                <label class="block font-label-md text-[14px] text-on-surface-variant">Tên Shop *</label>
                <input id="shop-name-input" type="text" required class="w-full h-12 px-4 rounded-xl border border-outline-variant focus:border-primary outline-none" placeholder="Ví dụ: Cửa hàng Đồ Cũ Hạnh Phúc"/>
              </div>
              <!-- Business Type & Phone -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                <div class="space-y-1">
                  <label class="block font-label-md text-[14px] text-on-surface-variant">Loại hình kinh doanh *</label>
                  <select class="w-full h-12 px-4 rounded-xl border border-outline-variant focus:border-primary outline-none bg-white">
                    <option value="individual">Cá nhân kinh doanh</option>
                    <option value="household">Hộ kinh doanh</option>
                    <option value="company">Công ty</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="block font-label-md text-[14px] text-on-surface-variant">Số điện thoại Shop *</label>
                  <input id="shop-phone-input" type="tel" required class="w-full h-12 px-4 rounded-xl border border-outline-variant focus:border-primary outline-none" placeholder="09xx xxx xxx"/>
                </div>
              </div>
              
              <!-- Main Category (Chips) -->
              <div class="space-y-1">
                <label class="block font-label-md text-[14px] text-on-surface-variant">Danh mục chính *</label>
                <div class="flex flex-wrap gap-2 mt-2" id="category-chips">
                  <button type="button" class="px-4 py-2 rounded-full border border-outline-variant text-[14px] active-chip">Quần áo</button>
                  <button type="button" class="px-4 py-2 rounded-full border border-outline-variant text-[14px]">Giày</button>
                  <button type="button" class="px-4 py-2 rounded-full border border-outline-variant text-[14px]">Túi xách</button>
                  <button type="button" class="px-4 py-2 rounded-full border border-outline-variant text-[14px]">Điện tử</button>
                  <button type="button" class="px-4 py-2 rounded-full border border-outline-variant text-[14px]">Đồ nhà</button>
                  <button type="button" class="px-4 py-2 rounded-full border border-outline-variant text-[14px]">Khác</button>
                </div>
              </div>

              <!-- Shop Description -->
              <div class="space-y-1">
                <label class="block font-label-md text-[14px] text-on-surface-variant">Mô tả Shop</label>
                <textarea id="shop-desc-input" rows="3" class="w-full p-4 rounded-xl border border-outline-variant focus:border-primary outline-none resize-none" placeholder="Chia sẻ câu chuyện hoặc phong cách sản phẩm của bạn..."></textarea>
              </div>

              <!-- Logo Upload (Mock) -->
              <div class="space-y-1">
                <label class="block font-label-md text-[14px] text-on-surface-variant">Logo/Avatar Shop</label>
                <div class="flex items-center gap-[24px] mt-2">
                  <div class="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center border-2 border-dashed border-outline-variant cursor-pointer">
                    <span class="material-symbols-outlined text-outline">add_a_photo</span>
                  </div>
                  <div class="flex-1">
                    <p class="text-[12px] text-on-surface-variant">Định dạng: JPG, PNG. Tối đa 2MB.</p>
                    <button type="button" class="mt-2 text-primary font-bold text-[14px]">Tải lên từ máy tính</button>
                  </div>
                </div>
              </div>

              <!-- Submit -->
              <div class="pt-[16px]">
                <button type="submit" class="w-full h-14 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]" style="background-color: #006b2c;">
                  Đăng ký & Tiếp theo
                  <span class="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Right Column: Live Preview -->
        <div class="lg:col-span-5 relative hidden lg:block">
          <div class="sticky top-28 space-y-[24px]">
            <h3 class="font-label-md text-[14px] text-on-surface-variant uppercase tracking-widest text-center">Xem trước cửa hàng</h3>
            <!-- Mobile Preview Container -->
            <div class="mx-auto w-[280px] h-[580px] bg-white rounded-[3rem] border-[8px] border-inverse-surface shadow-2xl overflow-hidden flex flex-col" style="border-color: #2b322b;">
              <!-- Preview Header -->
              <div class="h-6 w-full flex justify-center items-end pb-1" style="background-color: #2b322b;">
                <div class="w-16 h-3 bg-black rounded-full"></div>
              </div>
              <!-- Shop Hero Section -->
              <div class="relative h-32 overflow-hidden" style="background-color: #ffddb8;">
                <img class="w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS28YD-5YceOfYtQpxA6U55a7MsKaSSK8-v7NmGwwCSs2gJwfBRThtrzswUTwkfKC-mRZn6k6lcE7aplAdcpGW5HHGhZzWLjJ4BcGaHYN2AKa9OMUtzx5aJWRf0-hkwuI6exlvch7Vfrs_stldjbVz4kZ_A05-N5ZKP_6pVXbKQlEEQqwRQNTUW4SZfrHijwDFNLDtKAfocAI3Kwd6aEwEN8R23sG9WvmV3vewc64t29c4koryv1vIw_QqGJg7KHe_kdFeiY19vV91"/>
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div class="absolute bottom-[-20px] left-4 flex items-end gap-3">
                  <div class="w-16 h-16 rounded-full bg-white border-2 border-white shadow-lg flex items-center justify-center overflow-hidden">
                    <span class="material-symbols-outlined text-outline text-3xl" id="preview-logo">storefront</span>
                  </div>
                </div>
              </div>
              <!-- Shop Info Preview -->
              <div class="mt-6 px-4 pt-2">
                <h4 class="font-headline-md text-[18px] text-on-surface" id="preview-name">Tên Shop của bạn</h4>
                <div class="flex items-center gap-1 mt-1">
                  <span class="material-symbols-outlined text-secondary text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                  <span class="text-[12px] text-on-surface">5.0</span>
                </div>
                <p class="mt-3 text-[12px] text-on-surface-variant line-clamp-3" id="preview-desc">Mô tả cửa hàng sẽ xuất hiện ở đây...</p>
              </div>
              <!-- Preview Action Bar -->
              <div class="px-4 py-3 border-y border-outline-variant/30 mt-4 flex gap-2 overflow-x-auto no-scrollbar">
                <div class="flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-bold" style="background-color: #7ffc97; color: #002109;">Tất cả</div>
                <div class="flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-bold" style="background-color: #e9f0e5; color: #3e4a3d;" id="preview-tag">Danh mục</div>
              </div>
              <!-- Preview Grid -->
              <div class="flex-1 p-3 grid grid-cols-2 gap-2 overflow-y-auto">
                <div class="aspect-[4/5] rounded-lg relative overflow-hidden" style="background-color: #e9f0e5;"></div>
                <div class="aspect-[4/5] rounded-lg relative overflow-hidden" style="background-color: #e9f0e5;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;

  // Bind logic
  const shopNameInput = document.getElementById('shop-name-input');
  const shopDescInput = document.getElementById('shop-desc-input');
  const previewName = document.getElementById('preview-name');
  const previewDesc = document.getElementById('preview-desc');
  const categoryChips = document.querySelectorAll('#category-chips button');
  const previewTag = document.getElementById('preview-tag');

  if (shopNameInput) {
    shopNameInput.addEventListener('input', (e) => {
        if (previewName) previewName.textContent = e.target.value || "Tên Shop của bạn";
    });
  }

  if (shopDescInput) {
    shopDescInput.addEventListener('input', (e) => {
        if (previewDesc) previewDesc.textContent = e.target.value || "Chia sẻ câu chuyện hoặc phong cách sản phẩm của bạn...";
    });
  }

  categoryChips.forEach(chip => {
      chip.addEventListener('click', () => {
          categoryChips.forEach(c => {
            c.style.backgroundColor = 'transparent';
            c.style.color = 'inherit';
            c.style.borderColor = '#bdcaba';
          });
          chip.style.backgroundColor = '#00873a';
          chip.style.color = '#fff';
          chip.style.borderColor = '#00873a';
          if (previewTag) previewTag.textContent = chip.textContent;
      });
  });

  // Init first chip
  if (categoryChips.length > 0) {
    categoryChips[0].style.backgroundColor = '#00873a';
    categoryChips[0].style.color = '#fff';
    categoryChips[0].style.borderColor = '#00873a';
  }

  const form = document.getElementById("shop-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const username = document.getElementById("shop-username").value.trim();
    const email = document.getElementById("shop-email").value.trim();
    const password = document.getElementById("shop-password").value;
    const fullName = shopNameInput.value.trim();
    const phone = document.getElementById("shop-phone-input").value.trim();

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
        roleName: "SELLER"
      });
      alert('Đăng ký Shop thành công! Chuyển hướng đến Đăng nhập...');
      window.location.hash = '#/login';
    } catch (err) {
      alert(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      btn.innerHTML = originalContent;
      btn.disabled = false;
    }
  });
}
