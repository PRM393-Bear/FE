// mobile/lib/features/cart/presentation/pages/cart_page.dart
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../data/cart_model.dart';
import '../../../order/presentation/pages/my_orders_page.dart';

class CartPage extends StatefulWidget {
  const CartPage({super.key});

  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  CartModel? _cart;
  bool _isLoading = true;
  bool _isCheckingOut = false;
  final Set<String> _removingIds = {};

  @override
  void initState() {
    super.initState();
    _fetchCart();
  }

  Future<void> _fetchCart() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiClient.dio.get('/api/cart');
      if (!mounted) return;
      setState(() {
        _cart = CartModel.fromJson(res.data as Map<String, dynamic>);
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch cart error: $e');
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Không tải được giỏ hàng, vui lòng thử lại'),
        backgroundColor: AppColors.error,
      ));
    }
  }

  Future<void> _removeItem(CartItemModel item) async {
    setState(() => _removingIds.add(item.cartItemId));
    try {
      await ApiClient.dio.delete(
        '/api/cart',
        queryParameters: {'cartItemId': item.cartItemId},
      );
      await _fetchCart();
    } on DioException catch (e) {
      debugPrint('🔴 Remove cart item error: ${e.response?.data}');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Xoá sản phẩm khỏi giỏ thất bại'),
        backgroundColor: AppColors.error,
      ));
    } finally {
      if (mounted) setState(() => _removingIds.remove(item.cartItemId));
    }
  }

  Future<void> _clearCart() async {
    try {
      await ApiClient.dio.delete('/api/cart/clear');
      await _fetchCart();
    } catch (e) {
      debugPrint('🔴 Clear cart error: $e');
    }
  }

  // Backend hiện chưa có API "checkout" cho giỏ hàng — endpoint này (POST
  // /api/cart/checkout) đã được đề xuất trong spec_be_cart_checkout.md,
  // đang chờ BE làm. Trong lúc chờ, nếu server trả 404/405 (chưa tồn tại)
  // thì hiện thông báo rõ ràng thay vì lỗi khó hiểu.
  Future<void> _handleCheckout() async {
    final cart = _cart;
    if (cart == null || cart.items.isEmpty) return;

    setState(() => _isCheckingOut = true);
    try {
      await ApiClient.dio.post('/api/cart/checkout', data: {
        'cartItemIds': cart.items.map((e) => e.cartItemId).toList(),
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Đặt hàng thành công! Chờ người bán xác nhận.'),
        backgroundColor: AppColors.primary,
      ));
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const MyOrdersPage()),
      );
    } on DioException catch (e) {
      debugPrint(
          '🔴 Checkout error: ${e.response?.statusCode} ${e.response?.data}');
      if (!mounted) return;
      final status = e.response?.statusCode;
      String msg;
      if (status == 404 || status == 405) {
        msg = 'Tính năng đặt hàng từ giỏ đang được hoàn thiện, vui lòng quay lại sau nhé!';
      } else {
        final data = e.response?.data;
        msg = (data is Map && data['message'] != null)
            ? data['message'].toString()
            : 'Đặt hàng thất bại, vui lòng thử lại';
      }
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(msg),
        backgroundColor: AppColors.error,
      ));
    } finally {
      if (mounted) setState(() => _isCheckingOut = false);
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
    final cart = _cart;
    final isEmpty = cart == null || cart.items.isEmpty;

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
        title: Text('Giỏ hàng', style: AppTextStyles.headline3),
        actions: [
          if (!isEmpty)
            TextButton(
              onPressed: _clearCart,
              child: Text('Xoá hết',
                  style: AppTextStyles.bodyMedium
                      .copyWith(color: AppColors.error)),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(
          child: CircularProgressIndicator(color: AppColors.primary))
          : isEmpty
          ? RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _fetchCart,
        child: ListView(
          children: [
            SizedBox(
              height: MediaQuery.of(context).size.height * 0.6,
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.shopping_cart_outlined,
                        size: 60, color: AppColors.neutral),
                    const SizedBox(height: 12),
                    Text('Giỏ hàng trống',
                        style: AppTextStyles.bodyLarge),
                    const SizedBox(height: 4),
                    Text('Thêm sản phẩm bạn thích vào giỏ nhé!',
                        style: AppTextStyles.bodyMedium),
                  ],
                ),
              ),
            ),
          ],
        ),
      )
          : RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _fetchCart,
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: cart.items.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final item = cart.items[index];
            final isRemoving =
            _removingIds.contains(item.cartItemId);
            return Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.productName,
                          style: AppTextStyles.bodyLarge,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${_formatPrice(item.price)} đ',
                          style: AppTextStyles.bodyLarge.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  isRemoving
                      ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2),
                  )
                      : IconButton(
                    icon: const Icon(
                        Icons.delete_outline_rounded,
                        color: AppColors.error),
                    onPressed: () => _removeItem(item),
                  ),
                ],
              ),
            );
          },
        ),
      ),
      bottomNavigationBar: isEmpty
          ? null
          : Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        decoration: BoxDecoration(
          color: AppColors.surface,
          border: Border(top: BorderSide(color: AppColors.border)),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Tổng cộng', style: AppTextStyles.bodyMedium),
                  Text(
                    '${_formatPrice(cart.totalPrice)} đ',
                    style: AppTextStyles.headline3
                        .copyWith(color: AppColors.primary),
                  ),
                ],
              ),
            ),
            SizedBox(
              width: 160,
              child: AppButton(
                label: 'Đặt hàng',
                isLoading: _isCheckingOut,
                onPressed: _isCheckingOut ? null : _handleCheckout,
              ),
            ),
          ],
        ),
      ),
    );
  }
}