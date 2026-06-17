import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/utils/profile_store.dart';
import '../../../../core/utils/listing_store.dart';

class MyShopPage extends StatefulWidget {
  const MyShopPage({super.key});

  @override
  State<MyShopPage> createState() => _MyShopPageState();
}

class _MyShopPageState extends State<MyShopPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
    );
  }

  @override
  Widget build(BuildContext context) {
    final profile = ProfileStore.instance.profile;
    final listings = ListingStore.instance.myListings;

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
                    style: AppTextStyles.headline3.copyWith(
                      color: Colors.white,
                    )),
              ],
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: profile.coverUrl.isNotEmpty
                  ? Image.network(profile.coverUrl, fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) {
                    return Container(color: AppColors.primary);
                  })
                  : Container(color: AppColors.primary),
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
                    ),
                    child: ClipOval(
                      child: profile.avatarUrl.isNotEmpty
                          ? Image.network(profile.avatarUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) {
                            return Container(
                              color: AppColors.primary.withOpacity(0.2),
                              child: const Icon(Icons.person,
                                  size: 40, color: AppColors.primary),
                            );
                          })
                          : Container(
                        color: AppColors.primary.withOpacity(0.2),
                        child: const Icon(Icons.person,
                            size: 40, color: AppColors.primary),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  Text(profile.name, style: AppTextStyles.headline2),
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildStat('${listings.length}', 'đang bán'),
                      _buildStatDivider(),
                      _buildStat('${profile.sold}', 'đã bán'),
                      _buildStatDivider(),
                      Column(
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.star_rounded,
                                  color: Colors.amber, size: 18),
                              const SizedBox(width: 2),
                              Text('${profile.rating}',
                                  style: AppTextStyles.headline3),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text('đánh giá', style: AppTextStyles.bodyMedium),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Nhắn tin button
                  ElevatedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.chat_bubble_outline_rounded,
                        size: 18),
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
                labelStyle: AppTextStyles.bodyLarge.copyWith(
                  fontWeight: FontWeight.w600,
                ),
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
            listings.isEmpty
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
              itemCount: listings.length,
              itemBuilder: (context, index) {
                final listing = listings[index];
                return Container(
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Stack(
                        children: [
                          ClipRRect(
                            borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(12),
                            ),
                            child: listing.imagePaths.isNotEmpty
                                ? Image.network(
                              listing.imagePaths.first,
                              height: 140,
                              width: double.infinity,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) =>
                                  Container(
                                    height: 140,
                                    color: AppColors.border,
                                    child:
                                    const Icon(Icons.image_outlined),
                                  ),
                            )
                                : Container(
                              height: 140,
                              color: AppColors.border,
                              child:
                              const Icon(Icons.image_outlined),
                            ),
                          ),
                          Positioned(
                            top: 8,
                            left: 8,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.secondary,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'Mới',
                                style: AppTextStyles.label.copyWith(
                                  color: Colors.white,
                                  fontSize: 10,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      Padding(
                        padding: const EdgeInsets.all(8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              listing.title,
                              style: AppTextStyles.label,
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
                          ],
                        ),
                      ),
                    ],
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

  Widget _buildStatDivider() {
    return Container(width: 1, height: 30, color: AppColors.border);
  }
}

class _SliverTabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;
  _SliverTabBarDelegate(this.tabBar);

  @override
  double get minExtent => tabBar.preferredSize.height;
  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: AppColors.background,
      child: tabBar,
    );
  }

  @override
  bool shouldRebuild(_SliverTabBarDelegate oldDelegate) => false;
}