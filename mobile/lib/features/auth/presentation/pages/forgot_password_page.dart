import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_text_field.dart';

/// Màn hình Quên mật khẩu — luồng 3 bước: Email -> OTP -> Mật khẩu mới
/// Dùng chung 3 API backend đã có sẵn (giống flow web):
///   POST /api/user/forgot-password/send-otp
///   POST /api/user/forgot-password/verify-otp
///   POST /api/user/forgot-password/reset-password
class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  int _step = 1; // 1: email, 2: otp, 3: new password

  final _emailFormKey = GlobalKey<FormState>();
  final _otpFormKey = GlobalKey<FormState>();
  final _passwordFormKey = GlobalKey<FormState>();

  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _obscureNewPassword = true;
  bool _obscureConfirmPassword = true;
  bool _isLoading = false;

  String _email = '';
  String _resetToken = '';

  @override
  void dispose() {
    _emailController.dispose();
    _otpController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? AppColors.error : AppColors.primary,
      duration: const Duration(seconds: 4),
    ));
  }

  // ── Bước 1: Gửi OTP về email ──
  Future<void> _handleSendOtp() async {
    if (!_emailFormKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      final email = _emailController.text.trim();
      await ApiClient.dio.post(
        '/api/user/forgot-password/send-otp',
        queryParameters: {
          'email': email,
          'otpPurpose': 'FORGOT_PASSWORD',
        },
      );

      _email = email;
      if (!mounted) return;
      _showSnack('Mã OTP đã được gửi đến email của bạn');
      setState(() => _step = 2);
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? 'Không thể gửi OTP. Kiểm tra lại email.';
      _showSnack(msg, isError: true);
    } catch (e) {
      _showSnack('Đã có lỗi xảy ra, vui lòng thử lại', isError: true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // ── Bước 2: Xác nhận OTP -> nhận resetToken ──
  Future<void> _handleVerifyOtp() async {
    if (!_otpFormKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      final res = await ApiClient.dio.post(
        '/api/user/forgot-password/verify-otp',
        queryParameters: {
          'email': _email,
          'otp': _otpController.text.trim(),
          'otpPurpose': 'FORGOT_PASSWORD',
        },
      );

      // Backend trả resetToken dạng String thô (ResponseEntity.ok(resetToken))
      _resetToken = res.data is String ? res.data.trim() : res.data.toString();

      if (!mounted) return;
      _showSnack('Xác nhận OTP thành công');
      setState(() => _step = 3);
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? 'Mã OTP không đúng hoặc đã hết hạn.';
      _showSnack(msg, isError: true);
    } catch (e) {
      _showSnack('Đã có lỗi xảy ra, vui lòng thử lại', isError: true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleResendOtp() async {
    try {
      await ApiClient.dio.post(
        '/api/user/forgot-password/send-otp',
        queryParameters: {
          'email': _email,
          'otpPurpose': 'FORGOT_PASSWORD',
        },
      );
      if (!mounted) return;
      _showSnack('Mã OTP mới đã được gửi');
    } catch (e) {
      _showSnack('Không thể gửi lại OTP. Vui lòng thử lại.', isError: true);
    }
  }

  // ── Bước 3: Đặt mật khẩu mới ──
  Future<void> _handleResetPassword() async {
    if (!_passwordFormKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      await ApiClient.dio.post(
        '/api/user/forgot-password/reset-password',
        queryParameters: {
          'resetToken': _resetToken,
          'newPassword': _newPasswordController.text,
          'confirmPassword': _confirmPasswordController.text,
        },
      );

      if (!mounted) return;
      _showSnack('Đặt lại mật khẩu thành công!');
      context.go('/login');
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? 'Không thể đặt lại mật khẩu.';
      _showSnack(msg, isError: true);
    } catch (e) {
      _showSnack('Đã có lỗi xảy ra, vui lòng thử lại', isError: true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () {
            if (_step == 1) {
              Navigator.pop(context);
            } else {
              setState(() => _step -= 1);
            }
          },
        ),
        title: Text('Quên mật khẩu', style: AppTextStyles.headline3),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: _isLoading
              ? const Padding(
            padding: EdgeInsets.only(top: 80),
            child: Center(child: CircularProgressIndicator()),
          )
              : _buildStep(),
        ),
      ),
    );
  }

  Widget _buildStep() {
    switch (_step) {
      case 1:
        return _buildStep1();
      case 2:
        return _buildStep2();
      default:
        return _buildStep3();
    }
  }

  // ── UI Bước 1 ──
  Widget _buildStep1() {
    return Form(
      key: _emailFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 8),
          Text('Nhập email của bạn', style: AppTextStyles.headline2),
          const SizedBox(height: 8),
          Text(
            'Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 24),
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
          const SizedBox(height: 24),
          AppButton(label: 'Gửi mã OTP', onPressed: _handleSendOtp),
        ],
      ),
    );
  }

  // ── UI Bước 2 ──
  Widget _buildStep2() {
    return Form(
      key: _otpFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 8),
          Text('Nhập mã OTP', style: AppTextStyles.headline2),
          const SizedBox(height: 8),
          Text(
            'Mã 6 số đã được gửi tới $_email',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 24),
          AppTextField(
            label: 'Mã OTP',
            hint: '000000',
            controller: _otpController,
            keyboardType: TextInputType.number,
            validator: (v) {
              if (v == null || v.length != 6) return 'Mã OTP phải gồm 6 chữ số';
              return null;
            },
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: _handleResendOtp,
              child: const Text('Gửi lại OTP'),
            ),
          ),
          const SizedBox(height: 12),
          AppButton(label: 'Xác nhận OTP', onPressed: _handleVerifyOtp),
        ],
      ),
    );
  }

  // ── UI Bước 3 ──
  Widget _buildStep3() {
    return Form(
      key: _passwordFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 8),
          Text('Đặt lại mật khẩu', style: AppTextStyles.headline2),
          const SizedBox(height: 8),
          Text(
            'Nhập mật khẩu mới cho tài khoản của bạn.',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 24),
          AppTextField(
            label: 'Mật khẩu mới',
            hint: '••••••••',
            controller: _newPasswordController,
            obscureText: _obscureNewPassword,
            suffixIcon: IconButton(
              icon: Icon(_obscureNewPassword
                  ? Icons.visibility_off_outlined
                  : Icons.visibility_outlined),
              onPressed: () =>
                  setState(() => _obscureNewPassword = !_obscureNewPassword),
            ),
            validator: (v) {
              if (v == null || v.isEmpty) return 'Vui lòng nhập mật khẩu mới';
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
              icon: Icon(_obscureConfirmPassword
                  ? Icons.visibility_off_outlined
                  : Icons.visibility_outlined),
              onPressed: () => setState(
                      () => _obscureConfirmPassword = !_obscureConfirmPassword),
            ),
            validator: (v) {
              if (v != _newPasswordController.text) return 'Mật khẩu xác nhận không khớp';
              return null;
            },
          ),
          const SizedBox(height: 24),
          AppButton(label: 'Đặt lại mật khẩu', onPressed: _handleResetPassword),
        ],
      ),
    );
  }
}