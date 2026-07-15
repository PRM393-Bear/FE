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
    // BE hiện tại trả về "name" (không phải "title") và "imageUrl" dạng
    // 1 String đơn lẻ (không phải mảng "images") — đọc linh hoạt cả 2 kiểu
    // để không vỡ nếu BE sau này đổi lại đúng chuẩn "title"/"images".
    List<String> parsedImages;
    if (json['images'] != null) {
      parsedImages = List<String>.from(json['images']);
    } else if (json['imageUrl'] != null &&
        (json['imageUrl'] as String).isNotEmpty) {
      parsedImages = [json['imageUrl'] as String];
    } else {
      parsedImages = <String>[];
    }

    return WardrobeModel(
      id: (json['id'] ?? json['itemId'])?.toString() ?? '', // đọc cả 2 tên field, phòng khi BE đặt tên khác
      productId: json['productId']?.toString() ?? '',
      title: (json['title'] ?? json['name'] ?? '') as String,
      brand: json['brand'],
      size: json['size'],
      color: json['color'],
      category: json['category'],
      images: parsedImages,
      status: json['status'] ?? 'AVAILABLE',
    );
  }
}