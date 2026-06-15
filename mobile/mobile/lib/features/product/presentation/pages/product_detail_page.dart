import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

// Core & Routes
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../routes/route_names.dart';

// Shared Widgets
import '../../../../shared/widgets/app_button.dart';

// Feature Product (Data & Widgets)
import '../../data/product_model.dart';
import '../../data/product_mock_data.dart';
import '../../widgets/product_card.dart';

class ProductDetailPage extends StatefulWidget {
  final ProductModel product;
  const ProductDetailPage({super.key, required this.product});

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  bool _isFavorite = false;
  bool _isExpanded = false;

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
    );
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final similar = ProductMockData.products
        .where((p) => p.id != product.id && p.category == product.category)
        .take(4)
        .toList();

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App bar + Image
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new_rounded),
              onPressed: () => context.pop(),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.share_outlined),
                onPressed: () {},
              ),
              IconButton(
                icon: Icon(
                  _isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                  color: _isFavorite ? Colors.red : null,
                ),
                onPressed: () => setState(() => _isFavorite = !_isFavorite),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Image.network(
                product.imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  color: AppColors.border,
                  child: const Icon(Icons.image_outlined, size: 60),
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(product.title, style: AppTextStyles.headline2),
                  const SizedBox(height: 8),

                  // Price
                  Text(
                    '${_formatPrice(product.price)} đ',
                    style: AppTextStyles.headline1.copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Rating + condition
                  Row(
                    children: [
                      ...List.generate(5, (i) => Icon(
                        i < product.rating.floor()
                            ? Icons.star_rounded
                            : Icons.star_border_rounded,
                        size: 16,
                        color: Colors.amber,
                      )),
                      const SizedBox(width: 6),
                      Text(product.condition,
                          style: AppTextStyles.bodyMedium),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '✦ AI đánh giá',
                          style: AppTextStyles.label.copyWith(
                            color: AppColors.primary,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Tags
                  Wrap(
                    spacing: 6,
                    children: product.tags.map((tag) => Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Text(tag,
                          style: AppTextStyles.bodyMedium.copyWith(
                            fontSize: 12,
                          )),
                    )).toList(),
                  ),

                  const Divider(height: 24),

                  // Seller info
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: AppColors.primary.withOpacity(0.2),
                        child: Text(
                          product.sellerName[0],
                          style: AppTextStyles.bodyLarge.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(product.sellerName,
                                style: AppTextStyles.bodyLarge.copyWith(
                                  fontWeight: FontWeight.w600,
                                )),
                            Row(
                              children: [
                                const Icon(Icons.star_rounded,
                                    size: 12, color: Colors.amber),
                                Text(
                                  ' ${product.sellerRating} (${product.sellerReviews} đánh giá)',
                                  style: AppTextStyles.bodyMedium.copyWith(
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      TextButton(
                        onPressed: () {},
                        child: Text('Xem shop →',
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.primary,
                            )),
                      ),
                    ],
                  ),

                  const Divider(height: 24),

                  // Location & shipping
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined,
                          size: 16, color: AppColors.neutral),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Khu vực',
                              style: AppTextStyles.bodyMedium.copyWith(
                                fontSize: 12,
                              )),
                          Text(product.location,
                              style: AppTextStyles.bodyLarge),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.local_shipping_outlined,
                          size: 16, color: AppColors.neutral),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Vận chuyển',
                              style: AppTextStyles.bodyMedium.copyWith(
                                fontSize: 12,
                              )),
                          Text('Ship toàn quốc',
                              style: AppTextStyles.bodyLarge),
                        ],
                      ),
                    ],
                  ),

                  const Divider(height: 24),

                  // Description
                  Text('Mô tả sản phẩm', style: AppTextStyles.headline3),
                  const SizedBox(height: 8),
                  Text(
                    product.description,
                    style: AppTextStyles.bodyLarge,
                    maxLines: _isExpanded ? null : 3,
                    overflow: _isExpanded ? null : TextOverflow.ellipsis,
                  ),
                  TextButton(
                    onPressed: () => setState(() => _isExpanded = !_isExpanded),
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(
                      _isExpanded ? 'Thu gọn' : 'Xem thêm',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                  ),

                  const Divider(height: 24),

                  // Similar products
                  if (similar.isNotEmpty) ...[
                    Text('Sản phẩm tương tự', style: AppTextStyles.headline3),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 280,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: similar.length,
                        itemBuilder: (context, index) {
                          return SizedBox(
                            width: 160,
                            child: Padding(
                              padding: const EdgeInsets.only(right: 12),
                              child: ProductCard(
                                product: similar[index],
                                onTap: () {},
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],

                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),

      // Bottom bar
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        decoration: BoxDecoration(
          color: AppColors.surface,
          border: Border(top: BorderSide(color: AppColors.border)),
        ),
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.chat_bubble_outline_rounded, size: 18),
                label: const Text('Chat với seller'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(0, 48),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: AppButton(
                label: 'Mua ngay',
                onPressed: () {},
              ),
            ),
          ],
        ),
      ),
    );
  }
}
