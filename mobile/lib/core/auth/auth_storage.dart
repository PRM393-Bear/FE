import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthStorage {
  static const _storage = FlutterSecureStorage();

  /// Lưu role lấy được từ /api/user/me ngay sau khi login,
  /// vì JWT hiện tại chưa mang claim role.
  static Future<void> saveRole(String role) async {
    await _storage.write(key: 'user_role', value: role.toUpperCase());
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

  /// Dùng khi logout để xoá sạch cả token lẫn role đã lưu
  static Future<void> clear() async {
    await _storage.delete(key: 'auth_token');
    await _storage.delete(key: 'user_role');
  }
}
