import React, { useState, useEffect } from "react";
import { getAllUsers, getAllDonationRequests } from "../../services/admin.service.js";
import { getAllProducts } from "../../services/product.service.js";

export default function OverviewTab() {
  const [stats, setStats] = useState({
    users: "--",
    shops: "--",
    products: "--",
    donations: "--"
  });

  const [pendingActions, setPendingActions] = useState([
    {
      id: 1,
      title: "Phê duyệt tổ chức mới",
      subtitle: "EcoFashion Group",
      type: "Hệ thống",
      status: "Chờ duyệt",
      statusColor: "bg-secondary-fixed text-secondary-fixed-dim"
    },
    {
      id: 2,
      title: "Yêu cầu quyên góp quá hạn",
      subtitle: "Mã: DON-8821",
      type: "Quyên góp",
      status: "Quá hạn",
      statusColor: "bg-error-container text-error"
    },
    {
      id: 3,
      title: "Báo cáo vi phạm sản phẩm",
      subtitle: "User: luan_nguyen99",
      type: "Bảo mật",
      status: "Mới",
      statusColor: "bg-surface-variant text-on-surface-variant"
    }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const users = await getAllUsers();
        const shopCount = users.filter(u => u.role?.roleName === 'ROLE_ORGANIZATION').length;
        
        const products = await getAllProducts();
        const donations = await getAllDonationRequests();

        setStats({
          users: users.length.toLocaleString("vi"),
          shops: shopCount.toLocaleString("vi"),
          products: products.length.toLocaleString("vi"),
          donations: donations.length.toLocaleString("vi")
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu tổng quan:", error);
      }
    };

    fetchStats();
  }, []);

  const handleAction = (id) => {
    setPendingActions(prev => prev.filter(action => action.id !== id));
  };

  return (
    <main className="ml-64 flex-1 min-h-screen h-screen overflow-y-auto bg-background">
      {/* TopNavBar Shell */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant h-20 flex justify-between items-center px-margin-desktop shadow-sm">
        <div className="flex items-center gap-stack-lg">
          <div className="relative w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined">search</span>
            <input className="w-full pl-12 pr-4 h-12 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline-variant" placeholder="Tìm kiếm hệ thống..." type="text"/>
          </div>
        </div>
        <div className="flex items-center gap-stack-lg">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          <div className="flex items-center gap-stack-sm ml-stack-sm border-l border-outline-variant pl-stack-lg">
            <div className="text-right">
              <p className="font-label-md text-on-surface">Admin Master</p>
              <p className="text-[10px] text-outline uppercase font-bold tracking-tight">System Owner</p>
            </div>
            <img alt="Administrator Profile" className="w-10 h-10 rounded-full border-2 border-primary-fixed" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0xu-mkKPh2dYj4iA0DCjMmKbkLzUM4MCyVR50aYt3ZmoOlkTp4rj84A_HdtZZLNfnJPzjzToAb4KAwgU8MO-rjTasLTDBfiuuQOq-qprKsFJPJHmocjo1eDq_ehXyVapmngH86CsAz8CRyarMCy_03XJZqrFGPB7zhYBHl4DqnHinvi_r9RxfRypptvOBt6fLFN2Dgr8Z0nxonJZgd1mzCYIvO5530cIdhiK4XMFWp2dEAgMs6HPvK-nwvQDhzOm5wydz66LYrK8e"/>
          </div>
        </div>
      </header>

      {/* Dashboard Canvas */}
      <div className="p-margin-desktop space-y-stack-xl max-w-[1440px] mx-auto pb-10">
        {/* Welcome Header */}
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Chào buổi sáng, Admin</h2>
          <p className="text-body-md text-on-surface-variant">Hệ thống đang hoạt động ổn định. Dưới đây là các chỉ số chính.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          <div className="stat-card bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30 cursor-pointer">
            <div className="flex justify-between items-start mb-stack-md">
              <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">group</span>
              </div>
              <span className="text-primary text-label-sm font-bold bg-primary-fixed-dim px-2 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-label-md text-on-surface-variant">Tổng User</p>
            <h3 className="text-headline-md font-headline-md text-on-surface">{stats.users}</h3>
          </div>
          <div className="stat-card bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30 cursor-pointer">
            <div className="flex justify-between items-start mb-stack-md">
              <div className="w-12 h-12 rounded-lg bg-secondary-container/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <span className="text-secondary text-label-sm font-bold bg-secondary-fixed px-2 py-1 rounded-full">+5.4%</span>
            </div>
            <p className="text-label-md text-on-surface-variant">Sản phẩm đang bán</p>
            <h3 className="text-headline-md font-headline-md text-on-surface">{stats.products}</h3>
          </div>
          <div className="stat-card bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30 cursor-pointer">
            <div className="flex justify-between items-start mb-stack-md">
              <div className="w-12 h-12 rounded-lg bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">domain</span>
              </div>
              <span className="text-tertiary text-label-sm font-bold bg-tertiary-fixed px-2 py-1 rounded-full">Đã duyệt</span>
            </div>
            <p className="text-label-md text-on-surface-variant">Tổ chức đăng ký</p>
            <h3 className="text-headline-md font-headline-md text-on-surface">{stats.shops}</h3>
          </div>
          <div className="stat-card bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30 cursor-pointer">
            <div className="flex justify-between items-start mb-stack-md">
              <div className="w-12 h-12 rounded-lg bg-error-container/20 flex items-center justify-center text-error">
                <span className="material-symbols-outlined">volunteer_activism</span>
              </div>
              <span className="text-error text-label-sm font-bold bg-error-container px-2 py-1 rounded-full">Cần xử lý</span>
            </div>
            <p className="text-label-md text-on-surface-variant">Donation đang chờ</p>
            <h3 className="text-headline-md font-headline-md text-on-surface">{stats.donations}</h3>
          </div>
        </div>

        {/* Bento Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Line Chart Area */}
          <div className="lg:col-span-2 bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-center items-center h-72 text-center">
            <span className="material-symbols-outlined text-4xl text-outline mb-2 animate-pulse">query_stats</span>
            <h4 className="font-headline-sm text-on-surface font-semibold">Biểu đồ Giao dịch chưa sẵn sàng</h4>
            <p className="text-body-sm text-on-surface-variant max-w-md mt-1">Hệ thống đang tích hợp API phân tích dữ liệu thời gian thực từ máy chủ. Vui lòng quay lại sau.</p>
          </div>
          {/* Donut Chart Area */}
          <div className="bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-center items-center h-72 text-center">
            <span className="material-symbols-outlined text-4xl text-outline mb-2 animate-pulse">pie_chart</span>
            <h4 className="font-headline-sm text-on-surface font-semibold">Danh mục Sản phẩm</h4>
            <p className="text-body-sm text-on-surface-variant max-w-xs mt-1">Đang tích hợp dữ liệu phân bổ từ kho API.</p>
          </div>
        </div>

        {/* Table & Feed Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mt-stack-xl">
          {/* Pending Actions Table */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <div className="p-stack-lg border-b border-outline-variant/30 flex justify-between items-center">
              <h4 className="font-headline-md text-on-surface">Pending actions</h4>
              <span className="bg-error-container text-on-error-container text-[10px] font-bold px-2 py-1 rounded-full">Cần lưu ý ({pendingActions.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-on-surface-variant font-label-md text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-stack-lg py-4">Nội dung</th>
                    <th className="px-stack-lg py-4">Loại</th>
                    <th className="px-stack-lg py-4">Trạng thái</th>
                    <th className="px-stack-lg py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {pendingActions.map(action => (
                    <tr key={action.id}>
                      <td className="px-stack-lg py-4">
                        <p className="font-label-md text-on-surface">{action.title}</p>
                        <p className="text-xs text-outline">{action.subtitle}</p>
                      </td>
                      <td className="px-stack-lg py-4 text-sm">{action.type}</td>
                      <td className="px-stack-lg py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${action.statusColor}`}>{action.status}</span>
                      </td>
                      <td className="px-stack-lg py-4 text-right">
                        <button onClick={() => handleAction(action.id)} className="action-btn bg-primary text-on-primary px-4 py-2 rounded-xl text-label-sm font-bold hover:opacity-90 active:scale-95 transition-all">Xử lý ngay</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-surface-container-lowest p-stack-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col">
            <div className="flex justify-between items-center mb-stack-lg">
              <h4 className="font-headline-md text-on-surface">Recent activity</h4>
              <button className="text-primary text-label-sm font-bold hover:underline">Xem tất cả</button>
            </div>
            <div className="space-y-stack-lg">
              <div className="flex gap-stack-md">
                <div className="w-1 h-12 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-label-md text-on-surface font-bold">Admin đăng nhập thành công</p>
                  <p className="text-xs text-on-surface-variant">Vừa xong • Địa chỉ IP: 192.168.1.1</p>
                </div>
              </div>
              <div className="flex gap-stack-md">
                <div className="w-1 h-12 bg-secondary-container rounded-full"></div>
                <div className="flex-1">
                  <p className="text-label-md text-on-surface font-bold">50 sản phẩm mới được đăng</p>
                  <p className="text-xs text-on-surface-variant">10 phút trước • Danh mục: Thời trang</p>
                </div>
              </div>
              <div className="flex gap-stack-md">
                <div className="w-1 h-12 bg-tertiary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-label-md text-on-surface font-bold">Giao dịch #TX-4402 hoàn tất</p>
                  <p className="text-xs text-on-surface-variant">25 phút trước • Giá trị: 1,250,000đ</p>
                </div>
              </div>
              <div className="flex gap-stack-md">
                <div className="w-1 h-12 bg-outline-variant rounded-full"></div>
                <div className="flex-1">
                  <p className="text-label-md text-on-surface font-bold">Tổ chức mới đăng ký: GreenLife</p>
                  <p className="text-xs text-on-surface-variant">1 giờ trước • Chờ xác minh hồ sơ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Visual Flare - Subtle Background Animation */}
        <div className="fixed bottom-0 right-0 w-96 h-96 -z-10 opacity-30 pointer-events-none">
        </div>

      </div>
    </main>
  );
}
