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
import '../../../../core/auth/auth_storage.dart';
import '../../../../core/auth/auth_state.dart';
import 'forgot_password_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;

  final _storage = const FlutterSecureStorage();

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final res = await ApiClient.dio.post('/api/auth/login', data: {
        'username': _usernameController.text.trim(),
        'password': _passwordController.text,
      });

      final token = res.data['accessToken'] as String;
      await _storage.write(key: 'auth_token', value: token);

      // JWT hiện tại chưa có claim role, nên gọi thêm /api/user/me để lấy role thật
      String roleName = 'MEMBER';
      try {
        final meRes = await ApiClient.dio.get('/api/user/me');
        roleName = (meRes.data['role']?['roleName'] as String?)?.toUpperCase() ?? 'MEMBER';
      } catch (e) {
        debugPrint('🔴 Fetch /api/user/me failed, default to MEMBER: $e');
      }
      await AuthStorage.saveRole(roleName);
      AuthState.notifyChanged();

      if (!mounted) return;

      if (roleName == 'ORGANIZATION') {
        context.go(RouteNames.orgDashboard);
      } else {
        context.go(RouteNames.productList);
      }
    } on DioException catch (e) {
      debugPrint('🔴 Login error: ${e.response?.data}');

      final statusCode = e.response?.statusCode;
      String msg = 'Đăng nhập thất bại';
      
      final data = e.response?.data;
      if (data is Map) {
        if (statusCode == 401 || statusCode == 403) {
          msg = 'Sai tên đăng nhập hoặc mật khẩu';
        } else {
          msg = data['message']?.toString() ?? msg;
        }
      } else if (data is String && data.isNotEmpty) {
        msg = data;
      }

      _showSnack(msg);
    } catch (e) {
      debugPrint('🔴 Unknown error: $e');
      _showSnack('Đã có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: AppColors.error,
      duration: const Duration(seconds: 4),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Chỉ hiện nút back khi màn này được push lên từ chỗ khác (guest bấm
      // "Đăng nhập"). Nếu app mở thẳng vào đây (không có gì để pop) thì ẩn đi.
      appBar: Navigator.canPop(context)
          ? AppBar(
              backgroundColor: Colors.transparent,
              elevation: 0,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded,
                    color: AppColors.textPrimary),
                onPressed: () => Navigator.pop(context),
              ),
            )
          : null,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 48),

                // Logo icon
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.eco_rounded,
                    color: AppColors.primary,
                    size: 32,
                  ),
                ),

                const SizedBox(height: 20),

                Text('Chào mừng trở lại', style: AppTextStyles.headline2),
                const SizedBox(height: 8),
                Text(
                  'Mỗi món đồ đều có vòng đời mới',
                  style: AppTextStyles.bodyMedium,
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 36),

                AppTextField(
                  label: 'Tên đăng nhập',
                  hint: 'Nhập tên đăng nhập của bạn',
                  controller: _usernameController,
                  validator: (v) {
                    if (v == null || v.isEmpty)
                      return 'Vui lòng nhập tên đăng nhập';
                    return null;
                  },
                ),

                const SizedBox(height: 16),

                AppTextField(
                  label: 'Mật khẩu',
                  hint: 'Nhập mật khẩu',
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

                const SizedBox(height: 8),

                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const ForgotPasswordPage()),
                    ),
                    child: Text(
                      'Quên mật khẩu?',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                AppButton(
                  label: 'Đăng nhập',
                  isLoading: _isLoading,
                  onPressed: _handleLogin,
                ),

                const SizedBox(height: 24),

                Row(
                  children: [
                    const Expanded(child: Divider()),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        'Hoặc tiếp tục với',
                        style: AppTextStyles.bodyMedium,
                      ),
                    ),
                    const Expanded(child: Divider()),
                  ],
                ),

                const SizedBox(height: 16),

                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.g_mobiledata, size: 24),
                        label: const Text('Google'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.textPrimary,
                          side: const BorderSide(color: AppColors.border),
                          minimumSize: const Size(0, 48),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {},
                        icon: const Icon(
                          Icons.facebook,
                          size: 24,
                          color: Color(0xFF1877F2),
                        ),
                        label: const Text('Facebook'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.textPrimary,
                          side: const BorderSide(color: AppColors.border),
                          minimumSize: const Size(0, 48),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Chưa có tài khoản?',
                        style: AppTextStyles.bodyMedium),
                    TextButton(
                      onPressed: () => context.push(RouteNames.selectRole),
                      child: Text(
                        'Đăng ký ngay',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}