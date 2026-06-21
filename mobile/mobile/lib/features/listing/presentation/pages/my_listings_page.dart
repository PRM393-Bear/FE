import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/utils/listing_store.dart';
import '../../../../routes/route_names.dart';
import '../../../listing/presentation/pages/upload_image_page.dart';
import 'listing_form_page.dart';

class MyListingsPage extends StatefulWidget {
  const MyListingsPage({super.key});

  @override
  State<MyListingsPage> createState() => _MyListingsPageState();
}

class _MyListingsPageState extends State<MyListingsPage> {
  String _selectedTab = 'Đang bán';
  final List<String> _tabs = ['Đang bán', 'Đã bán', 'Nháp', 'Ẩn'];

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
    );
  }

  @override
  Widget build(BuildContext context) {
    final listings = ListingStore.instance.myListings;

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Row(
          children: [
            const Icon(Icons.eco_rounded, color: AppColors.primary, size: 20),
            const SizedBox(width: 6),
            Text('Bài đăng của tôi', style: AppTextStyles.headline3),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Stats row
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                _buildStat('${listings.length}', 'Đang bán'),
                _buildDivider(),
                _buildStat('12', 'Đã bán'),
                _buildDivider(),
                _buildStat('2', 'Nháp'),
              ],
            ),
          ),

          // Filter tabs
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _tabs.map((tab) {
                  final isSelected = tab == _selectedTab;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedTab = tab),
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
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
                      child: Text(
                        tab,
                        style: AppTextStyles.label.copyWith(
                          color: isSelected
                              ? Colors.white
                              : AppColors.textSecondary,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          const SizedBox(height: 16),

          // List
          Expanded(
            child: listings.isEmpty
                ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.inbox_outlined,
                      size: 60, color: AppColors.neutral),
                  const SizedBox(height: 12),
                  Text('Chưa có bài đăng nào',
                      style: AppTextStyles.bodyLarge),
                  const SizedBox(height: 4),
                  Text(
                    'Hãy đăng bán món đồ đầu tiên của bạn!',
                    style: AppTextStyles.bodyMedium,
                  ),
                ],
              ),
            )
                : ListView.builder(
              padding: const EdgeInsets.only(
                left: 16,
                right: 16,
                bottom: 80, // tránh FAB che nội dung
              ),
              itemCount: listings.length,
              itemBuilder: (context, index) {
                final listing = listings[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      // Ảnh
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: listing.imagePaths.isNotEmpty
                            ? Image.network(
                          listing.imagePaths.first,
                          width: 80,
                          height: 80,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              _buildImagePlaceholder(),
                        )
                            : _buildImagePlaceholder(),
                      ),
                      const SizedBox(width: 12),

                      // Info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              listing.title,
                              style: AppTextStyles.bodyLarge.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${_formatPrice(listing.price)}đ',
                              style: AppTextStyles.bodyLarge.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary
                                        .withOpacity(0.1),
                                    borderRadius:
                                    BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    '● Đang bán',
                                    style: AppTextStyles.label.copyWith(
                                      color: AppColors.primary,
                                      fontSize: 11,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Cập nhật: Vừa xong',
                                  style: AppTextStyles.bodyMedium
                                      .copyWith(fontSize: 11),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      // Actions
                      Column(
                        children: [
                          // Nút chỉnh sửa
                          IconButton(
                            icon: const Icon(
                              Icons.edit_outlined,
                              color: AppColors.neutral,
                              size: 20,
                            ),
                            onPressed: () async {
                              await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ListingFormPage(
                                    imagePaths: listing.imagePaths,
                                    existingListing: listing,
                                    existingIndex: index,
                                  ),
                                ),
                              );
                              // Refresh lại danh sách sau khi edit
                              setState(() {});
                            },
                          ),

                          // Nút xóa
                          IconButton(
                            icon: const Icon(
                              Icons.delete_outline_rounded,
                              color: Colors.redAccent,
                              size: 20,
                            ),
                            onPressed: () {
                              // Hiện dialog xác nhận trước khi xóa
                              showDialog(
                                context: context,
                                builder: (ctx) => AlertDialog(
                                  title: const Text('Xóa bài đăng'),
                                  content: const Text(
                                    'Bạn có chắc muốn xóa bài đăng này không?',
                                  ),
                                  actions: [
                                    TextButton(
                                      onPressed: () =>
                                          Navigator.pop(ctx),
                                      child: const Text('Hủy'),
                                    ),
                                    TextButton(
                                      onPressed: () {
                                        setState(() {
                                          ListingStore.instance
                                              .myListings
                                              .removeAt(index);
                                        });
                                        Navigator.pop(ctx);
                                      },
                                      child: Text(
                                        'Xóa',
                                        style: TextStyle(
                                            color: Colors.redAccent),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),

      // FAB Đăng bán mới
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => const UploadImagePage(),
          ),
        ),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: Text(
          'Đăng bán mới',
          style: AppTextStyles.label.copyWith(color: Colors.white),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _buildStat(String value, String label) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: AppTextStyles.headline2.copyWith(
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          Text(label, style: AppTextStyles.bodyMedium),
        ],
      ),
    );
  }

  Widget _buildDivider() {
    return Container(
      width: 1,
      height: 40,
      color: AppColors.border,
    );
  }

  Widget _buildImagePlaceholder() {
    return Container(
      width: 80,
      height: 80,
      color: AppColors.border,
      child: const Icon(Icons.image_outlined, color: AppColors.neutral),
    );
  }
}