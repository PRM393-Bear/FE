class ProductModel {
  final String id;
  final String title;
  final String description;
  final String category;
  final String type;        // ITEM | BUNDLE
  final int condition;      // 1-5
  final double price;
  final String size;
  final String color;
  final List<String> images;
  final List<String> aiTags;
  final String status;
  final String sellerId;
  final String sellerName;

  // FE-only fields (giữ lại để không phải sửa nhiều chỗ)
  final bool isFavorite;

  const ProductModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.type,
    required this.condition,
    required this.price,
    required this.size,
    required this.color,
    required this.images,
    required this.aiTags,
    required this.status,
    required this.sellerId,
    required this.sellerName,
    this.isFavorite = false,
  });

  // Lấy ảnh đầu tiên hoặc placeholder
  String get imageUrl =>
      images.isNotEmpty ? images.first : '';

  // Condition text
  String get conditionText {
    switch (condition) {
      case 5: return 'Mới';
      case 4: return 'Gần như mới';
      case 3: return 'Tốt';
      case 2: return 'Khá tốt';
      default: return 'Cũ';
    }
  }

  // Parse từ JSON của BE
  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      type: json['type'] ?? 'ITEM',
      condition: (json['condition'] as num?)?.toInt() ?? 3,
      price: (json['price'] as num?)?.toDouble() ?? 0,
      size: json['size'] ?? '',
      color: json['color'] ?? '',
      images: (json['images'] as List<dynamic>?)
          ?.map((e) => e.toString())
          .toList() ??
          [],
      aiTags: (json['aiTags'] as List<dynamic>?)
          ?.map((e) => e.toString())
          .toList() ??
          [],
      status: json['status'] ?? '',
      sellerId: json['sellerId']?.toString() ?? '',
      sellerName: json['sellerName'] ?? '',
    );
  }
}