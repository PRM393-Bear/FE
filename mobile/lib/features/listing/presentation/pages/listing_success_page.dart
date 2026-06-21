import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../routes/route_names.dart';
import '../../../../core/utils/listing_store.dart';
import 'upload_image_page.dart';
import 'my_listings_page.dart';

class ListingSuccessPage extends StatelessWidget {
  const ListingSuccessPage({super.key});

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
    );
  }

  @override
  Widget build(BuildContext context) {
    final lastListing = ListingStore.instance.myListings.isNotEmpty
        ? ListingStore.instance.myListings.first
        : null;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Container(
                width: double.infinity,
                color: AppColors.primary,
                padding: const EdgeInsets.fromLTRB(16, 24, 16, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '🎉 Đăng bài thành công!',
                      style: AppTextStyles.headline2.copyWith(
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Món đồ của bạn đã sẵn sàng tìm kiếm vòng đời mới.',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),

              // Sản phẩm vừa đăng
              if (lastListing != null) ...[
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Row(
                    children: [
                      Text('Sản phẩm vừa đăng',
                          style: AppTextStyles.headline3),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'Đã đăng',
                          style: AppTextStyles.label.copyWith(
                            color: Colors.white,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Product card
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Ảnh
                        if (lastListing.imagePaths.isNotEmpty)
                          ClipRRect(
                            borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(12),
                            ),
                            child: Image.network(
                              lastListing.imagePaths.first,
                              width: double.infinity,
                              height: 220,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                height: 220,
                                color: AppColors.border,
                                child: const Icon(Icons.image_outlined,
                                    size: 60, color: AppColors.neutral),
                              ),
                            ),
                          ),

                        Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Category + timing
                              Row(
                                children: [
                                  if (lastListing.category.isNotEmpty)
                                    Text(
                                      lastListing.category.toUpperCase(),
                                      style: AppTextStyles.label.copyWith(
                                        color: AppColors.neutral,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  const SizedBox(width: 8),
                                  Text(
                                    '• Vừa xong',
                                    style: AppTextStyles.bodyMedium
                                        .copyWith(fontSize: 11),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(lastListing.title,
                                  style: AppTextStyles.headline3),
                              const SizedBox(height: 4),
                              Text(
                                '${_formatPrice(lastListing.price)}đ',
                                style: AppTextStyles.headline2.copyWith(
                                  color: AppColors.primary,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  CircleAvatar(
                                    radius: 14,
                                    backgroundColor:
                                    AppColors.primary.withOpacity(0.2),
                                    child: const Icon(Icons.person,
                                        size: 16, color: AppColors.primary),
                                  ),
                                  const SizedBox(width: 8),
                                  Column(
                                    crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                    children: [
                                      Text('Bạn',
                                          style: AppTextStyles.bodyLarge
                                              .copyWith(
                                              fontWeight:
                                              FontWeight.w600)),
                                      Row(
                                        children: [
                                          const Icon(Icons.star_rounded,
                                              size: 12, color: Colors.amber),
                                          Text(' 5.0 (mới)',
                                              style: AppTextStyles.bodyMedium
                                                  .copyWith(fontSize: 11)),
                                        ],
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],

              // Buttons
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 24, 16, 32),
                child: Column(
                  children: [
                    // Về trang chủ — dùng pushAndRemoveUntil
                    AppButton(
                      label: '→ Về trang chủ',
                      onPressed: () => context.go(RouteNames.productList),
                    ),
                    const SizedBox(height: 12),

                    // Đăng bài mới
                    AppButton(
                      label: '⊕ Đăng bài mới',
                      type: AppButtonType.secondary,
                      onPressed: () => Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const UploadImagePage(),
                        ),
                            (route) => false,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Xem bài đăng — đổi sang Navigator.pushAndRemoveUntil
                    OutlinedButton(
                      onPressed: () => Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const MyListingsPage(),
                        ),
                            (route) => false,
                      ),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 52),
                        side: const BorderSide(color: AppColors.border),
                        foregroundColor: AppColors.textPrimary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        '◉ Xem bài đăng',
                        style: AppTextStyles.button.copyWith(
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}