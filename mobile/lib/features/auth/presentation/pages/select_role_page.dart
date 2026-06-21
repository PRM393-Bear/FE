import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../routes/route_names.dart';

enum RegisterRole { member, shop, organization }

class SelectRolePage extends StatefulWidget {
  const SelectRolePage({super.key});

  @override
  State<SelectRolePage> createState() => _SelectRolePageState();
}

class _SelectRolePageState extends State<SelectRolePage> {
  RegisterRole? _selectedRole;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 8),
              Text(
                'Bạn muốn đăng ký loại tài\nkhoản nào?',
                style: AppTextStyles.headline2,
              ),
              const SizedBox(height: 8),
              Text(
                'Hãy chọn loại hình phù hợp nhất để chúng tôi tối\nưu trải nghiệm cho bạn.',
                style: AppTextStyles.bodyMedium
                    .copyWith(color: AppColors.primary),
              ),
              const SizedBox(height: 28),

              _RoleCard(
                icon: Icons.person_outline_rounded,
                title: 'Cá nhân',
                description: 'Mua bán đồ cũ, tặng đồ, tham gia cộng đồng',
                badge: 'Miễn phí, không cần duyệt',
                badgeColor: AppColors.primary,
                isSelected: _selectedRole == RegisterRole.member,
                onTap: () => setState(() => _selectedRole = RegisterRole.member),
              ),
              const SizedBox(height: 14),

              _RoleCard(
                icon: Icons.storefront_outlined,
                title: 'Shop kinh doanh',
                description: 'Bán không giới hạn, tạo Bundle, xem báo cáo doanh thu',
                badge: 'Cần xác minh giấy tờ',
                badgeColor: AppColors.secondary,
                isSelected: _selectedRole == RegisterRole.shop,
                onTap: () => setState(() => _selectedRole = RegisterRole.shop),
              ),
              const SizedBox(height: 14),

              _RoleCard(
                icon: Icons.volunteer_activism_outlined,
                title: 'Tổ chức từ thiện',
                description: 'Nhận đồ quyên góp, tạo sự kiện từ thiện, kết nối cộng đồng',
                isSelected: _selectedRole == RegisterRole.organization,
                onTap: () => setState(() => _selectedRole = RegisterRole.organization),
              ),

              const Spacer(),

              AppButton(
                label: 'Tiếp tục  →',
                onPressed: _selectedRole == null
                    ? null
                    : () => _navigateToRegister(context),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  void _navigateToRegister(BuildContext context) {
    // Tất cả 3 role đều vào RegisterPage trước
    // Truyền roleName qua extra để RegisterPage biết role
    switch (_selectedRole!) {
      case RegisterRole.member:
        context.push(RouteNames.register, extra: 'MEMBER');
        break;
      case RegisterRole.shop:
        context.push(RouteNames.register, extra: 'SELLER');
        break;
      case RegisterRole.organization:
        context.push(RouteNames.register, extra: 'ORGANIZATION');
        break;
    }
  }
}

// ─── Widget card chọn role ───────────────────────────────────────────────────

class _RoleCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final String? badge;
  final Color? badgeColor;
  final bool isSelected;
  final VoidCallback onTap;

  const _RoleCard({
    required this.icon,
    required this.title,
    required this.description,
    this.badge,
    this.badgeColor,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1.5,
          ),
          boxShadow: isSelected
              ? [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.12),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ]
              : [],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppColors.primary, size: 24),
            ),
            const SizedBox(width: 14),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTextStyles.bodyLarge),
                  const SizedBox(height: 4),
                  Text(description,
                      style: AppTextStyles.bodyMedium
                          .copyWith(color: AppColors.textSecondary)),
                  if (badge != null) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: (badgeColor ?? AppColors.primary)
                            .withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        badge!,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: badgeColor ?? AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ]
                ],
              ),
            ),

            const SizedBox(width: 8),
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.border,
                  width: 2,
                ),
              ),
              child: isSelected
                  ? Center(
                child: Container(
                  width: 12,
                  height: 12,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.primary,
                  ),
                ),
              )
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}