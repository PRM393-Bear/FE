class CatalogSuggestionModel {
  final String id;
  final String name;
  final int price;
  final bool inStock;
  final String? imageUrl;

  CatalogSuggestionModel({
    required this.id,
    required this.name,
    required this.price,
    required this.inStock,
    this.imageUrl,
  });

  factory CatalogSuggestionModel.fromJson(Map<String, dynamic> json) {
    final images = json['images'] as List?;
    String? img;
    if (images != null && images.isNotEmpty) {
      final first = images.first?.toString();
      // Một số item mẫu chỉ có tên file giả (vd "beige-linen-1.jpg"), không phải URL thật
      // -> chỉ nhận nếu là URL http thật, tránh Image.network load lỗi liên tục.
      if (first != null && first.startsWith('http')) img = first;
    }
    return CatalogSuggestionModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      price: (json['price'] as num?)?.toInt() ?? 0,
      inStock: json['in_stock'] as bool? ?? true,
      imageUrl: img,
    );
  }
}