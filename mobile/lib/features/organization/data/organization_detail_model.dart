class OrganizationDetailModel {
  final String id;
  final String userId;
  final String orgName;
  final String description;
  final String address;
  final String? websiteUrl;
  final double? latitude;
  final double? longitude;
  final String? avtOrg;
  final List<String> acceptedTypes;
  final String status;

  OrganizationDetailModel({
    required this.id,
    required this.userId,
    required this.orgName,
    required this.description,
    required this.address,
    this.websiteUrl,
    this.latitude,
    this.longitude,
    this.avtOrg,
    required this.acceptedTypes,
    required this.status,
  });

  factory OrganizationDetailModel.fromJson(Map<String, dynamic> json) {
    return OrganizationDetailModel(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      orgName: json['orgName'] ?? '',
      description: json['description'] ?? '',
      address: json['address'] ?? '',
      websiteUrl: json['websiteUrl'],
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      avtOrg: json['avtOrg'],
      acceptedTypes: List<String>.from(json['acceptedTypes'] ?? []),
      status: json['status'] ?? '',
    );
  }
}