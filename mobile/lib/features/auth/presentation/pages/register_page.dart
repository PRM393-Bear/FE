import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_text_field.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _agreedToTerms = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Tham gia cộng đồng', style: AppTextStyles.headline3),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 24),

                // Avatar placeholder
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.person_rounded,
                    color: Colors.white,
                    size: 32,
                  ),
                ),

                const SizedBox(height: 16),

                Text('Tạo tài khoản mới', style: AppTextStyles.headline2),
                const SizedBox(height: 6),
                Text(
                  'Mỗi món đồ đều có vòng đời mới',
                  style: AppTextStyles.bodyMedium,
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 28),

                AppTextField(
                  label: 'Họ và tên',
                  hint: 'Nguyễn Văn A',
                  controller: _nameController,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Vui lòng nhập họ tên';
                    return null;
                  },
                ),

                const SizedBox(height: 14),

                AppTextField(
                  label: 'Email',
                  hint: 'email@vi-du.com',
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Vui lòng nhập email';
                    if (!v.contains('@')) return 'Email không hợp lệ';
                    return null;
                  },
                ),

                const SizedBox(height: 14),

                AppTextField(
                  label: 'Số điện thoại',
                  hint: '09xx xxx xxx',
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Vui lòng nhập số điện thoại';
                    if (v.length < 10) return 'Số điện thoại không hợp lệ';
                    return null;
                  },
                ),

                const SizedBox(height: 14),

                AppTextField(
                  label: 'Mật khẩu',
                  hint: '••••••••',
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      color: AppColors.neutral,
                    ),
                    onPressed: () =>
                        setState(() => _obscurePassword = !_obscurePassword),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Vui lòng nhập mật khẩu';
                    if (v.length < 6) return 'Mật khẩu tối thiểu 6 ký tự';
                    return null;
                  },
                ),

                const SizedBox(height: 14),

                AppTextField(
                  label: 'Xác nhận mật khẩu',
                  hint: '••••••••',
                  controller: _confirmPasswordController,
                  obscureText: _obscureConfirmPassword,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscureConfirmPassword
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      color: AppColors.neutral,
                    ),
                    onPressed: () => setState(
                          () => _obscureConfirmPassword = !_obscureConfirmPassword,
                    ),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Vui lòng xác nhận mật khẩu';
                    if (v != _passwordController.text) return 'Mật khẩu không khớp';
                    return null;
                  },
                ),

                const SizedBox(height: 16),

                // Checkbox Terms
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Checkbox(
                      value: _agreedToTerms,
                      activeColor: AppColors.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                      ),
                      onChanged: (v) =>
                          setState(() => _agreedToTerms = v ?? false),
                    ),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 12),
                        child: RichText(
                          text: TextSpan(
                            style: AppTextStyles.bodyMedium,
                            children: [
                              const TextSpan(text: 'Tôi đồng ý với các '),
                              TextSpan(
                                text: 'Điều khoản',
                                style: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const TextSpan(text: ' & '),
                              TextSpan(
                                text: 'Chính sách bảo mật',
                                style: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const TextSpan(text: ' của cộng đồng.'),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                AppButton(
                  label: 'Đăng ký ngay',
                  onPressed: () {
                    if (!_agreedToTerms) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Vui lòng đồng ý với điều khoản'),
                          backgroundColor: Colors.redAccent,
                        ),
                      );
                      return;
                    }
                    if (_formKey.currentState!.validate()) {
                      // TODO: call register API
                    }
                  },
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }
}