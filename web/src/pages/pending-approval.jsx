import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { refreshUserOrgStatus, getUser, logoutApi } from "../services/auth.service.js";
import { showToast } from "../utils/ui.js";

export default function PendingApproval() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [checking, setChecking] = useState(false);
  const cardRef = useRef(null);

  const isRejected = user?.status === "rejected";

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;

      const rotateX = (y - 0.5) * 4;
      const rotateY = (x - 0.5) * -4;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      card.style.transition = 'transform 0.5s ease';
    };

    const handleMouseEnter = () => {
      card.style.transition = 'none';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    card.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      card.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const newStatus = await refreshUserOrgStatus();
      if (newStatus === "approved") {
        showToast("Tài khoản của bạn đã được Staff chấp thuận! Chào mừng bạn 🌿", "success");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else if (newStatus === "rejected") {
        showToast("Hồ sơ tổ chức của bạn đã bị từ chối.", "error");
        setUser(getUser());
      } else {
        showToast("Tài khoản vẫn đang trong quá trình xét duyệt của Staff. Vui lòng quay lại sau.", "info");
      }
    } catch (err) {
      showToast("Không thể kiểm tra trạng thái lúc này. Vui lòng thử lại sau.", "error");
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      navigate("/login");
    }
  };

  return (
    <>
      <style>{`
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
      `}</style>
      <div className="pending-container">
        <div className="pending-card" ref={cardRef}>
          <div className="organic-blur"></div>
          <div style={{ position: 'relative', zIndex: 10 }}>
            {isRejected ? (
              <>
                <div className="status-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#DC2626', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
                  Trạng thái: Từ chối xét duyệt
                </div>
                <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '16px' }}>Hồ Sơ Chưa Đạt Yêu Cầu</h1>
                <p style={{ fontSize: '16px', color: 'var(--on-surface-variant)', maxWidth: '440px', margin: '0 auto 32px', lineHeight: 1.5 }}>
                  Rất tiếc, hồ sơ tổ chức của bạn chưa đáp ứng đủ điều kiện hoặc minh chứng chưa hợp lệ. Vui lòng liên hệ bộ phận hỗ trợ hoặc thử đăng ký lại.
                </p>
              </>
            ) : (
              <>
                <div className="clock-wrapper">
                  <div className="clock-container">
                    <div className="clock-circle">
                      <div className="clock-hand-minute"></div>
                      <div className="clock-hand-hour"></div>
                      <div className="clock-center"></div>
                      <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJg3qPlTW-HB55V4eMGejXXyKDj6O75hTPU5xOWDl8mFXpuGG65QRHrflmI-bSb9vNK2BpzGqx8RMfcZch3cIIoxzLaYYGmloqFvEmymdZU-cfZvsu9qxyh7tX50k2LQR6DDEfEKVv_GuRW64XzwVrAABgcdOj-AojHUwhpp-sotOJx0GWw5RuvOCr-5HR7nDQRHBNgnTfTgVB_7vemfHj1RHjk_g3GZoSWsuIR9OGqfpKSzouNS8q5zAxLy2HyakQuibN2CMwmNQ7" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Clock bg" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="status-badge">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pending</span>
                  Trạng thái: Chờ duyệt
                </div>
                
                <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '16px' }}>Đang chờ xét duyệt</h1>
                
                <p style={{ fontSize: '16px', color: 'var(--on-surface-variant)', maxWidth: '440px', margin: '0 auto 32px', lineHeight: 1.5 }}>
                  Hồ sơ tổ chức của bạn đang được Staff kiểm tra. Ngay sau khi được chấp thuận, bạn có thể thực hiện toàn bộ các chức năng khác như bình thường.
                </p>
              </>
            )}
            
            <div className="pending-actions">
              <button 
                type="button" 
                className="btn-check" 
                onClick={handleCheckStatus} 
                disabled={checking}
              >
                <span className={`material-symbols-outlined ${checking ? 'animate-spin' : ''}`}>refresh</span>
                {checking ? 'Đang kiểm tra...' : 'Kiểm tra lại trạng thái duyệt'}
              </button>
              <button 
                type="button" 
                className="btn-logout-ghost" 
                onClick={handleLogout}
              >
                <span className="material-symbols-outlined">logout</span>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
