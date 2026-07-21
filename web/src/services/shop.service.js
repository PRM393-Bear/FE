import { apiFetch } from "../utils/api.js";

export async function createShop(shopData) {
  return await apiFetch("/api/shops", {
    method: "POST",
    body: JSON.stringify(shopData),
  });
}

export async function updateShop(shopId, shopData) {
  return await apiFetch(`/api/shops/${shopId}`, {
    method: "PUT",
    body: JSON.stringify(shopData),
  });
}

export async function deleteShop(shopId) {
  return await apiFetch(`/api/shops/${shopId}`, {
    method: "DELETE",
  });
}

export async function getShop(shopId) {
  return await apiFetch(`/api/shops/${shopId}`);
}
