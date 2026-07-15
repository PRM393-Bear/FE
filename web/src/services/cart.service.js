/**
 * EcoCycle Web - Cart API Service
 * Handles API operations for shopping cart.
 */

import { apiFetch } from "../utils/api.js";
import { getProductById } from "./product.service.js";
import { getUser, getUserIdFromToken } from "./auth.service.js";

export async function addToCart(productId) {
  try {
    const product = await getProductById(productId);
    if (product) {
      const localUser = getUser() || {};
      const tokenUserId = getUserIdFromToken();
      const myUsername = localUser.username || localUser.userName;
      const myUserId = tokenUserId || localUser.id || localUser.userId;
      const isOwner = Boolean(
        (myUserId && (String(product.sellerId) === String(myUserId) || String(product.sellerUserId) === String(myUserId) || String(product.userId) === String(myUserId))) ||
        (myUsername && (String(product.sellerName || "").toLowerCase() === String(myUsername).toLowerCase() || String(product.sellerUsername || "").toLowerCase() === String(myUsername).toLowerCase() || String(product.username || "").toLowerCase() === String(myUsername).toLowerCase()))
      );
      if (isOwner) {
        throw new Error("Sản phẩm do chính bạn đăng bán nên không thể thêm vào giỏ hàng.");
      }
    }
  } catch (err) {
    if (err.message && err.message.includes("đăng bán")) throw err;
  }
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
