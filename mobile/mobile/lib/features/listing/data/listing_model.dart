class ListingModel {
  final String title;
  final String category;
  final String brand;
  final String color;
  final String condition;
  final List<String> tags;
  final double price;
  final String size;
  final String description;
  final bool shipNationwide;
  final bool meetInPerson;
  final double? shippingFee;
  final List<String> imagePaths;

  const ListingModel({
    required this.title,
    required this.category,
    required this.brand,
    required this.color,
    required this.condition,
    required this.tags,
    required this.price,
    required this.size,
    required this.description,
    required this.shipNationwide,
    required this.meetInPerson,
    this.shippingFee,
    required this.imagePaths,
  });
}