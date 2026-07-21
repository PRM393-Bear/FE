import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { logoutApi } from '../services/auth.service.js';
import { getCart } from '../services/cart.service.js';
import { getMyNotifications, markNotificationAsRead } from '../services/notification.service.js';
import { chatService } from '../services/chat.service.js';
import "./header.css";

export default function Header({ activePage = '' }) {
  const { user, isAuthenticated, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const notifMenuRef = useRef(null);
  const notifBtnRef = useRef(null);

  const isPendingOrg = isAuthenticated && (user?.role === "organization" || user?.role === "org") && (user?.status === "pending" || user?.status === "rejected");

  const updateCartBadge = async () => {
    if (!isAuthenticated) return;
    try {
      const cart = await getCart();
      setCartCount(cart?.items?.length || 0);
    } catch (e) {
      console.warn("Badge cart fetch error:", e);
    }
  };

  const handleLogout = async () => {
    await logoutApi();
    refreshAuth();
    navigate('/login');
  };

  useEffect(() => {
    if (isAuthenticated) {
      updateCartBadge();
      
      const cartUpdatedHandler = () => updateCartBadge();
      window.addEventListener("ecocycle:cart-updated", cartUpdatedHandler);

      if (!isPendingOrg) {
        initNotifications();
      }

      return () => {
        window.removeEventListener("ecocycle:cart-updated", cartUpdatedHandler);
        if (window._notificationListenerHeader) {
          chatService.offNotification(window._notificationListenerHeader);
        }
      };
    }
  }, [isAuthenticated, isPendingOrg]);

  const initNotifications = async () => {
    try {
      const notifs = await getMyNotifications();
      setNotifications(notifs);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }

    window._notificationListenerHeader = (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
    };
    chatService.onNotification(window._notificationListenerHeader);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notifMenuRef.current && !notifMenuRef.current.contains(event.target) &&
        notifBtnRef.current && !notifBtnRef.current.contains(event.target)
      ) {
        setIsNotifMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      navigate(`/products?search=${encodeURIComponent(e.target.value.trim())}`);
    }
  };

  const scrollToTop = (e) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleMarkRead = async (id) => {
    try {
      const notif = notifications.find(n => n.id === id);
      if (notif && !notif.read) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        await markNotificationAsRead(id);
      }
    } catch (e) {
      console.error("Mark read failed", e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header id="site-header" className="site-header" role="banner">
      {/* Left: Logo & Search */}
      <div className="site-header__left">
        <Link to={isPendingOrg ? '/pending-approval' : '/'} className="site-header__brand" aria-label="EcoCycle" onClick={scrollToTop}>
          <img src="/logo.svg" alt="EcoCycle logo" className="site-header__logo" />
          <span>EcoCycle</span>
        </Link>
        
        {!isPendingOrg ? (
          <div className="site-header__search">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Tìm kiếm sản phẩm, người bán..." onKeyDown={handleSearch} />
          </div>
        ) : (
          <div style={{display:'inline-flex', alignItems:'center', padding:'4px 12px', borderRadius:'999px', background:'rgba(245,158,11,0.1)', color:'#D97706', fontSize:'13px', fontWeight:'600', border:'1px solid rgba(245,158,11,0.2)', marginLeft:'8px'}}>
            {user?.status === "rejected" ? 'Từ Chối Xét Duyệt' : 'Tổ Chức • Chờ Xét Duyệt'}
          </div>
        )}
      </div>

      {/* Right: Nav & Auth */}
      <div className="site-header__right">
        {!isPendingOrg && (
          <nav className="site-header__nav">
            <Link to="/" className={`site-header__nav-link ${activePage === 'home' || !activePage ? 'is-active' : ''}`}>Trang chủ</Link>
            <Link to="/products" className={`site-header__nav-link ${activePage === 'products' || activePage === 'explore' ? 'is-active' : ''}`}>Sản phẩm</Link>
            <Link to="/map" className={`site-header__nav-link ${activePage === 'map' ? 'is-active' : ''}`}>Bản đồ</Link>
            <Link to="/donate" className={`site-header__nav-link ${activePage === 'donate' ? 'is-active' : ''}`}>Quyên góp</Link>
          </nav>
        )}

        <div className="site-header__actions">
          {isAuthenticated ? (
            <>
              {!isPendingOrg && (
                <>
                  <div className="site-header__notification-dropdown relative" id="header-notification-container">
                    <button 
                      ref={notifBtnRef}
                      className="site-header__icon-btn relative" 
                      title="Thông báo"
                      onClick={(e) => { e.stopPropagation(); setIsNotifMenuOpen(!isNotifMenuOpen); }}
                    >
                      <span className="material-symbols-outlined">notifications</span>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-error text-on-error text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface shadow-sm">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </button>
                    
                    <div ref={notifMenuRef} className={`site-header__notification-menu absolute right-[-40px] sm:right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 overflow-hidden z-50 flex-col ${isNotifMenuOpen ? 'flex' : 'hidden'}`}>
                      <div className="p-3 border-b border-outline-variant/30 bg-surface/50 backdrop-blur font-bold text-on-surface flex justify-between items-center">
                        Thông báo
                      </div>
                      <div className="flex-1 overflow-y-auto max-h-[350px]">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center flex flex-col items-center text-on-surface-variant opacity-70">
                            <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                            <span className="text-sm">Bạn chưa có thông báo nào</span>
                          </div>
                        ) : (
                          notifications.map(notif => (
                            <div key={notif.id} className={`p-3 border-b border-outline-variant/30 hover:bg-surface-variant/30 transition-colors cursor-pointer flex gap-3 ${notif.read ? 'opacity-70' : 'bg-primary/5'}`} onClick={() => handleMarkRead(notif.id)}>
                              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined">{notif.type === 'MESSAGE' ? 'forum' : 'notifications'}</span>
                              </div>
                              <div className="flex-1">
                                <div className={`text-sm font-semibold text-on-surface ${!notif.read ? 'text-primary' : ''}`}>{notif.title}</div>
                                <div className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{notif.message}</div>
                                <div className="text-[10px] text-on-surface-variant mt-1.5 opacity-70">
                                  {new Date(notif.createdAt).toLocaleString('vi-VN')}
                                </div>
                              </div>
                              {!notif.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <Link to="/cart" className={`site-header__icon-btn relative ${activePage === 'cart' ? 'bg-surface-variant text-primary' : ''}`} title="Giỏ hàng">
                    <span className="material-symbols-outlined">shopping_cart</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-error text-on-error text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface shadow-sm">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
              
              <div className="site-header__user-dropdown">
                <img src="/user-avatar.jpg" alt="User profile" className="site-header__avatar" />
                
                <div className="site-header__dropdown-menu">
                  {!isPendingOrg && (user?.role === 'organization' || user?.role === 'org') && <Link to="/profile" className="site-header__dropdown-item font-bold text-primary">Dashboard Tổ Chức</Link>}
                  {!isPendingOrg && user?.role !== 'organization' && user?.role !== 'org' && <Link to="/profile" className="site-header__dropdown-item">Tài Khoản Của Tôi</Link>}
                  {user?.role === 'admin' && <Link to="/admin" className="site-header__dropdown-item">Trang Quản Trị</Link>}
                  {user?.role === 'staff' && <Link to="/staff" className="site-header__dropdown-item font-bold text-primary">Khu Vực Staff</Link>}
                  <button className="site-header__dropdown-item" onClick={handleLogout}>Đăng Xuất</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="site-header__btn-ghost">Đăng nhập</Link>
              <Link to="/register" className="site-header__btn-primary">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
