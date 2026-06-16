/**
 * EcoCycle – Profile Service
 * API calls for all 4 actor types + rich mock data fallback
 */

import { getToken, getUser, getUserIdFromToken, saveUser } from "./auth.service.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function apiFetch(path) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ════════════════════════════════════════════
   MOCK DATA – all 4 actor profiles
   ════════════════════════════════════════════ */

export const MOCK_PROFILES = {
  /* ── MEMBER ── */
  member: {
    id: "u001",
    role: "member",
    name: "Nguyễn Minh Anh",
    avatar: "https://i.pravatar.cc/150?img=47",
    cover:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
    bio: "Yêu thích thời trang vintage và đồ cũ có giá trị. Hãy cùng trao đổi để mọi món đồ có thêm vòng đời mới nhé!",
    location: "Quận 3, TP. Hồ Chí Minh",
    joinedDate: "03/2023",
    rating: 4.8,
    reviewCount: 47,
    stats: { sold: 23, bought: 15, donated: 8, rating: 4.8 },
    posts: [
      {
        id: "p1",
        title: "Áo khoác denim Levi's size M",
        price: 350000,
        condition: "Tốt",
        image:
          "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400",
        category: "Quần áo",
        qty: 1,
      },
      {
        id: "p2",
        title: "Giày Nike Air Max 90",
        price: 1200000,
        condition: "Như mới",
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        category: "Giày",
        qty: 1,
      },
      {
        id: "p3",
        title: "Túi xách da nâu vintage",
        price: 550000,
        condition: "Tốt",
        image:
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
        category: "Túi xách",
        qty: 1,
      },
      {
        id: "p4",
        title: "Đồng hồ Daniel Wellington",
        price: 890000,
        condition: "Như mới",
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        category: "Phụ kiện",
        qty: 1,
      },
      {
        id: "p5",
        title: "Áo khoác mùa đông H&M",
        price: 420000,
        condition: "Tốt",
        image:
          "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
        category: "Quần áo",
        qty: 1,
      },
      {
        id: "p6",
        title: "Balo da vintage",
        price: 320000,
        condition: "Tốt",
        image:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
        category: "Túi xách",
        qty: 1,
      },
    ],
    reviews: [
      {
        id: "r1",
        author: "Quang Huy",
        avatar: "https://i.pravatar.cc/40?img=12",
        rating: 5,
        comment:
          "Bán hàng rất uy tín, giao hàng nhanh. Sản phẩm đúng như mô tả!",
        date: "2 ngày trước",
      },
      {
        id: "r2",
        author: "Lan Anh",
        avatar: "https://i.pravatar.cc/40?img=25",
        rating: 5,
        comment: "Chị dễ thương, đồ còn rất mới. Sẽ ủng hộ lần sau!",
        date: "1 tuần trước",
      },
      {
        id: "r3",
        author: "Minh Tú",
        avatar: "https://i.pravatar.cc/40?img=33",
        rating: 4,
        comment: "Giao dịch suôn sẻ, đồ chất lượng tốt.",
        date: "2 tuần trước",
      },
    ],
    donations: [
      {
        id: "d1",
        org: "Tổ chức Kết nối Cộng đồng",
        items: "2 áo khoác + 1 túi xách",
        date: "15/05/2024",
        status: "Đã nhận",
        orgAvatar: "https://i.pravatar.cc/40?img=60",
      },
      {
        id: "d2",
        org: "Mái ấm Hoa Hướng Dương",
        items: "3 bộ quần áo trẻ em",
        date: "02/04/2024",
        status: "Đã nhận",
        orgAvatar: "https://i.pravatar.cc/40?img=61",
      },
      {
        id: "d3",
        org: "Tổ chức Kết nối Cộng đồng",
        items: "1 đôi giày size 38",
        date: "18/02/2024",
        status: "Đã nhận",
        orgAvatar: "https://i.pravatar.cc/40?img=60",
      },
    ],
  },

  /* ── SELLER ── */
  seller: {
    id: "u002",
    role: "seller",
    name: "Vintage House Saigon",
    avatar: "https://i.pravatar.cc/150?img=52",
    cover:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
    bio: "Chuyên mua bán đồ secondhand, thời trang vintage và phụ kiện. Hàng chính hãng 100%, giá cả hợp lý, phục vụ tận tâm.",
    location: "Quận 1, TP. Hồ Chí Minh",
    joinedDate: "06/2022",
    rating: 4.9,
    reviewCount: 312,
    shopStats: {
      totalSold: 1240,
      activeListings: 86,
      responseRate: "98%",
      responseTime: "< 1 giờ",
    },
    stats: { sold: 1240, rating: 4.9, reviews: 312, followers: 580 },
    posts: [
      {
        id: "sp1",
        title: "Lô 10 áo thun Uniqlo hàng thùng",
        price: 850000,
        condition: "Tốt",
        image:
          "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400",
        category: "Quần áo",
        qty: 10,
      },
      {
        id: "sp2",
        title: "Set 5 váy công sở thanh lý",
        price: 1200000,
        condition: "Như mới",
        image:
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400",
        category: "Quần áo",
        qty: 5,
      },
      {
        id: "sp3",
        title: "20 đôi giày mix các size",
        price: 3500000,
        condition: "Tốt",
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        category: "Giày",
        qty: 20,
      },
      {
        id: "sp4",
        title: "Lô túi xách da cao cấp 8 cái",
        price: 2800000,
        condition: "Tốt",
        image:
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
        category: "Túi xách",
        qty: 8,
      },
      {
        id: "sp5",
        title: "50 áo sơ mi nam các màu",
        price: 2500000,
        condition: "Tốt",
        image:
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400",
        category: "Quần áo",
        qty: 50,
      },
      {
        id: "sp6",
        title: "Bộ 12 phụ kiện thời trang mix",
        price: 1500000,
        condition: "Như mới",
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        category: "Phụ kiện",
        qty: 12,
      },
    ],
    reviews: [
      {
        id: "sr1",
        author: "Thu Hà",
        avatar: "https://i.pravatar.cc/40?img=15",
        rating: 5,
        comment:
          "Shop uy tín, hàng đẹp, đóng gói cẩn thận. Đã mua nhiều lần rồi!",
        date: "1 ngày trước",
      },
      {
        id: "sr2",
        author: "Bảo Anh",
        avatar: "https://i.pravatar.cc/40?img=22",
        rating: 5,
        comment:
          "Mua được lô áo rất ngon, chất vải tốt, đúng như mô tả. Sẽ ủng hộ tiếp.",
        date: "3 ngày trước",
      },
      {
        id: "sr3",
        author: "Mỹ Linh",
        avatar: "https://i.pravatar.cc/40?img=31",
        rating: 4,
        comment: "Shop hỗ trợ nhiệt tình, giao hàng nhanh.",
        date: "1 tuần trước",
      },
    ],
    events: [
      {
        id: "se1",
        title: "Hội chợ đồ cũ Saigon Retro Market",
        date: "20/06/2024",
        location: "Công viên Tao Đàn, Q.1",
        image:
          "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400",
        role: "Người bán hàng",
        status: "Sắp diễn ra",
      },
      {
        id: "se2",
        title: "Phiên chợ secondhand tháng 5",
        date: "12/05/2024",
        location: "SECC, Q.7",
        image:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        role: "Người bán hàng",
        status: "Đã kết thúc",
      },
    ],
    donations: [
      {
        id: "sd1",
        org: "Tổ chức Kết nối Cộng đồng",
        items: "50 áo + 20 quần (hàng tồn)",
        date: "01/05/2024",
        status: "Đã nhận",
        orgAvatar: "https://i.pravatar.cc/40?img=60",
      },
    ],
  },

  /* ── ORGANIZATION ── */
  org: {
    id: "u003",
    role: "org",
    name: "Tổ chức Kết nối Cộng đồng",
    avatar:
      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=200&h=200&fit=crop",
    cover:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80",
    verified: true,
    bio: "Tổ chức Kết nối Cộng đồng được thành lập với mục tiêu giảm thiểu lãng phí và hỗ trợ những gia đình khó khăn thông qua việc tái phân phối các vật dụng đã qua sử dụng. Chúng tôi tin rằng mỗi món đồ cũ đều mang trong mình một câu chuyện mới khi đến tay người cần. Sứ mệnh của chúng tôi là xây dựng một hệ sinh thái cho tặng bền vững, nơi sự tử tế được lan tỏa mỗi ngày.",
    location: "Quận 1, TP. Hồ Chí Minh",
    address: "123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    phone: "028 3823 4567",
    email: "contact@ketnoicongdong.org",
    joinedDate: "01/2020",
    impactStats: {
      itemsReceived: 12500,
      eventsOrganized: 48,
      trustedDonors: 1200,
    },
    acceptedCategories: ["Quần áo", "Giày", "Đồ dùng học tập", "Sách & Truyện"],
    recentEvents: [
      {
        id: "e1",
        title: 'Chương trình "Áo ấm mùa đông" tại Quận 8',
        description: "Hơn 500 phần quà đã được trao tận tay",
        image:
          "https://images.unsplash.com/photo-1593113630400-ea4288922559?w=600&q=80",
        type: "Sự kiện",
        date: "2 tuần trước",
      },
    ],
    recentTestimonials: [
      {
        author: "Nguyễn Thị Hoa",
        avatar: "https://i.pravatar.cc/40?img=45",
        time: "Cập nhật 2 giờ trước",
        comment:
          "Cảm ơn mọi người đã đóng góp sách giáo khoa lớp 1–5, chúng tôi đã gom đủ 100 bộ cho các em vùng cao.",
      },
    ],
    events: [
      {
        id: "oe1",
        title: 'Chương trình "Áo ấm mùa đông" tại Quận 8',
        date: "01/12/2024",
        location: "UBND Quận 8, TP.HCM",
        image:
          "https://images.unsplash.com/photo-1593113630400-ea4288922559?w=400&q=80",
        status: "Sắp diễn ra",
        participants: 240,
      },
      {
        id: "oe2",
        title: "Hội sách cũ – Tri thức không biên giới",
        date: "20/10/2024",
        location: "Đường Sách Nguyễn Văn Bình, Q.1",
        image:
          "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80",
        status: "Đã kết thúc",
        participants: 890,
      },
      {
        id: "oe3",
        title: "Ngày hội tặng đồ – Vòng đời mới",
        date: "15/08/2024",
        location: "Nhà Văn hóa Thanh Niên, Q.1",
        image:
          "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&q=80",
        status: "Đã kết thúc",
        participants: 1200,
      },
    ],
    reviews: [
      {
        id: "or1",
        author: "Minh Châu",
        avatar: "https://i.pravatar.cc/40?img=18",
        rating: 5,
        comment:
          "Tổ chức rất chuyên nghiệp. Đồ tôi quyên góp đã đến đúng tay người cần trong 3 ngày!",
        date: "1 tuần trước",
      },
      {
        id: "or2",
        author: "Hải Đăng",
        avatar: "https://i.pravatar.cc/40?img=27",
        rating: 5,
        comment: "Minh bạch, tận tâm và hiệu quả. Sẽ tiếp tục ủng hộ lâu dài.",
        date: "2 tuần trước",
      },
      {
        id: "or3",
        author: "Ngọc Lan",
        avatar: "https://i.pravatar.cc/40?img=38",
        rating: 4,
        comment:
          "Nhận đồ nhanh, xử lý khéo léo. Rất trân trọng công việc của các bạn.",
        date: "1 tháng trước",
      },
    ],
    donations: [
      {
        id: "od1",
        donor: "Vintage House Saigon",
        items: "50 áo + 20 quần",
        date: "01/05/2024",
        status: "Đã phân phối",
        donorAvatar: "https://i.pravatar.cc/40?img=52",
      },
      {
        id: "od2",
        donor: "Nguyễn Minh Anh",
        items: "2 áo khoác + 1 túi xách",
        date: "15/04/2024",
        status: "Đã phân phối",
        donorAvatar: "https://i.pravatar.cc/40?img=47",
      },
      {
        id: "od3",
        donor: "Lê Thanh Tùng",
        items: "Sách giáo khoa lớp 3-5 (12 cuốn)",
        date: "10/04/2024",
        status: "Đã phân phối",
        donorAvatar: "https://i.pravatar.cc/40?img=35",
      },
    ],
  },

  /* ── ADMIN ── */
  admin: {
    id: "u004",
    role: "admin",
    name: "Admin EcoCycle",
    avatar: "https://i.pravatar.cc/150?img=68",
    cover:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
    bio: "Quản trị viên hệ thống EcoCycle. Giám sát hoạt động nền tảng, kiểm duyệt nội dung và hỗ trợ người dùng.",
    location: "TP. Hồ Chí Minh",
    joinedDate: "01/2024",
    platformStats: {
      totalUsers: 25840,
      activeListings: 4210,
      eventsThisMonth: 12,
      donationsThisMonth: 3400,
      pendingReports: 7,
      newUsersToday: 143,
    },
    recentReports: [
      {
        id: "rp1",
        type: "Tin đăng vi phạm",
        user: "user_abc123",
        time: "30 phút trước",
        severity: "high",
      },
      {
        id: "rp2",
        type: "Tài khoản giả mạo",
        user: "user_xyz789",
        time: "2 giờ trước",
        severity: "high",
      },
      {
        id: "rp3",
        type: "Bình luận spam",
        user: "user_def456",
        time: "5 giờ trước",
        severity: "low",
      },
    ],
    quickLinks: [
      {
        label: "Quản lý người dùng",
        icon: "👥",
        href: "#/admin/users",
        count: 25840,
      },
      {
        label: "Kiểm duyệt tin đăng",
        icon: "📋",
        href: "#/admin/listings",
        count: 4210,
      },
      {
        label: "Quản lý sự kiện",
        icon: "🎪",
        href: "#/admin/events",
        count: 48,
      },
      {
        label: "Báo cáo vi phạm",
        icon: "🚨",
        href: "#/admin/reports",
        count: 7,
        badge: true,
      },
      {
        label: "Tổ chức & Từ thiện",
        icon: "🏢",
        href: "#/admin/orgs",
        count: 23,
      },
      {
        label: "Thống kê hệ thống",
        icon: "📊",
        href: "#/admin/analytics",
        count: null,
      },
    ],
  },
};

/* ════════════════════════════════════════════
   API CALLS (with mock fallback)
   ════════════════════════════════════════════ */

export async function getMyProfile() {
  let userId = getUserIdFromToken();
  const localUser = getUser();
  const rawRole = localUser?.role || "MEMBER";
  const username = localUser?.username;

  // Normalize role string to match MOCK_PROFILES key
  let role = "member";
  if (rawRole.toUpperCase() === "ADMIN") role = "admin";
  else if (rawRole.toUpperCase() === "SELLER") role = "seller";
  else if (rawRole.toUpperCase() === "ORGANIZATION" || rawRole.toUpperCase() === "ORG") role = "org";

  const defaultMock = MOCK_PROFILES[role] || MOCK_PROFILES.member;

  // Dynamic Fallback: If JWT does not have userId, query products database to find seller UUID
  if (!userId && username) {
    console.warn("getMyProfile: No userId found in token. Attempting dynamic resolution from products list...");
    try {
      const allProducts = await apiFetch("/api/products");
      const matchedProduct = allProducts.find(
        (p) => p.sellerName === username
      );
      if (matchedProduct) {
        userId = matchedProduct.sellerId;
        console.log("getMyProfile: Resolved userId from product sellerId:", userId);
      }
    } catch (err) {
      console.error("getMyProfile: Failed to resolve userId from products API:", err);
    }
  }

  // Final Fallback: If still not resolved, try any product sellerId or fallback default
  if (!userId) {
    try {
      const allProducts = await apiFetch("/api/products");
      if (allProducts && allProducts.length > 0) {
        userId = allProducts[0].sellerId;
        console.warn("getMyProfile: Falling back to first available sellerId from products:", userId);
      }
    } catch (e) {
      console.error("getMyProfile: Final fallback failed:", e);
    }
  }

  if (!userId) {
    throw new Error("No user ID found in token and failed to resolve from products.");
  }

  // Fetch real details from database
  const userDetails = await apiFetch(`/api/user/${userId}`);

  return {
    id: userId,
    role: role,
    username: userDetails.username,
    name: userDetails.fullName || userDetails.username,
    email: userDetails.email || "",
    phone: userDetails.phone || "",
    avatar: defaultMock.avatar || "https://i.pravatar.cc/150?img=11",
    bio: defaultMock.bio || "",
    location: defaultMock.location || "",
    posts: []
  };
}

export async function updateUserProfile(userId, { fullName, email, phone, username }) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/user/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ fullName, email, phone, username }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  // Update local storage user info
  const localUser = getUser();
  if (localUser) {
    localUser.username = username;
    saveUser(localUser);
  }

  return res.text();
}

export async function getProfileById(id) {
  try {
    return await apiFetch(`/api/profile/${id}`);
  } catch {
    return MOCK_PROFILES.org;
  }
}

export async function getProfilePosts(id) {
  try {
    return await apiFetch(`/api/profile/${id}/posts`);
  } catch {
    const all = Object.values(MOCK_PROFILES);
    const profile = all.find((p) => p.id === id) ?? MOCK_PROFILES.member;
    return profile.posts ?? [];
  }
}

export async function getProfileReviews(id) {
  try {
    return await apiFetch(`/api/profile/${id}/reviews`);
  } catch {
    const all = Object.values(MOCK_PROFILES);
    const profile = all.find((p) => p.id === id) ?? MOCK_PROFILES.member;
    return profile.reviews ?? [];
  }
}

export async function getProfileEvents(id) {
  try {
    return await apiFetch(`/api/profile/${id}/events`);
  } catch {
    const all = Object.values(MOCK_PROFILES);
    const profile = all.find((p) => p.id === id) ?? MOCK_PROFILES.org;
    return profile.events ?? [];
  }
}

export async function getProfileDonations(id) {
  try {
    return await apiFetch(`/api/profile/${id}/donations`);
  } catch {
    const all = Object.values(MOCK_PROFILES);
    const profile = all.find((p) => p.id === id) ?? MOCK_PROFILES.member;
    return profile.donations ?? [];
  }
}
