import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';

class OrderConfirmSheet {
  /// Trả về true nếu người dùng xác nhận đặt hàng, null/false nếu hủy.
  static Future<bool?> show(
    BuildContext context, {
    required String productTitle,
    required double price,
  }) {
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _OrderConfirmContent(productTitle: productTitle, price: price),
    );
  }
}

class _OrderConfirmContent extends StatefulWidget {
  final String productTitle;
  final double price;
  const _OrderConfirmContent({required this.productTitle, required this.price});

  @override
  State<_OrderConfirmContent> createState() => _OrderConfirmContentState();
}

class _OrderConfirmContentState extends State<_OrderConfirmContent> {
  final _addressController = TextEditingController();
  bool _isLoadingAddress = true;
  bool _isSaving = false;
  static const double _shippingFee = 0; // BE chưa có khái niệm phí ship riêng — hiện "Miễn phí"

  @override
  void initState() {
    super.initState();
    _fetchAddress();
  }

  Future<void> _fetchAddress() async {
    try {
      final res = await ApiClient.dio.get('/api/user/me');
      if (!mounted) return;
      setState(() {
        _addressController.text = (res.data['address'] ?? '').toString();
        _isLoadingAddress = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch address error: $e');
      if (mounted) setState(() => _isLoadingAddress = false);
    }
  }

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (m) => '${m[1]}.',
    );
  }

  Future<void> _handleConfirm() async {
    if (_addressController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Vui lòng nhập địa chỉ nhận hàng'),
        backgroundColor: AppColors.error,
      ));
      return;
    }
    setState(() => _isSaving = true);
    try {
      // BE lưu địa chỉ theo user (User.address), không theo từng đơn hàng —
      // nên chỗ này chỉ cập nhật lại hồ sơ nếu người dùng có sửa địa chỉ.
      await ApiClient.dio.put('/api/user/me', data: {
        'address': _addressController.text.trim(),
      });
      if (!mounted) return;
      Navigator.pop(context, true);
    } on DioException catch (e) {
      debugPrint('🔴 Save address error: ${e.response?.data}');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Không lưu được địa chỉ, thử lại nhé'),
        backgroundColor: AppColors.error,
      ));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Widget _buildRow(String label, String value, {bool isTotal = false}) {
    final style = isTotal
        ? AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.w700)
        : AppTextStyles.bodyMedium;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: style),
        Text(value, style: isTotal ? style.copyWith(color: AppColors.primary) : style),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final total = widget.price + _shippingFee;
    return Container(
      padding: EdgeInsets.fromLTRB(20, 12, 20, MediaQuery.of(context).viewInsets.bottom + 20),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                    color: AppColors.border, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 16),
            Text('Xác nhận đơn hàng', style: AppTextStyles.headline3),
            const SizedBox(height: 16),
            Text(widget.productTitle,
                style: AppTextStyles.bodyLarge, maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 16),
            _buildRow('Tiền hàng', '${_formatPrice(widget.price)} đ'),
            const SizedBox(height: 8),
            _buildRow('Phí vận chuyển',
                _shippingFee == 0 ? 'Miễn phí' : '${_formatPrice(_shippingFee)} đ'),
            const Divider(height: 24),
            _buildRow('Tổng cộng', '${_formatPrice(total)} đ', isTotal: true),
            const SizedBox(height: 20),
            Text('Địa chỉ nhận hàng', style: AppTextStyles.label),
            const SizedBox(height: 6),
            _isLoadingAddress
                ? const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                  )
                : TextField(
                    controller: _addressController,
                    maxLines: 2,
                    style: AppTextStyles.bodyLarge,
                    decoration:
                        const InputDecoration(hintText: 'Nhập địa chỉ nhận hàng...'),
                  ),
            const SizedBox(height: 24),
            AppButton(
              label: 'Xác nhận đặt hàng',
              isLoading: _isSaving,
              onPressed: _isLoadingAddress || _isSaving ? null : _handleConfirm,
            ),
          ],
        ),
      ),
    );
  }
}
