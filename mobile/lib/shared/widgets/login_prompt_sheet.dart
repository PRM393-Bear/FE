// mobile/lib/shared/widgets/login_prompt_sheet.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../routes/route_names.dart';
import 'app_button.dart';

/// Bottom sheet dùng chung cho mọi hành động mà Guest (chưa đăng nhập)
/// không được phép thực hiện: mua hàng, chat, lưu sản phẩm, đăng bán...
///
/// Cách dùng:
/// ```dart
/// LoginPromptSheet.show(context, message: 'Đăng nhập để mua sản phẩm này');
/// ```
class LoginPromptSheet {
  static Future<void> show(
      BuildContext context, {
        String message = 'Đăng nhập để tiếp tục sử dụng tính năng này',
      }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _LoginPromptContent(message: message),
    );
  }
}

class _LoginPromptContent extends StatelessWidget {
  final String message;
  const _LoginPromptContent({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        24,
        12,
        24,
        MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.border,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 20),

          // Icon
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.lock_outline_rounded,
              color: AppColors.primary,
              size: 30,
            ),
          ),
          const SizedBox(height: 16),

          Text(
            'Bạn cần đăng nhập',
            style: AppTextStyles.headline3,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: AppTextStyles.bodyMedium
                .copyWith(color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),

          // Đăng nhập
          SizedBox(
            width: double.infinity,
            child: AppButton(
              label: 'Đăng nhập',
              onPressed: () {
                Navigator.pop(context);
                // push (không go) để giữ lại màn đang xem, back về được
                context.push(RouteNames.login);
              },
            ),
          ),
          const SizedBox(height: 10),

          // Đăng ký tài khoản mới
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {
                Navigator.pop(context);
                context.push(RouteNames.selectRole);
              },
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(0, 48),
                side: const BorderSide(color: AppColors.border),
              ),
              child: Text(
                'Đăng ký tài khoản mới',
                style: AppTextStyles.bodyLarge,
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Tiếp tục xem (dismiss)
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Tiếp tục xem',
              style: AppTextStyles.bodyMedium
                  .copyWith(color: AppColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }
}