/**
 * EcoCycle – Order API Service
 * Integrates with backend OrderController
 */

import { apiFetch } from "../utils/api.js";

export async function createOrder(productId) {
  return await apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}

export async function confirmOrder(orderId) {
  return await apiFetch(`/api/orders/confirm?orderId=${orderId}`, {
    method: "PUT",
  });
}

export async function shipOrder(orderId, trackingCode) {
  return await apiFetch(`/api/orders/${orderId}/ship?trackingCode=${encodeURIComponent(trackingCode)}`, {
    method: "PUT",
  });
}

export async function confirmReceived(orderId) {
  return await apiFetch(`/api/orders/${orderId}/receive`, {
    method: "PUT",
  });
}

export async function getOrdersByBuyer() {
  return await apiFetch("/api/orders/buyer");
}

export async function getOrdersBySeller() {
  return await apiFetch("/api/orders/seller");
}

export async function getOrderById(orderId) {
  return await apiFetch(`/api/orders/${orderId}`);
}
