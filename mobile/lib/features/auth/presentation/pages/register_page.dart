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
import 'verify_otp_page.dart';

class RegisterPage extends StatefulWidget {
  /// roleName: 'MEMBER' | 'ORGANIZATION'
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
      // 1. Đăng ký tài khoản (BE tự gửi OTP về email)
      await ApiClient.dio.post('/api/auth/register', data: {
        'username': _usernameController.text.trim(),
        'password': _passwordController.text,
        'email': _emailController.text.trim(),
        'fullName': _fullNameController.text.trim(),
        'phone': _phoneController.text.trim(),
        'roleName': widget.roleName,
      });

      if (!mounted) return;

      // 2. Điều hướng sang màn hình nhập OTP — KHÔNG login ngay
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => VerifyOtpPage(
            email: _emailController.text.trim(),
            username: _usernameController.text.trim(),
            password: _passwordController.text,
            roleName: widget.roleName,
          ),
        ),
      );
    } on DioException catch (e) {
      debugPrint('🔴 Register error type: ${e.type}');
      debugPrint('🔴 Register error response: ${e.response?.data}');

      if (!mounted) return;

      // 1. Xử lý lỗi Timeout (OTP đã gửi nhưng app ko nhận được phản hồi kịp)
      if (e.type == DioExceptionType.receiveTimeout || e.type == DioExceptionType.connectionTimeout) {
        _showTimeoutDialog();
        return;
      }

      // 2. Xử lý lỗi từ Server trả về
      String msg = e.response?.data?['message']?.toString() ?? 'Đăng ký thất bại';
      _showSnack(msg, isError: true);

      // Nếu email đã tồn tại (do lần đăng ký trước bị timeout hoặc lỗi nửa chừng), gợi ý nhập OTP luôn
      if (msg.toLowerCase().contains('exists') || msg.toLowerCase().contains('tồn tại')) {
        _showVerifyAccountOption();
      }
    } catch (e) {
      debugPrint('🔴 Unknown error: $e');
      _showSnack('Đã có lỗi xảy ra, vui lòng thử lại', isError: true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showTimeoutDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text('Đang gửi mã xác thực...'),
        content: const Text(
            'Yêu cầu của bạn đang được hệ thống xử lý. Vui lòng kiểm tra email xem có mã OTP chưa và nhấn Tiếp tục.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Chờ thêm')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              _navigateToVerifyOtp();
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('Tiếp tục nhập OTP', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _navigateToVerifyOtp() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => VerifyOtpPage(
          email: _emailController.text.trim(),
          username: _usernameController.text.trim(),
          password: _passwordController.text,
          roleName: widget.roleName,
        ),
      ),
    );
  }

  void _showVerifyAccountOption() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Tài khoản đã tồn tại'),
        content: const Text('Email này đã được đăng ký trên hệ thống nhưng có thể chưa xác thực thành công. Bạn có muốn thử nhập mã OTP ngay không?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _navigateToVerifyOtp();
            },
            child: const Text('Nhập mã OTP'),
          ),
        ],
      ),
    );
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
                    widget.roleName == 'ORGANIZATION'
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
                  widget.roleName == 'ORGANIZATION'
                      ? 'Đăng ký tài khoản Tổ chức từ thiện'
                      : 'Đăng ký tài khoản Cá nhân',
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