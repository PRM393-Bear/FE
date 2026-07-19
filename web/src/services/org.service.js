import { apiFetch } from "../utils/api.js";

/**
 * Lấy danh sách các tổ chức xung quanh tọa độ cho trước.
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {number} radius (Tùy chọn, mặc định 50 km)
 */
export async function getNearbyOrganizations(latitude, longitude, radius = 50.0) {
  const query = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    radius: radius.toString()
  });
  return await apiFetch(`/api/organization-details/nearby?${query.toString()}`);
}
