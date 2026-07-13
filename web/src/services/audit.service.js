/**
 * EcoCycle Web - Audit Log Service
 * Handles fetching audit logs from API or gracefully fallback if BE only pushes to external service.
 */

import { apiFetch } from "../utils/api.js";

export async function getAuditLogs(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.action) params.append("action", filters.action);
    if (filters.username) params.append("username", filters.username);
    if (filters.status) params.append("status", filters.status);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return await apiFetch(`/api/audit-logs${queryString}`);
  } catch (error) {
    console.warn("Audit logs GET endpoint not directly exposed by current backend or returned error:", error.message);
    // Return gracefully or throw depending on UI requirement. We return an object indicating status or fallback list if needed.
    throw error;
  }
}
