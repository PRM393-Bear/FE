import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getNearbyOrganizations } from "../services/org.service.js";
import { showToast } from "../utils/ui.js";

// Fix Leaflet icons issue with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(L.featureGroup());
  const userMarkerRef = useRef(null);
  const circleRef = useRef(null);
  
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const defaultCenter = [21.0285, 105.8542]; // Default: Ha Noi

  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(defaultCenter, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);
      
      markersGroup.current.addTo(mapInstance.current);
      
      attemptLocate();
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNearby = async (lat, lng) => {
    setLoading(true);
    setErrorMsg("");
    setOrganizations([]);
    
    try {
      const orgs = await getNearbyOrganizations(lat, lng, 50.0);
      
      // Clear old markers
      markersGroup.current.clearLayers();
      if (circleRef.current) mapInstance.current.removeLayer(circleRef.current);
      if (userMarkerRef.current) mapInstance.current.removeLayer(userMarkerRef.current);

      // Draw radius circle (50km)
      circleRef.current = L.circle([lat, lng], {
        color: '#006B2C',
        fillColor: '#006B2C',
        fillOpacity: 0.1,
        radius: 50000 
      }).addTo(mapInstance.current);

      // Add user marker
      userMarkerRef.current = L.marker([lat, lng], {
        icon: L.divIcon({
          html: `<span class="material-symbols-outlined text-error text-3xl drop-shadow-md">person_pin_circle</span>`,
          className: 'custom-leaflet-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        })
      }).addTo(mapInstance.current).bindPopup("<b>Vị trí của bạn</b>");

      if (orgs.length === 0) {
        setErrorMsg("Không tìm thấy tổ chức nào trong bán kính 50km.");
      } else {
        setOrganizations(orgs);
        orgs.forEach(org => {
          if (org.latitude && org.longitude) {
            const marker = L.marker([org.latitude, org.longitude])
              .bindPopup(`
                <div class="text-center" style="min-width: 150px;">
                  <img src="${org.avatar || 'https://ui-avatars.com/api/?name='+encodeURIComponent(org.organizationName)}" class="w-12 h-12 rounded-full mx-auto mb-2 border border-outline-variant/30 object-cover" />
                  <h3 class="font-bold text-primary" style="margin: 0 0 4px 0;">${org.organizationName}</h3>
                  <p class="text-xs text-on-surface-variant mb-2" style="margin: 0 0 8px 0;">${org.address}</p>
                  <button onclick="window.openChatWith('${org.userId}', '${org.organizationName.replace(/'/g, "\\'")}')" class="bg-primary text-white text-xs px-3 py-1 rounded-full hover:bg-primary/90 inline-block" style="border: none; cursor: pointer;">Nhắn tin</button>
                </div>
              `);
            markersGroup.current.addLayer(marker);
          }
        });
        
        // Add user marker to bounds calculation temporarily
        markersGroup.current.addLayer(userMarkerRef.current);
        mapInstance.current.fitBounds(markersGroup.current.getBounds().pad(0.2));
        markersGroup.current.removeLayer(userMarkerRef.current); // remove from group so it doesn't get cleared next time without our logic
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const attemptLocate = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (mapInstance.current) {
            mapInstance.current.setView([lat, lng], 13);
          }
          loadNearby(lat, lng);
        },
        (error) => {
          console.error(error);
          setLoading(false);
          showToast("Không thể lấy vị trí của bạn. Vui lòng cho phép quyền truy cập vị trí.", "error");
        }
      );
    } else {
      showToast("Trình duyệt không hỗ trợ Geolocation.", "error");
    }
  };

  const mapFocusMarker = (lat, lng) => {
    if (mapInstance.current) {
      mapInstance.current.setView([lat, lng], 15, { animate: true });
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] mt-[80px] w-full flex flex-col md:flex-row bg-surface">
      {/* Sidebar */}
      <div className="w-full md:w-96 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col shadow-lg z-10 relative">
        <div className="p-4 border-b border-outline-variant/30 bg-primary/5">
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">distance</span>
            Tổ chức gần bạn
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">Các tổ chức thu gom rác thải trong bán kính 50km</p>
          <div className="mt-4 flex gap-2">
            <button 
              onClick={attemptLocate}
              className="flex-1 bg-primary text-on-primary rounded-lg py-2 text-sm font-semibold hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">my_location</span> Tìm quanh tôi
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {loading && (
            <div className="flex items-center justify-center p-6 text-primary">
              <span className="material-symbols-outlined animate-spin mr-2">sync</span> Đang tìm kiếm...
            </div>
          )}
          
          {!loading && errorMsg && (
            <div className={`text-center p-4 text-sm ${errorMsg.includes('lỗi') ? 'text-error' : 'text-on-surface-variant'}`}>
              {errorMsg}
            </div>
          )}
          
          {!loading && !errorMsg && organizations.length === 0 && (
            <div className="flex items-center justify-center h-full text-on-surface-variant text-center">
              Hãy cấp quyền vị trí để xem tổ chức gần nhất
            </div>
          )}

          {!loading && organizations.length > 0 && organizations.map(org => (
            <div 
              key={org.userId}
              className="p-3 bg-surface rounded-xl border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer shadow-sm group"
              onClick={() => mapFocusMarker(org.latitude, org.longitude)}
            >
              <div className="flex items-center gap-3 mb-2">
                <img 
                  src={org.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(org.organizationName)}`} 
                  className="w-10 h-10 rounded-full object-cover border border-outline-variant/30" 
                  alt="Avatar"
                />
                <div>
                  <h4 className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors line-clamp-1">{org.organizationName}</h4>
                  <p className="text-[11px] text-on-surface-variant font-medium">{org.contactPhone || 'Chưa cập nhật SĐT'}</p>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant line-clamp-2">
                <span className="material-symbols-outlined text-[14px] align-middle mr-1">location_on</span>
                {org.address}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Map Area */}
      <div ref={mapRef} className="flex-1 h-full z-0"></div>
    </div>
  );
}
