// mobile/lib/features/order/presentation/pages/order_detail_page.dart
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../data/order_model.dart';

class OrderDetailPage extends StatefulWidget {
  final String orderId;
  const OrderDetailPage({super.key, required this.orderId});

  @override
  State<OrderDetailPage> createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends State<OrderDetailPage> {
  OrderModel? _order;
  bool _isLoading = true;
  bool _isConfirming = false;

  final List<String> _steps = ['PENDING', 'PROCESSING', 'SHIPPING', 'RECEIVED'];
  final List<String> _stepLabels = ['Chờ xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Đã nhận'];

  @override
  void initState() {
    super.initState();
    _fetchOrder();
  }

  Future<void> _fetchOrder() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiClient.dio.get('/api/orders/${widget.orderId}');
      setState(() {
        _order = OrderModel.fromJson(res.data as Map<String, dynamic>);
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch order detail error: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleConfirmReceived() async {
    setState(() => _isConfirming = true);
    try {
      await ApiClient.dio.put('/api/orders/${widget.orderId}/receive');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Đã xác nhận nhận hàng! Sản phẩm được thêm vào Tủ đồ của bạn.'),
        backgroundColor: AppColors.primary,
      ));
      _fetchOrder();
    } on DioException catch (e) {
      debugPrint('🔴 Confirm received error: ${e.response?.data}');
      final data = e.response?.data;
      String msg = 'Xác nhận thất bại';
      if (data is Map && data['message'] != null) msg = data['message'].toString();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(msg),
        backgroundColor: AppColors.error,
      ));
    } finally {
      if (mounted) setState(() => _isConfirming = false);
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
        title: Text('Chi tiết đơn hàng', style: AppTextStyles.headline3),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _order == null
          ? Center(
          child: Text('Không tìm thấy đơn hàng',
              style: AppTextStyles.bodyLarge))
          : RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _fetchOrder,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Container(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Text(_statusText(_order!.status),
                  style: AppTextStyles.bodyMedium
                      .copyWith(color: AppColors.primary)),
            ),
            const SizedBox(height: 8),
            _buildStatusTimeline(_order!.status),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Sản phẩm', style: AppTextStyles.headline3),
                  const SizedBox(height: 10),
                  ..._order!.items.map(
                        (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: item.productImage != null &&
                                item.productImage!.isNotEmpty
                                ? Image.network(
                              item.productImage!,
                              width: 56,
                              height: 56,
                              fit: BoxFit.cover,
                            )
                                : Container(
                              width: 56,
                              height: 56,
                              color: AppColors.background,
                              child: const Icon(
                                  Icons.image_outlined,
                                  color: AppColors.neutral),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(item.productTitle,
                                style: AppTextStyles.bodyLarge),
                          ),
                          Text('${_formatPrice(item.unitPrice)}đ',
                              style: AppTextStyles.bodyLarge),
                        ],
                      ),
                    ),
                  ),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Tổng cộng',
                          style: AppTextStyles.bodyLarge
                              .copyWith(fontWeight: FontWeight.w700)),
                      Text('${_formatPrice(_order!.totalAmount)}đ',
                          style: AppTextStyles.headline3
                              .copyWith(color: AppColors.primary)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Người bán', style: AppTextStyles.bodyMedium),
                  Text(_order!.sellerName,
                      style: AppTextStyles.bodyLarge
                          .copyWith(fontWeight: FontWeight.w600)),
                  if (_order!.trackingCode != null &&
                      _order!.trackingCode!.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Text('Mã vận đơn', style: AppTextStyles.bodyMedium),
                    Text(_order!.trackingCode!,
                        style: AppTextStyles.bodyLarge
                            .copyWith(fontWeight: FontWeight.w600)),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),
            if (_order!.status == 'SHIPPING')
              AppButton(
                label: _isConfirming ? 'Đang xác nhận...' : 'Đã nhận được hàng',
                isLoading: _isConfirming,
                onPressed: _isConfirming ? null : _handleConfirmReceived,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusTimeline(String currentStatus) {
    if (currentStatus == 'CANCELLED') {
      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.error.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            const Icon(Icons.cancel_outlined, color: AppColors.error),
            const SizedBox(width: 8),
            Text('Đơn hàng đã bị hủy',
                style: AppTextStyles.bodyLarge.copyWith(color: AppColors.error)),
          ],
        ),
      );
    }

    // COMPLETED coi như đã đi hết các bước tới "Đã nhận"
    final effectiveStatus = currentStatus == 'COMPLETED' ? 'RECEIVED' : currentStatus;
    final currentIndex = _steps.indexOf(effectiveStatus);

    return Row(
      children: List.generate(_steps.length, (index) {
        final isDone = index <= currentIndex;
        return Expanded(
          child: Column(
            children: [
              Row(
                children: [
                  if (index > 0)
                    Expanded(
                      child: Container(
                          height: 2,
                          color: isDone ? AppColors.primary : AppColors.border),
                    ),
                  Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isDone ? AppColors.primary : AppColors.border,
                    ),
                    child: isDone
                        ? const Icon(Icons.check, size: 14, color: Colors.white)
                        : null,
                  ),
                  if (index < _steps.length - 1)
                    Expanded(
                      child: Container(
                          height: 2,
                          color: index < currentIndex
                              ? AppColors.primary
                              : AppColors.border),
                    ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                _stepLabels[index],
                textAlign: TextAlign.center,
                style: AppTextStyles.label.copyWith(
                  fontSize: 10,
                  color: isDone ? AppColors.primary : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}