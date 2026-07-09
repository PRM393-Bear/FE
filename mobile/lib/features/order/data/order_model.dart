// mobile/lib/features/order/data/order_model.dart
class OrderItemModel {
  final String id;
  final String productId;
  final String productTitle;
  final String? productImage;
  final double unitPrice;

  OrderItemModel({
    required this.id,
    required this.productId,
    required this.productTitle,
    this.productImage,
    required this.unitPrice,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: json['id']?.toString() ?? '',
      productId: json['productId']?.toString() ?? '',
      productTitle: json['productTitle'] ?? '',
      productImage: json['productImage'],
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0,
    );
  }
}

class OrderModel {
  final String id;
  final double totalAmount;
  final String status; // PENDING, PROCESSING, SHIPPING, RECEIVED, COMPLETED, CANCELLED
  final String createdAt;
  final String? trackingCode;
  final String? deliveryPhotoUrl;
  final String buyerId;
  final String buyerName;
  final String sellerId;
  final String sellerName;
  final List<OrderItemModel> items;

  OrderModel({
    required this.id,
    required this.totalAmount,
    required this.status,
    required this.createdAt,
    this.trackingCode,
    this.deliveryPhotoUrl,
    required this.buyerId,
    required this.buyerName,
    required this.sellerId,
    required this.sellerName,
    required this.items,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id']?.toString() ?? '',
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0,
      status: json['status'] ?? 'PENDING',
      createdAt: json['createdAt']?.toString() ?? '',
      trackingCode: json['trackingCode'],
      deliveryPhotoUrl: json['deliveryPhotoUrl'],
      buyerId: json['buyerId']?.toString() ?? '',
      buyerName: json['buyerName'] ?? '',
      sellerId: json['sellerId']?.toString() ?? '',
      sellerName: json['sellerName'] ?? '',
      items: (json['items'] as List<dynamic>?)
          ?.map((e) => OrderItemModel.fromJson(e as Map<String, dynamic>))
          .toList() ??
          [],
    );
  }
}