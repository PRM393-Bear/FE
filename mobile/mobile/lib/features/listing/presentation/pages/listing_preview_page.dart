import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../data/listing_model.dart';
import '../widgets/step_indicator.dart';
import 'listing_success_page.dart';

class ListingPreviewPage extends StatefulWidget {
  final ListingModel listing;
  const ListingPreviewPage({super.key, required this.listing});

  @override
  State<ListingPreviewPage> createState() => _ListingPreviewPageState();
}

class _ListingPreviewPageState extends State<ListingPreviewPage> {
  bool _isLoading = false;

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
    );
  }

  // Map condition string → số (BE dùng Short 1-5)
  int _mapCondition(String condition) {
    if (condition.contains('95-99')) return 5;
    if (condition.contains('85-95')) return 4;
    if (condition.contains('70-85')) return 3;
    return 2;
  }

  Future<void> _handlePost() async {
    setState(() => _isLoading = true);
    try {
      final listing = widget.listing;

      await ApiClient.dio.post('/api/products', data: {
        'title': listing.title,
        'description': listing.description,
        'category': listing.category,
        'type': 'ITEM',
        'condition': _mapCondition(listing.condition),
        'price': listing.price.toInt(),
        'size': listing.size,
        'color': listing.color,
        'images': listing.imagePaths,
        'aiTags': listing.tags,
        'lifecycleGeneration': 1,
      });

      if (!mounted) return;

      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const ListingSuccessPage()),
            (route) => false,
      );
    } on DioException catch (e) {
      debugPrint('🔴 Post product error: ${e.response?.data}');
      final msg =
          e.response?.data?['message'] ?? 'Đăng sản phẩm thất bại';
      _showSnack(msg);
    } catch (e) {
      debugPrint('🔴 Unknown error: $e');
      _showSnack('Đã có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: AppColors.error,
      duration: const Duration(seconds: 4),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final listing = widget.listing;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Xem trước bài đăng', style: AppTextStyles.headline3),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Banner xem trước
            Container(
              width: double.infinity,
              color: AppColors.primary,
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.visibility_outlined,
                      color: Colors.white, size: 16),
                  const SizedBox(width: 6),
                  Text(
                    'CHẾ ĐỘ XEM TRƯỚC',
                    style: AppTextStyles.label.copyWith(color: Colors.white),
                  ),
                ],
              ),
            ),

            // Ảnh sản phẩm
            if (listing.imagePaths.isNotEmpty)
              Image.network(
                listing.imagePaths.first,
                width: double.infinity,
                height: 300,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 300,
                  color: AppColors.border,
                  child: const Icon(Icons.image_outlined,
                      size: 60, color: AppColors.neutral),
                ),
              )
            else
              Container(
                height: 300,
                color: AppColors.border,
                child: const Center(
                  child: Icon(Icons.image_outlined,
                      size: 60, color: AppColors.neutral),
                ),
              ),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const StepIndicator(currentStep: 3, totalSteps: 4),
                  const SizedBox(height: 16),

                  // Category + Condition
                  Row(
                    children: [
                      if (listing.category.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            listing.category.toUpperCase(),
                            style: AppTextStyles.label.copyWith(
                              color: AppColors.primary,
                              fontSize: 11,
                            ),
                          ),
                        ),
                      const SizedBox(width: 8),
                      if (listing.condition.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.tertiary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            listing.condition,
                            style: AppTextStyles.label.copyWith(
                              color: AppColors.tertiary,
                              fontSize: 11,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Tên + Giá
                  Text(
                    listing.title.isNotEmpty ? listing.title : 'Tên sản phẩm',
                    style: AppTextStyles.headline2,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${_formatPrice(listing.price)}đ',
                    style: AppTextStyles.headline1
                        .copyWith(color: AppColors.primary),
                  ),
                  const Divider(height: 24),

                  // Mô tả
                  Text('Mô tả chi tiết', style: AppTextStyles.headline3),
                  const SizedBox(height: 8),
                  Text(
                    listing.description.isNotEmpty
                        ? listing.description
                        : 'Chưa có mô tả',
                    style: AppTextStyles.bodyLarge,
                  ),
                  const SizedBox(height: 16),

                  // Kích cỡ + Thương hiệu + Màu
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Kích cỡ',
                                style: AppTextStyles.bodyMedium),
                            Text(
                              listing.size.isNotEmpty ? listing.size : '--',
                              style: AppTextStyles.bodyLarge.copyWith(
                                  fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Màu sắc',
                                style: AppTextStyles.bodyMedium),
                            Text(
                              listing.color.isNotEmpty
                                  ? listing.color
                                  : '--',
                              style: AppTextStyles.bodyLarge.copyWith(
                                  fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 24),

                  // Giao hàng
                  if (listing.shipNationwide)
                    Row(
                      children: [
                        const Icon(Icons.local_shipping_outlined,
                            size: 18, color: AppColors.primary),
                        const SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Ship toàn quốc',
                                style: AppTextStyles.bodyLarge),
                            Text(
                              listing.shippingFee != null
                                  ? 'Phí ship: ${_formatPrice(listing.shippingFee!)}đ'
                                  : 'Phí ship: 22k - 35k',
                              style: AppTextStyles.bodyMedium
                                  .copyWith(fontSize: 12),
                            ),
                          ],
                        ),
                      ],
                    ),
                  if (listing.meetInPerson) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined,
                            size: 18, color: AppColors.primary),
                        const SizedBox(width: 8),
                        Text('Gặp trực tiếp',
                            style: AppTextStyles.bodyLarge),
                      ],
                    ),
                  ],
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ],
        ),
      ),

      // Bottom actions
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        decoration: BoxDecoration(
          color: AppColors.surface,
          border: Border(top: BorderSide(color: AppColors.border)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AppButton(
              label: '✓ Đăng bài ngay',
              isLoading: _isLoading,
              onPressed: _handlePost,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.arrow_back_rounded, size: 16),
                    label: const Text('Chỉnh sửa thêm'),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 44),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.save_outlined, size: 16),
                    label: const Text('Lưu nháp'),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 44),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}