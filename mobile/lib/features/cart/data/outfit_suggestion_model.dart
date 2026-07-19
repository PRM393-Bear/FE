class OutfitItemModel {
  final String productId;
  final String name;
  final String category;
  final String color;

  OutfitItemModel({
    required this.productId,
    required this.name,
    required this.category,
    required this.color,
  });

  factory OutfitItemModel.fromJson(Map<String, dynamic> json) {
    return OutfitItemModel(
      productId: json['product_id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      category: json['category']?.toString() ?? '',
      color: json['color']?.toString() ?? '',
    );
  }
}

class OutfitModel {
  final int outfitNumber;
  final double? score;
  final List<OutfitItemModel> items;
  final String description;
  final String colorReason;

  OutfitModel({
    required this.outfitNumber,
    this.score,
    required this.items,
    required this.description,
    required this.colorReason,
  });

  factory OutfitModel.fromJson(Map<String, dynamic> json) {
    final itemsList = (json['items'] as List?) ?? [];
    return OutfitModel(
      outfitNumber: (json['outfit_number'] as num?)?.toInt() ?? 0,
      score: (json['score'] as num?)?.toDouble(),
      items: itemsList
          .map((e) => OutfitItemModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      description: json['description']?.toString() ?? '',
      colorReason: json['color_reason']?.toString() ?? '',
    );
  }
}
