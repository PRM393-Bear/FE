import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../product/data/product_model.dart';
import '../../../product/presentation/pages/product_detail_page.dart';

class MyShopPage extends StatefulWidget {
  final String fullName;
  final String username;

  const MyShopPage({
    super.key,
    required this.fullName,
    required this.username,
  });

  @override
  State<MyShopPage> createState() => _MyShopPageState();
}

class _MyShopPageState extends State<MyShopPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<ProductModel> _products = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchMyProducts();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchMyProducts() async {
    setState(() => _isLoading = true);
    try {
      const storage = FlutterSecureStorage();
      final token = await storage.read(key: 'auth_token');
      if (token == null) throw Exception('Chưa đăng nhập');

      final parts = token.split('.');
      String payload = parts[1];
      while (payload.length % 4 != 0) payload += '=';
      final decoded = utf8.decode(base64Url.decode(payload));
      final Map<String, dynamic> claims = jsonDecode(decoded);
      final userId = claims['userId']?.toString() ?? claims['sub']?.toString();
      if (userId == null) throw Exception('Không lấy được userId');

      final res = await ApiClient.dio
          .get('/api/products/user/product?userId=$userId');
      final list = (res.data as List)
          .map((e) => ProductModel.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() {
        _products = list;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch shop products error: $e');
      setState(() => _isLoading = false);
    }
  }

  List<ProductModel> get _availableProducts =>
      _products.where((p) => p.status == 'AVAILABLE').toList();
  int get _soldCount =>
      _products.where((p) => p.status == 'SOLD').length;

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: NestedScrollView(
        headerSliverBuilder: (context, _) => [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new_rounded,
                  color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.share_outlined, color: Colors.white),
                onPressed: () {},
              ),
            ],
            title: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.eco_rounded, color: Colors.white, size: 18),
                const SizedBox(width: 6),
                Text('Lifecycle',
                    style: AppTextStyles.headline3
                        .copyWith(color: Colors.white)),
              ],
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(color: AppColors.primary),
            ),
          ),

          // Info section
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 16),
              child: Column(
                children: [
                  // Avatar
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 3),
                      color: AppColors.primary.withOpacity(0.2),
                    ),
                    child: ClipOval(
                      child: Center(
                        child: Text(
                          widget.fullName.isNotEmpty
                              ? widget.fullName[0].toUpperCase()
                              : widget.username.isNotEmpty
                              ? widget.username[0].toUpperCase()
                              : '?',
                          style: AppTextStyles.headline1
                              .copyWith(color: AppColors.primary),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  Text(
                    widget.fullName.isNotEmpty
                        ? widget.fullName
                        : widget.username,
                    style: AppTextStyles.headline2,
                  ),
                  const SizedBox(height: 6),

                  // Badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.verified_rounded,
                            size: 14, color: Colors.white),
                        const SizedBox(width: 4),
                        Text('Người bán uy tín',
                            style: AppTextStyles.label.copyWith(
                              color: Colors.white,
                              fontSize: 12,
                            )),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Stats
                  _isLoading
                      ? const CircularProgressIndicator(
                      color: AppColors.primary)
                      : Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildStat(
                          '${_availableProducts.length}', 'đang bán'),
                      _buildStatDivider(),
                      _buildStat('$_soldCount', 'đã bán'),
                      _buildStatDivider(),
                      Column(
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.star_rounded,
                                  color: Colors.amber, size: 18),
                              const SizedBox(width: 2),
                              Text('0.0',
                                  style: AppTextStyles.headline3),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text('đánh giá',
                              style: AppTextStyles.bodyMedium),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Nhắn tin
                  ElevatedButton.icon(
                    onPressed: () {},
                    icon: const Icon(
                        Icons.chat_bubble_outline_rounded, size: 18),
                    label: const Text('Nhắn tin'),
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 48),
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Tab bar
          SliverPersistentHeader(
            pinned: true,
            delegate: _SliverTabBarDelegate(
              TabBar(
                controller: _tabController,
                labelColor: AppColors.primary,
                unselectedLabelColor: AppColors.textSecondary,
                indicatorColor: AppColors.primary,
                indicatorWeight: 3,
                labelStyle: AppTextStyles.bodyLarge
                    .copyWith(fontWeight: FontWeight.w600),
                tabs: const [
                  Tab(text: 'Đang bán'),
                  Tab(text: 'Đánh giá'),
                ],
              ),
            ),
          ),
        ],
        body: TabBarView(
          controller: _tabController,
          children: [
            // Tab 1: Sản phẩm đang bán
            _isLoading
                ? const Center(
                child: CircularProgressIndicator(
                    color: AppColors.primary))
                : _availableProducts.isEmpty
                ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.inbox_outlined,
                      size: 60, color: AppColors.neutral),
                  const SizedBox(height: 12),
                  Text('Chưa có sản phẩm nào',
                      style: AppTextStyles.bodyLarge),
                ],
              ),
            )
                : GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate:
              const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.72,
              ),
              itemCount: _availableProducts.length,
              itemBuilder: (context, index) {
                final product = _availableProducts[index];
                return GestureDetector(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ProductDetailPage(product: product),
                    ),
                  ),
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ClipRRect(
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(12),
                          ),
                          child: product.imageUrl.isNotEmpty
                              ? Image.network(
                            product.imageUrl,
                            height: 140,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) =>
                                Container(
                                  height: 140,
                                  color: AppColors.border,
                                  child: const Icon(
                                      Icons.image_outlined),
                                ),
                          )
                              : Container(
                            height: 140,
                            color: AppColors.border,
                            child: const Icon(
                                Icons.image_outlined),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(8),
                          child: Column(
                            crossAxisAlignment:
                            CrossAxisAlignment.start,
                            children: [
                              Text(
                                product.title,
                                style: AppTextStyles.label,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${_formatPrice(product.price)}đ',
                                style:
                                AppTextStyles.bodyLarge.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w700,
                                ),
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

            // Tab 2: Đánh giá
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.star_outline_rounded,
                      size: 60, color: AppColors.neutral),
                  const SizedBox(height: 12),
                  Text('Chưa có đánh giá nào',
                      style: AppTextStyles.bodyLarge),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStat(String value, String label) {
    return Column(
      children: [
        Text(value, style: AppTextStyles.headline3),
        const SizedBox(height: 2),
        Text(label, style: AppTextStyles.bodyMedium),
      ],
    );
  }

  Widget _buildStatDivider() =>
      Container(width: 1, height: 30, color: AppColors.border);
}

class _SliverTabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;
  _SliverTabBarDelegate(this.tabBar);

  @override
  double get minExtent => tabBar.preferredSize.height;
  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  Widget build(
      BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(color: AppColors.background, child: tabBar);
  }

  @override
  bool shouldRebuild(_SliverTabBarDelegate oldDelegate) => false;
}