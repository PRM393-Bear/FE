import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getNearbyOrganizations } from "../services/org.service.js";
import { isAuthenticated } from "../services/auth.service.js";

export function renderMapPage(container) {
  const defaultCenter = [21.0285, 105.8542]; // Default: Ha Noi
  
  container.innerHTML = `
    <div class="h-[calc(100vh-80px)] mt-[80px] w-full flex flex-col md:flex-row bg-surface">
      <!-- Sidebar -->
      <div class="w-full md:w-96 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col shadow-lg z-10 relative">
        <div class="p-4 border-b border-outline-variant/30 bg-primary/5">
          <h2 class="text-xl font-display font-bold text-primary flex items-center gap-2">
            <span class="material-symbols-outlined">distance</span>
            Tổ chức gần bạn
          </h2>
          <p class="text-sm text-on-surface-variant mt-1">Các tổ chức thu gom rác thải trong bán kính 50km</p>
          <div class="mt-4 flex gap-2">
            <button id="map-locate-btn" class="flex-1 bg-primary text-on-primary rounded-lg py-2 text-sm font-semibold hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors">
              <span class="material-symbols-outlined text-lg">my_location</span> Tìm quanh tôi
            </button>
          </div>
        </div>
        <div id="map-org-list" class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <div class="flex items-center justify-center h-full text-on-surface-variant">
            Hãy cấp quyền vị trí để xem tổ chức gần nhất
          </div>
        </div>
      </div>
      
      <!-- Map Area -->
      <div id="leaflet-map-container" class="flex-1 h-full z-0"></div>
    </div>
  `;

  // Fix Leaflet icons issue with Webpack/Vite
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });

  const map = L.map('leaflet-map-container').setView(defaultCenter, 13);
  let currentMarkers = [];
  let currentCircle = null;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const locateBtn = document.getElementById("map-locate-btn");
  const orgList = document.getElementById("map-org-list");

  const loadNearby = async (lat, lng) => {
    orgList.innerHTML = `<div class="flex items-center justify-center p-6 text-primary"><span class="material-symbols-outlined animate-spin mr-2">sync</span> Đang tìm kiếm...</div>`;
    
    try {
      const orgs = await getNearbyOrganizations(lat, lng, 50.0);
      
      // Clear old markers
      currentMarkers.forEach(m => map.removeLayer(m));
      currentMarkers = [];
      if (currentCircle) map.removeLayer(currentCircle);

      // Draw radius circle (50km)
      currentCircle = L.circle([lat, lng], {
        color: '#006B2C',
        fillColor: '#006B2C',
        fillOpacity: 0.1,
        radius: 50000 
      }).addTo(map);

      // Add user marker
      const userMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          html: `<span class="material-symbols-outlined text-error text-3xl drop-shadow-md">person_pin_circle</span>`,
          className: 'custom-leaflet-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        })
      }).addTo(map).bindPopup("<b>Vị trí của bạn</b>");
      currentMarkers.push(userMarker);

      if (orgs.length === 0) {
        orgList.innerHTML = `<div class="text-center p-4 text-on-surface-variant text-sm">Không tìm thấy tổ chức nào trong bán kính 50km.</div>`;
        return;
      }

      let listHtml = "";
      orgs.forEach(org => {
        // Add marker
        if (org.latitude && org.longitude) {
          const marker = L.marker([org.latitude, org.longitude])
            .addTo(map)
            .bindPopup(`
              <div class="text-center">
                <img src="${org.avatar || 'https://ui-avatars.com/api/?name='+encodeURIComponent(org.organizationName)}" class="w-12 h-12 rounded-full mx-auto mb-2 border border-outline-variant/30 object-cover" />
                <h3 class="font-bold text-primary">${org.organizationName}</h3>
                <p class="text-xs text-on-surface-variant mb-2">${org.address}</p>
                <button onclick="window.openChatWith('${org.userId}', '${org.organizationName.replace(/'/g, "\\'")}')" class="bg-primary text-white text-xs px-3 py-1 rounded-full hover:bg-primary/90 inline-block">Nhắn tin</button>
              </div>
            `);
          currentMarkers.push(marker);

          listHtml += `
            <div class="p-3 bg-surface rounded-xl border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer shadow-sm group"
                 onclick="window.mapFocusMarker(${org.latitude}, ${org.longitude})">
              <div class="flex items-center gap-3 mb-2">
                <img src="${org.avatar || 'https://ui-avatars.com/api/?name='+encodeURIComponent(org.organizationName)}" class="w-10 h-10 rounded-full object-cover border border-outline-variant/30" />
                <div>
                  <h4 class="font-bold text-on-surface text-sm group-hover:text-primary transition-colors line-clamp-1">${org.organizationName}</h4>
                  <p class="text-[11px] text-on-surface-variant font-medium">${org.contactPhone || 'Chưa cập nhật SĐT'}</p>
                </div>
              </div>
              <p class="text-xs text-on-surface-variant line-clamp-2"><span class="material-symbols-outlined text-[14px] align-middle mr-1">location_on</span>${org.address}</p>
            </div>
          `;
        }
      });
      orgList.innerHTML = listHtml;
      
      // Fit map to bounds
      const group = new L.featureGroup(currentMarkers);
      map.fitBounds(group.getBounds().pad(0.2));

    } catch (e) {
      console.error(e);
      orgList.innerHTML = `<div class="text-error p-4 text-center text-sm">Có lỗi xảy ra khi tải dữ liệu.</div>`;
    }
  };

  window.mapFocusMarker = (lat, lng) => {
    map.setView([lat, lng], 15, { animate: true });
  };

  const attemptLocate = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          map.setView([lat, lng], 13);
          loadNearby(lat, lng);
        },
        (error) => {
          console.error(error);
          alert("Không thể lấy vị trí của bạn. Vui lòng cho phép quyền truy cập vị trí.");
        }
      );
    } else {
      alert("Trình duyệt không hỗ trợ Geolocation.");
    }
  };

  locateBtn.addEventListener("click", attemptLocate);

  // Automatically attempt location on mount
  attemptLocate();

  return () => {
    if (map) {
      map.remove();
    }
    delete window.mapFocusMarker;
  };
}
