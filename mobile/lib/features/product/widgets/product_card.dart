import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../data/product_model.dart';

class ProductCard extends StatelessWidget {
  final ProductModel product;
  final VoidCallback onTap;

  const ProductCard({
    super.key,
    required this.product,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(12),
                  ),
                  child: product.imageUrl.isNotEmpty
                      ? Image.network(
                    product.imageUrl,
                    height: 150,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _imagePlaceholder(),
                  )
                      : _imagePlaceholder(),
                ),

                // Badge type (DONATE / EXCHANGE)
                if (product.type == 'DONATE' || product.type == 'EXCHANGE')
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: product.type == 'DONATE'
                            ? AppColors.primary
                            : AppColors.secondary,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        product.type == 'DONATE' ? 'Tặng' : 'Đổi',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),

                // Favorite button
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    width: 30,
                    height: 30,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                    child: const Icon(Icons.favorite_border_rounded,
                        size: 16, color: AppColors.neutral),
                  ),
                ),
              ],
            ),

            // Info
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.title,
                    style: AppTextStyles.label,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),

                  // Price hoặc "Miễn phí"
                  Text(
                    product.type == 'DONATE'
                        ? 'Miễn phí'
                        : '${_formatPrice(product.price)}đ',
                    style: AppTextStyles.bodyLarge.copyWith(
                      color: product.type == 'DONATE'
                          ? AppColors.primary
                          : AppColors.primary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),

                  // Condition
                  Row(
                    children: [
                      const Icon(Icons.circle,
                          size: 8, color: AppColors.primaryLight),
                      const SizedBox(width: 4),
                      Text(
                        product.conditionText,
                        style: AppTextStyles.bodyMedium.copyWith(
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),

                  // Seller
                  Row(
                    children: [
                      const Icon(Icons.person_outline_rounded,
                          size: 11, color: AppColors.neutral),
                      const SizedBox(width: 2),
                      Expanded(
                        child: Text(
                          product.sellerName,
                          style: AppTextStyles.bodyMedium.copyWith(
                            fontSize: 11,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _imagePlaceholder() {
    return Container(
      height: 150,
      width: double.infinity,
      color: AppColors.background,
      child: const Icon(Icons.image_outlined,
          color: AppColors.neutral, size: 40),
    );
  }

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
    );
  }
}