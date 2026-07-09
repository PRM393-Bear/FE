// mobile/lib/features/cart/data/cart_model.dart
class CartItemModel {
  final String cartItemId;
  final String productId;
  final String productName;
  final double price;

  CartItemModel({
    required this.cartItemId,
    required this.productId,
    required this.productName,
    required this.price,
  });

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    return CartItemModel(
      cartItemId: json['cartItemId']?.toString() ?? '',
      productId: json['productId']?.toString() ?? '',
      productName: json['productName'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0,
    );
  }
}

class CartModel {
  final String cartId;
  final String userId;
  final List<CartItemModel> items;
  final double totalPrice;

  CartModel({
    required this.cartId,
    required this.userId,
    required this.items,
    required this.totalPrice,
  });

  factory CartModel.fromJson(Map<String, dynamic> json) {
    return CartModel(
      cartId: json['cartId']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      items: (json['items'] as List<dynamic>? ?? [])
          .map((e) => CartItemModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 0,
    );
  }
}