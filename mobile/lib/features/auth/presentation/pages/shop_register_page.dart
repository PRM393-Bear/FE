import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_text_field.dart';
import '../../../../core/network/api_client.dart';
import '../../../../routes/route_names.dart';

class ShopRegisterPage extends StatefulWidget {
  const ShopRegisterPage({super.key});

  @override
  State<ShopRegisterPage> createState() => _ShopRegisterPageState();
}

class _ShopRegisterPageState extends State<ShopRegisterPage> {
  int _currentStep = 0;
  bool _isLoading = false;

  // ── Bước 1: Thông tin cơ bản ──
  final _formKey1 = GlobalKey<FormState>();
  final _shopNameController = TextEditingController();
  final _addressController = TextEditingController();
  final _phoneController = TextEditingController();
  final _descriptionController = TextEditingController();

  String? _selectedBusinessType;
  final List<String> _businessTypes = [
    'Cá nhân kinh doanh',
    'Hộ kinh doanh cá thể',
    'Công ty TNHH',
    'Công ty Cổ phần',
  ];

  final List<String> _allCategories = [
    'Quần áo', 'Giày', 'Túi xách', 'Điện tử', 'Đồ nhà', 'Khác'
  ];
  final List<String> _selectedCategories = [];

  // ── Bước 2: Giấy tờ ──
  File? _frontIdImage;
  File? _backIdImage;
  File? _businessLicenseImage;
  File? _storeImage;

  // ── Bước 3: Xác nhận ──
  bool _agreedToTerms = false;

  // Uploaded URLs
  String? _frontIdUrl;
  String? _backIdUrl;
  String? _businessLicenseUrl;
  String? _storeImageUrl;

  @override
  void dispose() {
    _shopNameController.dispose();
    _addressController.dispose();
    _phoneController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  // ── Upload ảnh lên server ──
  Future<String?> _uploadImage(File file) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(file.path),
      });
      final res = await ApiClient.dio.post('/api/upload/image', data: formData,
          options: Options(contentType: 'multipart/form-data'));
      return res.data['url'] as String?;
    } catch (e) {
      debugPrint('🔴 Upload error: $e');
      return null;
    }
  }

  // ── Chọn ảnh từ gallery/camera ──
  Future<File?> _pickImage() async {
    final picker = ImagePicker();
    final result = await showModalBottomSheet<XFile?>(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt_outlined),
              title: const Text('Chụp ảnh'),
              onTap: () async {
                final img = await picker.pickImage(source: ImageSource.camera);
                if (context.mounted) Navigator.pop(context, img);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('Chọn từ thư viện'),
              onTap: () async {
                final img = await picker.pickImage(source: ImageSource.gallery);
                if (context.mounted) Navigator.pop(context, img);
              },
            ),
          ],
        ),
      ),
    );
    if (result == null) return null;
    return File(result.path);
  }

  // ── Submit đăng ký shop ──
  Future<void> _submitRegister() async {
    if (!_agreedToTerms) {
      _showSnack('Vui lòng đồng ý với điều khoản', isError: true);
      return;
    }

    setState(() => _isLoading = true);

    try {
      // 1. Upload tất cả ảnh
      if (_frontIdImage != null) {
        _frontIdUrl = await _uploadImage(_frontIdImage!);
      }
      if (_backIdImage != null) {
        _backIdUrl = await _uploadImage(_backIdImage!);
      }
      if (_businessLicenseImage != null) {
        _businessLicenseUrl = await _uploadImage(_businessLicenseImage!);
      }
      if (_storeImage != null) {
        _storeImageUrl = await _uploadImage(_storeImage!);
      }

      // 2. Tạo shop
      await ApiClient.dio.post('/api/shops', data: {
        'shopName': _shopNameController.text.trim(),
        'address': _addressController.text.trim(),
        'phone': _phoneController.text.trim(),
        'description': _descriptionController.text.trim(),
        'isVerified': false,
      });

      if (!mounted) return;
      setState(() => _currentStep = 3);
    } on DioException catch (e) {
      debugPrint('🔴 DioException: ${e.type}');
      debugPrint('🔴 Response: ${e.response?.data}');
      debugPrint('🔴 Status: ${e.response?.statusCode}');
      final msg = e.response?.data?['message'] ?? 'Lỗi kết nối server';
      _showSnack('Lỗi: $msg', isError: true);
    } catch (e) {
      debugPrint('🔴 Unknown error: $e');
      _showSnack('Lỗi: $e', isError: true);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? AppColors.error : AppColors.primary,
      duration: const Duration(seconds: 5),
    ));
  }

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
          onPressed: () {
            if (_currentStep > 0 && _currentStep < 3) {
              setState(() => _currentStep--);
            } else {
              Navigator.pop(context);
            }
          },
        ),
        title: Text('Lifecycle Marketplace',
            style: AppTextStyles.bodyLarge
                .copyWith(fontWeight: FontWeight.w600)),
      ),
      body: _currentStep == 3 ? _buildSuccessScreen() : _buildStepBody(),
    );
  }

  Widget _buildStepBody() {
    return Column(
      children: [
        _buildStepIndicator(),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: [
              _buildStep1(),
              _buildStep2(),
              _buildStep3(),
            ][_currentStep],
          ),
        ),
      ],
    );
  }

  Widget _buildStepIndicator() {
    final steps = ['Thông tin\nShop', 'Giấy tờ', 'Xác nhận'];
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      child: Row(
        children: List.generate(steps.length, (i) {
          final isDone = i < _currentStep;
          final isActive = i == _currentStep;
          return Expanded(
            child: Row(
              children: [
                Column(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isDone || isActive
                            ? AppColors.primary
                            : AppColors.border,
                      ),
                      child: Center(
                        child: isDone
                            ? const Icon(Icons.check, color: Colors.white, size: 16)
                            : Text('${i + 1}',
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(steps[i],
                        textAlign: TextAlign.center,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: isActive
                              ? AppColors.primary
                              : AppColors.textSecondary,
                          fontWeight:
                          isActive ? FontWeight.w600 : FontWeight.normal,
                          fontSize: 11,
                        )),
                  ],
                ),
                if (i < steps.length - 1)
                  Expanded(
                    child: Container(
                      height: 2,
                      margin: const EdgeInsets.only(bottom: 20),
                      color: i < _currentStep
                          ? AppColors.primary
                          : AppColors.border,
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildStep1() {
    return Form(
      key: _formKey1,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Thông tin cơ bản', style: AppTextStyles.headline3),
          const SizedBox(height: 6),
          Text(
            'Vui lòng cung cấp thông tin chính xác để người mua có thể tin tưởng và kết nối với Shop của bạn.',
            style: AppTextStyles.bodyMedium
                .copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 24),
          AppTextField(
            label: 'Tên Shop *',
            hint: 'VD: EcoFashion Corner',
            controller: _shopNameController,
            validator: (v) =>
            v == null || v.isEmpty ? 'Vui lòng nhập tên shop' : null,
          ),
          const SizedBox(height: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Loại hình kinh doanh *', style: AppTextStyles.label),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _selectedBusinessType,
                hint: Text('Cá nhân kinh doanh',
                    style: AppTextStyles.bodyMedium
                        .copyWith(color: AppColors.textHint)),
                decoration: const InputDecoration(),
                items: _businessTypes
                    .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                    .toList(),
                onChanged: (v) => setState(() => _selectedBusinessType = v),
                validator: (v) =>
                v == null ? 'Vui lòng chọn loại hình' : null,
              ),
            ],
          ),
          const SizedBox(height: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Danh mục chính bán *', style: AppTextStyles.label),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _allCategories.map((cat) {
                  final selected = _selectedCategories.contains(cat);
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        selected
                            ? _selectedCategories.remove(cat)
                            : _selectedCategories.add(cat);
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: selected
                            ? AppColors.primary
                            : AppColors.background,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: selected
                              ? AppColors.primary
                              : AppColors.border,
                        ),
                      ),
                      child: Text(
                        cat,
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: selected
                              ? Colors.white
                              : AppColors.textPrimary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
          const SizedBox(height: 14),
          AppTextField(
            label: 'Địa chỉ Shop *',
            hint: 'Số nhà, Tên đường, Phường/Xã...',
            controller: _addressController,
            validator: (v) =>
            v == null || v.isEmpty ? 'Vui lòng nhập địa chỉ' : null,
          ),
          const SizedBox(height: 14),
          AppTextField(
            label: 'Số điện thoại Shop *',
            hint: '0901 234 567',
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            validator: (v) {
              if (v == null || v.isEmpty) return 'Vui lòng nhập SĐT';
              if (v.length < 10) return 'SĐT không hợp lệ';
              return null;
            },
          ),
          const SizedBox(height: 14),
          AppTextField(
            label: 'Mô tả Shop',
            hint: 'Chia sẻ một chút về Shop và các sản phẩm của bạn...',
            controller: _descriptionController,
          ),
          const SizedBox(height: 32),
          AppButton(
            label: 'Tiếp theo →',
            onPressed: () {
              if (_formKey1.currentState!.validate()) {
                if (_selectedCategories.isEmpty) {
                  _showSnack('Vui lòng chọn ít nhất 1 danh mục',
                      isError: true);
                  return;
                }
                setState(() => _currentStep = 1);
              }
            },
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Xác minh danh tính &\ngiấy tờ kinh doanh',
            style: AppTextStyles.headline3),
        const SizedBox(height: 6),
        Text(
          'Vui lòng cung cấp ảnh chụp giấy tờ rõ nét để hệ thống xét duyệt nhanh chóng.',
          style: AppTextStyles.bodyMedium
              .copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 24),
        _buildUploadTile(
          label: 'CMND/CCCD mặt trước *',
          file: _frontIdImage,
          onTap: () async {
            final f = await _pickImage();
            if (f != null) setState(() => _frontIdImage = f);
          },
        ),
        const SizedBox(height: 14),
        _buildUploadTile(
          label: 'CMND/CCCD mặt sau *',
          file: _backIdImage,
          onTap: () async {
            final f = await _pickImage();
            if (f != null) setState(() => _backIdImage = f);
          },
        ),
        const SizedBox(height: 14),
        _buildUploadTile(
          label: 'Giấy phép kinh doanh (Tùy chọn)',
          file: _businessLicenseImage,
          isOptional: true,
          onTap: () async {
            final f = await _pickImage();
            if (f != null) setState(() => _businessLicenseImage = f);
          },
        ),
        const SizedBox(height: 14),
        _buildUploadTile(
          label: 'Ảnh cửa hàng/kho hàng (Tùy chọn)',
          file: _storeImage,
          isOptional: true,
          onTap: () async {
            final f = await _pickImage();
            if (f != null) setState(() => _storeImage = f);
          },
        ),
        const SizedBox(height: 32),
        Row(
          children: [
            Expanded(
              child: AppButton(
                label: 'Quay lại',
                type: AppButtonType.outlined,
                onPressed: () => setState(() => _currentStep = 0),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: AppButton(
                label: 'Tiếp theo →',
                onPressed: () {
                  if (_frontIdImage == null || _backIdImage == null) {
                    _showSnack('Vui lòng upload CMND/CCCD 2 mặt',
                        isError: true);
                    return;
                  }
                  setState(() => _currentStep = 2);
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildUploadTile({
    required String label,
    required File? file,
    required VoidCallback onTap,
    bool isOptional = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(label, style: AppTextStyles.label),
            if (isOptional) ...[
              const SizedBox(width: 8),
              Container(
                padding:
                const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.secondary.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text('Tùy chọn',
                    style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.secondary,
                        fontWeight: FontWeight.w600)),
              ),
            ]
          ],
        ),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: onTap,
          child: Container(
            width: double.infinity,
            height: file != null ? 160 : 100,
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: file != null
                ? ClipRRect(
              borderRadius: BorderRadius.circular(11),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.file(file, fit: BoxFit.cover),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: GestureDetector(
                      onTap: onTap,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.edit,
                            color: Colors.white, size: 16),
                      ),
                    ),
                  ),
                ],
              ),
            )
                : Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.add_photo_alternate_outlined,
                    color: AppColors.neutral, size: 32),
                const SizedBox(height: 8),
                Text('Tải ảnh lên',
                    style: AppTextStyles.bodyMedium
                        .copyWith(color: AppColors.neutral)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStep3() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Kiểm tra thông tin\ncủa bạn', style: AppTextStyles.headline3),
        const SizedBox(height: 6),
        Text(
          'Vui lòng rà soát các thông tin trước khi gửi yêu cầu xét duyệt.',
          style: AppTextStyles.bodyMedium
              .copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 20),
        _buildInfoCard(),
        const SizedBox(height: 16),
        _buildDocsPreview(),
        const SizedBox(height: 20),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Checkbox(
              value: _agreedToTerms,
              activeColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(4)),
              onChanged: (v) => setState(() => _agreedToTerms = v ?? false),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(
                  'Tôi cam kết thông tin cung cấp là chính xác và hoàn toàn chịu trách nhiệm trước pháp luật về tính xác thực của các tài liệu đã tải lên.',
                  style: AppTextStyles.bodyMedium,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: AppButton(
                label: 'Quay lại chỉnh sửa',
                type: AppButtonType.outlined,
                onPressed: () => setState(() => _currentStep = 1),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: AppButton(
                label: 'Gửi yêu cầu duyệt',
                isLoading: _isLoading,
                onPressed: _submitRegister,
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildInfoCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          _infoRow(Icons.storefront_outlined, 'Thông tin cơ bản', null,
              trailing: TextButton(
                onPressed: () => setState(() => _currentStep = 0),
                child: Text('Chỉnh sửa',
                    style: AppTextStyles.bodyMedium
                        .copyWith(color: AppColors.primary)),
              )),
          const Divider(),
          _infoRow(null, 'TÊN SHOP', _shopNameController.text),
          _infoRow(null, 'LOẠI HÌNH KINH DOANH',
              _selectedBusinessType ?? '-'),
          _infoRow(null, 'DANH MỤC', _selectedCategories.join(', ')),
          _infoRow(null, 'ĐỊA CHỈ LẤY HÀNG', _addressController.text),
        ],
      ),
    );
  }

  Widget _infoRow(IconData? icon, String label, String? value,
      {Widget? trailing}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          if (icon != null) ...[
            Icon(icon, color: AppColors.primary, size: 18),
            const SizedBox(width: 8),
          ],
          Expanded(
            child: value != null
                ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w600)),
                Text(value, style: AppTextStyles.bodyMedium),
              ],
            )
                : Text(label,
                style: AppTextStyles.bodyMedium
                    .copyWith(fontWeight: FontWeight.w600)),
          ),
          if (trailing != null) trailing,
        ],
      ),
    );
  }

  Widget _buildDocsPreview() {
    final docs = [
      if (_frontIdImage != null) ('Mặt trước CCCD', _frontIdImage!),
      if (_backIdImage != null) ('Mặt sau CCCD', _backIdImage!),
      if (_businessLicenseImage != null)
        ('GP kinh doanh', _businessLicenseImage!),
    ];

    if (docs.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Giấy tờ pháp lý',
                  style: AppTextStyles.bodyMedium
                      .copyWith(fontWeight: FontWeight.w600)),
              TextButton(
                onPressed: () => setState(() => _currentStep = 1),
                child: Text('Thay đổi',
                    style: AppTextStyles.bodyMedium
                        .copyWith(color: AppColors.primary)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: docs.map((doc) {
              return Column(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.file(doc.$2,
                        width: 90, height: 70, fit: BoxFit.cover),
                  ),
                  const SizedBox(height: 4),
                  Text(doc.$1,
                      style: AppTextStyles.bodySmall
                          .copyWith(color: AppColors.textSecondary)),
                ],
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessScreen() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppColors.secondary.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.hourglass_top_rounded,
                  color: AppColors.secondary, size: 48),
            ),
            const SizedBox(height: 24),
            Container(
              padding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.secondary.withOpacity(0.15),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text('Trạng thái: Chờ duyệt',
                  style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.secondary,
                      fontWeight: FontWeight.w600)),
            ),
            const SizedBox(height: 20),
            Text('Đang chờ xét duyệt', style: AppTextStyles.headline3),
            const SizedBox(height: 12),
            Text(
              'Yêu cầu của bạn đang được xem xét. Thường mất 1-2 ngày làm việc. Chúng tôi sẽ thông báo qua email/app khi có kết quả.',
              textAlign: TextAlign.center,
              style: AppTextStyles.bodyMedium
                  .copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 32),
            AppButton(
              label: 'Kiểm tra chi tiết',
              onPressed: () => context.go(RouteNames.productList),
            ),
            const SizedBox(height: 12),
            AppButton(
              label: 'Về trang chủ',
              type: AppButtonType.outlined,
              onPressed: () => context.go(RouteNames.productList),
            ),
          ],
        ),
      ),
    );
  }
}