class DonationRequestModel {
  final String id;
  final String username;
  final String description;
  final String organizationName;
  final String? eventName;
  final String? trackingCode;
  final DateTime? createdAt;
  final String status;
  final List<String> images;

  DonationRequestModel({
    required this.id,
    required this.username,
    required this.description,
    required this.organizationName,
    this.eventName,
    this.trackingCode,
    this.createdAt,
    required this.status,
    this.images = const [],
  });

  factory DonationRequestModel.fromJson(Map<String, dynamic> json) {
    return DonationRequestModel(
      id: json['id']?.toString() ?? '',
      username: json['username'] ?? 'Người dùng',
      description: json['description'] ?? '',
      organizationName: json['organizationName'] ?? '',
      eventName: json['eventName'],
      trackingCode: json['trackingCode'],
      createdAt:
          json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      // TODO(BE): field "status" chưa có trong DonationPendingResponse — xem
      // mục 8.0. Mặc định PENDING để không vỡ UI trong lúc chờ BE thêm.
      status: json['status'] ?? 'PENDING',
      images:
          (json['images'] as List<dynamic>?)?.map((e) => e.toString()).toList() ??
              [],
    );
  }

  String get timeAgoText {
    if (createdAt == null) return '';
    final diff = DateTime.now().difference(createdAt!);
    if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
    if (diff.inHours < 24) return '${diff.inHours} giờ trước';
    return '${diff.inDays} ngày trước';
  }
}
