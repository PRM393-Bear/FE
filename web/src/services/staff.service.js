/**
 * EcoCycle Web - Staff API Service
 * Handles API operations for Staff (Categories CRUD, Pending Products approval/rejection).
 */

import { apiFetch } from "../utils/api.js";

const DEFAULT_CATEGORIES = [
  { id: "c1", name: "Áo thun / Sơ mi", description: "Áo nam nữ các loại" },
  { id: "c2", name: "Quần dài / Short", description: "Quần jean, kaki, short" },
  { id: "c3", name: "Áo khoác / Blazer", description: "Áo khoác mùa đông, blazer công sở" },
  { id: "c4", name: "Váy & Đầm", description: "Váy liền, chân váy thời trang" },
  { id: "c5", name: "Đồ thể thao", description: "Quần áo tập gym, chạy bộ, yoga" },
  { id: "c6", name: "Phụ kiện thời trang", description: "Mũ, khăn, túi xách, thắt lưng" }
];

// --- Categories ---
export async function getAllCategories() {
  try {
    const data = await apiFetch("/api/staff/categories");
    return Array.isArray(data) && data.length > 0 ? data : DEFAULT_CATEGORIES;
  } catch (err) {
    console.warn("Failed to fetch staff categories (fallback to live products + defaults):", err);
    try {
      const products = await apiFetch("/api/products");
      const catMap = new Map();
      if (Array.isArray(products)) {
        products.forEach(p => {
          if (p.categoryId && p.category) {
            catMap.set(String(p.categoryId), { id: String(p.categoryId), name: String(p.category) });
          } else if (p.category && typeof p.category === "string") {
            catMap.set(p.category, { id: p.category, name: p.category });
          }
        });
      }
      DEFAULT_CATEGORIES.forEach(dc => {
        if (!catMap.has(dc.name) && !catMap.has(dc.id)) {
          catMap.set(dc.id, dc);
        }
      });
      const liveList = Array.from(catMap.values());
      return liveList.length > 0 ? liveList : DEFAULT_CATEGORIES;
    } catch (fallbackErr) {
      return DEFAULT_CATEGORIES;
    }
  }
}

export async function createCategory(payload) {
  return await apiFetch("/api/staff/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(id, payload) {
  return await apiFetch(`/api/staff/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(id) {
  return await apiFetch(`/api/staff/categories/${id}`, {
    method: "DELETE",
  });
}

// --- Pending Products ---
export async function getPendingProducts() {
  try {
    const data = await apiFetch("/api/products/pending");
    const list = Array.isArray(data) ? data : [];
    if (list.length === 0) return list;

    const categories = await getAllCategories();
    if (!Array.isArray(categories) || categories.length === 0) return list;

    const catMapById = new Map();
    const catMapByName = new Map();
    categories.forEach(c => {
      if (c.id) catMapById.set(String(c.id), c.name);
      if (c.name) catMapByName.set(c.name.toLowerCase(), c.name);
    });

    return list.map(p => {
      if (!p || typeof p !== "object") return p;
      if (p.categoryId && catMapById.has(String(p.categoryId))) {
        p.category = catMapById.get(String(p.categoryId));
      } else if (p.category && catMapById.has(String(p.category))) {
        p.category = catMapById.get(String(p.category));
      } else if (p.category && catMapByName.has(String(p.category).toLowerCase())) {
        p.category = catMapByName.get(String(p.category).toLowerCase());
      }
      return p;
    });
  } catch (err) {
    console.warn("Failed to fetch pending products:", err);
    return [];
  }
}


export async function approveProduct(id) {
  return await apiFetch(`/api/products/approve?id=${id}`, {
    method: "PUT",
  });
}

export async function rejectProduct(id, reason) {
  return await apiFetch(`/api/products/reject?id=${id}&reason=${encodeURIComponent(reason)}`, {
    method: "PUT",
  });
}

// --- Organizations Verification (Staff Role) ---
export async function getPendingOrganizations() {
  try {
    const pendingOrgs = await apiFetch("/api/organization-details/pending");
    if (Array.isArray(pendingOrgs)) {
      return pendingOrgs.filter(org => org.status === "PENDING");
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch pending organizations:", error);
    return [];
  }
}

export async function approveOrganization(id) {
  return await apiFetch(`/api/organization-details/${id}/approve`, {
    method: "PATCH",
  });
}

export async function rejectOrganization(id) {
  return await apiFetch(`/api/organization-details/${id}/reject`, {
    method: "PATCH",
  });
}
