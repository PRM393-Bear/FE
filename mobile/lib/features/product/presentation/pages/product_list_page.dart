import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../data/product_mock_data.dart';
import '../../data/product_model.dart';
import '../../widgets/product_card.dart';
import '../../../../routes/route_names.dart';

class ProductListPage extends StatefulWidget {
  const ProductListPage({super.key});

  @override
  State<ProductListPage> createState() => _ProductListPageState();
}

class _ProductListPageState extends State<ProductListPage> {
  final List<String> _categories = [
    'Tất cả', 'Quần áo', 'Giày', 'Túi xách', 'Phụ kiện'
  ];
  String _selectedCategory = 'Tất cả';

  List<ProductModel> get _filteredProducts {
    if (_selectedCategory == 'Tất cả') return ProductMockData.products;
    return ProductMockData.products
        .where((p) => p.category == _selectedCategory)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false, // ← chặn nút back vật lý khi đang ở trang chủ
      child: Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false, // ← ẩn nút back trên AppBar
          title: Row(
            children: [
              const Icon(Icons.eco_rounded, color: AppColors.primary, size: 20),
              const SizedBox(width: 6),
              Text('Lifecycle', style: AppTextStyles.headline3.copyWith(
                color: AppColors.primary,
              )),
            ],
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.search_rounded),
              onPressed: () {},
            ),
            IconButton(
              icon: const Icon(Icons.notifications_outlined),
              onPressed: () {},
            ),
          ],
        ),

        body: CustomScrollView(
          slivers: [
            // Location
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                child: Row(
                  children: [
                    const Icon(Icons.location_on_outlined,
                        size: 16, color: AppColors.neutral),
                    const SizedBox(width: 4),
                    Text('TP. Hồ Chí Minh',
                        style: AppTextStyles.bodyMedium),
                    const Icon(Icons.keyboard_arrow_down_rounded,
                        size: 16, color: AppColors.neutral),
                  ],
                ),
              ),
            ),

            // Category tabs
            SliverToBoxAdapter(
              child: SizedBox(
                height: 48,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 8),
                  itemCount: _categories.length,
                  itemBuilder: (context, index) {
                    final cat = _categories[index];
                    final isSelected = cat == _selectedCategory;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedCategory = cat),
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.primary
                              : AppColors.surface,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.border,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            cat,
                            style: AppTextStyles.label.copyWith(
                              color: isSelected
                                  ? Colors.white
                                  : AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            // Banner
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Container(
                  height: 120,
                  decoration: BoxDecoration(
                    color: AppColors.secondary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Sự kiện quyên góp\ncuối tuần này tại Quận 1',
                              style: AppTextStyles.bodyLarge.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text('Xem ngay',
                                  style: AppTextStyles.label.copyWith(
                                    color: AppColors.secondary,
                                  )),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.volunteer_activism,
                          size: 60, color: Colors.white),
                    ],
                  ),
                ),
              ),
            ),

            // Section title
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Mới đăng hôm nay', style: AppTextStyles.headline3),
                    TextButton(
                      onPressed: () {},
                      child: Text('Xem tất cả →',
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.primary,
                          )),
                    ),
                  ],
                ),
              ),
            ),

            // Product Grid
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.62,
                ),
                delegate: SliverChildBuilderDelegate(
                      (context, index) {
                    final product = _filteredProducts[index];
                    return ProductCard(
                      product: product,
                      onTap: () => context.push(
                        RouteNames.productDetail,
                        extra: product,
                      ),
                    );
                  },
                  childCount: _filteredProducts.length,
                ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 32)),
          ],
        ),
      ),
    );
  }
}