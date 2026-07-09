// mobile/lib/features/order/presentation/pages/my_orders_page.dart
import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../data/order_model.dart';
import 'order_detail_page.dart';

class MyOrdersPage extends StatefulWidget {
  const MyOrdersPage({super.key});

  @override
  State<MyOrdersPage> createState() => _MyOrdersPageState();
}

class _MyOrdersPageState extends State<MyOrdersPage> {
  List<OrderModel> _orders = [];
  bool _isLoading = true;
  String _selectedTab = 'Tất cả';
  final List<String> _tabs = ['Tất cả', 'Chờ xác nhận', 'Đang giao', 'Hoàn tất'];

  @override
  void initState() {
    super.initState();
    _fetchOrders();
  }

  Future<void> _fetchOrders() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiClient.dio.get('/api/orders/history/all');
      final list = (res.data as List)
          .map((e) => OrderModel.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() {
        _orders = list;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch orders error: $e');
      setState(() => _isLoading = false);
    }
  }

  List<OrderModel> get _filteredOrders {
    switch (_selectedTab) {
      case 'Chờ xác nhận':
        return _orders
            .where((o) => o.status == 'PENDING' || o.status == 'PROCESSING')
            .toList();
      case 'Đang giao':
        return _orders.where((o) => o.status == 'SHIPPING').toList();
      case 'Hoàn tất':
        return _orders
            .where((o) => o.status == 'RECEIVED' || o.status == 'COMPLETED')
            .toList();
      default:
        return _orders;
    }
  }

  String _statusText(String status) {
    switch (status) {
      case 'PENDING':
        return 'Chờ người bán xác nhận';
      case 'PROCESSING':
        return 'Đang chuẩn bị hàng';
      case 'SHIPPING':
        return 'Đang giao';
      case 'RECEIVED':
        return 'Đã nhận hàng';
      case 'COMPLETED':
        return 'Hoàn tất';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'PENDING':
      case 'PROCESSING':
        return AppColors.secondary;
      case 'SHIPPING':
        return AppColors.tertiary;
      case 'RECEIVED':
      case 'COMPLETED':
        return AppColors.primary;
      case 'CANCELLED':
        return AppColors.error;
      default:
        return AppColors.neutral;
    }
  }

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Đơn hàng của tôi', style: AppTextStyles.headline3),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 44,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _tabs.length,
              itemBuilder: (context, index) {
                final tab = _tabs[index];
                final isSelected = tab == _selectedTab;
                return GestureDetector(
                  onTap: () => setState(() => _selectedTab = tab),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary : AppColors.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected ? AppColors.primary : AppColors.border,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        tab,
                        style: AppTextStyles.label.copyWith(
                          color: isSelected ? Colors.white : AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: _isLoading
                ? const Center(
                child: CircularProgressIndicator(color: AppColors.primary))
                : _filteredOrders.isEmpty
                ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.receipt_long_outlined,
                      size: 60, color: AppColors.neutral),
                  const SizedBox(height: 12),
                  Text('Chưa có đơn hàng nào',
                      style: AppTextStyles.bodyLarge),
                ],
              ),
            )
                : RefreshIndicator(
              color: AppColors.primary,
              onRefresh: _fetchOrders,
              child: ListView.builder(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                itemCount: _filteredOrders.length,
                itemBuilder: (context, index) {
                  final order = _filteredOrders[index];
                  final item =
                  order.items.isNotEmpty ? order.items.first : null;
                  return GestureDetector(
                    onTap: () async {
                      await Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) =>
                              OrderDetailPage(orderId: order.id),
                        ),
                      );
                      _fetchOrders();
                    },
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: item?.productImage != null &&
                                item!.productImage!.isNotEmpty
                                ? Image.network(
                              item.productImage!,
                              width: 64,
                              height: 64,
                              fit: BoxFit.cover,
                            )
                                : Container(
                              width: 64,
                              height: 64,
                              color: AppColors.background,
                              child: const Icon(
                                  Icons.image_outlined,
                                  color: AppColors.neutral),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment:
                              CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item?.productTitle ?? 'Đơn hàng',
                                  style: AppTextStyles.bodyLarge
                                      .copyWith(
                                      fontWeight: FontWeight.w600),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 4),
                                Text('Người bán: ${order.sellerName}',
                                    style: AppTextStyles.bodyMedium),
                                const SizedBox(height: 6),
                                Row(
                                  mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      '${_formatPrice(order.totalAmount)}đ',
                                      style: AppTextStyles.bodyLarge
                                          .copyWith(
                                          color: AppColors.primary,
                                          fontWeight:
                                          FontWeight.w700),
                                    ),
                                    Container(
                                      padding:
                                      const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 3),
                                      decoration: BoxDecoration(
                                        color: _statusColor(
                                            order.status)
                                            .withOpacity(0.1),
                                        borderRadius:
                                        BorderRadius.circular(20),
                                      ),
                                      child: Text(
                                        _statusText(order.status),
                                        style: AppTextStyles.label
                                            .copyWith(
                                          color: _statusColor(
                                              order.status),
                                          fontSize: 11,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}