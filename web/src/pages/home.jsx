import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/home.css";
import { getAllProducts } from "../services/product.service.js";
import { getAllCategories } from "../services/staff.service.js";
import { showToast } from "../utils/ui.js";

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [todayProducts, setTodayProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const arrivalsContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const hoverScrollInterval = useRef(null);

  useEffect(() => {
    // Categories
    getAllCategories().then(cats => {
      if (Array.isArray(cats)) setCategories(cats);
    }).catch(err => {
      console.warn("Failed to load home categories:", err);
    });

    // Products
    getAllProducts().then(allProducts => {
      const today = new Date();
      const todayProds = allProducts.filter(p => {
        if (!p.createdAt) return false;
        const d = new Date(p.createdAt);
        return d.getDate() === today.getDate() &&
               d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
      });
      todayProds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTodayProducts(todayProds);
      setLoadingProducts(false);
    }).catch(error => {
      console.error("Failed to load arrivals:", error);
      setErrorProducts(true);
      setLoadingProducts(false);
    });
  }, []);

  // Carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 2); // 2 slides
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll logic for arrivals
  const updateArrowState = () => {
    if (!arrivalsContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = arrivalsContainerRef.current;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollWidth - clientWidth - scrollLeft > 2);
  };

  useEffect(() => {
    updateArrowState();
    window.addEventListener("resize", updateArrowState);
    return () => window.removeEventListener("resize", updateArrowState);
  }, [todayProducts]);

  const getScrollStep = () => {
    if (arrivalsContainerRef.current) {
      const firstCard = arrivalsContainerRef.current.querySelector(".product-card");
      if (firstCard) return firstCard.offsetWidth + 24;
    }
    return 300;
  };

  const scrollLeft = () => arrivalsContainerRef.current?.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
  const scrollRight = () => arrivalsContainerRef.current?.scrollBy({ left: getScrollStep(), behavior: "smooth" });

  const startHoverScroll = (direction) => {
    if (hoverScrollInterval.current) clearInterval(hoverScrollInterval.current);
    hoverScrollInterval.current = setInterval(() => {
      if (arrivalsContainerRef.current) {
        arrivalsContainerRef.current.scrollLeft += direction * 8;
        updateArrowState();
      }
    }, 16);
  };

  const stopHoverScroll = () => {
    if (hoverScrollInterval.current) {
      clearInterval(hoverScrollInterval.current);
      hoverScrollInterval.current = null;
    }
  };

  const getFashionIconForCategory = (name = "") => {
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
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getConditionBadge = (condition) => {
    switch (condition) {
      case 1: return { text: "Mới 100%", className: "product-condition-badge--new" };
      case 2: return { text: "Mới 99%", className: "product-condition-badge--new" };
      case 3: return { text: "Mới 95%", className: "product-condition-badge--new" };
      case 4: return { text: "Cũ 80%", className: "product-condition-badge--used" };
      case 5: return { text: "Cũ 60%", className: "product-condition-badge--used" };
      default: return { text: "Mới 90%", className: "product-condition-badge--new" };
    }
  };

  return (
    <div className="home-layout">
      {/* Hero Carousel */}
      <section className="home-carousel">
        <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          <div className="carousel-slide">
            <div className="carousel-content">
              <span className="carousel-badge carousel-badge--primary">AI Powered</span>
              <h2 className="carousel-title">Mua bán đồ cũ thông minh hơn với AI</h2>
              <p className="carousel-desc">Công nghệ nhận diện hình ảnh giúp bạn định giá và mô tả sản phẩm tự động chỉ trong vài giây.</p>
              <button className="carousel-btn carousel-btn--primary" onClick={() => showToast('Tính năng sắp ra mắt', 'info')}>Bắt đầu ngay</button>
            </div>
            <div className="carousel-image-wrapper">
              <img alt="Lifecycle Marketplace Hero" className="carousel-image" src="/home.jpg"/>
            </div>
          </div>
          <div className="carousel-slide carousel-slide--white">
            <div className="carousel-content">
              <span className="carousel-badge carousel-badge--secondary">Impact</span>
              <h2 className="carousel-title">Tặng đồ — Kết nối yêu thương</h2>
              <p className="carousel-desc">Lan tỏa sự tử tế bằng cách trao tặng những món đồ bạn không còn sử dụng cho các tổ chức cộng đồng.</p>
              <button className="carousel-btn carousel-btn--secondary" onClick={() => navigate('/map')}>Tìm tổ chức</button>
            </div>
            <div className="carousel-image-wrapper">
              <img alt="Donation Feature Hero" className="carousel-image" src="/home-donation.jpg"/>
            </div>
          </div>
        </div>
        <div className="carousel-dots">
          <button className={`carousel-dot ${currentSlide === 0 ? 'is-active' : ''}`} onClick={() => setCurrentSlide(0)}></button>
          <button className={`carousel-dot ${currentSlide === 1 ? 'is-active' : ''}`} onClick={() => setCurrentSlide(1)}></button>
        </div>
      </section>

      {/* Category Row */}
      <section className="home-container">
        <div className="home-categories">
          <button className="category-btn is-active" onClick={() => navigate('/products')}>
            <div className="category-icon-box"><span className="material-symbols-outlined">grid_view</span></div>
            <span className="category-label">Tất cả</span>
          </button>
          {categories.map(cat => (
            <button key={cat.id} className="category-btn" onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}>
              <div className="category-icon-box">
                <span className="material-symbols-outlined">{getFashionIconForCategory(cat.name)}</span>
              </div>
              <span className="category-label">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="home-container">
        <header className="section-header">
          <div>
            <h3 className="section-title">Mới đăng hôm nay</h3>
            <p className="section-desc">Khám phá những món đồ vừa lên sàn</p>
          </div>
          <Link to="/products" className="section-link">Xem tất cả <span className="material-symbols-outlined">arrow_forward</span></Link>
        </header>

        <div className="arrivals-slider-wrapper">
          <button 
            className="slider-arrow slider-arrow--prev" 
            disabled={!canScrollLeft} 
            onClick={scrollLeft}
            onMouseEnter={() => startHoverScroll(-1)}
            onMouseLeave={stopHoverScroll}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          
          <div className="arrivals-slider-container" ref={arrivalsContainerRef} onScroll={updateArrowState}>
            <div className="arrivals-slider-track">
              {loadingProducts ? (
                <div className="slider-loading">
                  <div className="spinner"></div>
                  <p>Đang tải sản phẩm mới...</p>
                </div>
              ) : errorProducts ? (
                <div className="slider-error">
                  <p>Không thể tải sản phẩm hôm nay.</p>
                </div>
              ) : todayProducts.length > 0 ? (
                todayProducts.map(product => {
                  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : "https://placehold.co/400x533/E4EBE4/6E7B6C?text=No+Image";
                  const badge = getConditionBadge(product.condition || 3);
                  return (
                    <Link to={`/product/${product.id}`} key={product.id} className="product-card">
                      <div className="product-image-wrapper">
                        <img className="product-image" src={imageUrl} loading="lazy" alt="product" />
                        <button className="product-fav-btn" onClick={(e) => { e.preventDefault(); showToast('Tính năng yêu thích đang được phát triển', 'info'); }}><span className="material-symbols-outlined">favorite</span></button>
                        <span className={`product-condition-badge ${badge.className}`}>{badge.text}</span>
                      </div>
                      <h4 className="product-title">{product.title || "Sản phẩm không có tên"}</h4>
                      <p className="product-price">{formatPrice(product.price)}</p>
                    </Link>
                  );
                })
              ) : (
                <div className="slider-empty">
                  <span className="material-symbols-outlined empty-icon">shopping_bag</span>
                  <p>Hôm nay chưa có sản phẩm nào được đăng.</p>
                  <Link to="/products" className="empty-btn">Khám phá sản phẩm cũ hơn</Link>
                </div>
              )}
            </div>
          </div>

          <button 
            className="slider-arrow slider-arrow--next" 
            disabled={!canScrollRight} 
            onClick={scrollRight}
            onMouseEnter={() => startHoverScroll(1)}
            onMouseLeave={stopHoverScroll}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </section>

      {/* Events Section */}
      <section className="events-section">
        <div className="home-container">
          <header className="section-header" style={{marginTop: 0}}>
            <div>
              <h3 className="section-title">Sự kiện quyên góp sắp diễn ra</h3>
              <p className="section-desc">Tham gia cộng đồng và chia sẻ yêu thương</p>
            </div>
            <a href="#/" onClick={(e) => { e.preventDefault(); showToast('Tính năng đang phát triển', 'info'); }} className="section-link">Xem tất cả <span className="material-symbols-outlined">arrow_forward</span></a>
          </header>
          <div className="events-grid">
            <a href="#/" onClick={(e) => { e.preventDefault(); showToast('Tính năng đang phát triển', 'info'); }} className="event-card">
              <div className="event-image-wrapper">
                <img className="event-image" src="/home-event.jpg" alt="event" />
                <span className="event-badge">Sắp diễn ra</span>
              </div>
              <div className="event-body">
                <h4 className="event-title">Ngày hội Tủ đồ Nhỏ - Trao yêu thương</h4>
                <div className="event-info"><span className="material-symbols-outlined">calendar_today</span> Chủ Nhật, 25 Th06, 2024</div>
                <div className="event-info"><span className="material-symbols-outlined">location_on</span> Công viên Thống Nhất, Hà Nội</div>
              </div>
            </a>
            <a href="#/" onClick={(e) => { e.preventDefault(); showToast('Tính năng đang phát triển', 'info'); }} className="event-card">
              <div className="event-image-wrapper">
                <img className="event-image" src="/home-event.jpg" alt="event" />
              </div>
              <div className="event-body">
                <h4 className="event-title">Quyên góp sách cũ cho trẻ em vùng cao</h4>
                <div className="event-info"><span className="material-symbols-outlined">calendar_today</span> 15 Th07 - 20 Th07, 2024</div>
                <div className="event-info"><span className="material-symbols-outlined">location_on</span> Văn phòng Lifecycle, Q.1, TP.HCM</div>
              </div>
            </a>
            <a href="#/" onClick={(e) => { e.preventDefault(); showToast('Tính năng đang phát triển', 'info'); }} className="event-card">
              <div className="event-image-wrapper">
                <img className="event-image" src="/home-event.jpg" alt="event" />
              </div>
              <div className="event-body">
                <h4 className="event-title">Thu gom rác thải điện tử tái chế</h4>
                <div className="event-info"><span className="material-symbols-outlined">calendar_today</span> Thứ Bảy, 10 Th08, 2024</div>
                <div className="event-info"><span className="material-symbols-outlined">location_on</span> KĐT Sala, TP. Thủ Đức</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Community Masonry Section */}
      <section className="home-container">
        <header className="section-header">
          <div>
            <h3 className="section-title">Bài đăng từ cộng đồng</h3>
            <p className="section-desc">Xem cách mọi người tái sử dụng đồ cũ</p>
          </div>
          <a href="#/" onClick={(e) => { e.preventDefault(); showToast('Tính năng đang phát triển', 'info'); }} className="section-link">Xem cộng đồng <span className="material-symbols-outlined">arrow_forward</span></a>
        </header>
        <div className="community-masonry">
          <div className="post-card">
            <img className="post-image" src="/home-comunity.jpg" alt="post" />
            <div className="post-user">
              <img className="post-avatar" src="/user-avatar.jpg" alt="avatar" />
              <span className="post-username">Minh Anh</span>
            </div>
            <p className="post-text">Vừa mới "săn" được chiếc áo khoác denim cực chất trên Lifecycle. Phối đồ xuống phố thôi nào! #thoitrang #lifestyle</p>
          </div>
          <div className="post-card">
            <p className="post-text post-text--quote">"Cảm ơn Lifecycle đã giúp mình tặng được bộ sách giáo khoa cho một em nhỏ khó khăn. Cảm thấy thật ấm lòng!"</p>
            <div className="post-user">
              <img className="post-avatar" src="/user-avatar.jpg" alt="avatar" />
              <span className="post-username">Hoàng Nam</span>
            </div>
          </div>
          <div className="post-card">
            <img className="post-image" src="/home-comunity.jpg" alt="post" />
            <div className="post-user">
              <img className="post-avatar" src="/user-avatar.jpg" alt="avatar" />
              <span className="post-username">Thanh Trúc</span>
            </div>
            <p className="post-text">Góc làm việc mới decor hoàn toàn bằng đồ 2nd-hand. Vừa rẻ vừa độc bản!</p>
          </div>
        </div>
      </section>

      {/* Bottom Nav Bar (Mobile) */}
      <nav className="mobile-nav">
        <Link to="/" className="mobile-nav-item is-active">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>home</span>
          <span>Trang chủ</span>
        </Link>
        <a href="#/" onClick={(e) => { e.preventDefault(); showToast('Tính năng yêu thích đang phát triển', 'info'); }} className="mobile-nav-item">
          <span className="material-symbols-outlined">favorite</span>
          <span>Yêu thích</span>
        </a>
        <Link to="/create-listing" className="mobile-nav-fab">
          <div className="mobile-nav-fab-btn">
            <span className="material-symbols-outlined">add</span>
          </div>
          <span>Bán đồ</span>
        </Link>
        <a href="#/" onClick={(e) => { e.preventDefault(); showToast('Tính năng thông báo đang phát triển', 'info'); }} className="mobile-nav-item">
          <span className="material-symbols-outlined">notifications</span>
          <span>Thông báo</span>
        </a>
        <Link to="/profile" className="mobile-nav-item">
          <span className="material-symbols-outlined">person</span>
          <span>Tôi</span>
        </Link>
      </nav>
    </div>
  );
}
