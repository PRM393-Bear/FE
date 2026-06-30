/**
 * EcoCycle – Wardrobe API Service
 * Integrates with backend WardrobeItemController
 */

import { apiFetch } from "../utils/api.js";

export async function getMyWardrobe() {
  return await apiFetch("/api/wardrobe-items/my-wardrobe");
}
