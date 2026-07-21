import React from 'react';
import { Link } from 'react-router-dom';
import "./footer.css";

export default function Footer() {
  const scrollToTop = (e) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer id="site-footer" className="site-footer">
      <div className="site-footer__inner">
        {/* Col 1: Brand */}
        <div className="site-footer__brand-col">
          <Link to="/" className="site-footer__brand" aria-label="EcoCycle" onClick={scrollToTop}>
            <img src="/logo.svg" alt="EcoCycle logo" />
            <span>EcoCycle</span>
          </Link>
          <p className="site-footer__desc">
            Nền tảng mua bán và quyên góp đồ cũ thông minh, hướng tới lối sống bền vững.
          </p>
          <div className="site-footer__socials">
            <a href="#" className="site-footer__social-btn"><span className="material-symbols-outlined">public</span></a>
            <a href="#" className="site-footer__social-btn"><span className="material-symbols-outlined">mail</span></a>
          </div>
        </div>

        {/* Col 2: About */}
        <div>
          <h6 className="site-footer__title">Về chúng tôi</h6>
          <ul className="site-footer__links">
            <li><a href="#">Giới thiệu</a></li>
            <li><a href="#">Tuyển dụng</a></li>
            <li><a href="#">Blog cộng đồng</a></li>
            <li><a href="#">Báo chí</a></li>
          </ul>
        </div>

        {/* Col 3: Support */}
        <div>
          <h6 className="site-footer__title">Hỗ trợ</h6>
          <ul className="site-footer__links">
            <li><a href="#">Trung tâm trợ giúp</a></li>
            <li><a href="#">Quy tắc cộng đồng</a></li>
            <li><a href="#">An toàn mua bán</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
          </ul>
        </div>

        {/* Col 4: Apps */}
        <div>
          <h6 className="site-footer__title">Tải ứng dụng</h6>
          <div className="site-footer__apps">
            <button className="site-footer__app-btn">
              <span className="material-symbols-outlined">apps</span>
              <div className="site-footer__app-text">
                <span className="site-footer__app-subtitle">Download on</span>
                <span className="site-footer__app-title">App Store</span>
              </div>
            </button>
            <button className="site-footer__app-btn">
              <span className="material-symbols-outlined">play_arrow</span>
              <div className="site-footer__app-text">
                <span className="site-footer__app-subtitle">Get it on</span>
                <span className="site-footer__app-title">Google Play</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        © {new Date().getFullYear()} EcoCycle Marketplace. All rights reserved.
      </div>
    </footer>
  );
}
