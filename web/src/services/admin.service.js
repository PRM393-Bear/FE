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

export async function rejectOrganization(id) {
  return await apiFetch(`/api/organization-details/${id}/reject`, {
    method: "PATCH",
  });
}

