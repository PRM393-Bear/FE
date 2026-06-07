import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/utils/profile_store.dart';
import '../../../../routes/route_names.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final profile = ProfileStore.instance.profile;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // Header with Cover Image
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            backgroundColor: AppColors.primary,
            flexibleSpace: FlexibleSpaceBar(
              background: Image.network(
                profile.coverUrl,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(color: AppColors.primary),
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.settings_outlined, color: Colors.white),
                onPressed: () {},
              ),
            ],
          ),

          SliverToBoxAdapter(
            child: Column(
              children: [
                // Avatar & Basic Info
                Transform.translate(
                  offset: const Offset(0, -50),
                  child: Column(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 4),
                        ),
                        child: CircleAvatar(
                          radius: 50,
                          backgroundImage: NetworkImage(profile.avatarUrl),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(profile.name, style: AppTextStyles.headline2),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.star_rounded, color: Colors.amber, size: 18),
                          const SizedBox(width: 4),
                          Text(
                            '${profile.rating} (${profile.ratingCount} đánh giá)',
                            style: AppTextStyles.bodyMedium,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Stats
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatItem('Đã bán', profile.sold.toString()),
                      _buildStatItem('Đã mua', profile.bought.toString()),
                      _buildStatItem('Quyên góp', profile.donated.toString()),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Menu Items
                _buildMenuItem(
                  icon: Icons.edit_outlined,
                  title: 'Chỉnh sửa hồ sơ',
                  onTap: () => context.push(RouteNames.profile + '/edit'),
                ),
                _buildMenuItem(
                  icon: Icons.inventory_2_outlined,
                  title: 'Tin đăng của tôi',
                  onTap: () => context.push(RouteNames.myListings),
                ),
                _buildMenuItem(
                  icon: Icons.location_on_outlined,
                  title: 'Địa chỉ đã lưu',
                  onTap: () {},
                ),
                _buildMenuItem(
                  icon: Icons.help_outline_rounded,
                  title: 'Trung tâm trợ giúp',
                  onTap: () {},
                ),
                _buildMenuItem(
                  icon: Icons.logout_rounded,
                  title: 'Đăng xuất',
                  titleColor: Colors.red,
                  iconColor: Colors.red,
                  onTap: () => context.go(RouteNames.login),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(value, style: AppTextStyles.headline3.copyWith(color: AppColors.primary)),
        const SizedBox(height: 4),
        Text(label, style: AppTextStyles.bodyMedium),
      ],
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? titleColor,
    Color? iconColor,
  }) {
    return ListTile(
      leading: Icon(icon, color: iconColor ?? AppColors.textPrimary),
      title: Text(title, style: AppTextStyles.bodyLarge.copyWith(color: titleColor)),
      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
      onTap: onTap,
    );
  }
}
