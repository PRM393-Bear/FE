// mobile/lib/features/cart/presentation/pages/cart_page.dart
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../data/cart_model.dart';
import '../../../order/presentation/pages/my_orders_page.dart';
import '../../../product/presentation/widgets/order_confirm_sheet.dart';

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

  Future<void> _handleCheckout() async {
    final cart = _cart;
    if (cart == null || cart.items.isEmpty) return;

    final confirmed = await OrderConfirmSheet.show(
      context,
      productTitle: '${cart.items.length} sản phẩm trong giỏ hàng',
      price: cart.totalPrice,
    );
    if (confirmed != true) return;

    setState(() => _isCheckingOut = true);
    try {
      // BE chỉ có POST /api/orders nhận 1 productId/lần — lặp qua từng item
      for (final item in cart.items) {
        await ApiClient.dio.post('/api/orders', data: {
          'productId': item.productId,
        });
      }
      await ApiClient.dio.delete('/api/cart/clear');

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
      final data = e.response?.data;
      final msg = (data is Map && data['message'] != null)
          ? data['message'].toString()
          : 'Đặt hàng thất bại, vui lòng thử lại';
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
      body: SafeArea(
        child: Column(
          children: [
            // Custom App Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios_new_rounded,
                        color: AppColors.textPrimary),
                    onPressed: () => Navigator.pop(context),
                  ),
                  Expanded(
                    child: Text('Giỏ hàng', style: AppTextStyles.headline3),
                  ),
                  if (!isEmpty)
                    TextButton(
                      onPressed: _clearCart,
                      child: Text('Xoá hết',
                          style: AppTextStyles.bodyMedium
                              .copyWith(color: AppColors.error)),
                    ),
                ],
              ),
            ),

            // Content
            Expanded(
              child: _isLoading
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
            ),

            // Bottom Bar
            if (!isEmpty)
              Container(
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
          ],
        ),
      ),
    );
  }
}
