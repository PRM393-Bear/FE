import { getPendingOrganizations, approveOrganization, rejectOrganization } from "../../services/staff.service.js";

export function renderOrganizationsTab(container) {
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-6 animate-fade-in">
      <!-- Header banner -->
      <div class="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 class="text-title-lg font-bold text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">domain_verification</span>
            Xét duyệt tài khoản tổ chức (Quyên góp & Thiện nguyện)
          </h3>
          <p class="text-xs text-on-surface-variant mt-1">Kiểm tra thông tin pháp lý, giấy phép và phê duyệt tài khoản tổ chức tham gia nhận quyên góp quần áo.</p>
        </div>
        <button id="btn-reload-orgs" class="px-4 py-2 bg-surface rounded-xl border border-outline-variant/50 text-xs font-bold text-on-surface hover:bg-surface-variant flex items-center gap-1.5 transition-colors">
          <span class="material-symbols-outlined text-sm">refresh</span> Tải lại danh sách
        </button>
      </div>

      <!-- Organizations Table Card -->
      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container/50 border-b border-outline-variant/30 text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                <th class="px-6 py-4">Tổ chức / Đơn vị</th>
                <th class="px-6 py-4">Đại diện liên hệ</th>
                <th class="px-6 py-4">Nhu cầu tiếp nhận</th>
                <th class="px-6 py-4">Tài liệu pháp lý / Xác minh</th>
                <th class="px-6 py-4 text-right">Thao tác duyệt</th>
              </tr>
            </thead>
            <tbody id="staff-orgs-tbody" class="divide-y divide-outline-variant/20 text-sm">
              <tr>
                <td colspan="5" class="text-center py-12 text-on-surface-variant">
                  <div class="flex flex-col items-center gap-2">
                    <span class="material-symbols-outlined text-3xl animate-spin text-primary">progress_activity</span>
                    <span>Đang tải dữ liệu tổ chức chờ xét duyệt...</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  attachOrganizationsListeners(container);
  container.querySelector("#btn-reload-orgs")?.addEventListener("click", () => attachOrganizationsListeners(container));
}

export async function attachOrganizationsListeners(container) {
  const tbody = container.querySelector("#staff-orgs-tbody");
  if (!tbody) return;

  const isPendingStatus = (status) => status === "PENDING";
  const getApprovalErrorMessage = (error) => {
    const message = error?.message || "";
    if (message.includes("not in pending status")) {
      return "Tổ chức này không còn ở trạng thái chờ duyệt. Vui lòng làm mới danh sách.";
    }
    return message || "Không thể thực hiện thao tác kiểm duyệt tổ chức.";
  };

  try {
    const orgs = await getPendingOrganizations();
    if (orgs && orgs.length > 0) {
      tbody.innerHTML = orgs.map(org => {
        const canModerate = isPendingStatus(org.status);
        const logoUrl = org.avtOrg || `https://ui-avatars.com/api/?name=${encodeURIComponent(org.orgName || "O")}&background=006B2C&color=fff`;
        const acceptedTypesText = org.acceptedTypes && org.acceptedTypes.length > 0
          ? org.acceptedTypes.map(t => `<span class="px-2.5 py-1 bg-surface-variant/80 text-on-surface font-semibold rounded-lg text-xs inline-block my-0.5">${t}</span>`).join(" ")
          : '<span class="text-xs text-on-surface-variant italic">Tất cả quần áo</span>';

        const docLinks = org.verificationDocs && org.verificationDocs.length > 0
          ? org.verificationDocs.map((doc, idx) => `
              <a href="${doc}" target="_blank" class="inline-flex items-center gap-1 text-primary hover:underline font-semibold text-xs py-1 px-2 rounded bg-primary/5 hover:bg-primary/10 transition-colors" onclick="event.stopPropagation()">
                <span class="material-symbols-outlined text-xs">description</span> Tài liệu ${idx + 1}
              </a>
            `).join(" ")
          : '<span class="text-xs text-on-surface-variant italic">Không tải kèm tài liệu</span>';

        return `
          <tr class="hover:bg-surface-container-low/50 transition-colors" data-orgid="${org.id}">
            <td class="px-6 py-5 align-top">
              <div class="flex items-start gap-3.5">
                <img alt="Org Logo" class="w-11 h-11 rounded-xl object-cover border border-outline-variant/30 shrink-0 shadow-sm" src="${logoUrl}"/>
                <div class="min-w-0">
                  <p class="font-bold text-on-surface text-base leading-snug">${org.orgName || "Chưa đặt tên tổ chức"}</p>
                  <p class="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">location_on</span>
                    ${org.address || "Không có địa chỉ"}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-6 py-5 align-top">
              <p class="font-bold text-on-surface">${org.userFullName || "N/A"}</p>
              <p class="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span class="material-symbols-outlined text-[14px]">mail</span>
                ${org.userEmail || "N/A"}
              </p>
            </td>
            <td class="px-6 py-5 align-top">
              <div class="flex flex-wrap gap-1 max-w-[200px]">
                ${acceptedTypesText}
              </div>
            </td>
            <td class="px-6 py-5 align-top">
              <div class="flex flex-col gap-1.5 items-start">
                ${docLinks}
              </div>
            </td>
            <td class="px-6 py-5 align-top text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-2">
                <button class="staff-approve-org-btn px-3.5 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs shadow-sm hover:opacity-90 transition-all active:scale-95 flex items-center gap-1 ${canModerate ? "" : "opacity-50 cursor-not-allowed"}" data-id="${org.id}" ${canModerate ? "" : "disabled"}>
                  <span class="material-symbols-outlined text-sm">check</span> Phê duyệt
                </button>
                <button class="staff-reject-org-btn px-3 py-2 bg-error/10 text-error rounded-xl font-bold text-xs hover:bg-error/20 transition-all active:scale-95 flex items-center gap-1 ${canModerate ? "" : "opacity-50 cursor-not-allowed"}" data-id="${org.id}" ${canModerate ? "" : "disabled"}>
                  <span class="material-symbols-outlined text-sm">close</span> Từ chối
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join("");

      tbody.querySelectorAll(".staff-approve-org-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const id = btn.getAttribute("data-id");
          if (confirm("Bạn có chắc chắn muốn PHÊ DUYỆT tài khoản tổ chức này để họ tham gia nhận quyên góp?")) {
            try {
              btn.disabled = true;
              btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">progress_activity</span>`;
              await approveOrganization(id);
              attachOrganizationsListeners(container);
            } catch (err) {
              alert("Lỗi khi duyệt tổ chức: " + getApprovalErrorMessage(err));
              btn.disabled = false;
              btn.innerHTML = `<span class="material-symbols-outlined text-sm">check</span> Phê duyệt`;
            }
          }
        });
      });

      tbody.querySelectorAll(".staff-reject-org-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const id = btn.getAttribute("data-id");
          const reason = prompt("Nhập lý do từ chối hồ sơ tổ chức (sẽ gửi đến email người dùng):", "Hồ sơ không đáp ứng đủ điều kiện xác thực hoặc minh chứng chưa hợp lệ");
          if (reason === null) return;
          if (confirm("Bạn có chắc chắn muốn TỪ CHỐI tài khoản tổ chức này?")) {
            try {
              btn.disabled = true;
              btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">progress_activity</span>`;
              await rejectOrganization(id, reason.trim() || "Hồ sơ không hợp lệ");
              attachOrganizationsListeners(container);
            } catch (err) {
              alert("Lỗi khi từ chối tổ chức: " + getApprovalErrorMessage(err));
              btn.disabled = false;
              btn.innerHTML = `<span class="material-symbols-outlined text-sm">close</span> Từ chối`;
            }
          }
        });
      });

    } else {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-16 text-on-surface-variant">
            <div class="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
              <div class="w-12 h-12 rounded-full bg-surface-variant/50 flex items-center justify-center text-on-surface-variant mb-1">
                <span class="material-symbols-outlined text-2xl">verified</span>
              </div>
              <p class="font-bold text-base text-on-surface">Không có hồ sơ nào chờ duyệt</p>
              <p class="text-xs text-on-surface-variant text-center">Tất cả tài khoản tổ chức đăng ký mới đã được kiểm duyệt hoặc chưa có yêu cầu mới.</p>
            </div>
          </td>
        </tr>
      `;
    }
  } catch (error) {
    console.error("Error loading pending organizations for staff:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-10 text-error font-bold">
          Lỗi khi tải dữ liệu từ máy chủ. Vui lòng thử lại sau.
        </td>
      </tr>
    `;
  }
}
