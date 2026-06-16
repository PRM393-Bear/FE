/**
 * EcoCycle – Site Footer Component
 * Reusable footer across all pages.
 */

import "./footer.css";

/**
 * Inject the footer as the last child of <body>.
 * Call once per page render.
 */
export function renderFooter() {
  const existing = document.getElementById("site-footer");
  if (existing) existing.remove();

  const footer = document.createElement("footer");
  footer.id = "site-footer";
  footer.className = "site-footer";
  footer.setAttribute("role", "contentinfo");

  footer.innerHTML = `
    <div class="site-footer__inner">
      
      <!-- Brand & Desc -->
      <div class="site-footer__brand-col">
        <a href="#/" class="site-footer__brand" aria-label="EcoCycle">
          <img src="/logo.svg" alt="EcoCycle logo" class="site-footer__logo" width="36" height="36" />
          <span class="site-footer__wordmark">EcoCycle</span>
        </a>
        <p class="site-footer__desc">
          Nền tảng kết nối những người yêu thích đồ cũ, trao đổi đồ cũ và quyên góp từ thiện nhằm giảm thiểu rác thải, bảo vệ môi trường.
        </p>
      </div>

      <!-- Links: Về chúng tôi -->
      <div>
        <h3 class="site-footer__title">Về chúng tôi</h3>
        <ul class="site-footer__links">
          <li><a href="#/about" class="site-footer__link">Câu chuyện EcoCycle</a></li>
          <li><a href="#/careers" class="site-footer__link">Tuyển dụng</a></li>
          <li><a href="#/blog" class="site-footer__link">Blog & Tin tức</a></li>
          <li><a href="#/partners" class="site-footer__link">Đối tác từ thiện</a></li>
        </ul>
      </div>

      <!-- Links: Hỗ trợ -->
      <div>
        <h3 class="site-footer__title">Hỗ trợ khách hàng</h3>
        <ul class="site-footer__links">
          <li><a href="#/faq" class="site-footer__link">Câu hỏi thường gặp</a></li>
          <li><a href="#/guide" class="site-footer__link">Hướng dẫn sử dụng</a></li>
          <li><a href="#/policy" class="site-footer__link">Chính sách bảo mật</a></li>
          <li><a href="#/terms" class="site-footer__link">Điều khoản dịch vụ</a></li>
        </ul>
      </div>

      <!-- Newsletter -->
      <div class="site-footer__newsletter-col">
        <h3 class="site-footer__title">Đăng ký nhận tin</h3>
        <p class="site-footer__newsletter-desc">Nhận thông tin mới nhất về các sự kiện quyên góp và đồ cũ nổi bật.</p>
        <form class="site-footer__form" onsubmit="event.preventDefault(); alert('Cảm ơn bạn đã đăng ký!');">
          <input type="email" class="site-footer__input" placeholder="Nhập email của bạn..." required />
          <button type="submit" class="site-footer__submit">Đăng ký</button>
        </form>
      </div>

    </div>

    <div class="site-footer__bottom">
      <span>&copy; ${new Date().getFullYear()} EcoCycle. Mọi quyền được bảo lưu.</span>
      <div class="site-footer__social">
        <a href="#" class="site-footer__social-link" aria-label="Facebook">Facebook</a>
        <a href="#" class="site-footer__social-link" aria-label="Instagram">Instagram</a>
        <a href="#" class="site-footer__social-link" aria-label="Twitter">Twitter</a>
      </div>
    </div>
  `;

  document.body.appendChild(footer);
}
