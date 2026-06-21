import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../data/product_model.dart';
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
  int _currentImageIndex = 0;

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
    );
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // AppBar + Image
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
                  _isFavorite
                      ? Icons.favorite_rounded
                      : Icons.favorite_border_rounded,
                  color: _isFavorite ? Colors.red : null,
                ),
                onPressed: () =>
                    setState(() => _isFavorite = !_isFavorite),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: product.images.isNotEmpty
                  ? PageView.builder(
                itemCount: product.images.length,
                onPageChanged: (i) =>
                    setState(() => _currentImageIndex = i),
                itemBuilder: (_, i) => Image.network(
                  product.images[i],
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    color: AppColors.border,
                    child: const Icon(Icons.image_outlined, size: 60),
                  ),
                ),
              )
                  : Container(
                color: AppColors.background,
                child: const Icon(Icons.image_outlined,
                    size: 60, color: AppColors.neutral),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image dots indicator
                  if (product.images.length > 1) ...[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        product.images.length,
                            (i) => Container(
                          margin: const EdgeInsets.symmetric(horizontal: 3),
                          width: i == _currentImageIndex ? 16 : 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: i == _currentImageIndex
                                ? AppColors.primary
                                : AppColors.border,
                            borderRadius: BorderRadius.circular(3),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],

                  // Badge type
                  if (product.type == 'DONATE' || product.type == 'EXCHANGE')
                    Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: product.type == 'DONATE'
                            ? AppColors.primary.withOpacity(0.12)
                            : AppColors.secondary.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        product.type == 'DONATE'
                            ? '🎁 Sản phẩm tặng miễn phí'
                            : '🔄 Sản phẩm trao đổi',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: product.type == 'DONATE'
                              ? AppColors.primary
                              : AppColors.secondary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),

                  // Title
                  Text(product.title, style: AppTextStyles.headline2),
                  const SizedBox(height: 8),

                  // Price
                  Text(
                    product.type == 'DONATE'
                        ? 'Miễn phí'
                        : '${_formatPrice(product.price)} đ',
                    style: AppTextStyles.headline1.copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Condition + Size + Color
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _infoChip(Icons.circle,
                          'Tình trạng: ${product.conditionText}',
                          AppColors.primary),
                      if (product.size.isNotEmpty)
                        _infoChip(Icons.straighten_outlined,
                            'Size: ${product.size}', AppColors.neutral),
                      if (product.color.isNotEmpty)
                        _infoChip(Icons.palette_outlined,
                            'Màu: ${product.color}', AppColors.neutral),
                      _infoChip(Icons.category_outlined,
                          product.category, AppColors.neutral),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // AI Tags
                  if (product.aiTags.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: product.aiTags
                          .map((tag) => Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(20),
                          border:
                          Border.all(color: AppColors.border),
                        ),
                        child: Text(tag,
                            style: AppTextStyles.bodyMedium
                                .copyWith(fontSize: 12)),
                      ))
                          .toList(),
                    ),
                  ],

                  const Divider(height: 24),

                  // Seller info
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: AppColors.primary.withOpacity(0.2),
                        child: Text(
                          product.sellerName.isNotEmpty
                              ? product.sellerName[0].toUpperCase()
                              : '?',
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
                            Text('Người bán',
                                style: AppTextStyles.bodyMedium
                                    .copyWith(fontSize: 12)),
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

                  // Description
                  Text('Mô tả sản phẩm', style: AppTextStyles.headline3),
                  const SizedBox(height: 8),
                  Text(
                    product.description.isNotEmpty
                        ? product.description
                        : 'Chưa có mô tả',
                    style: AppTextStyles.bodyLarge,
                    maxLines: _isExpanded ? null : 3,
                    overflow:
                    _isExpanded ? null : TextOverflow.ellipsis,
                  ),
                  if (product.description.length > 100)
                    TextButton(
                      onPressed: () =>
                          setState(() => _isExpanded = !_isExpanded),
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
                icon: const Icon(Icons.chat_bubble_outline_rounded,
                    size: 18),
                label: const Text('Chat với seller'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(0, 48),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: AppButton(
                label: product.type == 'DONATE' ? 'Xin nhận' : 'Mua ngay',
                onPressed: () {},
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoChip(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(label,
              style:
              AppTextStyles.bodyMedium.copyWith(fontSize: 12)),
        ],
      ),
    );
  }
}