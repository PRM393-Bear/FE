export function renderPendingApprovalPage(container) {
    container.innerHTML = `
    <style>
      .pending-container {
        min-height: calc(100vh - 64px);
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at top right, rgba(0, 107, 44, 0.05), transparent),
                    radial-gradient(circle at bottom left, rgba(245, 158, 11, 0.05), transparent);
        background-color: var(--surface);
        padding: 24px;
      }
      .pending-card {
        background: var(--surface-card, #FFFFFF);
        border-radius: 24px;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
        border: 1px solid var(--outline-variant);
        padding: 48px;
        max-width: 600px;
        width: 100%;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      .pending-card:hover {
        transform: translateY(-4px);
        transition: transform 0.3s ease;
      }
      .organic-blur {
        position: absolute;
        top: -48px;
        right: -48px;
        width: 128px;
        height: 128px;
        background: rgba(0, 107, 44, 0.05);
        border-radius: 50%;
        filter: blur(40px);
      }
      .clock-wrapper {
        display: flex;
        justify-content: center;
        margin-bottom: 32px;
      }
      .clock-container {
        position: relative;
        width: 200px;
        height: 200px;
      }
      .clock-circle {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 4px solid var(--surface-container-highest);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }
      .clock-hand-minute {
        position: absolute;
        width: 4px;
        height: 64px;
        background: var(--primary);
        border-radius: 9999px;
        transform-origin: bottom;
        bottom: 50%;
        transform: rotate(45deg);
        animation: spinClock 10s linear infinite;
      }
      .clock-hand-hour {
        position: absolute;
        width: 6px;
        height: 48px;
        background: #F59E0B;
        border-radius: 9999px;
        transform-origin: bottom;
        bottom: 50%;
        transform: rotate(180deg);
        animation: spinClock 60s linear infinite;
      }
      .clock-center {
        width: 16px;
        height: 16px;
        background: var(--primary);
        border-radius: 50%;
        z-index: 20;
      }
      @keyframes spinClock {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 16px;
        border-radius: 9999px;
        background: rgba(245, 158, 11, 0.1);
        color: #D97706;
        border: 1px solid rgba(245, 158, 11, 0.2);
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 16px;
      }
      .btn-home {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: var(--primary);
        color: white;
        border: none;
        padding: 12px 32px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      }
      .btn-home:hover {
        background: var(--primary-container, #00873a);
        transform: scale(0.98);
      }
    </style>
    <div class="pending-container">
      <div class="pending-card" id="pendingCard">
        <div class="organic-blur"></div>
        <div style="position: relative; z-index: 10;">
          <div class="clock-wrapper">
            <div class="clock-container">
              <div class="clock-circle">
                <div class="clock-hand-minute"></div>
                <div class="clock-hand-hour"></div>
                <div class="clock-center"></div>
                <div style="position: absolute; inset: 0; opacity: 0.1;">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJg3qPlTW-HB55V4eMGejXXyKDj6O75hTPU5xOWDl8mFXpuGG65QRHrflmI-bSb9vNK2BpzGqx8RMfcZch3cIIoxzLaYYGmloqFvEmymdZU-cfZvsu9qxyh7tX50k2LQR6DDEfEKVv_GuRW64XzwVrAABgcdOj-AojHUwhpp-sotOJx0GWw5RuvOCr-5HR7nDQRHBNgnTfTgVB_7vemfHj1RHjk_g3GZoSWsuIR9OGqfpKSzouNS8q5zAxLy2HyakQuibN2CMwmNQ7" style="width: 100%; height: 100%; object-fit: contain;" />
                </div>
              </div>
            </div>
          </div>
          
          <div class="status-badge">
            <span class="material-symbols-outlined" style="font-size: 18px;">pending</span>
            Trạng thái: Chờ duyệt
          </div>
          
          <h1 style="font-size: 32px; font-weight: 700; color: var(--on-surface); margin-bottom: 16px;">Đang chờ xét duyệt</h1>
          
          <p style="font-size: 16px; color: var(--on-surface-variant); max-width: 400px; margin: 0 auto 32px; line-height: 1.5;">
            Hồ sơ tổ chức của bạn đang được xem xét. Thường mất 1-2 ngày làm việc. Chúng tôi sẽ thông báo cho bạn ngay khi có kết quả qua email đăng ký.
          </p>
          
          <a href="#/" class="btn-home">
            <span class="material-symbols-outlined">home</span>
            Về trang chủ
          </a>
        </div>
      </div>
    </div>
  `;

    const card = document.getElementById('pendingCard');
    if (card) {
        card.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = card.getBoundingClientRect();
            const x = (e.clientX - left) / width;
            const y = (e.clientY - top) / height;

            const rotateX = (y - 0.5) * 4;
            const rotateY = (x - 0.5) * -4;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            card.style.transition = 'transform 0.5s ease';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    }
}
