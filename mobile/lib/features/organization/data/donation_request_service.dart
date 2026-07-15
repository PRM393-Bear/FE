import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import 'donation_request_model.dart';

class DonationRequestService {
  /// BE cần thêm endpoint này — xem mục 8.0. API /lists cũ KHÔNG dùng được
  /// cho màn hình này (chỉ trả PENDING quá hạn 5 ngày).
  static Future<List<DonationRequestModel>> getMyOrganizationRequests() async {
    final res = await ApiClient.dio.get('/api/donation-requests/my-organization');
    return (res.data as List)
        .map((e) => DonationRequestModel.fromJson(e as Map<String, dynamic>))
        .toList();
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
}