/**
 * EcoCycle Web - Product Service
 * Handles API calls for products with in-memory caching.
 */

import { getToken } from "./auth.service.js";
import { apiFetch } from "../utils/api.js";
import { getAllCategories } from "./staff.service.js";

const DRAFT_PRODUCT_IDS_STORAGE_KEY = "ecocycle_draft_product_ids";

let productsCache = null;
let productsCacheTime = 0;
const CACHE_TTL = 3 * 60 * 1000; // 3 phút

async function enrichProductsWithLiveCategory(products) {
  if (!products) return products;
  try {
    const categories = await getAllCategories();
    if (!Array.isArray(categories) || categories.length === 0) return products;
    const catMapById = new Map();
    const catMapByName = new Map();
    categories.forEach(c => {
      if (c.id) catMapById.set(String(c.id), c.name);
      if (c.name) catMapByName.set(c.name.toLowerCase(), c.name);
    });

    const enrichOne = (p) => {
      if (!p || typeof p !== "object") return p;
      if (p.categoryId && catMapById.has(String(p.categoryId))) {
        p.category = catMapById.get(String(p.categoryId));
      } else if (p.category && catMapById.has(String(p.category))) {
        p.category = catMapById.get(String(p.category));
      } else if (p.category && catMapByName.has(String(p.category).toLowerCase())) {
        p.category = catMapByName.get(String(p.category).toLowerCase());
      }
      return p;
    };

    if (Array.isArray(products)) {
      return products.map(enrichOne);
    } else {
      return enrichOne(products);
    }
  } catch (err) {
    return products;
  }
}

export function invalidateProductCache() {
  productsCache = null;
  productsCacheTime = 0;
}

function normalizeProductStatus(status) {
  return String(status ?? "").trim().toUpperCase();
}

export function getDraftProductIds() {
  try {
    const raw = localStorage.getItem(DRAFT_PRODUCT_IDS_STORAGE_KEY);
    if (!raw) {
      return new Set();
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(parsed.filter((id) => typeof id === "string" && id.length > 0));
  } catch (error) {
    console.warn("Failed to read draft product ids:", error);
    return new Set();
  }
}

function writeDraftProductIds(ids) {
  localStorage.setItem(
    DRAFT_PRODUCT_IDS_STORAGE_KEY,
    JSON.stringify(Array.from(ids))
  );
}

export function markDraftProductId(id) {
  if (!id) return;
  const ids = getDraftProductIds();
  ids.add(String(id));
  writeDraftProductIds(ids);
}

export function unmarkDraftProductId(id) {
  if (!id) return;
  const ids = getDraftProductIds();
  ids.delete(String(id));
  writeDraftProductIds(ids);
}

export function isDraftProduct(product) {
  if (!product) {
    return false;
  }

  const status = normalizeProductStatus(product.status);
  if (status === "DRAFT") {
    return true;
  }

  return getDraftProductIds().has(String(product.id));
}

/**
 * Fetch all products from the backend with caching.
 * @returns {Promise<Array>} Array of product objects.
 */
export async function getAllProducts() {
  const now = Date.now();
  if (productsCache && now - productsCacheTime < CACHE_TTL) {
    const availableOnly = (productsCache || []).filter(p => !p.status || p.status.toUpperCase() === "AVAILABLE");
    return await enrichProductsWithLiveCategory(availableOnly);
  }
  try {
    const data = await apiFetch("/api/products");
    productsCache = data;
    productsCacheTime = now;
    const availableOnly = (data || []).filter(p => !p.status || p.status.toUpperCase() === "AVAILABLE");
    return await enrichProductsWithLiveCategory(availableOnly);
  } catch (error) {
    console.error("getAllProducts failed:", error);
    throw error;
  }
}

/**
 * Fetch a single product by ID.
 * @param {string} id Product UUID
 * @returns {Promise<Object>} Product details.
 */
export async function getProductById(id) {
  try {
    const prod = await apiFetch(`/api/products/${id}`);
    return await enrichProductsWithLiveCategory(prod);
  } catch (error) {
    console.error("getProductById failed:", error);
    throw error;
  }
}

/**
 * Create a new product.
 * @param {Object} productData - Product request payload.
 * @returns {Promise<Object>} Created product response.
 */
export async function createProduct(productData) {
  try {
    const data = await apiFetch("/api/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
    invalidateProductCache();
    return data;
  } catch (error) {
    console.error("createProduct failed:", error);
    throw error;
  }
}

/**
 * Update an existing product.
 * @param {string} id - Product UUID.
 * @param {Object} productData - Product request payload.
 * @returns {Promise<Object>} Updated product response.
 */
export async function updateProduct(id, productData) {
  try {
    const data = await apiFetch(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
    invalidateProductCache();
    return data;
  } catch (error) {
    console.error("updateProduct failed:", error);
    throw error;
  }
}

/**
 * Upload a product image to Cloudinary.
 * @param {File} file - Compressed image file.
 * @returns {Promise<Object>} Upload response containing url and publicId.
 */
export async function uploadProductImage(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    return await apiFetch("/api/upload/image", {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    console.error("uploadProductImage failed:", error);
    throw error;
  }
}

/**
 * Hide a product by ID.
 * @param {string} productId - Product UUID.
 * @returns {Promise<Object>} Response from hide API.
 */
export async function hideProduct(productId) {
  try {
    const data = await apiFetch(`/api/products/hide?productId=${productId}`, {
      method: "PUT",
    });
    invalidateProductCache();
    return data;
  } catch (error) {
    console.error("hideProduct failed:", error);
    throw error;
  }
}

/**
 * Unhide a product by ID.
 * @param {string} productId - Product UUID.
 * @returns {Promise<Object>} Response from unhide API.
 */
export async function unhideProduct(productId) {
  try {
    const data = await apiFetch(`/api/products/unhide?productId=${productId}`, {
      method: "PUT",
    });
    invalidateProductCache();
    return data;
  } catch (error) {
    console.error("unhideProduct failed:", error);
    throw error;
  }
}

/**
 * Get products by seller userId.
 * @param {string} userId - User UUID.
 * @returns {Promise<Array>} List of seller's products.
 */
export async function getMyProducts(userId) {
  try {
    if (!userId) {
      const all = await getAllProducts();
      return all;
    }
    return await apiFetch(`/api/products/user/product?userId=${userId}`);
  } catch (error) {
    console.warn("getMyProducts endpoint error, falling back to filtering getAllProducts:", error);
    const all = await getAllProducts();
    return all.filter(p => p.sellerId === userId || p.sellerUserId === userId);
  }
}

/**
 * Filter products using backend specification API (`GET /api/products/filter`).
 * @param {Object} params - Filter query parameters (category, minPrice, maxPrice, condition, size, color, location, type, sortBy).
 * @returns {Promise<Array>} List of filtered available products.
 */
export async function filterProductsApi(params = {}) {
  try {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
        query.append(key, params[key]);
      }
    });
    const url = `/api/products/filter${query.toString() ? '?' + query.toString() : ''}`;
    const data = await apiFetch(url);
    return await enrichProductsWithLiveCategory(data || []);
  } catch (error) {
    console.warn("filterProductsApi failed, falling back to client filtering:", error);
    const all = await getAllProducts();
    return all.filter(p => {
      if (params.category && p.category && !p.category.toLowerCase().includes(params.category.toLowerCase())) return false;
      if (params.minPrice !== undefined && p.price < params.minPrice) return false;
      if (params.maxPrice !== undefined && p.price > params.maxPrice) return false;
      if (params.condition !== undefined && p.condition != params.condition) return false;
      if (params.size && p.size !== params.size) return false;
      if (params.color && p.color !== params.color) return false;
      return true;
    });
  }
}

/**
 * Search products by keyword using backend API (`GET /api/products/search-by-keyword`).
 * @param {string} keyword - Search term.
 * @returns {Promise<Array>} List of matching available products.
 */
export async function searchProductsByKeywordApi(keyword) {
  try {
    if (!keyword || !keyword.trim()) {
      return await getAllProducts();
    }
    const data = await apiFetch(`/api/products/search-by-keyword?keyword=${encodeURIComponent(keyword.trim())}`);
    return await enrichProductsWithLiveCategory(data || []);
  } catch (error) {
    console.warn("searchProductsByKeywordApi failed, falling back to client filtering:", error);
    const all = await getAllProducts();
    const q = keyword.trim().toLowerCase();
    return all.filter(p => (p.title || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q) || (p.brand || "").toLowerCase().includes(q));
  }
}



