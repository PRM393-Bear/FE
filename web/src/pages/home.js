/**
 * EcoCycle – Home Page
 * Renders the homepage content based on Figma V2 layout.
 */

import "../styles/home.css";
import { getAllProducts } from "../services/product.service.js";
import { getAllCategories } from "../services/staff.service.js";

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
              <img alt="Lifecycle Marketplace Hero" class="carousel-image" src="/home.jpg"/>
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
              <img alt="Donation Feature Hero" class="carousel-image" src="/home-donation.jpg"/>
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
        <div class="home-categories" id="home-categories-container">
          <button class="category-btn is-active" data-cat="">
            <div class="category-icon-box"><span class="material-symbols-outlined">grid_view</span></div>
            <span class="category-label">Tất cả</span>
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
                <img class="event-image" src="/home-event.jpg" />
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
                <img class="event-image" src="/home-event.jpg" />
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
                <img class="event-image" src="/home-event.jpg" />
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
            <img class="post-image" src="/home-comunity.jpg" />
            <div class="post-user">
              <img class="post-avatar" src="/user-avatar.jpg" />
              <span class="post-username">Minh Anh</span>
            </div>
            <p class="post-text">Vừa mới "săn" được chiếc áo khoác denim cực chất trên Lifecycle. Phối đồ xuống phố thôi nào! #thoitrang #lifestyle</p>
          </div>

          <!-- Post 2 -->
          <div class="post-card">
            <p class="post-text post-text--quote">"Cảm ơn Lifecycle đã giúp mình tặng được bộ sách giáo khoa cho một em nhỏ khó khăn. Cảm thấy thật ấm lòng!"</p>
            <div class="post-user">
              <img class="post-avatar" src="/user-avatar.jpg" />
              <span class="post-username">Hoàng Nam</span>
            </div>
          </div>

          <!-- Post 3 -->
          <div class="post-card">
            <img class="post-image" src="/home-comunity.jpg" />
            <div class="post-user">
              <img class="post-avatar" src="/user-avatar.jpg" />
              <span class="post-username">Thanh Trúc</span>
            </div>
            <p class="post-text">Góc làm việc mới decor hoàn toàn bằng đồ 2nd-hand. Vừa rẻ vừa độc bản!</p>
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
        <a href="#/create-listing" class="mobile-nav-fab">
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

  // Dynamic categories loader & click handler setup
  function getFashionIconForCategory(name = "") {
    const lower = name.toLowerCase();
    if (lower.includes("áo thun") || lower.includes("sơ mi")) return "checkroom";
    if (lower.includes("áo khoác") || lower.includes("blazer") || lower.includes("áo ấm") || lower.includes("len")) return "ac_unit";
    if (lower.includes("áo")) return "apparel";
    if (lower.includes("quần")) return "dry_cleaning";
    if (lower.includes("váy") || lower.includes("đầm")) return "styler";
    if (lower.includes("thể thao") || lower.includes("tập") || lower.includes("gym")) return "fitness_center";
    if (lower.includes("ngủ") || lower.includes("mặc nhà")) return "bed";
    if (lower.includes("túi") || lower.includes("phụ kiện") || lower.includes("mũ") || lower.includes("khăn")) return "shopping_bag";
    if (lower.includes("giày") || lower.includes("dép")) return "steps";
    return "style";
  }

  function attachCategoryClickHandlers() {
    const catBtns = container.querySelectorAll(".category-btn");
    catBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.getAttribute("data-cat") || "";
        if (cat) {
          window.location.hash = `#/products?category=${encodeURIComponent(cat)}`;
        } else {
          window.location.hash = `#/products`;
        }
      });
    });
  }

  const catContainer = container.querySelector("#home-categories-container");
  if (catContainer) {
    getAllCategories().then(categories => {
      if (Array.isArray(categories) && categories.length > 0) {
        catContainer.innerHTML = `
          <button class="category-btn is-active" data-cat="">
            <div class="category-icon-box"><span class="material-symbols-outlined">grid_view</span></div>
            <span class="category-label">Tất cả</span>
          </button>
          ${categories.map(cat => {
            const icon = getFashionIconForCategory(cat.name || "");
            return `
              <button class="category-btn" data-cat="${cat.name || ""}">
                <div class="category-icon-box"><span class="material-symbols-outlined">${icon}</span></div>
                <span class="category-label">${cat.name || "Không tên"}</span>
              </button>
            `;
          }).join("")}
        `;
      }
      attachCategoryClickHandlers();
    }).catch(err => {
      console.warn("Failed to load home categories:", err);
      attachCategoryClickHandlers();
    });
  } else {
    attachCategoryClickHandlers();
  }

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
  let hoverScrollInterval = null;
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

  return () => {
    window.removeEventListener("resize", updateArrowState);
    if (hoverScrollInterval) {
      clearInterval(hoverScrollInterval);
      hoverScrollInterval = null;
    }
  };
}
