/**
 * EcoCycle Web - Cart API Service
 * Handles API operations for shopping cart.
 */

import { apiFetch } from "../utils/api.js";

export async function addToCart(productId) {
  return await apiFetch(`/api/cart/add?productId=${productId}`, {
    method: "POST",
  });
}

export async function getCart() {
  try {
    const data = await apiFetch("/api/cart");
    return data || { items: [], totalAmount: 0 };
  } catch (error) {
    console.warn("Failed to fetch cart:", error);
    return { items: [], totalAmount: 0 };
  }
}

export async function removeItem(cartItemId) {
  return await apiFetch(`/api/cart?cartItemId=${cartItemId}`, {
    method: "DELETE",
  });
}

export async function clearCart() {
  return await apiFetch("/api/cart/clear", {
    method: "DELETE",
  });
}
