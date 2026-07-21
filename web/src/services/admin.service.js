/**
 * EcoCycle Web - Admin API Service
 * Handles API calls for the admin dashboard.
 */

import { apiFetch } from "../utils/api.js";

export async function getAllUsers() {
  try {
    return await apiFetch("/api/user/all");
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function banUser(userId, isBanned, reason = "Vi phạm điều khoản sử dụng cộng đồng EcoCycle") {
  return await apiFetch(`/api/user/banned?userId=${userId}&isBanned=${isBanned}&reason=${encodeURIComponent(reason)}`, {
    method: "PUT",
  });
}

export async function getListBanned(isBanned) {
  return await apiFetch(`/api/user/list-banned?isBanned=${isBanned}`);
}

export async function createStaff(userData) {
  return await apiFetch("/api/user/staff", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function getAllDonationRequests() {
  try {
    return await apiFetch("/api/donation-requests/lists");
  } catch (error) {
    console.error("Failed to fetch donation requests:", error);
    return [];
  }
}

export async function getPendingOrganizations() {
  try {
    const pendingOrgs = await apiFetch("/api/organization-details/pending");
    if (Array.isArray(pendingOrgs)) {
      return pendingOrgs.filter(org => org.status === "PENDING");
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch pending organizations:", error);
    return [];
  }
}

export async function approveOrganization(id) {
  return await apiFetch(`/api/organization-details/${id}/approve`, {
    method: "PATCH",
  });
}

export async function rejectOrganization(id, reason = "Hồ sơ không đáp ứng đủ điều kiện xác thực") {
  return await apiFetch(`/api/organization-details/${id}/reject?reason=${encodeURIComponent(reason)}`, {
    method: "PATCH",
  });
}

export async function getUserChartByRole() {
  try {
    return await apiFetch("/api/user/chart/by-role");
  } catch (error) {
    console.error("Failed to fetch user chart by role:", error);
    return [];
  }
}

export async function getUserChartByStatus() {
  try {
    return await apiFetch("/api/user/chart/by-status");
  } catch (error) {
    console.error("Failed to fetch user chart by status:", error);
    return [];
  }
}
