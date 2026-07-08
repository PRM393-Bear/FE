import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthStorage {
  static const _storage = FlutterSecureStorage();

  static Future<String?> getRole() async {
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
}
