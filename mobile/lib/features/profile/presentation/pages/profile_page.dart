import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../routes/route_names.dart';
import 'edit_profile_page.dart';
import 'my_shop_page.dart';
import 'setting_page.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  String _fullName = '';
  String _username = '';
  String _email = '';
  String _phone = '';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiClient.dio.get('/api/user/me');
      setState(() {
        _fullName = res.data['fullName'] ?? '';
        _username = res.data['username'] ?? '';
        _email = res.data['email'] ?? '';
        _phone = res.data['phone'] ?? '';
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch profile error: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleLogout() async {
    const storage = FlutterSecureStorage();
    await storage.delete(key: 'auth_token');
    if (!mounted) return;
    context.go(RouteNames.login);
  }

  String get _displayName => _fullName.isNotEmpty ? _fullName : _username;
  String get _avatarLetter => _displayName.isNotEmpty
      ? _displayName[0].toUpperCase()
      : '?';

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: _isLoading
            ? const Center(
            child: CircularProgressIndicator(color: AppColors.primary))
            : RefreshIndicator(
          color: AppColors.primary,
          onRefresh: _fetchProfile,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              children: [
                // ── Cover + Avatar ──────────────────────────
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    // Cover
                    Container(
                      height: 160,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppColors.primary,
                            AppColors.primaryLight,
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                    ),

                    // AppBar overlay
                    Positioned(
                      top: 0, left: 0, right: 0,
                      child: SafeArea(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const SizedBox(width: 48),
                              Text('Profile',
                                  style: AppTextStyles.headline3
                                      .copyWith(color: Colors.white)),
                              IconButton(
                                icon: const Icon(Icons.more_vert_rounded,
                                    color: Colors.white),
                                onPressed: () {},
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                    // Avatar
                    Positioned(
                      bottom: -40,
                      left: 16,
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                          color: AppColors.primary.withOpacity(0.2),
                        ),
                        child: ClipOval(
                          child: Container(
                            color: AppColors.primaryLight.withOpacity(0.3),
                            child: Center(
                              child: Text(
                                _avatarLetter,
                                style: AppTextStyles.headline1
                                    .copyWith(color: AppColors.primary),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 52),

                // ── Name + Edit ──────────────────────────────
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(_displayName,
                                style: AppTextStyles.headline2),
                            if (_username.isNotEmpty)
                              Text('@$_username',
                                  style: AppTextStyles.bodyMedium.copyWith(
                                      color: AppColors.textSecondary)),
                            if (_email.isNotEmpty)
                              Text(_email,
                                  style: AppTextStyles.bodyMedium),
                            if (_phone.isNotEmpty)
                              Text(_phone,
                                  style: AppTextStyles.bodyMedium),
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: () async {
                          await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => EditProfilePage(
                                fullName: _fullName,
                                phone: _phone,
                                email: _email,
                              ),
                            ),
                          );
                          _fetchProfile();
                        },
                        child: Row(
                          children: [
                            const Icon(Icons.edit_outlined,
                                size: 16, color: AppColors.primary),
                            const SizedBox(width: 4),
                            Text('Chỉnh sửa',
                                style: AppTextStyles.bodyMedium
                                    .copyWith(color: AppColors.primary)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // ── Stats ────────────────────────────────────
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        _buildStat('0', 'Đã bán'),
                        _buildStatDivider(),
                        _buildStat('0', 'Đã mua'),
                        _buildStatDivider(),
                        _buildStat('0', 'Đã tặng'),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // ── Đơn hàng ─────────────────────────────────
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
                        _buildMenuItem(
                          icon: Icons.shopping_bag_outlined,
                          title: 'Đơn hàng của tôi',
                          onTap: () {},
                        ),
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _buildOrderStatus(
                                  Icons.access_time_outlined,
                                  'Chờ xác nhận', '0'),
                              _buildOrderStatus(
                                  Icons.local_shipping_outlined,
                                  'Đang giao', '0'),
                              _buildOrderStatus(
                                  Icons.check_circle_outline_rounded,
                                  'Hoàn tất', '0'),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // ── Menu chính ───────────────────────────────
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      children: [
                        _buildMenuItem(
                          icon: Icons.storefront_outlined,
                          title: 'Xem shop của tôi',
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => MyShopPage(
                                fullName: _fullName,
                                username: _username,
                              ),
                            ),
                          ),
                        ),
                        _buildDivider(),
                        _buildMenuItem(
                          icon: Icons.checkroom_outlined,
                          title: 'Tủ đồ',
                          onTap: () => context.push(RouteNames.wardrobe),
                        ),
                        _buildDivider(),
                        _buildMenuItem(
                          icon: Icons.card_giftcard_outlined,
                          title: 'Yêu cầu tặng đồ',
                          onTap: () {},
                        ),
                        _buildDivider(),
                        _buildMenuItem(
                          icon: Icons.favorite_outline_rounded,
                          iconColor: Colors.redAccent,
                          title: 'Sản phẩm đã lưu',
                          onTap: () {},
                        ),
                        _buildDivider(),
                        _buildMenuItem(
                          icon: Icons.star_outline_rounded,
                          iconColor: Colors.amber,
                          title: 'Đánh giá đã nhận',
                          onTap: () {},
                        ),
                        _buildDivider(),
                        _buildMenuItem(
                          icon: Icons.storefront_outlined,
                          title: 'Seller Dashboard',
                          onTap: () => context.push(RouteNames.sellerDashboard),
                        ),
                        _buildDivider(),
                        _buildMenuItem(
                          icon: Icons.volunteer_activism_outlined,
                          title: 'Organization Dashboard',
                          onTap: () => context.push(RouteNames.orgDashboard),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // ── Settings ─────────────────────────────────
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      children: [
                        _buildMenuItem(
                          icon: Icons.settings_outlined,
                          title: 'Cài đặt',
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => const SettingsPage()),
                          ),
                        ),
                        _buildDivider(),
                        _buildMenuItem(
                          icon: Icons.notifications_outlined,
                          title: 'Thông báo',
                          onTap: () {},
                        ),
                        _buildDivider(),
                        _buildMenuItem(
                          icon: Icons.logout_rounded,
                          iconColor: Colors.redAccent,
                          title: 'Đăng xuất',
                          titleColor: Colors.redAccent,
                          onTap: () => showDialog(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              title: const Text('Đăng xuất'),
                              content: const Text(
                                  'Bạn có chắc muốn đăng xuất không?'),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(ctx),
                                  child: const Text('Hủy'),
                                ),
                                TextButton(
                                  onPressed: () {
                                    Navigator.pop(ctx);
                                    _handleLogout();
                                  },
                                  child: const Text('Đăng xuất',
                                      style: TextStyle(
                                          color: Colors.redAccent)),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildOrderStatus(IconData icon, String label, String count) {
    return Column(
      children: [
        Stack(
          clipBehavior: Clip.none,
          children: [
            Icon(icon, color: AppColors.primary, size: 28),
            if (count != '0')
              Positioned(
                top: -4, right: -8,
                child: Container(
                  padding: const EdgeInsets.all(3),
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                  child: Text(count,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold)),
                ),
              ),
          ],
        ),
        const SizedBox(height: 4),
        Text(label,
            style: AppTextStyles.bodySmall
                .copyWith(color: AppColors.textSecondary)),
      ],
    );
  }

  Widget _buildStat(String value, String label) {
    return Expanded(
      child: Column(
        children: [
          Text(value,
              style: AppTextStyles.headline2
                  .copyWith(color: AppColors.primary)),
          const SizedBox(height: 4),
          Text(label, style: AppTextStyles.bodyMedium),
        ],
      ),
    );
  }

  Widget _buildStatDivider() =>
      Container(width: 1, height: 40, color: AppColors.border);

  Widget _buildDivider() =>
      const Divider(height: 1, indent: 16, endIndent: 16);

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? iconColor,
    Color? titleColor,
  }) {
    return ListTile(
      leading: Icon(icon, color: iconColor ?? AppColors.primary, size: 22),
      title: Text(title,
          style: AppTextStyles.bodyLarge
              .copyWith(color: titleColor ?? AppColors.textPrimary)),
      trailing:
      const Icon(Icons.chevron_right_rounded, color: AppColors.neutral),
      onTap: onTap,
    );
  }
}