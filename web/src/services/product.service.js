/**
 * EcoCycle Web - Product Service
 * Handles API calls for products with in-memory caching.
 */

import { getToken } from "./auth.service.js";
import { apiFetch } from "../utils/api.js";

const DRAFT_PRODUCT_IDS_STORAGE_KEY = "ecocycle_draft_product_ids";

let productsCache = null;
let productsCacheTime = 0;
const CACHE_TTL = 3 * 60 * 1000; // 3 phút

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
    JSON.stringify([...ids])
  );
}

export function markDraftProductId(productId) {
  if (!productId) {
    return;
  }

  const ids = getDraftProductIds();
  ids.add(String(productId));
  writeDraftProductIds(ids);
}

export function unmarkDraftProductId(productId) {
  if (!productId) {
    return;
  }

  const ids = getDraftProductIds();
  ids.delete(String(productId));
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
    return productsCache;
  }
  try {
    const data = await apiFetch("/api/products");
    productsCache = data;
    productsCacheTime = now;
    return data;
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
    return await apiFetch(`/api/products/${id}`);
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

