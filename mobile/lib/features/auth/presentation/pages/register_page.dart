import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../routes/route_names.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_text_field.dart';

class RegisterPage extends StatefulWidget {
  /// roleName: 'MEMBER' | 'SELLER' | 'ORGANIZATION'
  /// Truyền vào từ SelectRolePage qua GoRouter extra
  final String roleName;

  const RegisterPage({super.key, this.roleName = 'MEMBER'});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _agreedToTerms = false;
  bool _isLoading = false;

  final _storage = const FlutterSecureStorage();

  @override
  void dispose() {
    _usernameController.dispose();
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_agreedToTerms) {
      _showSnack('Vui lòng đồng ý với điều khoản', isError: true);
      return;
    }
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      // 1. Đăng ký tài khoản
      await ApiClient.dio.post('/api/auth/register', data: {
        'username': _usernameController.text.trim(),
        'password': _passwordController.text,
        'email': _emailController.text.trim(),
        'fullName': _fullNameController.text.trim(),
        'phone': _phoneController.text.trim(),
        'roleName': widget.roleName,
      });

      // 2. Tự động login lấy token
      final loginRes = await ApiClient.dio.post('/api/auth/login', data: {
        'username': _usernameController.text.trim(),
        'password': _passwordController.text,
      });

      final token = loginRes.data['token'] as String;

      // 3. Lưu token vào secure storage
      await _storage.write(key: 'auth_token', value: token);

      if (!mounted) return;

      // 4. Điều hướng theo role
      if (widget.roleName == 'SELLER') {
        context.go(RouteNames.registerShop);
      } else if (widget.roleName == 'ORGANIZATION') {
        context.go(RouteNames.registerOrg);
      } else {
        context.go(RouteNames.productList);
      }
    } on DioException catch (e) {
      debugPrint('🔴 Register error: ${e.response?.data}');
      debugPrint('🔴 Status code: ${e.response?.statusCode}');
      debugPrint('🔴 Error type: ${e.type}');
      debugPrint('🔴 Error message: ${e.message}');
      debugPrint('🔴 Error cause: ${e.error}');
      final msg = e.response?.data?['message'] ?? 'Đăng ký thất bại';
      _showSnack(msg, isError: true);
    } catch (e) {
      debugPrint('🔴 Unknown error: $e');
      _showSnack('Đã có lỗi xảy ra, vui lòng thử lại', isError: true);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? AppColors.error : AppColors.primary,
      duration: const Duration(seconds: 4),
    ));
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

                // Avatar icon theo role
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    widget.roleName == 'SELLER'
                        ? Icons.storefront_rounded
                        : widget.roleName == 'ORGANIZATION'
                        ? Icons.volunteer_activism_rounded
                        : Icons.person_rounded,
                    color: Colors.white,
                    size: 32,
                  ),
                ),

                const SizedBox(height: 16),

                Text('Tạo tài khoản mới', style: AppTextStyles.headline2),
                const SizedBox(height: 6),
                Text(
                  widget.roleName == 'SELLER'
                      ? 'Đăng ký tài khoản Shop kinh doanh'
                      : widget.roleName == 'ORGANIZATION'
                      ? 'Đăng ký tài khoản Tổ chức từ thiện'
                      : 'Mỗi món đồ đều có vòng đời mới',
                  style: AppTextStyles.bodyMedium,
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 28),

                AppTextField(
                  label: 'Tên đăng nhập *',
                  hint: 'nguyenvana123',
                  controller: _usernameController,
                  validator: (v) {
                    if (v == null || v.isEmpty)
                      return 'Vui lòng nhập tên đăng nhập';
                    if (v.length < 4) return 'Tối thiểu 4 ký tự';
                    return null;
                  },
                ),

                const SizedBox(height: 14),

                AppTextField(
                  label: 'Họ và tên *',
                  hint: 'Nguyễn Văn A',
                  controller: _fullNameController,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Vui lòng nhập họ tên';
                    return null;
                  },
                ),

                const SizedBox(height: 14),

                AppTextField(
                  label: 'Email *',
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
                  label: 'Số điện thoại *',
                  hint: '09xx xxx xxx',
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  validator: (v) {
                    if (v == null || v.isEmpty)
                      return 'Vui lòng nhập số điện thoại';
                    if (v.length < 10) return 'Số điện thoại không hợp lệ';
                    return null;
                  },
                ),

                const SizedBox(height: 14),

                AppTextField(
                  label: 'Mật khẩu *',
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
                  label: 'Xác nhận mật khẩu *',
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
                    onPressed: () => setState(() =>
                    _obscureConfirmPassword = !_obscureConfirmPassword),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty)
                      return 'Vui lòng xác nhận mật khẩu';
                    if (v != _passwordController.text)
                      return 'Mật khẩu không khớp';
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
                  isLoading: _isLoading,
                  onPressed: _handleRegister,
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