/**
 * EcoCycle – Home Page
 * Renders the homepage content based on Figma V2 layout.
 */

import "../styles/home.css";
import { getAllProducts } from "../services/product.service.js";

export async function renderHomePage(container) {
  container.innerHTML = `
    <div class="home-layout">
      <!-- Hero Carousel -->
      <section class="home-carousel">
        <div class="carousel-track" id="hero-carousel">
          
          <!-- Slide 1 -->
          <div class="carousel-slide">
            <div class="carousel-content">
              <span class="carousel-badge carousel-badge--primary">AI Powered</span>
              <h2 class="carousel-title">Mua bán đồ cũ thông minh hơn với AI</h2>
              <p class="carousel-desc">Công nghệ nhận diện hình ảnh giúp bạn định giá và mô tả sản phẩm tự động chỉ trong vài giây.</p>
              <button class="carousel-btn carousel-btn--primary">Bắt đầu ngay</button>
            </div>
            <div class="carousel-image-wrapper">
              <img alt="Lifecycle Marketplace Hero" class="carousel-image" src="https://lh3.googleusercontent.com/aida/AP1WRLs9VWj7rZ8ol_qjWYOVCZi1b76y0Q3tV9BlbBZZ2R7duxgyhwmif7a_XiWxJdOniM7ARK0U9WFHOAWuLz9SVlIbq0k0I87ttScHvpdMLNVJmnZoKOb16I37R_aRsRn9mKkz2T827BrgGLkDENo3llX3F1IUEJxWHsFPbLFh6r7TYpPrR0s46uMTE2KCjLMbheW_5tKtaTD9Tw1i2zm_R3eKEYcW1nBtW26IwmmvOBlaqqupLhHShIYc4ns"/>
            </div>
          </div>

          <!-- Slide 2 -->
          <div class="carousel-slide carousel-slide--white">
            <div class="carousel-content">
              <span class="carousel-badge carousel-badge--secondary">Impact</span>
              <h2 class="carousel-title">Tặng đồ — Kết nối yêu thương</h2>
              <p class="carousel-desc">Lan tỏa sự tử tế bằng cách trao tặng những món đồ bạn không còn sử dụng cho các tổ chức cộng đồng.</p>
              <button class="carousel-btn carousel-btn--secondary">Tìm tổ chức</button>
            </div>
            <div class="carousel-image-wrapper">
              <img alt="Donation Feature Hero" class="carousel-image" src="https://lh3.googleusercontent.com/aida/AP1WRLuqVSlwS7eAayzLaS3KMJDI-fGQPcUldpB-bf1thEIsHGUpK5v1_IgkkBbiv6IwomahULoOBiAeC5NmU1VijbIu7s0fgz9mqekX1pMcKWlDuKdOcC63NyDupQXyNfqJ9nmMTWejIC5sxQ1k6zFVwoGo-CepI64-67Dm4u1eNFEwaFVuB6_lADEUq3IsMeAGQznoLykQ9XeM0dgE1MlTJPVB7uObSKRhvUHOAAxHAnOIdX2JkVtQ4_lO-U0J"/>
            </div>
          </div>

        </div>

        <div class="carousel-dots">
          <button class="carousel-dot is-active" data-index="0"></button>
          <button class="carousel-dot" data-index="1"></button>
        </div>
      </section>

      <!-- Category Row -->
      <section class="home-container">
        <div class="home-categories">
          <button class="category-btn is-active">
            <div class="category-icon-box"><span class="material-symbols-outlined">grid_view</span></div>
            <span class="category-label">Tất cả</span>
          </button>
          <button class="category-btn">
            <div class="category-icon-box"><span class="material-symbols-outlined">apparel</span></div>
            <span class="category-label">Quần áo</span>
          </button>
          <button class="category-btn">
            <div class="category-icon-box"><span class="material-symbols-outlined">steps</span></div>
            <span class="category-label">Giày</span>
          </button>
          <button class="category-btn">
            <div class="category-icon-box"><span class="material-symbols-outlined">handyman</span></div>
            <span class="category-label">Túi xách</span>
          </button>
          <button class="category-btn">
            <div class="category-icon-box"><span class="material-symbols-outlined">devices</span></div>
            <span class="category-label">Điện tử</span>
          </button>
          <button class="category-btn">
            <div class="category-icon-box"><span class="material-symbols-outlined">home_app_logo</span></div>
            <span class="category-label">Đồ nhà</span>
          </button>
          <button class="category-btn">
            <div class="category-icon-box"><span class="material-symbols-outlined">book</span></div>
            <span class="category-label">Sách</span>
          </button>
          <button class="category-btn">
            <div class="category-icon-box"><span class="material-symbols-outlined">more_horiz</span></div>
            <span class="category-label">Khác</span>
          </button>
        </div>
      </section>

      <!-- New Arrivals -->
      <section class="home-container">
        <header class="section-header">
          <div>
            <h3 class="section-title">Mới đăng hôm nay</h3>
            <p class="section-desc">Khám phá những món đồ vừa lên sàn</p>
          </div>
          <a href="#/products" class="section-link">Xem tất cả <span class="material-symbols-outlined">arrow_forward</span></a>
        </header>

        <div class="arrivals-slider-wrapper">
          <button class="slider-arrow slider-arrow--prev" id="arrivals-prev-btn" aria-label="Previous products" disabled>
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          
          <div class="arrivals-slider-container" id="arrivals-slider-container">
            <div class="arrivals-slider-track" id="arrivals-slider-track">
              <!-- Will be loaded dynamically -->
            </div>
          </div>

          <button class="slider-arrow slider-arrow--next" id="arrivals-next-btn" aria-label="Next products" disabled>
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </section>

      <!-- Events Section -->
      <section class="events-section">
        <div class="home-container">
          <header class="section-header" style="margin-top: 0;">
            <div>
              <h3 class="section-title">Sự kiện quyên góp sắp diễn ra</h3>
              <p class="section-desc">Tham gia cộng đồng và chia sẻ yêu thương</p>
            </div>
            <a href="#" class="section-link">Xem tất cả <span class="material-symbols-outlined">arrow_forward</span></a>
          </header>

          <div class="events-grid">
            <!-- Event 1 -->
            <a href="#" class="event-card">
              <div class="event-image-wrapper">
                <img class="event-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3udAxb397SbCWObrh_btqhw1cQr4SE1VpVtBDWkdzDFST4Y5NCNQEuCfkns164cTB1C3RXjVFnTonO-7vWOW2c3ReBjKMxMzYwWzs8_Rkti-WNxIHttGpMiSOA6O_lVk3PnHVlzd912svmvppofjpdyIi_aam8sG3Hn3i8-vg81VsreuqoHv9c1w-S2weB1Dt1B2167bERtXiNz_CDzVztj_ZDE17Pw_a9DBTeIxV2P9X8WpUZWyTOlTHQxMNIRlnW2IRizegX7ID" />
                <span class="event-badge">Sắp diễn ra</span>
              </div>
              <div class="event-body">
                <h4 class="event-title">Ngày hội Tủ đồ Nhỏ - Trao yêu thương</h4>
                <div class="event-info"><span class="material-symbols-outlined">calendar_today</span> Chủ Nhật, 25 Th06, 2024</div>
                <div class="event-info"><span class="material-symbols-outlined">location_on</span> Công viên Thống Nhất, Hà Nội</div>
              </div>
            </a>

            <!-- Event 2 -->
            <a href="#" class="event-card">
              <div class="event-image-wrapper">
                <img class="event-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrprTWEU8DXJclSX_aHjeKZQSj_J-cs8EQxXeQftFvFUHhz6vl-Hc9tFzbukWCyhoHeH4wYrAYTkzvG08Vl70OgJzHdYgxtZMT1euWqQiz5kaAZn1UeOB5RqxtCo6OpkWgDDS8lOZ3ifLoLaAI9wVCnqN8nexivYVbo7QrXMxVAm_f2xMKRCw1iIcPSVbDsCNZP7Puv_hu7ym5SfQwQRzDvL-ZDyYTyQ6uIoJKhNLM_jPpv-ptw5UpUjkln3-o6Gc8ZOB7mfd17A9G" />
              </div>
              <div class="event-body">
                <h4 class="event-title">Quyên góp sách cũ cho trẻ em vùng cao</h4>
                <div class="event-info"><span class="material-symbols-outlined">calendar_today</span> 15 Th07 - 20 Th07, 2024</div>
                <div class="event-info"><span class="material-symbols-outlined">location_on</span> Văn phòng Lifecycle, Q.1, TP.HCM</div>
              </div>
            </a>

            <!-- Event 3 -->
            <a href="#" class="event-card">
              <div class="event-image-wrapper">
                <img class="event-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeGqJDttVsNNQmVb1PqnoMU4mkzuZvR9Wc7lL1KkpASMtZOJulE6ILv8ZuOa6hzWZkryudNaBMy9ytkktbMipU7RaB7CGP6bejdVH0MYIj3MMiU24ZVr5fXQLSpaT1yNOsEIuOysbpYD9J0AcQ1BhjmbNFWQZRb7zwopBlH6oZMEWAuaBRiCofztdY1J-kPEXZajGcQe4ZYPZwXFAo9UvhD001Lr_NXPLCu1xNGRVGiiGx6rPKzaQaWFAzOqfWcvDRMMD5mZq6rZEB" />
              </div>
              <div class="event-body">
                <h4 class="event-title">Thu gom rác thải điện tử tái chế</h4>
                <div class="event-info"><span class="material-symbols-outlined">calendar_today</span> Thứ Bảy, 10 Th08, 2024</div>
                <div class="event-info"><span class="material-symbols-outlined">location_on</span> KĐT Sala, TP. Thủ Đức</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- Community Masonry Section -->
      <section class="home-container">
        <header class="section-header">
          <div>
            <h3 class="section-title">Bài đăng từ cộng đồng</h3>
            <p class="section-desc">Xem cách mọi người tái sử dụng đồ cũ</p>
          </div>
          <a href="#" class="section-link">Xem cộng đồng <span class="material-symbols-outlined">arrow_forward</span></a>
        </header>

        <div class="community-masonry">
          <!-- Post 1 -->
          <div class="post-card">
            <img class="post-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnXvovWhHid6pPmLKGYqbUXkqpw9LAt34OhRJyC-ljKCH1DyZpfy4oe5VG1aNyOh7ckDWYHvG6VxCACROpuYReRcTVHbe4PevtqV8XjY4nD-oaiopXjiudJYPIRJwyVAp3n3GF4xjmmAVqCMvXR47BgBnuS3I8rlv4lJ4lUx2KNBpbgyBL11-rP4MoW1NRHySXaFfJv9gY5yoiNlAQY4kzQ8XJmmzdWRrvbHu3edOwDR3nJjMrTsbrTRZT0w7MxntHFJEMysT37ADM" />
            <div class="post-user">
              <img class="post-avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA45i0uHxtTq-y9oTqDFU_9Pf6HeLmUvQoPa4fIvIlto_DU_yacWsopaDsxIaLWVncDe7dAlKOnTXiu1vd75MOpT9RURFYeWzp4QKxmUVBJJTLQDRY1dU-b8DnN7SHvfXyQ0VqKrquHNZADZtmv5HQ6lur2GOLGy4ib9qHlD6s7qpr-shCBLKD2GYTp0wjXxAXd1AlEcw0EqQ1Zd5faa1fNTYpwJ3NCZjA7K_USFHpCIaO1eh8Lj5diaNiReraksm03n2JeKpl46fb5" />
              <span class="post-username">Minh Anh</span>
            </div>
            <p class="post-text">Vừa mới "săn" được chiếc áo khoác denim cực chất trên Lifecycle. Phối đồ xuống phố thôi nào! #thoitrang #lifestyle</p>
          </div>

          <!-- Post 2 -->
          <div class="post-card">
            <p class="post-text post-text--quote">"Cảm ơn Lifecycle đã giúp mình tặng được bộ sách giáo khoa cho một em nhỏ khó khăn. Cảm thấy thật ấm lòng!"</p>
            <div class="post-user">
              <img class="post-avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSHJ9fVJVta6oo4TDVTjE4GGg-1Y9Fhk7K5L7laMMRwXYnME9vt4FXFRsHHEPGXGk6mhIKcyGi9VfFkQOrswlY2IW2GtRThxzMR8vsD55i8Q_uUicSmfrUwWutccJO8JhK7NHkpD51F9FgefrKgTp0sqvR3A-VgpmACS3dbC3-hfYtGCWWWvYTe-1tVzH8yBTWqwxMlT4yV_uVuscpakUXAtxdtOwwu52DzWnJeKlYFyc-HuqcHnnK3UGFg3IgcSlB-GVx2AXEek7J" />
              <span class="post-username">Hoàng Nam</span>
            </div>
          </div>

          <!-- Post 3 -->
          <div class="post-card">
            <img class="post-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOniDcbgdqflqWrY7G9CRlA6uNxyzg5w6bbujiH5FVMwfs66vbao9v_j5P0wcbxIc-hsdYgga8oMLM9bcukG1mWhLDV5Kl7YrAHK_5Yt2A0wiT0xs_-ey0_Q_HbJYKaIYwx7bjRKACBsp5GWBUqQ6lLMnuszi5KNE4wtfjkrRf45K3q0DUTE9oBymMGEeUWMGnZCgHSJc1rbB3Vu4TkFSMq5QhGAfRfI6Hn7HSuFlfbsSNfOQ46ahwlMW89ev9WYS6-OqnfQWV-mcT" />
            <div class="post-user">
              <img class="post-avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCohuAbNDaF1FFHdR1Xr_gzOczYFiJDoNUIEBhEJrX2aYTRBoJii1UQ0I6lxdAjt98RJqcjBQyNYsQze60uthN7OrvdYD8qoysFMSjrqzZEXy7ZEH6jR3o58TExPpYMUYWFkFx5KshB_yD9ekrwihKoBlWQLlk9nEBoED3Um3atIgERrfbVk6I1O_BwqH3GWFotdzMNhgSb3uVzPek8ZaPrTbfMeXVRad_0gBQ-x0U5SHVARw6YEBEGp0oYGE9irDbCFgPmHuIrksKh" />
              <span class="post-username">Thanh Trúc</span>
            </div>
            <p class="post-text">Góc làm việc mới decor hoàn toàn bằng đồ 2nd-hand. Vừa rẻ vừa độc bản!</p>
          </div>
        </div>
      </section>

      <!-- Featured Sellers -->
      <section class="home-container">
        <header class="section-header">
          <div>
            <h3 class="section-title">Seller nổi bật</h3>
            <p class="section-desc">Những người bán uy tín được cộng đồng tin tưởng</p>
          </div>
        </header>

        <div class="sellers-row">
          <!-- Seller 1 -->
          <div class="seller-card">
            <div class="seller-avatar-wrapper">
              <img class="seller-avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCwCIKqrd6WRMbIjb3LrGDoGf6v7Mnxv_btlO7FjYGzb5xOGaTOioPaKzBjpgNDPuicOyWyxbT8Z3BW0mb5QKzBcpzOnwYV6NNDtnzrY2XgAgjCzBylvEXF_toNEK8nXe07UfGSbaNGHrFqbZ6ArItMHLpDMaiBFIdrbL3M-qHqXrtCMIB7uakXInlxFCN3BKUjseO5oUhIrBGOQrKh4EbPrGWcAjHrZK_XZPPbeAyKxiIXs4KUPktVrgPt1Y13qT43dX-nST6WKIr" />
              <span class="seller-verified"><span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">verified</span></span>
            </div>
            <h5 class="seller-name">Tuấn Anh Store</h5>
            <div class="seller-rating">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star_half</span>
              <span class="seller-rating-score">(4.8)</span>
            </div>
            <p class="seller-stats">42 sản phẩm đang bán</p>
            <button class="seller-btn">Xem shop</button>
          </div>

          <!-- Seller 2 -->
          <div class="seller-card">
            <div class="seller-avatar-wrapper">
              <img class="seller-avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUhLsqDt-BYAHI8bTaPKYpnuajfvHfQ5OTlkvcXdJndMPKjD8h_hTagqt3gk9wwtT8WV-JRF5f9QCjZQQ513cocwRRNNI8twC4AgpBklpbmQTN8FJWaA_nKPbezlS4dtct68Figvfs0yacDUi4s-p62ZYSzHTMcObLfi8Nlo63oOjKBwNVRW2_8mpyDINzSiB6O3_4pXqomlPaFURjEJOtzFCArb-S91TCC2ITTwm6tH1vupo1jSXfdSJzq0eaPifRLJgVMzJ3Y29l" />
              <span class="seller-verified"><span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">verified</span></span>
            </div>
            <h5 class="seller-name">Vintage Vibes</h5>
            <div class="seller-rating">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="seller-rating-score">(5.0)</span>
            </div>
            <p class="seller-stats">15 sản phẩm đang bán</p>
            <button class="seller-btn">Xem shop</button>
          </div>

          <!-- Seller 3 -->
          <div class="seller-card">
            <div class="seller-avatar-wrapper">
              <img class="seller-avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDc7h5NgV1rmO69JGhokaOSDWgDc53hKPSiORpRxaCRLcUNqI17p8J-v101DCPB4UUBTdiaAhDcICwVlI0WnE_QOKQFJOlndA5ldTdTKfZHMjLR9E7JQ8oI5FFmMSXnvK0_Xj7u8QqOJSrgCRdbCiSsTRK090VTbVnjNsG6v9CrKMwjd7jXLp0hMZEjeZdCkBjne1QD7TFAM7IbXu4WZN7WSfe34tNpqsXD9JDpSRonIIR1PQQ_eXgLRiFsPPQyIAptoX26npbTK9Ng" />
            </div>
            <h5 class="seller-name">Tech Passione</h5>
            <div class="seller-rating">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined">star_outline</span>
              <span class="seller-rating-score">(4.2)</span>
            </div>
            <p class="seller-stats">86 sản phẩm đang bán</p>
            <button class="seller-btn">Xem shop</button>
          </div>

          <!-- Seller 4 -->
          <div class="seller-card">
            <div class="seller-avatar-wrapper">
              <img class="seller-avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAb0Ldl37qRJL5hvtBlqMwbhD12O-2Ol2FgdeZ9fBqgZAooOI7JoqS_KIiiTJzRM70UBgqZ-8Aob1zreM3A6uTmILxISHgFawlBWHSe6ca7FpodpI70SUR6hFhhlhrLnbEh9pqcmxHAfRqaa_GOLJ03yjw__4wZ3hxbw3_3Nzpn-8wmNGbGROlZemuZsb6wBLj7Ym8uKzxAC6LeDu_uWWWjmc4XwvKy0CjvyrPDpHgOM7sbS_s30jG-qvKmh4SJ5ERtIuaKLGrlZ2FW" />
            </div>
            <h5 class="seller-name">Mẹ Bầu Bé Ngoan</h5>
            <div class="seller-rating">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star_half</span>
              <span class="seller-rating-score">(4.7)</span>
            </div>
            <p class="seller-stats">120 sản phẩm đang bán</p>
            <button class="seller-btn">Xem shop</button>
          </div>
        </div>
      </section>

      <!-- Bottom Nav Bar (Mobile) -->
      <nav class="mobile-nav">
        <a href="#/" class="mobile-nav-item is-active">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">home</span>
          <span>Trang chủ</span>
        </a>
        <a href="#" class="mobile-nav-item">
          <span class="material-symbols-outlined">favorite</span>
          <span>Yêu thích</span>
        </a>
        <a href="#" class="mobile-nav-fab">
          <div class="mobile-nav-fab-btn">
            <span class="material-symbols-outlined">add</span>
          </div>
          <span>Bán đồ</span>
        </a>
        <a href="#" class="mobile-nav-item">
          <span class="material-symbols-outlined">notifications</span>
          <span>Thông báo</span>
        </a>
        <a href="#/profile" class="mobile-nav-item">
          <span class="material-symbols-outlined">person</span>
          <span>Tôi</span>
        </a>
      </nav>

    </div>
  `;

  // Carousel Logic
  const track = document.getElementById("hero-carousel");
  const dots = document.querySelectorAll(".carousel-dot");
  let currentSlide = 0;
  const totalSlides = dots.length;

  function moveCarousel(index) {
    if (!track) return;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      currentSlide = parseInt(dot.getAttribute("data-index"), 10);
      moveCarousel(currentSlide);
    });
  });

  // Auto play carousel
  const carouselInterval = setInterval(() => {
    if (!document.getElementById("hero-carousel")) {
      clearInterval(carouselInterval);
      return;
    }
    currentSlide = (currentSlide + 1) % totalSlides;
    moveCarousel(currentSlide);
  }, 5000);

  // Helper for formatting prices
  function formatPrice(price) {
    if (!price && price !== 0) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  }

  // Helper for mapping condition value (1-5) to badge text and class
  function getConditionBadge(condition) {
    switch (condition) {
      case 1:
        return { text: "Mới 100%", class: "product-condition-badge--new" };
      case 2:
        return { text: "Mới 99%", class: "product-condition-badge--new" };
      case 3:
        return { text: "Mới 95%", class: "product-condition-badge--new" };
      case 4:
        return { text: "Cũ 80%", class: "product-condition-badge--used" };
      case 5:
        return { text: "Cũ 60%", class: "product-condition-badge--used" };
      default:
        return { text: "Mới 90%", class: "product-condition-badge--new" };
    }
  }

  // Load and render new arrivals dynamically
  const arrivalsTrack = document.getElementById("arrivals-slider-track");
  const arrivalsContainer = document.getElementById("arrivals-slider-container");
  const arrivalsPrevBtn = document.getElementById("arrivals-prev-btn");
  const arrivalsNextBtn = document.getElementById("arrivals-next-btn");

  function updateArrowState() {
    if (!arrivalsContainer || !arrivalsPrevBtn || !arrivalsNextBtn) return;
    const canScrollLeft = arrivalsContainer.scrollLeft > 2;
    const canScrollRight = arrivalsContainer.scrollWidth - arrivalsContainer.clientWidth - arrivalsContainer.scrollLeft > 2;
    arrivalsPrevBtn.disabled = !canScrollLeft;
    arrivalsNextBtn.disabled = !canScrollRight;
  }

  if (arrivalsTrack) {
    arrivalsTrack.innerHTML = `
      <div class="slider-loading">
        <div class="spinner"></div>
        <p>Đang tải sản phẩm mới...</p>
      </div>
    `;

    try {
      const allProducts = await getAllProducts();

      // Filter by today's date in local time
      const today = new Date();
      const todayProducts = allProducts.filter(p => {
        if (!p.createdAt) return false;
        const d = new Date(p.createdAt);
        return d.getDate() === today.getDate() &&
               d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
      });

      // Sort from newest to oldest
      todayProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (todayProducts.length > 0) {
        arrivalsTrack.innerHTML = todayProducts.map(product => {
          const imageUrl = product.images && product.images.length > 0
            ? product.images[0]
            : "https://placehold.co/400x533/E4EBE4/6E7B6C?text=No+Image";
          
          const price = product.price || 0;
          const conditionVal = product.condition || 3;
          const badge = getConditionBadge(conditionVal);

          return `
            <a href="#/product/${product.id}" class="product-card">
              <div class="product-image-wrapper">
                <img class="product-image" src="${imageUrl}" loading="lazy" />
                <button class="product-fav-btn" onclick="event.preventDefault()"><span class="material-symbols-outlined">favorite</span></button>
                <span class="product-condition-badge ${badge.class}">${badge.text}</span>
              </div>
              <h4 class="product-title">${product.title || "Sản phẩm không có tên"}</h4>
              <p class="product-price">${formatPrice(price)}</p>
            </a>
          `;
        }).join("");
      } else {
        arrivalsTrack.innerHTML = `
          <div class="slider-empty">
            <span class="material-symbols-outlined empty-icon">shopping_bag</span>
            <p>Hôm nay chưa có sản phẩm nào được đăng.</p>
            <a href="#/products" class="empty-btn">Khám phá sản phẩm cũ hơn</a>
          </div>
        `;
      }

      setTimeout(updateArrowState, 100);

    } catch (error) {
      console.error("Failed to load arrivals:", error);
      arrivalsTrack.innerHTML = `
        <div class="slider-error">
          <p>Không thể tải sản phẩm hôm nay.</p>
        </div>
      `;
    }
  }

  // Hook scroll listeners and hover slide timers
  if (arrivalsContainer && arrivalsPrevBtn && arrivalsNextBtn) {
    arrivalsContainer.addEventListener("scroll", updateArrowState);
    window.addEventListener("resize", updateArrowState);

    const getScrollStep = () => {
      const firstCard = arrivalsContainer.querySelector(".product-card");
      if (firstCard) {
        return firstCard.offsetWidth + 24; // card width + gap
      }
      return 300;
    };

    // Click arrows to scroll
    arrivalsPrevBtn.addEventListener("click", () => {
      arrivalsContainer.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
    });

    arrivalsNextBtn.addEventListener("click", () => {
      arrivalsContainer.scrollBy({ left: getScrollStep(), behavior: "smooth" });
    });

    // Hover (trỏ chuột) slow continuous scroll
    let hoverScrollInterval = null;
    const startHoverScroll = (direction) => {
      if (hoverScrollInterval) clearInterval(hoverScrollInterval);
      hoverScrollInterval = setInterval(() => {
        if (!document.getElementById("arrivals-slider-container")) {
          clearInterval(hoverScrollInterval);
          hoverScrollInterval = null;
          return;
        }
        arrivalsContainer.scrollLeft += direction * 8;
      }, 16);
    };

    const stopHoverScroll = () => {
      if (hoverScrollInterval) {
        clearInterval(hoverScrollInterval);
        hoverScrollInterval = null;
      }
    };

    arrivalsPrevBtn.addEventListener("mouseenter", () => startHoverScroll(-1));
    arrivalsPrevBtn.addEventListener("mouseleave", stopHoverScroll);

    arrivalsNextBtn.addEventListener("mouseenter", () => startHoverScroll(1));
    arrivalsNextBtn.addEventListener("mouseleave", stopHoverScroll);
  }
}
