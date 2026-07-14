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

