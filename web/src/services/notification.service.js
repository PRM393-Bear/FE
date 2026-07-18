import { apiFetch } from "../utils/api.js";

export async function getMyNotifications() {
  return await apiFetch("/api/notifications/my-notifications");
}

export async function markNotificationAsRead(id) {
  return await apiFetch(`/api/notifications/${id}/read`, { method: "PUT" });
}
