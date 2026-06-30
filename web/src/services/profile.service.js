/**
 * EcoCycle – Profile Service
 * Real API calls for all user profile actions and donation workflows.
 */

import { getToken, getUser, getUserIdFromToken, saveUser } from "./auth.service.js";
import { apiFetch } from "../utils/api.js";

/* ════════════════════════════════════════════
   PROFILE API CALLS
   ════════════════════════════════════════════ */

export async function getMyProfile() {
  let userId = getUserIdFromToken();
  const localUser = getUser();
  const rawRole = localUser?.role || "MEMBER";
  const username = localUser?.username;

  let role = "member";
  if (rawRole.toUpperCase() === "ADMIN") role = "admin";
  else if (rawRole.toUpperCase() === "ORGANIZATION" || rawRole.toUpperCase() === "ORG") role = "org";

  if (!userId && username) {
    try {
      const allProducts = await apiFetch("/api/products");
      const matchedProduct = allProducts.find((p) => p.sellerName === username);
      if (matchedProduct) {
        userId = matchedProduct.sellerId;
      }
    } catch (err) {
      console.error("getMyProfile: Failed to resolve userId from products API:", err);
    }
  }

  if (!userId) {
    try {
      const allProducts = await apiFetch("/api/products");
      if (allProducts && allProducts.length > 0) {
        userId = allProducts[0].sellerId;
      }
    } catch (e) {
      console.error("getMyProfile: Final fallback failed:", e);
    }
  }

  if (!userId) {
    throw new Error("No user ID found in token and failed to resolve from products.");
  }

  const userDetails = await apiFetch("/api/user/me");

  return {
    id: userId,
    role: role,
    username: userDetails.username,
    name: userDetails.fullName || userDetails.username,
    email: userDetails.email || "",
    phone: userDetails.phone || "",
    avatar: userDetails.avatarUrl || userDetails.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.fullName || userDetails.username || 'U')}&background=006B2C&color=fff`,
    bio: userDetails.bio || "Thành viên tích cực của cộng đồng EcoCycle.",
    location: userDetails.address || userDetails.location || "Việt Nam",
    posts: []
  };
}

export async function updateUserProfile(userId, { fullName, email, phone, username }) {
  const res = await apiFetch("/api/user/me", {
    method: "PUT",
    body: JSON.stringify({ fullName, email, phone, username }),
  });

  const localUser = getUser();
  if (localUser) {
    localUser.username = username;
    saveUser(localUser);
  }

  return res;
}

export async function getProfileById(id) {
  try {
    return await apiFetch(`/api/profile/${id}`);
  } catch {
    return null;
  }
}

export async function getProfilePosts(id) {
  try {
    return await apiFetch(`/api/profile/${id}/posts`);
  } catch {
    return [];
  }
}

export async function getProfileReviews(id) {
  try {
    return await apiFetch(`/api/profile/${id}/reviews`);
  } catch {
    return [];
  }
}

export async function getProfileEvents(id) {
  try {
    return await apiFetch(`/api/profile/${id}/events`);
  } catch {
    return [];
  }
}

export async function getProfileDonations(id) {
  try {
    return await apiFetch(`/api/profile/${id}/donations`);
  } catch {
    return [];
  }
}

/* ── DONATION FLOW API METHODS ── */

export async function createDonationRequestApi(payload) {
  return await apiFetch("/api/donation-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function acceptDonationRequest(id) {
  return await apiFetch(`/api/donation-requests/${id}/accept`, {
    method: "PATCH",
  });
}

export async function rejectDonationRequest(id, reason) {
  return await apiFetch(`/api/donation-requests/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

export async function shippingDonationRequest(id) {
  return await apiFetch(`/api/donation-requests/${id}/shipping`, {
    method: "PATCH",
  });
}

export async function shippedDonationRequest(id) {
  return await apiFetch(`/api/donation-requests/${id}/shipped`, {
    method: "PATCH",
  });
}

export async function receivedDonationRequest(id) {
  return await apiFetch(`/api/donation-requests/${id}/received`, {
    method: "PATCH",
  });
}

export async function completedDonationRequest(id) {
  return await apiFetch(`/api/donation-requests/${id}/completed`, {
    method: "PATCH",
  });
}

export async function cancelDonationRequest(id, reason) {
  return await apiFetch(`/api/donation-requests/${id}/cancel`, {
    method: "PATCH",
    body: reason, // Send text raw as expected by backend controller
  });
}

export async function assignOrganizationApi(donationId, organizationId) {
  return await apiFetch(`/api/donation-requests/${donationId}/assign-organization/${organizationId}`, {
    method: "PATCH",
  });
}

export async function getAllOrganizationsApi() {
  return await apiFetch("/api/organization-details");
}

export async function getAllDonationEventsApi() {
  return await apiFetch("/api/donation-events");
}
