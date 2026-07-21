import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/profile.css";
import { isAuthenticated, logout } from "../../services/auth.service.js";
import { 
  getMyProfile, 
  getAllOrganizationsApi, 
  getMyOrganizationDetailApi, 
  getAllDonationEventsApi,
  getOrgDonationRequestsApi 
} from "../../services/profile.service.js";
import { getOrdersByBuyer, getOrdersBySeller } from "../../services/order.service.js";
import { getMyWardrobe } from "../../services/wardrobe.service.js";
import { isDraftProduct, getMyProducts, getMyRejectedProductsApi } from "../../services/product.service.js";
import { apiFetch } from "../../utils/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

import WardrobePanel from "./WardrobePanel.jsx";
import ShopPanel from "./ShopPanel.jsx";
import DonationsTab from "./DonationsTab.jsx";
import SettingsTab from "./SettingsTab.jsx";
import DonationModal from "./DonationModal.jsx";

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshAuth } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data state
  const [profile, setProfile] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [orgDetail, setOrgDetail] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [donations, setDonations] = useState([]);
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [wardrobe, setWardrobe] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [drafts, setDrafts] = useState([]);

  const [activeTabKey, setActiveTabKey] = useState("");
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  // Initialize active tab from URL hash/query or default
  useEffect(() => {
    if (!profile) return;
    const isOrg = profile.role === "org";
    
    // Check if URL has a tab parameter e.g., ?tab=shop
    const params = new URLSearchParams(location.search);
    const urlTab = params.get("tab");
    
    if (urlTab && ["wardrobe", "shop", "donations", "settings"].includes(urlTab)) {
      setActiveTabKey(urlTab);
    } else if (!activeTabKey) {
      setActiveTabKey(isOrg ? "donations" : "wardrobe");
    }
  }, [profile, location, activeTabKey]);

  const loadData = async () => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const p = await getMyProfile();
      setProfile(p);
      
      const isOrg = p.role === "org";
      
      if (isOrg) {
        const [detailRes, eventsRes, requestsRes] = await Promise.all([
          getMyOrganizationDetailApi().catch(() => null),
          getAllDonationEventsApi().catch(() => []),
          getOrgDonationRequestsApi().catch(() => [])
        ]);
        setOrgDetail(detailRes);
        if (detailRes && detailRes.id) {
          setMyEvents(Array.isArray(eventsRes) 
            ? eventsRes.filter(ev => String(ev.organizationId || ev.orgId) === String(detailRes.id)) 
            : []);
        }
        setDonations(Array.isArray(requestsRes) ? requestsRes : []);
      } else {
        const [bOrders, sOrders, wItems, prods, rejectedProds, orgsList, allEvents, allReqs] = await Promise.all([
          getOrdersByBuyer().catch(() => []),
          getOrdersBySeller().catch(() => []),
          getMyWardrobe().catch(() => []),
          getMyProducts().catch(() => []),
          getMyRejectedProductsApi().catch(() => []),
          getAllOrganizationsApi().catch(() => []),
          getAllDonationEventsApi().catch(() => []),
          apiFetch("/api/donation-requests/my-requests", { method: "GET" }).catch(() => [])
        ]);
        setBuyerOrders(bOrders);
        setSellerOrders(sOrders);
        setWardrobe(wItems);
        
        // Merge rejected products with my products, avoiding duplicates by ID
        const allProds = [...prods];
        const existingIds = new Set(allProds.map(p => p.id || p.productId));
        if (Array.isArray(rejectedProds)) {
          rejectedProds.forEach(rp => {
            if (!existingIds.has(rp.id || rp.productId)) {
              allProds.push(rp);
            }
          });
        }
        
        setMyProducts(allProds.filter(p => !isDraftProduct(p)));
        setDrafts(allProds.filter(p => isDraftProduct(p)));
        setOrgs(orgsList);
        setMyEvents(allEvents);
        setDonations(Array.isArray(allReqs) ? allReqs : []);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(err.message || "Lỗi khi tải hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleRefresh = () => {
    loadData();
  };

  const handleLogout = () => {
    logout();
    refreshAuth();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface pt-20">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
          <p className="font-medium text-on-surface-variant">Đang tải hồ sơ cá nhân...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface pt-[104px] pb-12 flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-error mb-2">error</span>
          <h3 className="text-title-lg font-bold text-on-surface">Không thể tải hồ sơ</h3>
          <p className="text-body-sm text-on-surface-variant mt-1">{error}</p>
          <button onClick={loadData} className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold">Thử lại</button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const isOrg = profile.role === "org";

  const renderTabContent = () => {
    switch (activeTabKey) {
      case "wardrobe":
        return <WardrobePanel orders={buyerOrders} wardrobe={wardrobe} profile={profile} onRefresh={handleRefresh} />;
      case "shop":
        return <ShopPanel sellerOrders={sellerOrders} myDrafts={drafts} myProducts={myProducts} onRefresh={handleRefresh} />;
      case "donations":
        return <DonationsTab profile={profile} orgDetail={orgDetail} events={myEvents} requests={donations} onRefresh={handleRefresh} onOpenModal={() => setIsDonationModalOpen(true)} />;
      case "settings":
        return <SettingsTab profile={profile} orgDetail={orgDetail} onRefresh={handleRefresh} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-[90px] pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {/* User Info Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl mb-3 border-2 border-primary/20 shadow-inner overflow-hidden">
              {(profile.avatar || profile.avatarUrl) ? (
                <img src={profile.avatar || profile.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                (profile.name || profile.fullName || profile.username || "U").substring(0,2).toUpperCase()
              )}
            </div>
            <h2 className="text-title-md font-bold text-on-surface">{profile.name || profile.fullName || profile.username}</h2>
            <p className="text-body-sm text-on-surface-variant mt-0.5">{profile.email || "Thành viên EcoCycle"}</p>
            
            <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isOrg ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
              <span className="material-symbols-outlined text-sm">{isOrg ? 'corporate_fare' : 'checkroom'}</span>
              {isOrg ? 'Tổ chức Quyên góp' : 'Thành viên Cá nhân'}
            </div>
          </div>

          {/* Tab Buttons Menu */}
          <div className="bg-surface-container-lowest rounded-2xl p-3 border border-outline-variant/30 shadow-sm flex flex-col gap-1">
            {!isOrg && (
              <>
                <button onClick={() => setActiveTabKey("wardrobe")} className={`w-full px-4 py-3 rounded-xl text-left font-semibold text-sm flex items-center gap-3 transition-colors ${activeTabKey === "wardrobe" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-variant/50"}`}>
                  <span className="material-symbols-outlined">checkroom</span>
                  <span>Tủ đồ của tôi</span>
                </button>
                <button onClick={() => setActiveTabKey("shop")} className={`w-full px-4 py-3 rounded-xl text-left font-semibold text-sm flex items-center gap-3 transition-colors ${activeTabKey === "shop" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-variant/50"}`}>
                  <span className="material-symbols-outlined">storefront</span>
                  <span>Cửa hàng / Đơn hàng</span>
                </button>
              </>
            )}
            <button onClick={() => setActiveTabKey("donations")} className={`w-full px-4 py-3 rounded-xl text-left font-semibold text-sm flex items-center gap-3 transition-colors ${activeTabKey === "donations" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-variant/50"}`}>
              <span className="material-symbols-outlined">volunteer_activism</span>
              <span>{isOrg ? 'Quản lý Quyên góp' : 'Lịch sử Quyên góp'}</span>
            </button>
            <button onClick={() => setActiveTabKey("settings")} className={`w-full px-4 py-3 rounded-xl text-left font-semibold text-sm flex items-center gap-3 transition-colors ${activeTabKey === "settings" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-variant/50"}`}>
              <span className="material-symbols-outlined">manage_accounts</span>
              <span>Cài đặt Tài khoản</span>
            </button>
            
            <div className="border-t border-outline-variant/30 my-1 pt-1"></div>
            <button onClick={handleLogout} className="w-full px-4 py-3 rounded-xl text-left font-semibold text-sm flex items-center gap-3 text-error hover:bg-error/10 transition-colors">
              <span className="material-symbols-outlined">logout</span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          {renderTabContent()}
        </div>
      </div>

      {isDonationModalOpen && (
        <DonationModal
          organizations={orgs}
          onSuccess={handleRefresh}
          onClose={() => setIsDonationModalOpen(false)}
        />
      )}
    </div>
  );
}
