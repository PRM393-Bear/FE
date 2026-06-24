import "../styles/register-selection.css";
 
export function renderRegisterSelectionPage(container) {
  container.innerHTML = `
    <main class="rs-main">
      <div class="rs-container">
        <!-- Header Section -->
        <div class="rs-header">
          <h1 class="rs-title">Bạn muốn đăng ký loại tài khoản nào?</h1>
          <p class="rs-subtitle">Chọn mô hình phù hợp nhất với nhu cầu sử dụng của bạn trên nền tảng Lifecycle.</p>
        </div>
        
        <!-- Comparison Cards Container -->
        <div class="rs-grid">
          
          <!-- Individual Account Card -->
          <div class="rs-card" id="card-individual">
            <div class="rs-card-header">
              <div class="rs-icon-box rs-icon-individual">
                <span class="material-symbols-outlined" style="font-size: 32px;">person</span>
              </div>
              <span class="rs-badge rs-badge-individual">Miễn phí, không cần duyệt</span>
            </div>
            <h3 class="rs-card-title">
              👤 Cá nhân
            </h3>
            <p class="rs-card-desc">Mua bán đồ cũ, tặng đồ, tham gia cộng đồng tiêu dùng bền vững.</p>
            <div class="rs-illustration">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqLBGjIXO1k_Iu8hII4XuvshSBg0YzR8FB-fC8FMB9lHEDIOPrqEBFA0XkQelovVKPZwgKQ9jpmfv6bdRPkI6xIbh45WZXNQZ310KwxURyq9lbQDPeBe88ZeU32XVLVe-MvLNg29s8UdAhv_arXMXXrVmPmj5v4GPVR7Pjlc1ENmXDDN46BcIpHUiwdtJxVbQKng4HNwTN1c8BSDSQFLSRM8ltr5yOlSSm7VaEPkaV6gGbPVzXKmEw2bip3Fi89AqFkRmzDhdwU1aP"/>
            </div>
            <ul class="rs-features">
              <li class="rs-feature-item">
                <span class="material-symbols-outlined rs-feature-icon rs-feature-icon-indiv">check_circle</span>
                <span class="rs-feature-text">Đăng bán tối đa 20 sản phẩm/tháng</span>
              </li>
              <li class="rs-feature-item">
                <span class="material-symbols-outlined rs-feature-icon rs-feature-icon-indiv">check_circle</span>
                <span class="rs-feature-text">Tham gia các hội nhóm cộng đồng</span>
              </li>
              <li class="rs-feature-item">
                <span class="material-symbols-outlined rs-feature-icon rs-feature-icon-indiv">check_circle</span>
                <span class="rs-feature-text">Tặng đồ miễn phí &amp; Tích điểm xanh</span>
              </li>
            </ul>
            <div class="rs-radio rs-radio-indiv">
              <div class="rs-radio-inner"></div>
            </div>
          </div>

          <!-- Organization Account Card -->
          <div class="rs-card" id="card-organization">
            <div class="rs-card-header">
              <div class="rs-icon-box rs-icon-org">
                <span class="material-symbols-outlined" style="font-size: 32px;">domain</span>
              </div>
              <span class="rs-badge rs-badge-org">Dành cho tổ chức, doanh nghiệp</span>
            </div>
            <h3 class="rs-card-title">
              🏢 Tổ chức
            </h3>
            <p class="rs-card-desc">Quy mô lớn, quản lý nhân viên, chức năng ERP nâng cao.</p>
            <div class="rs-illustration" style="background-color: #f0f0f0;">
              <span class="material-symbols-outlined" style="font-size: 64px; color: var(--on-surface-variant);">domain</span>
            </div>
            <ul class="rs-features">
              <li class="rs-feature-item">
                <span class="material-symbols-outlined rs-feature-icon rs-feature-icon-org">check_circle</span>
                <span class="rs-feature-text">Tài khoản nhân viên không giới hạn</span>
              </li>
              <li class="rs-feature-item">
                <span class="material-symbols-outlined rs-feature-icon rs-feature-icon-org">check_circle</span>
                <span class="rs-feature-text">Tích hợp API và hệ thống ERP</span>
              </li>
              <li class="rs-feature-item">
                <span class="material-symbols-outlined rs-feature-icon rs-feature-icon-org">check_circle</span>
                <span class="rs-feature-text">Hỗ trợ riêng biệt (1-1)</span>
              </li>
            </ul>
            <div class="rs-radio rs-radio-org">
              <div class="rs-radio-inner"></div>
            </div>
          </div>
          
        </div>
        
        <!-- Action Section -->
        <div class="rs-action">
          <button id="btn-continue" class="rs-btn-continue" disabled="">
            Tiếp tục
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
          <p class="rs-footer-hint">Bạn có thể thay đổi loại tài khoản sau này trong phần Cài đặt.</p>
        </div>
        
      </div>
    </main>
  `;

  let selectedType = null;

  function selectAccount(type) {
    selectedType = type;
    const cardIndiv = document.getElementById('card-individual');
    const cardOrg = document.getElementById('card-organization');
    const btnContinue = document.getElementById('btn-continue');

    // Reset States
    cardIndiv.classList.remove('active-individual');
    cardOrg.classList.remove('active-organization');

    // Set Active State
    const activeCard = document.getElementById(`card-${type}`);
    activeCard.classList.add(`active-${type}`);

    // Enable Button
    btnContinue.disabled = false;
  }

  // Bind clicks
  document.getElementById('card-individual').addEventListener('click', () => selectAccount('individual'));
  document.getElementById('card-organization').addEventListener('click', () => selectAccount('organization'));

  document.getElementById('btn-continue').addEventListener('click', function () {
    if (!this.disabled) {
      this.innerHTML = `<span class="inline-block material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span> Đang xử lý...`;
      setTimeout(() => {
        if (selectedType === 'individual') {
          window.location.hash = '#/register-member';
        } else if (selectedType === 'organization') {
          window.location.hash = '#/register-organization';
        }
      }, 300);
    }
  });
}
