class ReviewModel {
  final String id;
  final String orderId;
  final String? reviewerName;
  final int rating;
  final String? comment;
  final DateTime? createdAt;
  final String? productTitle;

  ReviewModel({
    required this.id,
    required this.orderId,
    this.reviewerName,
    required this.rating,
    this.comment,
    this.createdAt,
    this.productTitle,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id']?.toString() ?? '',
      orderId: json['orderId']?.toString() ?? '',
      reviewerName: json['reviewerName']?.toString(),
      rating: (json['rating'] as num?)?.toInt() ?? 0,
      comment: json['comment']?.toString(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      productTitle: json['productTitle']?.toString(),
    );
  }
}
