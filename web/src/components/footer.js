/**
 * EcoCycle – Site Footer Component (Figma V2)
 */

import "./footer.css";

export function renderFooter() {
  const existing = document.getElementById("site-footer");
  if (existing) existing.remove();

  const footer = document.createElement("footer");
  footer.id = "site-footer";
  footer.className = "site-footer";

  footer.innerHTML = `
    <div class="site-footer__inner">
      <!-- Col 1: Brand -->
      <div class="site-footer__brand-col">
        <a href="#/" class="site-footer__brand" aria-label="EcoCycle">
          <img src="/logo.svg" alt="EcoCycle logo" />
          <span>EcoCycle</span>
        </a>
        <p class="site-footer__desc">
          Nền tảng mua bán và quyên góp đồ cũ thông minh, hướng tới lối sống bền vững.
        </p>
        <div class="site-footer__socials">
          <a href="#" class="site-footer__social-btn"><span class="material-symbols-outlined">public</span></a>
          <a href="#" class="site-footer__social-btn"><span class="material-symbols-outlined">mail</span></a>
        </div>
      </div>

      <!-- Col 2: About -->
      <div>
        <h6 class="site-footer__title">Về chúng tôi</h6>
        <ul class="site-footer__links">
          <li><a href="#">Giới thiệu</a></li>
          <li><a href="#">Tuyển dụng</a></li>
          <li><a href="#">Blog cộng đồng</a></li>
          <li><a href="#">Báo chí</a></li>
        </ul>
      </div>

      <!-- Col 3: Support -->
      <div>
        <h6 class="site-footer__title">Hỗ trợ</h6>
        <ul class="site-footer__links">
          <li><a href="#">Trung tâm trợ giúp</a></li>
          <li><a href="#">Quy tắc cộng đồng</a></li>
          <li><a href="#">An toàn mua bán</a></li>
          <li><a href="#">Chính sách bảo mật</a></li>
        </ul>
      </div>

      <!-- Col 4: Apps -->
      <div>
        <h6 class="site-footer__title">Tải ứng dụng</h6>
        <div class="site-footer__apps">
          <button class="site-footer__app-btn">
            <span class="material-symbols-outlined">apps</span>
            <div class="site-footer__app-text">
              <span class="site-footer__app-subtitle">Download on</span>
              <span class="site-footer__app-title">App Store</span>
            </div>
          </button>
          <button class="site-footer__app-btn">
            <span class="material-symbols-outlined">play_arrow</span>
            <div class="site-footer__app-text">
              <span class="site-footer__app-subtitle">Get it on</span>
              <span class="site-footer__app-title">Google Play</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="site-footer__bottom">
      © ${new Date().getFullYear()} EcoCycle Marketplace. All rights reserved.
    </div>
  `;

  document.body.appendChild(footer);

  // Brand click listener to scroll to top if already home
  footer.querySelector(".site-footer__brand")?.addEventListener("click", (e) => {
    if (window.location.hash === "#/" || window.location.hash === "") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}
