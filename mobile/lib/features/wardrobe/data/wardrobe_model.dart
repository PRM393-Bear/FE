class WardrobeModel {
  final String id;
  final String productId;
  final String title;
  final String? brand;
  final String? size;
  final String? color;
  final String? category;
  final List<String> images;
  final String status; // AVAILABLE, SOLD, DONATED

  WardrobeModel({
    required this.id,
    required this.productId,
    required this.title,
    this.brand,
    this.size,
    this.color,
    this.category,
    required this.images,
    required this.status,
  });

  String get imageUrl => images.isNotEmpty ? images.first : '';

  factory WardrobeModel.fromJson(Map<String, dynamic> json) {
    return WardrobeModel(
      id: json['id']?.toString() ?? '',
      productId: json['productId']?.toString() ?? '',
      title: json['title'] ?? '',
      brand: json['brand'],
      size: json['size'],
      color: json['color'],
      category: json['category'],
      images: List<String>.from(json['images'] ?? []),
      status: json['status'] ?? 'AVAILABLE',
    );
  }
}