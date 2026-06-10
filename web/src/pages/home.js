/**
 * EcoCycle – Home Page
 */

import '../styles/home.css';

/* ── MOCK DATA ── */
const CATEGORIES = [
  { id: 'all', icon: '✨', label: 'Tất cả' },
  { id: 'clothes', icon: '👕', label: 'Quần áo' },
  { id: 'shoes', icon: '👟', label: 'Giày dép' },
  { id: 'bags', icon: '👜', label: 'Túi xách' },
  { id: 'electronics', icon: '💻', label: 'Điện tử' },
  { id: 'home', icon: '🛋️', label: 'Đồ nhà' },
  { id: 'books', icon: '📚', label: 'Sách' },
];

const NEW_POSTS = [
  { id: 'p1', title: 'Áo khoác denim Levi\'s', price: 350000, condition: 'Tốt', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400', user: { name: 'Minh Anh', avatar: 'https://i.pravatar.cc/40?img=47' } },
  { id: 'sp1', title: 'Giày Nike Air Max 90', price: 1200000, condition: 'Như mới', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', user: { name: 'Vintage Saigon', avatar: 'https://i.pravatar.cc/40?img=52' } },
  { id: 'p3', title: 'Túi xách da nâu vintage', price: 550000, condition: 'Tốt', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', user: { name: 'Lan Anh', avatar: 'https://i.pravatar.cc/40?img=25' } },
  { id: 'p4', title: 'Đồng hồ Daniel', price: 890000, condition: 'Như mới', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', user: { name: 'Quang Huy', avatar: 'https://i.pravatar.cc/40?img=12' } },
];

const EVENTS = [
  { id: 'e1', title: 'Chương trình "Áo ấm mùa đông"', date: '01/12/2024', location: 'UBND Quận 8, TP.HCM', image: 'https://images.unsplash.com/photo-1593113630400-ea4288922559?w=600&q=80', status: 'Sắp diễn ra', statusClass: 'home-event-status--upcoming', org: 'Tổ chức Kết nối Cộng đồng' },
  { id: 'se1', title: 'Hội chợ đồ cũ Saigon Retro', date: '20/06/2024', location: 'Công viên Tao Đàn, Q.1', image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600', status: 'Sắp diễn ra', statusClass: 'home-event-status--upcoming', org: 'Vintage House Saigon' },
];

const SELLERS = [
  { id: 'u002', name: 'Vintage House Saigon', role: 'Cửa hàng chuyên nghiệp', avatar: 'https://i.pravatar.cc/150?img=52', sold: 1240, rating: 4.9 },
  { id: 'u005', name: 'Secondhand Book Hub', role: 'Người bán cá nhân', avatar: 'https://i.pravatar.cc/150?img=32', sold: 450, rating: 4.8 },
  { id: 'u003', name: 'Tổ chức Kết nối CĐ', role: 'Tổ chức từ thiện', avatar: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=200&h=200&fit=crop', sold: 12500, rating: 5.0 },
];

/* ── CAROUSEL LOGIC ── */
function initCarousel(container) {
  const slides = container.querySelectorAll('.home-hero__slide');
  const dots = container.querySelectorAll('.home-hero__dot');
  let currentIdx = 0;
  let timer;

  const showSlide = (idx) => {
    slides.forEach(s => s.classList.remove('is-active'));
    dots.forEach(d => d.classList.remove('is-active'));
    slides[idx].classList.add('is-active');
    dots[idx].classList.add('is-active');
    currentIdx = idx;
  };

  const nextSlide = () => {
    showSlide((currentIdx + 1) % slides.length);
  };

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      clearInterval(timer);
      timer = setInterval(nextSlide, 5000);
    });
  });

  timer = setInterval(nextSlide, 5000);
}

/* ── PAGE RENDER ── */
export function renderHomePage(container) {
  container.innerHTML = `
    <div class="home-layout">
      <!-- HERO CAROUSEL -->
      <section class="home-hero">
        
        <!-- Slide 1 -->
        <div class="home-hero__slide is-active">
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80" alt="Hero bg 1" class="home-hero__bg" />
          <div class="home-hero__overlay"></div>
          <div class="home-hero__content">
            <span class="home-hero__badge home-hero__badge--green">Mua bán đồ cũ</span>
            <h1 class="home-hero__title">Khám phá vòng đời mới của đồ vật</h1>
            <p class="home-hero__desc">Mua sắm thông minh, tiết kiệm và bảo vệ môi trường. Hàng ngàn món đồ secondhand chất lượng đang chờ bạn.</p>
            <a href="#/explore" class="site-header__btn-primary" style="display:inline-block; font-size:16px; padding:12px 28px;">Bắt đầu ngay</a>
          </div>
        </div>

        <!-- Slide 2 -->
        <div class="home-hero__slide">
          <img src="https://images.unsplash.com/photo-1593113630400-ea4288922559?w=1600&q=80" alt="Hero bg 2" class="home-hero__bg" />
          <div class="home-hero__overlay"></div>
          <div class="home-hero__content">
            <span class="home-hero__badge home-hero__badge--amber">Quyên góp từ thiện</span>
            <h1 class="home-hero__title">Trao yêu thương,<br/>Nhận nụ cười</h1>
            <p class="home-hero__desc">Kết nối những món đồ cũ của bạn với những người đang cần. Một hành động nhỏ, tác động lớn.</p>
            <a href="#/organizations" class="site-header__btn-primary" style="display:inline-block; font-size:16px; padding:12px 28px; background:linear-gradient(135deg,#F59E0B,#D97706)">Tìm tổ chức</a>
          </div>
        </div>

        <!-- Controls -->
        <div class="home-hero__controls">
          <button class="home-hero__dot is-active" aria-label="Slide 1"></button>
          <button class="home-hero__dot" aria-label="Slide 2"></button>
        </div>
      </section>

      <!-- CATEGORIES -->
      <section class="home-section">
        <div class="home-categories">
          ${CATEGORIES.map(c => `
            <a href="#/category/${c.id}" class="home-cat-card">
              <span class="home-cat-icon">${c.icon}</span>
              <span class="home-cat-label">${c.label}</span>
            </a>
          `).join('')}
        </div>
      </section>

      <!-- NEW LISTINGS -->
      <section class="home-section">
        <div class="home-section__header">
          <h2 class="home-section__title">Mới đăng hôm nay</h2>
          <a href="#/explore" class="home-section__link">Xem tất cả →</a>
        </div>
        <div class="home-posts-grid">
          ${NEW_POSTS.map(p => `
            <a href="#/product/${p.id}" class="home-post-card">
              <img src="${p.image}" alt="${p.title}" loading="lazy" />
              <div class="home-post-card-body">
                <h3 class="home-post-card-title">${p.title}</h3>
                <span class="home-post-card-price">${p.price.toLocaleString('vi')}đ</span>
                <div class="home-post-card-meta">
                  <span class="home-post-condition">${p.condition}</span>
                  <div class="home-post-user">
                    <img src="${p.user.avatar}" alt="${p.user.name}"/>
                    <span>${p.user.name}</span>
                  </div>
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      </section>

      <!-- UPCOMING EVENTS -->
      <section class="home-section">
        <div class="home-section__header">
          <h2 class="home-section__title">Sự kiện quyên góp sắp diễn ra</h2>
          <a href="#/events" class="home-section__link">Khám phá sự kiện →</a>
        </div>
        <div class="home-events-grid">
          ${EVENTS.map(e => `
            <a href="#/events/${e.id}" class="home-event-card">
              <img src="${e.image}" alt="${e.title}" loading="lazy"/>
              <div class="home-event-body">
                <span class="home-event-status ${e.statusClass}">${e.status}</span>
                <h3 class="home-event-title">${e.title}</h3>
                <div class="home-event-detail">
                  <span>🏢 ${e.org}</span>
                  <span>📅 ${e.date}</span>
                  <span>📍 ${e.location}</span>
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      </section>

      <!-- FEATURED SELLERS / ORGS -->
      <section class="home-section" style="margin-bottom:64px;">
        <div class="home-section__header">
          <h2 class="home-section__title">Người bán & Tổ chức nổi bật</h2>
        </div>
        <div class="home-community-grid">
          ${SELLERS.map(s => `
            <div class="home-seller-card">
              <img src="${s.avatar}" alt="${s.name}" class="home-seller-avatar" loading="lazy" />
              <h3 class="home-seller-name">${s.name}</h3>
              <p class="home-seller-role">${s.role}</p>
              <div class="home-seller-stats">
                <div><span>${s.sold > 1000 ? (s.sold/1000).toFixed(1)+'k' : s.sold}</span> <br/>Đã gd</div>
                <div><span>${s.rating}⭐</span> <br/>Đánh giá</div>
              </div>
              <button class="home-btn-follow" onclick="alert('Đã theo dõi ${s.name}')">Theo dõi</button>
            </div>
          `).join('')}
        </div>
      </section>

    </div>
  `;

  initCarousel(container);
}
