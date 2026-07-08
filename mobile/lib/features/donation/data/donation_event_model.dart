class DonationEventModel {
  final String id;
  final String title;
  final String description;
  final String location;
  final double? latitude;
  final double? longitude;
  final String? startDate;
  final String? endDate;
  final List<String> acceptedTypes;
  final int targetQuantity;
  final int currentQuantity; // sẽ luôn = 0 cho tới khi BE fix
  final String status;
  final String? bannerUrl;
  final String orgName;
  final String? orgAvatarUrl;

  DonationEventModel({
    required this.id,
    required this.title,
    required this.description,
    required this.location,
    this.latitude,
    this.longitude,
    this.startDate,
    this.endDate,
    required this.acceptedTypes,
    required this.targetQuantity,
    required this.currentQuantity,
    required this.status,
    this.bannerUrl,
    required this.orgName,
    this.orgAvatarUrl,
  });

  factory DonationEventModel.fromJson(Map<String, dynamic> json) {
    return DonationEventModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      location: json['location'] ?? '',
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      startDate: json['startDate']?.toString(),
      endDate: json['endDate']?.toString(),
      acceptedTypes: List<String>.from(json['acceptedTypes'] ?? []),
      targetQuantity: json['targetQuantity'] ?? 0,
      currentQuantity: json['currentQuantity'] ?? 0, // TODO: BE chưa trả field này
      status: json['status'] ?? '',
      bannerUrl: json['bannerUrl'],
      orgName: json['orgName'] ?? json['organizationName'] ?? 'Tổ chức',
      orgAvatarUrl: json['avtOrg'] ?? json['organizationAvatar'],
    );
  }

  double get progress =>
      targetQuantity > 0 ? (currentQuantity / targetQuantity).clamp(0, 1) : 0;

  String get daysLeftText {
    if (endDate == null) return '';
    try {
      final end = DateTime.parse(endDate!);
      final diff = end.difference(DateTime.now()).inDays;
      if (diff < 0) return 'Đã kết thúc';
      if (diff == 0) return 'Hôm nay kết thúc';
      return 'Còn $diff ngày';
    } catch (_) {
      return '';
    }
  }
}