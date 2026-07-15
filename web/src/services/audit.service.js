/**
 * EcoCycle Web - Audit Log Service
 * Handles fetching audit logs from API or gracefully fallback if BE only pushes to external service.
 */

import { apiFetch } from "../utils/api.js";

const localSessionAuditLogs = [];

export function recordLocalAuditLog({ action, username, entity, entityId, detail, status }) {
  localSessionAuditLogs.unshift({
    id: `session-log-${Date.now()}`,
    action: action || "ACTION",
    username: username || "Admin",
    entity: entity || "System",
    entityId: entityId || "",
    detail: detail || "",
    status: status || "SUCCESS",
    timestamp: new Date().toISOString()
  });
}

export function getLocalSessionAuditLogs() {
  return localSessionAuditLogs;
}

export async function getAuditLogs(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.action) params.append("action", filters.action);
    if (filters.username) params.append("username", filters.username);
    if (filters.status) params.append("status", filters.status);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const res = await apiFetch(`/api/audit-logs${queryString}`);
    if (Array.isArray(res) && res.length > 0) {
      return [...localSessionAuditLogs, ...res];
    }
    throw new Error("No backend logs returned");
  } catch (error) {
    console.warn("Audit logs GET endpoint not directly exposed by current backend or returned error:", error.message);
    throw error;
  }
}
