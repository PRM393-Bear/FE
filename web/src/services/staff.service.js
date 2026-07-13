/**
 * EcoCycle Web - Staff API Service
 * Handles API operations for Staff (Categories CRUD, Pending Products approval/rejection).
 */

import { apiFetch } from "../utils/api.js";

// --- Categories ---
export async function getAllCategories() {
  try {
    const data = await apiFetch("/api/staff/categories");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Failed to fetch staff categories:", err);
    return [];
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
    return Array.isArray(data) ? data : [];
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
