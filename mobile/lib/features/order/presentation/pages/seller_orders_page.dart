// mobile/lib/features/order/presentation/pages/seller_orders_page.dart
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../data/order_model.dart';

class SellerOrdersPage extends StatefulWidget {
  const SellerOrdersPage({super.key});

  @override
  State<SellerOrdersPage> createState() => _SellerOrdersPageState();
}

class _SellerOrdersPageState extends State<SellerOrdersPage> {
  List<OrderModel> _orders = [];
  bool _isLoading = true;
  String _selectedTab = 'Chờ xác nhận';
  final List<String> _tabs = ['Chờ xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Hoàn tất'];

  // Theo dõi order nào đang gọi API để hiện loading riêng cho từng thẻ
  final Set<String> _processingIds = {};

  @override
  void initState() {
    super.initState();
    _fetchOrders();
  }

  Future<void> _fetchOrders() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiClient.dio.get('/api/orders/seller');
      final list = (res.data as List)
          .map((e) => OrderModel.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() {
        _orders = list;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch seller orders error: $e');
      setState(() => _isLoading = false);
    }
  }

  List<OrderModel> get _filteredOrders {
    switch (_selectedTab) {
      case 'Chờ xác nhận':
        return _orders.where((o) => o.status == 'PENDING').toList();
      case 'Đang chuẩn bị':
        return _orders.where((o) => o.status == 'PROCESSING').toList();
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

  Future<void> _confirmOrder(OrderModel order) async {
    setState(() => _processingIds.add(order.id));
    try {
      await ApiClient.dio
          .put('/api/orders/confirm', queryParameters: {'orderId': order.id});
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Đã xác nhận đơn hàng. Chuẩn bị hàng rồi nhập mã vận đơn để giao nhé.'),
        backgroundColor: AppColors.primary,
      ));
      _fetchOrders();
    } on DioException catch (e) {
      debugPrint('🔴 Confirm order error: ${e.response?.data}');
      final data = e.response?.data;
      String msg = 'Xác nhận đơn thất bại';
      if (data is Map && data['message'] != null) msg = data['message'].toString();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(msg),
        backgroundColor: AppColors.error,
      ));
    } finally {
      if (mounted) setState(() => _processingIds.remove(order.id));
    }
  }

  Future<void> _showShipDialog(OrderModel order) async {
    final controller = TextEditingController();
    final trackingCode = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nhập mã vận đơn'),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'VD: GHN123456789',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () {
              final code = controller.text.trim();
              if (code.isEmpty) return;
              Navigator.pop(ctx, code);
            },
            child: const Text('Xác nhận'),
          ),
        ],
      ),
    );
    if (trackingCode == null || trackingCode.isEmpty) return;
    await _shipOrder(order, trackingCode);
  }

  Future<void> _shipOrder(OrderModel order, String trackingCode) async {
    setState(() => _processingIds.add(order.id));
    try {
      await ApiClient.dio.put(
        '/api/orders/${order.id}/ship',
        queryParameters: {'trackingCode': trackingCode},
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Đã nhập mã vận đơn, đơn hàng chuyển sang Đang giao.'),
        backgroundColor: AppColors.primary,
      ));
      _fetchOrders();
    } on DioException catch (e) {
      debugPrint('🔴 Ship order error: ${e.response?.data}');
      final data = e.response?.data;
      String msg = 'Cập nhật mã vận đơn thất bại';
      if (data is Map && data['message'] != null) msg = data['message'].toString();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(msg),
        backgroundColor: AppColors.error,
      ));
    } finally {
      if (mounted) setState(() => _processingIds.remove(order.id));
    }
  }

  String _statusText(String status) {
    switch (status) {
      case 'PENDING':
        return 'Chờ bạn xác nhận';
      case 'PROCESSING':
        return 'Đang chuẩn bị hàng';
      case 'SHIPPING':
        return 'Đang giao';
      case 'RECEIVED':
        return 'Người mua đã nhận';
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
        title: Text('Đơn bán hàng', style: AppTextStyles.headline3),
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
                  const Icon(Icons.storefront_outlined,
                      size: 60, color: AppColors.neutral),
                  const SizedBox(height: 12),
                  Text('Chưa có đơn nào ở mục này',
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
                itemBuilder: (context, index) =>
                    _buildOrderCard(_filteredOrders[index]),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderCard(OrderModel order) {
    final item = order.items.isNotEmpty ? order.items.first : null;
    final isProcessingThis = _processingIds.contains(order.id);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: item?.productImage != null && item!.productImage!.isNotEmpty
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
                  child: const Icon(Icons.image_outlined,
                      color: AppColors.neutral),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item?.productTitle ?? 'Đơn hàng',
                      style: AppTextStyles.bodyLarge
                          .copyWith(fontWeight: FontWeight.w600),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text('Người mua: ${order.buyerName}',
                        style: AppTextStyles.bodyMedium),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${_formatPrice(order.totalAmount)}đ',
                          style: AppTextStyles.bodyLarge.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: _statusColor(order.status).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            _statusText(order.status),
                            style: AppTextStyles.label.copyWith(
                              color: _statusColor(order.status),
                              fontSize: 11,
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (order.trackingCode != null &&
                        order.trackingCode!.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        'Mã vận đơn: ${order.trackingCode}',
                        style: AppTextStyles.bodyMedium.copyWith(fontSize: 11),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          if (order.status == 'PENDING' || order.status == 'PROCESSING') ...[
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: AppButton(
                label: order.status == 'PENDING'
                    ? (isProcessingThis ? 'Đang xác nhận...' : 'Xác nhận đơn')
                    : (isProcessingThis ? 'Đang xử lý...' : 'Nhập mã vận đơn'),
                isLoading: isProcessingThis,
                onPressed: isProcessingThis
                    ? null
                    : () => order.status == 'PENDING'
                    ? _confirmOrder(order)
                    : _showShipDialog(order),
              ),
            ),
          ],
        ],
      ),
    );
  }
}