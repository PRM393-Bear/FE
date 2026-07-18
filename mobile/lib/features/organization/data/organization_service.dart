import '../../../core/network/api_client.dart';
import '../../../core/auth/auth_storage.dart';
import 'organization_detail_model.dart';

class OrganizationService {
  /// Workaround: BE chưa có GET /organization-details/mine (xem mục 0.3 trong
  /// tài liệu hướng dẫn). Lấy toàn bộ list rồi lọc theo userId của JWT.
  static Future<OrganizationDetailModel?> getMine() async {
    final myUserId = await AuthStorage.getCurrentUserId();
    if (myUserId == null) return null;

    final res = await ApiClient.dio.get('/api/organization-details');
    final list = (res.data as List)
        .map((e) => OrganizationDetailModel.fromJson(e as Map<String, dynamic>))
        .toList();

    for (final org in list) {
      if (org.userId == myUserId) return org;
    }
    return null;
  }

  static Future<List<OrganizationDetailModel>> getNearby({
    required double latitude,
    required double longitude,
    double radius = 50.0,
  }) async {
    final res = await ApiClient.dio.get('/api/organization-details/nearby', queryParameters: {
      'latitude': latitude,
      'longitude': longitude,
      'radius': radius,
    });
    return (res.data as List)
        .map((e) => OrganizationDetailModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}