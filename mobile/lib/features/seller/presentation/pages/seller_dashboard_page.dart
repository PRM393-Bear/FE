import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../product/data/product_model.dart';
import '../../../../routes/route_names.dart';

class SellerDashboardPage extends StatefulWidget {
  const SellerDashboardPage({super.key});

  @override
  State<SellerDashboardPage> createState() => _SellerDashboardPageState();
}

class _SellerDashboardPageState extends State<SellerDashboardPage> {
  List<ProductModel> _products = [];
  bool _isLoading = true;
  String _username = '';

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      const storage = FlutterSecureStorage();
      final token = await storage.read(key: 'auth_token');
      if (token == null) return;

      // Decode JWT
      final parts = token.split('.');
      String payload = parts[1];
      while (payload.length % 4 != 0) payload += '=';
      final decoded = utf8.decode(base64Url.decode(payload));
      final Map<String, dynamic> claims = jsonDecode(decoded);
      final userId = claims['userId']?.toString() ?? claims['sub']?.toString();
      _username = claims['sub']?.toString() ?? '';

      // Fetch products
      final res = await ApiClient.dio
          .get('/api/products/user/product?userId=$userId');
      final list = (res.data as List)
          .map((e) => ProductModel.fromJson(e as Map<String, dynamic>))
          .toList();

      // Fetch user info
      final userRes = await ApiClient.dio.get('/api/user/me');
      _username = userRes.data['fullName'] ?? userRes.data['username'] ?? '';

      setState(() {
        _products = list;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch seller data error: $e');
      setState(() => _isLoading = false);
    }
  }

  int get _availableCount =>
      _products.where((p) => p.status == 'AVAILABLE').length;
  int get _soldCount =>
      _products.where((p) => p.status == 'SOLD').length;
  double get _totalRevenue =>
      _products.where((p) => p.status == 'SOLD').fold(0, (sum, p) => sum + p.price);

  String _formatPrice(double price) {
    if (price >= 1000000) return '${(price / 1000000).toStringAsFixed(1)}M đ';
    if (price >= 1000) return '${(price / 1000).toStringAsFixed(0)}k đ';
    return '${price.toStringAsFixed(0)}đ';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: _isLoading
          ? const Center(
          child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _fetchData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            children: [
              // ── Header ─────────────────────────────────
              Container(
                width: double.infinity,
                padding: EdgeInsets.fromLTRB(
                    16, MediaQuery.of(context).padding.top + 16, 16, 24),
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.vertical(
                      bottom: Radius.circular(24)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.storefront_outlined,
                                color: Colors.white, size: 20),
                            const SizedBox(width: 8),
                            Text('Shop của tôi 🏪',
                                style: AppTextStyles.bodyLarge
                                    .copyWith(color: Colors.white)),
                          ],
                        ),
                        Row(
                          children: [
                            IconButton(
                              icon: const Icon(
                                  Icons.notifications_outlined,
                                  color: Colors.white),
                              onPressed: () {},
                            ),
                            CircleAvatar(
                              radius: 16,
                              backgroundColor:
                              Colors.white.withOpacity(0.2),
                              child: Text(
                                _username.isNotEmpty
                                    ? _username[0].toUpperCase()
                                    : 'S',
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text('Chào buổi sáng,',
                        style: AppTextStyles.bodyMedium
                            .copyWith(color: Colors.white70)),
                    Text(
                      'Người bán Lifecycle',
                      style: AppTextStyles.headline2
                          .copyWith(color: Colors.white),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _soldCount > 0
                          ? 'Bạn có $_soldCount đơn hàng đã hoàn thành. Tiếp tục phát huy!'
                          : 'Hãy đăng sản phẩm đầu tiên của bạn!',
                      style: AppTextStyles.bodyMedium
                          .copyWith(color: Colors.white70),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // ── Banner tăng trưởng ──────────────────────
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.secondary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.trending_up_rounded,
                            color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Tăng trưởng',
                                style: AppTextStyles.bodyLarge.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                )),
                            Text(
                              'Doanh thu tích lũy: ${_formatPrice(_totalRevenue)}',
                              style: AppTextStyles.bodyMedium
                                  .copyWith(color: Colors.white70),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // ── Stats grid ──────────────────────────────
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.6,
                  children: [
                    _buildStatCard(
                      icon: Icons.inventory_2_outlined,
                      label: 'Đang bán',
                      value: '$_availableCount',
                      sub: '+${_products.length} tổng',
                      color: AppColors.primary,
                    ),
                    _buildStatCard(
                      icon: Icons.check_circle_outline_rounded,
                      label: 'Đã bán',
                      value: '$_soldCount',
                      sub: 'Tỉ lệ: ${_products.isEmpty ? 0 : (_soldCount / _products.length * 100).toStringAsFixed(0)}%',
                      color: AppColors.tertiary,
                    ),
                    _buildStatCard(
                      icon: Icons.account_balance_wallet_outlined,
                      label: 'Doanh thu',
                      value: _formatPrice(_totalRevenue),
                      sub: 'Tích lũy',
                      color: AppColors.secondary,
                    ),
                    _buildStatCard(
                      icon: Icons.star_outline_rounded,
                      label: 'Đánh giá',
                      value: '⭐ 0.0',
                      sub: 'Chưa có đánh giá',
                      color: Colors.amber,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // ── Thao tác nhanh ──────────────────────────
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Thao tác nhanh',
                        style: AppTextStyles.headline3),
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      onPressed: () =>
                          context.push(RouteNames.createListing),
                      icon: const Icon(Icons.add_circle_outline,
                          size: 18),
                      label: const Text('Đăng bài mới'),
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 48),
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    OutlinedButton.icon(
                      onPressed: () =>
                          context.push(RouteNames.myListings),
                      icon: const Icon(Icons.list_alt_outlined,
                          size: 18),
                      label: const Text('Quản lý bài đăng'),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 48),
                        foregroundColor: AppColors.primary,
                        side: const BorderSide(
                            color: AppColors.primary),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // ── Hoạt động gần đây ───────────────────────
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Sản phẩm gần đây',
                            style: AppTextStyles.headline3),
                        TextButton(
                          onPressed: () =>
                              context.push(RouteNames.myListings),
                          child: Text('Xem tất cả →',
                              style: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.primary)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    _products.isEmpty
                        ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          children: [
                            const Icon(Icons.inbox_outlined,
                                size: 48,
                                color: AppColors.neutral),
                            const SizedBox(height: 8),
                            Text('Chưa có sản phẩm nào',
                                style:
                                AppTextStyles.bodyMedium),
                          ],
                        ),
                      ),
                    )
                        : Column(
                      children: _products
                          .take(5)
                          .map((p) => _buildProductItem(p))
                          .toList(),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // ── Mẹo bán hàng ────────────────────────────
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.lightbulb_outline,
                                    color: Colors.white, size: 16),
                                const SizedBox(width: 6),
                                Text('Mẹo bán hàng',
                                    style: AppTextStyles.bodyLarge
                                        .copyWith(
                                        color: Colors.white,
                                        fontWeight:
                                        FontWeight.w600)),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Sử dụng ảnh sáng tự nhiên khi chụp ảnh sản phẩm giúp tăng tỉ lệ chốt đơn lên 40%.',
                              style: AppTextStyles.bodyMedium
                                  .copyWith(color: Colors.white70),
                            ),
                            const SizedBox(height: 8),
                            GestureDetector(
                              onTap: () {},
                              child: Text('Khám phá thêm →',
                                  style: AppTextStyles.bodyMedium
                                      .copyWith(
                                      color: Colors.white,
                                      fontWeight:
                                      FontWeight.w600)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String label,
    required String value,
    required String sub,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 16),
              const SizedBox(width: 6),
              Text(label,
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.textSecondary)),
            ],
          ),
          Text(value,
              style: AppTextStyles.headline3.copyWith(color: color)),
          Text(sub,
              style: AppTextStyles.bodySmall
                  .copyWith(color: AppColors.textSecondary)),
        ],
      ),
    );
  }

  Widget _buildProductItem(ProductModel product) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
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
            child: product.imageUrl.isNotEmpty
                ? Image.network(
              product.imageUrl,
              width: 52,
              height: 52,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => _imagePlaceholder(),
            )
                : _imagePlaceholder(),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product.title,
                    style: AppTextStyles.bodyLarge
                        .copyWith(fontWeight: FontWeight.w600),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                Text('${_formatPrice(product.price)}',
                    style: AppTextStyles.bodyMedium
                        .copyWith(color: AppColors.primary)),
              ],
            ),
          ),
          Container(
            padding:
            const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: product.status == 'AVAILABLE'
                  ? AppColors.primary.withOpacity(0.1)
                  : AppColors.neutral.withOpacity(0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              product.status == 'AVAILABLE' ? 'Đang bán' : 'Đã bán',
              style: AppTextStyles.bodySmall.copyWith(
                color: product.status == 'AVAILABLE'
                    ? AppColors.primary
                    : AppColors.neutral,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const Icon(Icons.chevron_right_rounded,
              color: AppColors.neutral, size: 18),
        ],
      ),
    );
  }

  Widget _imagePlaceholder() => Container(
    width: 52,
    height: 52,
    decoration: BoxDecoration(
      color: AppColors.background,
      borderRadius: BorderRadius.circular(8),
    ),
    child: const Icon(Icons.image_outlined,
        color: AppColors.neutral, size: 24),
  );
}