/**
 * EcoCycle – Wardrobe API Service
 * Integrates with backend WardrobeItemController
 */

import { apiFetch } from "../utils/api.js";
import { getAllCategories } from "./staff.service.js";

export async function getMyWardrobe() {
  try {
    const data = await apiFetch("/api/wardrobe-items/my-wardrobe");
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

    return list.map(item => {
      if (!item || typeof item !== "object") return item;
      if (item.categoryId && catMapById.has(String(item.categoryId))) {
        item.category = catMapById.get(String(item.categoryId));
      } else if (item.category && catMapById.has(String(item.category))) {
        item.category = catMapById.get(String(item.category));
      } else if (item.category && catMapByName.has(String(item.category).toLowerCase())) {
        item.category = catMapByName.get(String(item.category).toLowerCase());
      }
      return item;
    });
  } catch (err) {
    console.warn("Failed to fetch wardrobe items:", err);
    return [];
  }
}

/**
 * Request AI Styling recommendations by occasion and body shape.
 * Calls backend OutfitController endpoint: POST /api/outfit/occasion
 * @param {Object} payload - { message, occasion, bodyShape, productTitle, productCategory, productColor, productImageUrl, bodyImageUrl }
 * @param {number} maxOutfits - Number of outfits to request (default 3)
 */
export async function getAIOutfitsByOccasion(payload, maxOutfits = 3) {
  try {
    return await apiFetch(`/api/outfit/occasion?maxOutfits=${maxOutfits}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("getAIOutfitsByOccasion failed:", error);
    throw error;
  }
}

/**
 * Request AI Try-On realistic image (product + body).
 * Note: Backend currently has endpoint in OutfitController.java for outfit recommendations,
 * while AI try-on real image generation endpoint (/api/outfit/try-on) is pending backend addition (P0).
 * This connects FE cleanly to handle both real try-on image (when available) and styling guide fallback.
 * @param {Object} payload - { message, occasion, bodyShape, productTitle, productCategory, productColor, productImageUrl, bodyImageUrl }
 */
export async function getAITryOnImage(payload) {
  try {
    return await apiFetch(`/api/outfit/try-on`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn("getAITryOnImage endpoint not available yet or failed:", error?.message);
    return null;
  }
}
