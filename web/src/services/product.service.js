/**
 * EcoCycle Web - Product Service
 * Handles API calls for products.
 */

import { getToken } from "./auth.service.js";

const API_BASE = "/api/products";
const DRAFT_PRODUCT_IDS_STORAGE_KEY = "ecocycle_draft_product_ids";

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
 * Fetch all products from the backend.
 * @returns {Promise<Array>} Array of product objects.
 */
export async function getAllProducts() {
  try {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(API_BASE, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching products: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
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
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/${id}`, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching product: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
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
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(
        `Error creating product: ${response.status} ${response.statusText}. Details: ${errBody}`
      );
    }

    const data = await response.json();
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
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(
        `Error updating product: ${response.status} ${response.statusText}. Details: ${errBody}`
      );
    }

    const data = await response.json();
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
    const token = getToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload/image", {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(
        `Error uploading image: ${response.status} ${response.statusText}. Details: ${errBody}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("uploadProductImage failed:", error);
    throw error;
  }
}

