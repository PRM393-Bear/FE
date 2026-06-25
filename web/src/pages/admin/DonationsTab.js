import { showToast } from "../../utils/ui.js";
import { getAllDonationRequests } from "../../services/admin.service.js";

export function renderDonationsTab() {
  return `
      <!-- Main Content Canvas -->
      <main class="ml-64 flex-1 flex flex-col min-h-screen bg-surface w-full max-w-[calc(100%-16rem)]" style="font-family: 'Be Vietnam Pro', sans-serif;">
        <!-- TopNavBar -->
        <header class="flex justify-between items-center px-margin-desktop bg-surface-container-lowest shadow-sm border-b border-outline-variant h-20 sticky top-0 z-40">
          <div class="flex items-center flex-1 max-w-xl">
            <div class="relative w-full">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input id="admin-donations-search" class="w-full h-12 pl-12 pr-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-body-md transition-soft" placeholder="Tìm kiếm donation, người tặng..." type="text"/>
            </div>
          </div>
          <div class="flex items-center space-x-6 ml-gutter">
            <div class="flex items-center space-x-3 border-l border-outline-variant pl-6">
              <div class="text-right">
                <p class="text-label-md font-bold text-on-surface leading-none">Admin Nguyễn</p>
                <p class="text-label-sm text-on-surface-variant opacity-70">Quản trị viên</p>
              </div>
              <img alt="Administrator Profile" class="w-10 h-10 rounded-full border-2 border-primary/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD9hhQ7imU1OcP9ZuaAj-txVZJ9mesZyPCCubq9_3HyM9crEa34Etk5pQ1Y2A2gv4o2T9f2FddVeqZQy3v5xDT2uforX9X869WqAQHD9zDiFh5GGURfK7pNuAoitnM1oympNIMcxitFbdxdz7cBKwXI0D-fCfsel9T4LXKiMoJe6Opoixm0OG2YZB_f7qyds7HS-EkSa8PGiQZn8c59Kf0oMgP_LtMTLSyrF321YBHRVRJVu_P6xIxDZVLww-WDz6WVd6w9-x0K_zy"/>
            </div>
          </div>
        </header>

        <!-- Page Header & Tabs -->
        <section class="px-margin-desktop py-stack-lg bg-surface">
          <div class="mb-stack-lg">
            <h2 class="text-headline-lg font-headline-md text-on-surface text-2xl font-bold">Quản lý Quyên góp (Donation)</h2>
            <p class="text-body-md text-on-surface-variant">Theo dõi, điều phối lại và xác nhận hoàn tất các khoản quyên góp từ cộng đồng.</p>
          </div>
          <!-- Custom Tabs -->
          <div class="flex items-center space-x-gutter border-b border-outline-variant donations-tabs">
            <button class="tab-btn active pb-4 px-2 text-label-md font-bold text-primary border-b-2 border-primary flex items-center" data-filter="all">
              Tất cả
            </button>
            <button class="tab-btn pb-4 px-2 text-label-md font-medium text-on-surface-variant hover:text-primary transition-soft border-b-2 border-transparent" data-filter="PENDING">
              Chờ xử lý
            </button>
            <button class="tab-btn pb-4 px-2 text-label-md font-medium text-on-surface-variant hover:text-primary transition-soft border-b-2 border-transparent" data-filter="SHIPPED">
              Đã gửi hàng
            </button>
            <button class="tab-btn pb-4 px-2 text-label-md font-medium text-on-surface-variant hover:text-primary transition-soft border-b-2 border-transparent" data-filter="RECEIVED">
              Chờ hoàn thành (RECEIVED)
            </button>
            <button class="tab-btn pb-4 px-2 text-label-md font-medium text-on-surface-variant hover:text-primary transition-soft border-b-2 border-transparent" data-filter="COMPLETED">
              Hoàn tất
            </button>
          </div>
        </section>

        <!-- Donation Table Section -->
        <section class="px-margin-desktop pb-stack-xl flex-1">
          <div class="glass-card rounded-xl overflow-hidden shadow-sm border border-outline-variant/30 bg-white">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-surface-container-high border-b border-outline-variant">
                    <th class="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Người tặng</th>
                    <th class="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Tổ chức nhận</th>
                    <th class="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Mô tả món đồ</th>
                    <th class="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Trạng thái</th>
                    <th class="px-6 py-4 font-headline-md text-label-md text-on-surface-variant">Mã vận đơn / Chi tiết</th>
                    <th class="px-6 py-4 font-headline-md text-label-md text-on-surface-variant text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody id="donations-table-body" class="divide-y divide-outline-variant">
                  <tr>
                    <td colspan="6" class="px-6 py-5 text-center text-on-surface-variant">Đang tải dữ liệu...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
  `;
}

export async function attachDonationsListeners(container) {
  const tbody = container.querySelector('#donations-table-body');
  if (!tbody) return;

  let currentFilter = "all";
  let searchQuery = "";
  let donationRequests = [];
  let approvedOrganizations = [];

  // Helper function to fetch data and refresh table
  async function loadData() {
    tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-5 text-center text-on-surface-variant">Đang tải dữ liệu...</td></tr>`;
    
    // Fetch from backend lists (overdue pending ones)
    let backendPending = [];
    try {
      backendPending = await getAllDonationRequests();
    } catch (e) {
      console.warn("Failed to load backend pending overdue requests:", e);
    }

    // Load and merge local storage tracked requests
    let trackedRequests = [];
    try {
      const stored = localStorage.getItem("ecocycle_tracked_donations");
      if (stored) {
        trackedRequests = JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }

    // Merge backend list into tracked requests
    if (Array.isArray(backendPending)) {
      backendPending.forEach(bp => {
        const exists = trackedRequests.some(tr => tr.id === bp.id);
        if (!exists) {
          trackedRequests.unshift({
            id: bp.id,
            org: bp.organizationName,
            items: bp.itemName || "Vật phẩm quyên góp",
            date: new Date(bp.createdAt).toLocaleDateString("vi-VN"),
            status: "PENDING",
            orgAvatar: "https://i.pravatar.cc/40?img=60",
            description: bp.description,
            username: bp.username,
            trackingCode: bp.trackingCode
          });
        }
      });
      // Save it back to local database
      localStorage.setItem("ecocycle_tracked_donations", JSON.stringify(trackedRequests));
    }

    donationRequests = trackedRequests;

    // Fetch approved organizations list for reassign selection
    try {
      const token = localStorage.getItem("ecocycle_token");
      const res = await fetch("/api/organization-details", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const orgs = await res.json();
        approvedOrganizations = orgs;
      }
    } catch (err) {
      console.error("Failed to load organizations for assignment:", err);
    }

    renderTable();
  }

  function renderTable() {
    let filtered = donationRequests;

    // Filter by status tab
    if (currentFilter !== "all") {
      filtered = filtered.filter(item => item.status === currentFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.org?.toLowerCase().includes(q) || 
        item.username?.toLowerCase().includes(q) ||
        item.items?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-on-surface-variant">Không có yêu cầu quyên góp nào phù hợp.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(item => {
      let statusLabel = item.status || "PENDING";
      let statusClass = "warning";
      let badgeStyle = "";
      if (item.status === "ACCEPTED") { statusClass = "success"; statusLabel = "Đã chấp nhận"; }
      else if (item.status === "REJECTED") { badgeStyle = 'style="background: rgba(211, 47, 47, 0.1); color: #d32f2f;"'; statusLabel = "Đã từ chối"; }
      else if (item.status === "SHIPPING") { statusClass = "warning"; statusLabel = "Đang vận chuyển"; }
      else if (item.status === "SHIPPED") { statusClass = "warning"; statusLabel = "Đã gửi hàng"; }
      else if (item.status === "RECEIVED" || item.status === "COMPLETED") { statusClass = "success"; statusLabel = item.status === "RECEIVED" ? "Đã nhận hàng" : "Hoàn thành"; }
      else if (item.status === "CANCELLED") { badgeStyle = 'style="background: rgba(211, 47, 47, 0.1); color: #d32f2f;"'; statusLabel = "Đã hủy"; }

      let actionButton = "";
      if (item.status === "PENDING") {
        actionButton = `
          <button class="btn-primary reassign-org-btn bg-primary text-on-primary px-3 py-1.5 rounded-lg text-label-sm font-bold shadow-sm hover:opacity-90 transition-soft" data-id="${item.id}">
            Chỉ định Org khác
          </button>
        `;
      } else if (item.status === "RECEIVED") {
        actionButton = `
          <button class="btn-primary complete-donation-btn bg-primary text-on-primary px-3 py-1.5 rounded-lg text-label-sm font-bold shadow-sm hover:opacity-90 transition-soft" data-id="${item.id}" style="background-color: #006b2c;">
            Hoàn tất
          </button>
        `;
      }

      return `
        <tr class="hover:bg-surface-container transition-colors">
          <td class="px-6 py-4">
            <div>
              <p class="text-label-md font-bold text-on-surface">${item.username || "Thành viên"}</p>
              <p class="text-label-sm text-on-surface-variant opacity-60">ID: #${item.id.toString().substring(0, 8)}...</p>
            </div>
          </td>
          <td class="px-6 py-4">
            <p class="text-label-md font-medium text-on-surface">${item.org || "Chưa xác định"}</p>
          </td>
          <td class="px-6 py-4">
            <p class="text-body-md text-on-surface font-semibold">${item.items}</p>
            ${item.description ? `<p class="text-body-sm text-on-surface-variant line-clamp-1 opacity-70">${item.description}</p>` : ''}
          </td>
          <td class="px-6 py-4">
            <span class="status-badge px-2 py-1 rounded-full ${statusClass}" ${badgeStyle}>
              ${statusLabel}
            </span>
          </td>
          <td class="px-6 py-4">
            ${item.trackingCode ? `<p class="text-body-sm font-mono font-bold text-secondary">Vận đơn: ${item.trackingCode}</p>` : ''}
            <p class="text-body-xs text-on-surface-variant opacity-60">${item.date}</p>
            ${item.cancelReason ? `<p class="text-error text-body-xs">Lý do hủy: ${item.cancelReason}</p>` : ''}
            ${item.rejectedReason ? `<p class="text-error text-body-xs">Lý do từ chối: ${item.rejectedReason}</p>` : ''}
          </td>
          <td class="px-6 py-4 text-right">
            ${actionButton}
          </td>
        </tr>
      `;
    }).join("");

    bindActionButtons();
  }

  function bindActionButtons() {
    // Complete Request (RECEIVED -> COMPLETED)
    tbody.querySelectorAll(".complete-donation-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (!confirm("Bạn có chắc chắn muốn hoàn tất yêu cầu quyên góp này?")) return;
        try {
          btn.disabled = true;
          const token = localStorage.getItem("ecocycle_token");
          const res = await fetch(`/api/donation-requests/${id}/completed`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
          if (!res.ok) {
            throw new Error(await res.text() || `HTTP ${res.status}`);
          }

          // Update local state
          const list = JSON.parse(localStorage.getItem("ecocycle_tracked_donations") || "[]");
          const item = list.find(d => d.id === id);
          if (item) item.status = "COMPLETED";
          localStorage.setItem("ecocycle_tracked_donations", JSON.stringify(list));

          showToast("Đã hoàn tất yêu cầu quyên góp thành công!", "success");
          loadData();
        } catch (e) {
          showToast("Lỗi hoàn tất: " + e.message, "error");
          btn.disabled = false;
        }
      });
    });

    // Reassign Organization (Fallback logic)
    tbody.querySelectorAll(".reassign-org-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (approvedOrganizations.length === 0) {
          showToast("Không tìm thấy danh sách tổ chức để điều phối lại!", "error");
          return;
        }

        // Show selection modal
        const modal = document.createElement("div");
        modal.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4";
        modal.id = "reassign-org-modal";

        const optionsHtml = approvedOrganizations.map(org => 
          `<option value="${org.id}">${org.orgName} - ${org.address || ''}</option>`
        ).join("");

        modal.innerHTML = `
          <div class="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl text-left" style="font-family: 'Be Vietnam Pro', sans-serif;">
            <div class="flex justify-between items-center border-b border-outline-variant pb-3 mb-4">
              <h3 class="text-headline-sm font-bold text-on-surface text-lg">Điều phối Tổ chức khác (Fallback)</h3>
              <button class="text-on-surface-variant hover:text-on-surface close-modal-btn">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <p class="text-body-md text-on-surface-variant mb-4">
              Chọn tổ chức từ thiện thay thế để xử lý yêu cầu quyên góp này:
            </p>

            <form id="reassign-org-submit-form" class="space-y-4">
              <div class="flex flex-col">
                <label class="block text-label-md font-bold mb-1.5 text-sm">Chọn tổ chức mới *</label>
                <select id="reassign-org-select" class="w-full border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary focus:outline-none text-body-sm" required>
                  ${optionsHtml}
                </select>
              </div>
              
              <div class="flex justify-end space-x-3 pt-3 border-t border-outline-variant mt-4">
                <button type="button" class="btn-outline-variant close-modal-btn px-4 py-2 rounded-xl text-label-md font-bold border border-outline hover:bg-surface-variant transition-all text-sm">Hủy</button>
                <button type="submit" class="btn-primary px-4 py-2 rounded-xl text-label-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-all text-sm" style="background-color: #006b2c; color: white;">Xác nhận chỉ định</button>
              </div>
            </form>
          </div>
        `;

        document.body.appendChild(modal);

        const close = () => modal.remove();
        modal.querySelectorAll(".close-modal-btn").forEach(b => b.addEventListener("click", close));

        modal.querySelector("#reassign-org-submit-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const orgId = modal.querySelector("#reassign-org-select").value;
          const selectedOrgName = modal.querySelector("#reassign-org-select option:checked").text.split(" - ")[0];

          try {
            const token = localStorage.getItem("ecocycle_token");
            const res = await fetch(`/api/donation-requests/${id}/assign-organization/${orgId}`, {
              method: "PATCH",
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) {
              throw new Error(await res.text() || `HTTP ${res.status}`);
            }

            // Update local state
            const list = JSON.parse(localStorage.getItem("ecocycle_tracked_donations") || "[]");
            const item = list.find(d => d.id === id);
            if (item) {
              item.org = selectedOrgName;
              item.date = new Date().toLocaleDateString("vi-VN"); // Reset request date since it was reassigned
            }
            localStorage.setItem("ecocycle_tracked_donations", JSON.stringify(list));

            showToast(`Đã điều phối thành công sang tổ chức ${selectedOrgName}!`, "success");
            close();
            loadData();
          } catch (err) {
            showToast("Lỗi điều phối: " + err.message, "error");
          }
        });
      });
    });
  }

  // Bind Tab Click Handlers
  const tabs = container.querySelectorAll('.donations-tabs .tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('text-primary', 'font-bold', 'border-primary');
        t.classList.add('text-on-surface-variant', 'font-medium', 'border-transparent');
      });
      tab.classList.add('text-primary', 'font-bold', 'border-primary');
      tab.classList.remove('text-on-surface-variant', 'font-medium', 'border-transparent');
      
      currentFilter = tab.getAttribute('data-filter');
      renderTable();
    });
  });

  // Search query handler
  const searchInput = container.querySelector("#admin-donations-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderTable();
    });
  }

  // Initial load
  await loadData();
}