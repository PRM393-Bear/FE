import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/register-selection.css";

export default function RegisterSelection() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinue = () => {
    if (selectedType) {
      setIsProcessing(true);
      setTimeout(() => {
        if (selectedType === 'individual') navigate('/register-member');
        else if (selectedType === 'organization') navigate('/register-organization');
      }, 300);
    }
  };

  return (
    <main className="rs-main">
      <div className="rs-container">
        {/* Header Section */}
        <div className="rs-header">
          <h1 className="rs-title">Bạn muốn đăng ký loại tài khoản nào?</h1>
          <p className="rs-subtitle">Chọn mô hình phù hợp nhất với nhu cầu sử dụng của bạn trên nền tảng Lifecycle.</p>
        </div>
        
        {/* Comparison Cards Container */}
        <div className="rs-grid">
          
          {/* Individual Account Card */}
          <div 
            className={`rs-card ${selectedType === 'individual' ? 'active-individual' : ''}`} 
            onClick={() => setSelectedType('individual')}
          >
            <div className="rs-card-header">
              <div className="rs-icon-box rs-icon-individual">
                <span className="material-symbols-outlined" style={{fontSize: '32px'}}>person</span>
              </div>
              <span className="rs-badge rs-badge-individual">Miễn phí, không cần duyệt</span>
            </div>
            <h3 className="rs-card-title">
              👤 Cá nhân
            </h3>
            <p className="rs-card-desc">Mua bán đồ cũ, tặng đồ, tham gia cộng đồng tiêu dùng bền vững.</p>
            <div className="rs-illustration">
              <img src="/register-personal.jpg" alt="Personal" />
            </div>
            <ul className="rs-features">
              <li className="rs-feature-item">
                <span className="material-symbols-outlined rs-feature-icon rs-feature-icon-indiv">check_circle</span>
                <span className="rs-feature-text">Đăng bán tối đa 20 sản phẩm/tháng</span>
              </li>
              <li className="rs-feature-item">
                <span className="material-symbols-outlined rs-feature-icon rs-feature-icon-indiv">check_circle</span>
                <span className="rs-feature-text">Tham gia các hội nhóm cộng đồng</span>
              </li>
              <li className="rs-feature-item">
                <span className="material-symbols-outlined rs-feature-icon rs-feature-icon-indiv">check_circle</span>
                <span className="rs-feature-text">Tặng đồ miễn phí &amp; Tích điểm xanh</span>
              </li>
            </ul>
            <div className="rs-radio rs-radio-indiv">
              <div className="rs-radio-inner"></div>
            </div>
          </div>

          {/* Organization Account Card */}
          <div 
            className={`rs-card ${selectedType === 'organization' ? 'active-organization' : ''}`}
            onClick={() => setSelectedType('organization')}
          >
            <div className="rs-card-header">
              <div className="rs-icon-box rs-icon-org">
                <span className="material-symbols-outlined" style={{fontSize: '32px'}}>domain</span>
              </div>
              <span className="rs-badge rs-badge-org">Dành cho tổ chức, doanh nghiệp</span>
            </div>
            <h3 className="rs-card-title">
              🏢 Tổ chức
            </h3>
            <p className="rs-card-desc">Quy mô lớn, quản lý nhân viên, chức năng ERP nâng cao.</p>
            <div className="rs-illustration">
              <img src="/register-organization.jpg" alt="Organization" />
            </div>
            <ul className="rs-features">
              <li className="rs-feature-item">
                <span className="material-symbols-outlined rs-feature-icon rs-feature-icon-org">check_circle</span>
                <span className="rs-feature-text">Tài khoản nhân viên không giới hạn</span>
              </li>
              <li className="rs-feature-item">
                <span className="material-symbols-outlined rs-feature-icon rs-feature-icon-org">check_circle</span>
                <span className="rs-feature-text">Tích hợp API và hệ thống ERP</span>
              </li>
              <li className="rs-feature-item">
                <span className="material-symbols-outlined rs-feature-icon rs-feature-icon-org">check_circle</span>
                <span className="rs-feature-text">Hỗ trợ riêng biệt (1-1)</span>
              </li>
            </ul>
            <div className="rs-radio rs-radio-org">
              <div className="rs-radio-inner"></div>
            </div>
          </div>
          
        </div>
        
        {/* Action Section */}
        <div className="rs-action">
          <button 
            className="rs-btn-continue" 
            disabled={!selectedType || isProcessing}
            onClick={handleContinue}
          >
            {isProcessing ? (
              <><span className="inline-block material-symbols-outlined animate-spin">sync</span> Đang xử lý...</>
            ) : (
              <>Tiếp tục <span className="material-symbols-outlined">arrow_forward</span></>
            )}
          </button>
          <p className="rs-footer-hint">Bạn có thể thay đổi loại tài khoản sau này trong phần Cài đặt.</p>
        </div>
        
      </div>
    </main>
  );
}
