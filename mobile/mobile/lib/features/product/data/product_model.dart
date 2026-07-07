class ProductModel {
  final String id;
  final String title;
  final double price;
  final String imageUrl;
  final double rating;
  final String condition;
  final String location;
  final String sellerName;
  final double sellerRating;
  final int sellerReviews;
  final String description;
  final List<String> tags;
  final String category;
  final bool isFavorite;

  const ProductModel({
    required this.id,
    required this.title,
    required this.price,
    required this.imageUrl,
    required this.rating,
    required this.condition,
    required this.location,
    required this.sellerName,
    required this.sellerRating,
    required this.sellerReviews,
    required this.description,
    required this.tags,
    required this.category,
    this.isFavorite = false,
  });
}