import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../routes/route_names.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_text_field.dart';

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  int _step = 1; // 1: nhập email, 2: nhập OTP, 3: mật khẩu mới

  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  String? _resetToken;
  bool _isLoading = false;
  bool _obscureNew = true;
  bool _obscureConfirm = true;

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
    ));
  }

  // ── Bước 1: Gửi OTP về email ──
  Future<void> _handleSendOtp() async {
    final email = _emailController.text.trim();
    if (email.isEmpty || !email.contains('@')) {
      _showSnack('Vui lòng nhập email hợp lệ', isError: true);
      return;
    }
    setState(() => _isLoading = true);
    try {
      await ApiClient.dio.post(
        '/api/user/forgot-password/send-otp',
        queryParameters: {'email': email, 'otpPurpose': 'FORGOT_PASSWORD'},
      );
      if (!mounted) return;
      _showSnack('Mã OTP đã được gửi đến email của bạn');
      setState(() => _step = 2);
    } on DioException catch (e) {
      final msg = e.response?.data?['message']?.toString() ??
          e.response?.data?.toString() ??
          'Không gửi được OTP, kiểm tra lại email';
      _showSnack(msg, isError: true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // ── Bước 2: Verify OTP → nhận resetToken ──
  Future<void> _handleVerifyOtp() async {
    final otp = _otpController.text.trim();
    if (otp.length != 6) {
      _showSnack('Vui lòng nhập đủ 6 số OTP', isError: true);
      return;
    }
    setState(() => _isLoading = true);
    try {
      final res = await ApiClient.dio.post(
        '/api/user/forgot-password/verify-otp',
        queryParameters: {
          'email': _emailController.text.trim(),
          'otp': otp,
          'otpPurpose': 'FORGOT_PASSWORD',
        },
      );
      _resetToken = res.data.toString().trim();
      if (!mounted) return;
      _showSnack('Xác thực OTP thành công');
      setState(() => _step = 3);
    } on DioException catch (e) {
      final msg = e.response?.data?['message']?.toString() ??
          'Mã OTP không đúng hoặc đã hết hạn';
      _showSnack(msg, isError: true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleResendOtp() async {
    try {
      await ApiClient.dio.post(
        '/api/user/forgot-password/send-otp',
        queryParameters: {
          'email': _emailController.text.trim(),
          'otpPurpose': 'FORGOT_PASSWORD',
        },
      );
      _showSnack('Đã gửi lại mã OTP');
    } catch (_) {
      _showSnack('Không thể gửi lại OTP', isError: true);
    }
  }

  // ── Bước 3: Đặt mật khẩu mới ──
  Future<void> _handleResetPassword() async {
    // Đóng bàn phím và vô hiệu hóa Autofill tạm thời để tránh crash trên Emulator
    FocusScope.of(context).unfocus();

    final newPass = _newPasswordController.text;
    final confirmPass = _confirmPasswordController.text;
    if (newPass.length < 6) {
      _showSnack('Mật khẩu phải có ít nhất 6 ký tự', isError: true);
      return;
    }
    if (newPass != confirmPass) {
      _showSnack('Mật khẩu xác nhận không khớp', isError: true);
      return;
    }
    setState(() => _isLoading = true);
    try {
      await ApiClient.dio.post(
        '/api/user/forgot-password/reset-password',
        queryParameters: {
          'resetToken': _resetToken,
          'newPassword': newPass,
          'confirmPassword': confirmPass,
        },
      );
      if (!mounted) return;
      
      _showSnack('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại');
      
      // Đợi một chút để tránh xung đột context khi chuyển trang
      Future.delayed(const Duration(milliseconds: 800), () {
        if (mounted) context.go(RouteNames.login);
      });
    } on DioException catch (e) {
      String msg = 'Đặt lại mật khẩu thất bại, vui lòng thử lại';
      final data = e.response?.data;
      
      if (data is Map) {
        msg = data['message']?.toString() ?? msg;
      } else if (data is String && data.isNotEmpty) {
        msg = data;
      }

      _showSnack(msg, isError: true);
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
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Quên mật khẩu', style: AppTextStyles.headline3),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
          child: _step == 1
              ? _buildStep1()
              : _step == 2
              ? _buildStep2()
              : _buildStep3(),
        ),
      ),
    );
  }

  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Nhập email đã đăng ký', style: AppTextStyles.headline2),
        const SizedBox(height: 8),
        Text(
          'Chúng tôi sẽ gửi mã OTP gồm 6 số để xác thực.',
          style: AppTextStyles.bodyMedium,
        ),
        const SizedBox(height: 24),
        AppTextField(
          label: 'Email',
          hint: 'email@example.com',
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 24),
        AppButton(
          label: _isLoading ? 'Đang gửi...' : 'Gửi mã OTP',
          onPressed: _isLoading ? null : _handleSendOtp,
        ),
      ],
    );
  }

  Widget _buildStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text('Xác thực OTP', style: AppTextStyles.headline2),
        const SizedBox(height: 8),
        Text(
          'Mã đã được gửi tới ${_emailController.text.trim()}',
          style: AppTextStyles.bodyMedium,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),
        TextField(
          controller: _otpController,
          keyboardType: TextInputType.number,
          maxLength: 6,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 26, letterSpacing: 10, fontWeight: FontWeight.bold),
          decoration: const InputDecoration(counterText: '', hintText: '000000', border: OutlineInputBorder()),
        ),
        const SizedBox(height: 16),
        AppButton(
          label: _isLoading ? 'Đang xác thực...' : 'Xác thực',
          onPressed: _isLoading ? null : _handleVerifyOtp,
        ),
        const SizedBox(height: 12),
        TextButton(
          onPressed: _handleResendOtp,
          child: Text('Gửi lại mã OTP', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primary)),
        ),
      ],
    );
  }

  Widget _buildStep3() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Đặt mật khẩu mới', style: AppTextStyles.headline2),
        const SizedBox(height: 8),
        Text('Nhập mật khẩu mới cho tài khoản của bạn.', style: AppTextStyles.bodyMedium),
        const SizedBox(height: 24),
        AppTextField(
          label: 'Mật khẩu mới',
          controller: _newPasswordController,
          obscureText: _obscureNew,
          autofillHints: const [AutofillHints.newPassword],
          suffixIcon: IconButton(
            icon: Icon(_obscureNew ? Icons.visibility_off_outlined : Icons.visibility_outlined),
            onPressed: () => setState(() => _obscureNew = !_obscureNew),
          ),
        ),
        const SizedBox(height: 16),
        AppTextField(
          label: 'Xác nhận mật khẩu mới',
          controller: _confirmPasswordController,
          obscureText: _obscureConfirm,
          autofillHints: const [AutofillHints.password],
          suffixIcon: IconButton(
            icon: Icon(_obscureConfirm ? Icons.visibility_off_outlined : Icons.visibility_outlined),
            onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
          ),
        ),
        const SizedBox(height: 24),
        AppButton(
          label: _isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu',
          onPressed: _isLoading ? null : _handleResetPassword,
        ),
      ],
    );
  }
}