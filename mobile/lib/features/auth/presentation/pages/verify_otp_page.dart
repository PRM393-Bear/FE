import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../routes/route_names.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../core/auth/auth_storage.dart';

class VerifyOtpPage extends StatefulWidget {
  final String email;
  final String username;
  final String password;
  final String roleName;

  const VerifyOtpPage({
    super.key,
    required this.email,
    required this.username,
    required this.password,
    required this.roleName,
  });

  @override
  State<VerifyOtpPage> createState() => _VerifyOtpPageState();
}

class _VerifyOtpPageState extends State<VerifyOtpPage> {
  final _otpController = TextEditingController();
  final _storage = const FlutterSecureStorage();
  bool _isLoading = false;
  bool _isResending = false;

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _handleVerify() async {
    final otp = _otpController.text.trim();
    if (otp.length != 6) {
      _showSnack('Vui lòng nhập đủ 6 số OTP', isError: true);
      return;
    }

    setState(() => _isLoading = true);
    try {
      // 1. Verify OTP
      await ApiClient.dio.post(
        '/api/user/forgot-password/verify-otp',
        queryParameters: {
          'email': widget.email,
          'otp': otp,
          'otpPurpose': 'REGISTER',
        },
      );

      if (!mounted) return;
      _showSnack('Xác thực thành công! Đang đăng nhập...');

      // 2. Login để lấy token (bọc try-catch riêng để debug lỗi 500)
      try {
        final loginRes = await ApiClient.dio.post('/api/auth/login', data: {
          'username': widget.username,
          'password': widget.password,
        });

        final token = loginRes.data['accessToken'] as String;
        await _storage.write(key: 'auth_token', value: token);
        await AuthStorage.saveRole(widget.roleName); // roleName đã biết sẵn từ SelectRolePage

        if (!mounted) return;
        
        // 3. Điều hướng theo role
        if (widget.roleName == 'ORGANIZATION') {
          context.go(RouteNames.orgDashboard);
        } else {
          context.go(RouteNames.productList);
        }
      } on DioException catch (e) {
        debugPrint('🔴 Auto-login failed after verify: ${e.response?.data}');
        if (!mounted) return;
        _showSnack('Đã xác thực nhưng không thể tự động đăng nhập (Lỗi 500). Vui lòng thử đăng nhập thủ công bằng Email.');
        context.go(RouteNames.login);
      }
    } on DioException catch (e) {
      debugPrint('🔴 Verify OTP error: ${e.response?.data}');
      final msg = e.response?.data?['message']?.toString() ??
          e.response?.data?.toString() ??
          'Mã OTP không đúng hoặc đã hết hạn';
      _showSnack(msg, isError: true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleResend() async {
    setState(() => _isResending = true);
    try {
      await ApiClient.dio.post(
        '/api/user/forgot-password/send-otp',
        queryParameters: {
          'email': widget.email,
          'otpPurpose': 'REGISTER',
        },
      );
      _showSnack('Đã gửi lại mã OTP');
    } on DioException catch (e) {
      _showSnack('Không thể gửi lại OTP', isError: true);
    } finally {
      if (mounted) setState(() => _isResending = false);
    }
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? AppColors.error : AppColors.primary,
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
        title: Text('Xác thực Email', style: AppTextStyles.headline3),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 32),
              const Icon(Icons.mark_email_read_outlined,
                  size: 64, color: AppColors.primary),
              const SizedBox(height: 20),
              Text(
                'Nhập mã gồm 6 chữ số đã được gửi đến',
                style: AppTextStyles.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              Text(
                widget.email,
                style: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 28),
              TextField(
                controller: _otpController,
                keyboardType: TextInputType.number,
                maxLength: 6,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 28, letterSpacing: 12, fontWeight: FontWeight.bold),
                decoration: const InputDecoration(
                  counterText: '',
                  hintText: '000000',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 24),
              AppButton(
                label: _isLoading ? 'Đang xác thực...' : 'Xác thực',
                onPressed: _isLoading ? null : _handleVerify,
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: _isResending ? null : _handleResend,
                child: Text(
                  _isResending ? 'Đang gửi...' : 'Gửi lại mã OTP',
                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primary),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}