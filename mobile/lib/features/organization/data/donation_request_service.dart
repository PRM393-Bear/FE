import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import 'donation_request_model.dart';

class DonationRequestService {
  /// Đúng route thật của BE: GET /api/donation-requests/my-organization/{orgId}
  /// (không phải /my-organization suông — thiếu orgId sẽ luôn 404).
  static Future<List<DonationRequestModel>> getMyOrganizationRequests(String orgId) async {
    try {
      final res = await ApiClient.dio.get('/api/donation-requests/my-organization/$orgId');
      return (res.data as List)
          .map((e) => DonationRequestModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      // BE ném 404 khi tổ chức chưa có đơn quyên góp nào — coi là danh sách rỗng,
      // không phải lỗi thật, đừng để văng lỗi đỏ lên UI.
      if (e.response?.statusCode == 404) return [];
      rethrow;
    }
  }

  static Future<void> accept(String id) =>
      ApiClient.dio.patch('/api/donation-requests/$id/accept');

  static Future<void> reject(String id, String reason) => ApiClient.dio.patch(
    '/api/donation-requests/$id/reject',
    data: reason,
    options: Options(contentType: 'application/json'),
  );

  static Future<void> confirmReceived(String id, String imagePath) async {
    final formData = FormData.fromMap({
      'receiptProofFile': await MultipartFile.fromFile(imagePath),
    });
    await ApiClient.dio.patch(
      '/api/donation-requests/$id/received',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
    );
  }

  /// Member xem các đơn quyên góp của chính mình.
  static Future<List<DonationRequestModel>> getMyDonations() async {
    try {
      final res = await ApiClient.dio.get('/api/donation-requests/my-member');
      return (res.data as List)
          .map((e) => DonationRequestModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return [];
      rethrow;
    }
  }

  static Future<void> shipping(String id) =>
      ApiClient.dio.patch('/api/donation-requests/$id/shipping');

  static Future<void> shipped(String id, String trackingCode, String imagePath) async {
    final formData = FormData.fromMap({
      'trackingCode': trackingCode,
      'shippingProofFile': await MultipartFile.fromFile(imagePath),
    });
    await ApiClient.dio.patch(
      '/api/donation-requests/$id/shipped',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
    );
  }

  static Future<List<DonationRequestModel>> getMyRequests() async {
    final res = await ApiClient.dio.get('/api/donation-requests/my-requests');
    return (res.data as List)
        .map((e) => DonationRequestModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  static Future<void> submitTrackingCode(String id, String code) =>
      ApiClient.dio.patch(
        '/api/donation-requests/$id/shipping',
        data: code,
        options: Options(contentType: 'application/json'),
      );
}