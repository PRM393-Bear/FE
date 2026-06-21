import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../routes/route_names.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _orderUpdates = true;
  bool _chatNotif = true;
  bool _community = false;
  bool _events = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Cài đặt', style: AppTextStyles.headline3),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert_rounded),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ACCOUNT
            _buildSectionTitle('ACCOUNT'),
            const SizedBox(height: 8),
            _buildCard([
              _buildMenuItem(
                icon: Icons.lock_outline_rounded,
                title: 'Đổi mật khẩu',
                onTap: () {},
              ),
              const Divider(height: 1, indent: 16, endIndent: 16),
              _buildMenuItem(
                icon: Icons.link_rounded,
                title: 'Liên kết tài khoản',
                onTap: () {},
              ),
              const Divider(height: 1, indent: 16, endIndent: 16),
              _buildMenuItem(
                icon: Icons.verified_user_outlined,
                title: 'Xác minh danh tính',
                trailing: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.secondary.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'Chưa xác minh',
                    style: AppTextStyles.label.copyWith(
                      color: AppColors.secondary,
                      fontSize: 11,
                    ),
                  ),
                ),
                onTap: () {},
              ),
            ]),

            const SizedBox(height: 24),

            // NOTIFICATIONS
            _buildSectionTitle('NOTIFICATIONS'),
            const SizedBox(height: 8),
            _buildCard([
              _buildSwitchItem(
                title: 'Order updates',
                subtitle: 'Trạng thái đơn hàng và vận chuyển',
                value: _orderUpdates,
                onChanged: (v) => setState(() => _orderUpdates = v),
              ),
              const Divider(height: 1, indent: 16, endIndent: 16),
              _buildSwitchItem(
                title: 'Chat',
                subtitle: 'Tin nhắn từ người dùng khác',
                value: _chatNotif,
                onChanged: (v) => setState(() => _chatNotif = v),
              ),
              const Divider(height: 1, indent: 16, endIndent: 16),
              _buildSwitchItem(
                title: 'Community',
                subtitle: 'Tương tác trong cộng đồng',
                value: _community,
                onChanged: (v) => setState(() => _community = v),
              ),
              const Divider(height: 1, indent: 16, endIndent: 16),
              _buildSwitchItem(
                title: 'Events',
                subtitle: 'Sự kiện sắp diễn ra gần bạn',
                value: _events,
                onChanged: (v) => setState(() => _events = v),
              ),
            ]),

            const SizedBox(height: 24),

            // PRIVACY
            _buildSectionTitle('PRIVACY'),
            const SizedBox(height: 8),
            _buildCard([
              _buildMenuItem(
                title: 'Ai có thể xem hồ sơ',
                subtitle: 'Mọi người',
                onTap: () {},
              ),
              const Divider(height: 1, indent: 16, endIndent: 16),
              _buildMenuItem(
                title: 'Ai có thể nhắn tin',
                subtitle: 'Bạn bè',
                onTap: () {},
              ),
            ]),

            const SizedBox(height: 24),

            // LANGUAGE
            _buildSectionTitle('LANGUAGE'),
            const SizedBox(height: 8),
            _buildCard([
              ListTile(
                leading: const Icon(Icons.language_rounded,
                    color: AppColors.primary),
                title: Text('Tiếng Việt', style: AppTextStyles.bodyLarge),
                trailing: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('🇻🇳', style: TextStyle(fontSize: 20)),
                    SizedBox(width: 4),
                    Icon(Icons.keyboard_arrow_down_rounded,
                        color: AppColors.neutral),
                  ],
                ),
                onTap: () {},
              ),
            ]),

            const SizedBox(height: 24),

            // SUPPORT
            _buildSectionTitle('SUPPORT'),
            const SizedBox(height: 8),
            _buildCard([
              _buildMenuItem(
                icon: Icons.help_outline_rounded,
                title: 'Trợ giúp & Hỗ trợ',
                trailing: const Icon(Icons.open_in_new_rounded,
                    color: AppColors.neutral, size: 18),
                onTap: () {},
              ),
              const Divider(height: 1, indent: 16, endIndent: 16),
              _buildMenuItem(
                icon: Icons.description_outlined,
                title: 'Điều khoản sử dụng',
                onTap: () {},
              ),
            ]),

            const SizedBox(height: 24),

            // Xóa tài khoản
            OutlinedButton.icon(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Xóa tài khoản'),
                    content: const Text(
                        'Bạn có chắc muốn xóa tài khoản? Hành động này không thể hoàn tác.'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: const Text('Hủy'),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.pop(ctx);
                          context.go(RouteNames.login);
                        },
                        child: const Text(
                          'Xóa tài khoản',
                          style: TextStyle(color: Colors.redAccent),
                        ),
                      ),
                    ],
                  ),
                );
              },
              icon: const Icon(Icons.delete_outline_rounded,
                  color: Colors.redAccent),
              label: const Text('Xóa tài khoản'),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
                side: const BorderSide(color: Colors.redAccent),
                foregroundColor: Colors.redAccent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),

            const SizedBox(height: 12),

            Center(
              child: Text(
                'Phiên bản 2.4.1 (Build 1082)',
                style: AppTextStyles.bodyMedium.copyWith(fontSize: 12),
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        title,
        style: AppTextStyles.label.copyWith(
          color: AppColors.textSecondary,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildCard(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(children: children),
    );
  }

  Widget _buildMenuItem({
    IconData? icon,
    required String title,
    String? subtitle,
    Widget? trailing,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: icon != null
          ? Icon(icon, color: AppColors.primary, size: 22)
          : null,
      title: Text(title, style: AppTextStyles.bodyLarge),
      subtitle: subtitle != null
          ? Text(subtitle, style: AppTextStyles.bodyMedium)
          : null,
      trailing: trailing ??
          const Icon(Icons.chevron_right_rounded, color: AppColors.neutral),
      onTap: onTap,
    );
  }

  Widget _buildSwitchItem({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return SwitchListTile(
      value: value,
      activeColor: AppColors.primary,
      onChanged: onChanged,
      title: Text(title, style: AppTextStyles.bodyLarge),
      subtitle: Text(subtitle, style: AppTextStyles.bodyMedium),
    );
  }
}