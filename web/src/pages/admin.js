import '../styles/admin.css';
import { getAllProducts } from '../services/product.service.js';

export async function renderAdminPage(container) {
  // Mock Data for Dashboard Summary
  const MOCK_STATS = {
    users: 1254,
    transactions: 342,
    revenue: "45.2M",
    reports: 12
  };

  container.innerHTML = `
    <div class="admin-layout">
      
      <!-- Sidebar -->
      <aside class="admin-sidebar" id="admin-sidebar">
        <div class="admin-sidebar__header">
          <img src="/logo.svg" alt="Logo" class="admin-sidebar__logo" />
          <h2 class="admin-sidebar__title">Admin Panel</h2>
        </div>
        <nav class="admin-sidebar__nav">
          <a href="#/admin" class="admin-nav-item is-active">
            <span>📊</span> Tổng quan
          </a>
          <a href="javascript:void(0)" class="admin-nav-item" onclick="alert('Tính năng đang phát triển')">
            <span>📦</span> Quản lý Sản phẩm
          </a>
          <a href="javascript:void(0)" class="admin-nav-item" onclick="alert('Tính năng đang phát triển')">
            <span>👥</span> Quản lý Người dùng
          </a>
          <a href="javascript:void(0)" class="admin-nav-item" onclick="alert('Tính năng đang phát triển')">
            <span>⚠️</span> Báo cáo Vi phạm
          </a>
        </nav>
        <div class="admin-sidebar__footer">
          <a href="#/" class="admin-nav-item" style="color: #DC2626;">
            <span>⬅️</span> Về Trang Chủ
          </a>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="admin-main">
        <header class="admin-topbar">
          <h1 class="admin-topbar__title">Tổng quan hệ thống</h1>
          <div class="admin-topbar__actions">
            <span style="font-size: 14px; font-weight: 500;">Xin chào, Admin</span>
            <div style="width:36px; height:36px; border-radius:50%; background:#0F172A; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:bold;">A</div>
          </div>
        </header>

        <div class="admin-content">
          
          <!-- Summary Cards -->
          <div class="admin-stats-grid">
            <div class="admin-stat-card">
              <div class="admin-stat-icon green">📦</div>
              <div class="admin-stat-info">
                <p class="admin-stat-label">Tổng Sản phẩm</p>
                <h3 class="admin-stat-value" id="stat-total-products">--</h3>
              </div>
            </div>
            
            <div class="admin-stat-card">
              <div class="admin-stat-icon blue">👥</div>
              <div class="admin-stat-info">
                <p class="admin-stat-label">Người dùng (Mock)</p>
                <h3 class="admin-stat-value">${MOCK_STATS.users.toLocaleString('vi')}</h3>
              </div>
            </div>

            <div class="admin-stat-card">
              <div class="admin-stat-icon amber">🤝</div>
              <div class="admin-stat-info">
                <p class="admin-stat-label">Giao dịch (Mock)</p>
                <h3 class="admin-stat-value">${MOCK_STATS.transactions}</h3>
              </div>
            </div>

            <div class="admin-stat-card">
              <div class="admin-stat-icon purple">💰</div>
              <div class="admin-stat-info">
                <p class="admin-stat-label">Doanh thu (Mock)</p>
                <h3 class="admin-stat-value">${MOCK_STATS.revenue}</h3>
              </div>
            </div>
          </div>

          <!-- Data Table -->
          <div class="admin-table-container">
            <div class="admin-table-header">
              <h2 class="admin-table-title">Sản phẩm mới đăng</h2>
              <button class="admin-btn-action" onclick="alert('Làm mới dữ liệu')">🔄 Làm mới</button>
            </div>
            
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Người bán</th>
                  <th>Giá (VND)</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody id="admin-table-body">
                <tr><td colspan="5" style="text-align: center; padding: 32px;">Đang tải dữ liệu...</td></tr>
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  `;

  // Fetch real data for products
  fetchProductsData();
}

async function fetchProductsData() {
  const tbody = document.getElementById('admin-table-body');
  const totalCountEl = document.getElementById('stat-total-products');
  
  try {
    const products = await getAllProducts();
    
    // Update total count
    if (totalCountEl) {
      totalCountEl.textContent = products.length.toLocaleString('vi');
    }

    // Render latest 8 products
    if (tbody) {
      const latest = products.slice(0, 8);
      if (latest.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 32px;">Chưa có sản phẩm nào.</td></tr>`;
        return;
      }

      tbody.innerHTML = latest.map(p => {
        const img = p.images && p.images.length > 0 ? p.images[0] : 'https://placehold.co/100x100/E4EBE4/6E7B6C?text=N/A';
        const price = p.price != null ? p.price.toLocaleString('vi') : '0';
        const seller = p.sellerName || 'Unknown';
        
        // Mock status logically
        const isPending = Math.random() > 0.8; 
        const statusHtml = isPending 
          ? `<span class="admin-status-badge pending">Chờ duyệt</span>`
          : `<span class="admin-status-badge active">Đang bán</span>`;

        return `
          <tr>
            <td>
              <div class="admin-product-cell">
                <img src="${img}" alt="Product" class="admin-product-img" />
                <span class="admin-product-name">${p.title || 'Sản phẩm không tên'}</span>
              </div>
            </td>
            <td>${seller}</td>
            <td>${price}đ</td>
            <td>${statusHtml}</td>
            <td>
              <button class="admin-btn-action" onclick="window.location.hash='#/product/${p.id}'">Xem</button>
            </td>
          </tr>
        `;
      }).join('');
    }

  } catch (error) {
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red; padding: 32px;">Lỗi khi tải dữ liệu sản phẩm.</td></tr>`;
    }
  }
}
