import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthStorage {
  static const _storage = FlutterSecureStorage();

  /// Lưu role lấy được từ /api/user/me ngay sau khi login,
  /// vì JWT hiện tại chưa mang claim role (BE chưa bổ sung).
  static Future<void> saveRole(String role) async {
    await _storage.write(key: 'user_role', value: role.toUpperCase());
  }

  /// Cache trạng thái duyệt hồ sơ Tổ chức lần gần nhất, lấy trực tiếp từ
  /// field `organizationStatus` trong response `/api/auth/login`.
  static Future<void> saveOrganizationStatus(String? status) async {
    if (status == null) {
      await _storage.delete(key: 'organization_status');
    } else {
      await _storage.write(key: 'organization_status', value: status);
    }
  }

  static Future<String?> getOrganizationStatus() async {
    return _storage.read(key: 'organization_status');
  }

  static Future<String?> getRole() async {
    // Ưu tiên đọc role đã lưu trực tiếp (lấy từ /api/user/me lúc login)
    final savedRole = await _storage.read(key: 'user_role');
    if (savedRole != null) return savedRole;

    // Fallback: vẫn thử đọc claim role trong JWT, phòng khi BE sau này bổ sung
    final token = await _storage.read(key: 'auth_token');
    if (token == null) return null;
    try {
      final parts = token.split('.');
      String payload = parts[1];
      while (payload.length % 4 != 0) payload += '=';
      final decoded = utf8.decode(base64Url.decode(payload));
      final claims = jsonDecode(decoded) as Map<String, dynamic>;

      debugPrint('🟢 JWT claims: $claims');

      final rawRole = claims['role'] ?? (claims['roles'] is List ? claims['roles'][0] : null);
      if (rawRole == null) return null;

      String roleStr = rawRole.toString().toUpperCase();
      if (roleStr.startsWith('ROLE_')) {
        roleStr = roleStr.substring(5);
      }

      debugPrint('🟢 Final Role: $roleStr');
      return roleStr;
    } catch (e) {
      debugPrint('🔴 Decode JWT error: $e');
      return null;
    }
  }

  /// true nếu đang có token đăng nhập đã lưu (bất kể đã biết role hay chưa).
  /// Dùng để phân biệt Guest (chưa đăng nhập) với user đã đăng nhập —
  /// khác với getRole(), hàm này không suy luận role mặc định.
  static Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: 'auth_token');
    return token != null && token.isNotEmpty;
  }

  /// Dùng khi logout để xoá sạch cả token lẫn role đã lưu
  static Future<void> clear() async {
    await _storage.delete(key: 'auth_token');
    await _storage.delete(key: 'user_role');
    await _storage.delete(key: 'organization_status');
    // Không xoá 'has_seen_approved' ở đây để ghi nhớ vĩnh viễn việc đã xem thông báo
  }

  static Future<void> markSeenApproved() async {
    await _storage.write(key: 'has_seen_approved', value: 'true');
  }

  static Future<bool> hasSeenApproved() async {
    final val = await _storage.read(key: 'has_seen_approved');
    return val == 'true';
  }

  /// Lấy userId của tài khoản đang đăng nhập, decode trực tiếp từ JWT.
  static Future<String?> getCurrentUserId() async {
    final token = await _storage.read(key: 'auth_token');
    if (token == null) return null;
    try {
      final parts = token.split('.');
      String payload = parts[1];
      while (payload.length % 4 != 0) payload += '=';
      final decoded = utf8.decode(base64Url.decode(payload));
      final claims = jsonDecode(decoded) as Map<String, dynamic>;
      return claims['userId']?.toString() ?? claims['sub']?.toString();
    } catch (_) {
      return null;
    }
  }

  static Future<void> addMyCampaignId(String id) async {
    final ids = await getMyCampaignIds();
    if (!ids.contains(id)) {
      ids.add(id);
      await _storage.write(key: 'my_campaign_ids', value: ids.join(','));
    }
  }

  static Future<List<String>> getMyCampaignIds() async {
    final raw = await _storage.read(key: 'my_campaign_ids');
    if (raw == null || raw.isEmpty) return [];
    return raw.split(',');
  }
}
