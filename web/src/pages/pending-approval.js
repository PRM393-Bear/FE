import { refreshUserOrgStatus, getUser, logoutApi } from "../services/auth.service.js";
import { showToast } from "../utils/ui.js";

export function renderPendingApprovalPage(container) {
    const user = getUser();
    const isRejected = user?.status === "rejected";

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
        padding: 104px 24px 48px;
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
      .pending-actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .btn-check {
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
        width: 100%;
        max-width: 320px;
      }
      .btn-check:hover {
        background: var(--primary-container, #00873a);
        transform: scale(0.98);
      }
      .btn-check:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      .btn-logout-ghost {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: transparent;
        color: var(--error, #DC2626);
        border: 1px solid var(--error, #DC2626);
        padding: 10px 32px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s;
        width: 100%;
        max-width: 320px;
      }
      .btn-logout-ghost:hover {
        background: rgba(220, 38, 38, 0.05);
      }
    </style>
    <div class="pending-container">
      <div class="pending-card" id="pendingCard">
        <div class="organic-blur"></div>
        <div style="position: relative; z-index: 10;">
          ${isRejected ? `
          <div class="status-badge" style="background: rgba(239, 68, 68, 0.1); color: #DC2626; border-color: rgba(239, 68, 68, 0.2);">
            <span class="material-symbols-outlined" style="font-size: 18px;">cancel</span>
            Trạng thái: Từ chối xét duyệt
          </div>
          <h1 style="font-size: 32px; font-weight: 700; color: var(--on-surface); margin-bottom: 16px;">Hồ Sơ Chưa Đạt Yêu Cầu</h1>
          <p style="font-size: 16px; color: var(--on-surface-variant); max-width: 440px; margin: 0 auto 32px; line-height: 1.5;">
            Rất tiếc, hồ sơ tổ chức của bạn chưa đáp ứng đủ điều kiện hoặc minh chứng chưa hợp lệ. Vui lòng liên hệ bộ phận hỗ trợ hoặc thử đăng ký lại.
          </p>
          ` : `
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
          
          <p style="font-size: 16px; color: var(--on-surface-variant); max-width: 440px; margin: 0 auto 32px; line-height: 1.5;">
            Hồ sơ tổ chức của bạn đang được Staff kiểm tra. Ngay sau khi được chấp thuận, bạn có thể thực hiện toàn bộ các chức năng khác như bình thường.
          </p>
          `}
          
          <div class="pending-actions">
            <button type="button" id="btnCheckStatus" class="btn-check">
              <span class="material-symbols-outlined">refresh</span>
              Kiểm tra lại trạng thái duyệt
            </button>
            <button type="button" id="btnLogoutPending" class="btn-logout-ghost">
              <span class="material-symbols-outlined">logout</span>
              Đăng xuất
            </button>
          </div>
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

    const btnCheck = document.getElementById('btnCheckStatus');
    if (btnCheck) {
        btnCheck.addEventListener('click', async () => {
            btnCheck.disabled = true;
            btnCheck.innerHTML = `<span class="material-symbols-outlined animate-spin">refresh</span> Đang kiểm tra...`;
            try {
                const newStatus = await refreshUserOrgStatus();
                if (newStatus === "approved") {
                    showToast("Tài khoản của bạn đã được Staff chấp thuận! Chào mừng bạn 🌿", "success");
                    setTimeout(() => {
                        window.location.hash = "#/";
                    }, 1000);
                } else if (newStatus === "rejected") {
                    showToast("Hồ sơ tổ chức của bạn đã bị từ chối.", "error");
                    renderPendingApprovalPage(container);
                } else {
                    showToast("Tài khoản vẫn đang trong quá trình xét duyệt của Staff. Vui lòng quay lại sau.", "info");
                }
            } catch (err) {
                showToast("Không thể kiểm tra trạng thái lúc này. Vui lòng thử lại sau.", "error");
            } finally {
                btnCheck.disabled = false;
                btnCheck.innerHTML = `<span class="material-symbols-outlined">refresh</span> Kiểm tra lại trạng thái duyệt`;
            }
        });
    }

    const btnLogout = document.getElementById('btnLogoutPending');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            try {
                await logoutApi();
            } finally {
                window.location.hash = "#/login";
            }
        });
    }

    // Cleanup helper
    return () => {};
}
