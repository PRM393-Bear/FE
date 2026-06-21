import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../routes/route_names.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_text_field.dart';

class OrgRegisterPage extends StatefulWidget {
  const OrgRegisterPage({super.key});

  @override
  State<OrgRegisterPage> createState() => _OrgRegisterPageState();
}

class _OrgRegisterPageState extends State<OrgRegisterPage> {
  int _currentStep = 0;
  bool _isLoading = false;

  // ── Bước 1 ──
  final _formKey1 = GlobalKey<FormState>();
  final _orgNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _emailController = TextEditingController();
  final _websiteController = TextEditingController();
  final _addressController = TextEditingController();

  String? _selectedOrgType;
  final List<String> _orgTypes = [
    'Mái ấm / Trại trẻ mồ côi',
    'Tổ chức Phi lợi nhuận (NGO)',
    'Hội từ thiện',
    'Quỹ xã hội',
    'Khác',
  ];

  final List<String> _allAcceptedTypes = [
    'Quần áo', 'Giày dép', 'Đồ chơi trẻ em',
    'Sách vở', 'Đồ gia dụng', 'Thực phẩm khô',
  ];
  final List<String> _selectedAcceptedTypes = [];

  // ── Bước 2: Upload giấy tờ ──
  File? _idCardImage;        // CMND/CCCD người đại diện
  File? _licenseImage;       // Giấy phép hoạt động
  File? _officeImage;        // Ảnh trụ sở
  File? _activityImage;      // Ảnh hoạt động thực tế
  bool _agreedToTerms = false;

  // Uploaded URLs
  String? _idCardUrl;
  String? _licenseUrl;
  String? _officeUrl;
  String? _activityUrl;

  @override
  void dispose() {
    _orgNameController.dispose();
    _phoneController.dispose();
    _descriptionController.dispose();
    _emailController.dispose();
    _websiteController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<String?> _uploadImage(File file) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(file.path),
      });
      final res = await ApiClient.dio.post('/api/upload/image',
          data: formData,
          options: Options(contentType: 'multipart/form-data'));
      return res.data['url'] as String?;
    } catch (e) {
      debugPrint('🔴 Upload error: $e');
      return null;
    }
  }

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

  Future<void> _submitRegister() async {
    if (!_agreedToTerms) {
      _showSnack('Vui lòng đồng ý với điều khoản', isError: true);
      return;
    }
    setState(() => _isLoading = true);
    try {
      // 1. Upload ảnh
      if (_idCardImage != null) _idCardUrl = await _uploadImage(_idCardImage!);
      if (_licenseImage != null) _licenseUrl = await _uploadImage(_licenseImage!);
      if (_officeImage != null) _officeUrl = await _uploadImage(_officeImage!);
      if (_activityImage != null) _activityUrl = await _uploadImage(_activityImage!);

      // 2. Tạo tổ chức
      final verificationDocs = <String>[];
      if (_idCardUrl != null) verificationDocs.add(_idCardUrl!);
      if (_licenseUrl != null) verificationDocs.add(_licenseUrl!);
      if (_officeUrl != null) verificationDocs.add(_officeUrl!);
      if (_activityUrl != null) verificationDocs.add(_activityUrl!);

      await ApiClient.dio.post('/api/organization-details', data: {
        'orgName': _orgNameController.text.trim(),
        'description': _descriptionController.text.trim(),
        'address': _addressController.text.trim(),
        'latitude': 10.7769,
        'longitude': 106.7009,
        'acceptedTypes': _selectedAcceptedTypes,
        'verificationDocs': verificationDocs,
        'isVerified': false,
      });

      if (!mounted) return;
      setState(() => _currentStep = 3);
    } on DioException catch (e) {
      debugPrint('🔴 Org register error: ${e.response?.data}');
      final msg = e.response?.data?['message'] ?? 'Lỗi kết nối server';
      _showSnack('Lỗi: $msg', isError: true);
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
            style:
            AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.w600)),
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
              _buildStep3Review(),
            ][_currentStep],
          ),
        ),
      ],
    );
  }

  Widget _buildStepIndicator() {
    final steps = ['Thông tin\nTổ chức', 'Giấy tờ', 'Xác nhận'];
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
                            ? const Icon(Icons.check,
                            color: Colors.white, size: 16)
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
                          fontWeight: isActive
                              ? FontWeight.w600
                              : FontWeight.normal,
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

  // ════════════════════════════════════════════
  // BƯỚC 1: Thông tin cơ bản
  // ════════════════════════════════════════════
  Widget _buildStep1() {
    return Form(
      key: _formKey1,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Thông tin Cơ bản', style: AppTextStyles.headline3),
          const SizedBox(height: 24),

          AppTextField(
            label: 'Tên tổ chức *',
            hint: 'Nhập tên đầy đủ của tổ chức',
            controller: _orgNameController,
            validator: (v) =>
            v == null || v.isEmpty ? 'Vui lòng nhập tên tổ chức' : null,
          ),
          const SizedBox(height: 14),

          // Loại tổ chức dropdown
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Loại tổ chức *', style: AppTextStyles.label),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _selectedOrgType,
                hint: Text('Mái ấm / Trại trẻ mồ côi',
                    style: AppTextStyles.bodyMedium
                        .copyWith(color: AppColors.textHint)),
                decoration: const InputDecoration(),
                items: _orgTypes
                    .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                    .toList(),
                onChanged: (v) => setState(() => _selectedOrgType = v),
                validator: (v) =>
                v == null ? 'Vui lòng chọn loại tổ chức' : null,
              ),
            ],
          ),
          const SizedBox(height: 14),

          AppTextField(
            label: 'Số điện thoại *',
            hint: '0xxx xxx xxx',
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
            label: 'Mô tả tổ chức',
            hint: 'Chia sẻ về sứ mệnh và các hoạt động của tổ chức...',
            controller: _descriptionController,
          ),
          const SizedBox(height: 20),

          // Nhu cầu tiếp nhận
          Text('Nhu cầu Tiếp nhận', style: AppTextStyles.headline3),
          const SizedBox(height: 6),
          Text('Loại đồ muốn nhận (Chọn nhiều)',
              style: AppTextStyles.label),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _allAcceptedTypes.map((type) {
              final selected = _selectedAcceptedTypes.contains(type);
              return GestureDetector(
                onTap: () {
                  setState(() {
                    selected
                        ? _selectedAcceptedTypes.remove(type)
                        : _selectedAcceptedTypes.add(type);
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
                      color:
                      selected ? AppColors.primary : AppColors.border,
                    ),
                  ),
                  child: Text(
                    type,
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
          const SizedBox(height: 20),

          // Liên hệ & Địa chỉ
          Text('Liên hệ & Địa chỉ', style: AppTextStyles.headline3),
          const SizedBox(height: 14),

          AppTextField(
            label: 'Email liên hệ',
            hint: 'organization@example.com',
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 14),

          AppTextField(
            label: 'Website / Fanpage',
            hint: 'https://',
            controller: _websiteController,
          ),
          const SizedBox(height: 14),

          AppTextField(
            label: 'Địa chỉ hoạt động *',
            hint: 'Số nhà, tên đường, phường/xã...',
            controller: _addressController,
            validator: (v) =>
            v == null || v.isEmpty ? 'Vui lòng nhập địa chỉ' : null,
          ),
          const SizedBox(height: 32),

          AppButton(
            label: 'Tiếp theo →',
            onPressed: () {
              if (_formKey1.currentState!.validate()) {
                if (_selectedAcceptedTypes.isEmpty) {
                  _showSnack('Vui lòng chọn ít nhất 1 loại đồ muốn nhận',
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

  // ════════════════════════════════════════════
  // BƯỚC 2: Upload giấy tờ
  // ════════════════════════════════════════════
  Widget _buildStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Xác minh tổ chức', style: AppTextStyles.headline3),
        const SizedBox(height: 6),

        // Info box
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.08),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            children: [
              const Icon(Icons.info_outline,
                  color: AppColors.primary, size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Thông tin được bảo mật. Các tài liệu tải lên sẽ được mã hóa và chỉ sử dụng cho mục đích thẩm định.',
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.primary),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        _buildUploadTile(
          label: 'CMND/CCCD người đại diện *',
          file: _idCardImage,
          onTap: () async {
            final f = await _pickImage();
            if (f != null) setState(() => _idCardImage = f);
          },
        ),
        const SizedBox(height: 14),

        _buildUploadTile(
          label: 'Giấy phép hoạt động *',
          file: _licenseImage,
          onTap: () async {
            final f = await _pickImage();
            if (f != null) setState(() => _licenseImage = f);
          },
        ),
        const SizedBox(height: 14),

        _buildUploadTile(
          label: 'Ảnh trụ sở',
          file: _officeImage,
          isOptional: true,
          onTap: () async {
            final f = await _pickImage();
            if (f != null) setState(() => _officeImage = f);
          },
        ),
        const SizedBox(height: 14),

        _buildUploadTile(
          label: 'Ảnh hoạt động thực tế',
          file: _activityImage,
          isOptional: true,
          isRecommended: true,
          onTap: () async {
            final f = await _pickImage();
            if (f != null) setState(() => _activityImage = f);
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
                  if (_idCardImage == null || _licenseImage == null) {
                    _showSnack(
                        'Vui lòng upload CMND/CCCD và Giấy phép hoạt động',
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
    bool isRecommended = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(label, style: AppTextStyles.label),
            if (isOptional && !isRecommended) ...[
              const SizedBox(width: 8),
              Container(
                padding:
                const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text('Tùy chọn',
                    style: AppTextStyles.bodySmall
                        .copyWith(color: AppColors.textSecondary)),
              ),
            ],
            if (isRecommended) ...[
              const SizedBox(width: 8),
              Container(
                padding:
                const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.secondary.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text('Khuyến nghị',
                    style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.secondary,
                        fontWeight: FontWeight.w600)),
              ),
            ],
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
                Text('Nhấn để tải lên',
                    style: AppTextStyles.bodyMedium
                        .copyWith(color: AppColors.neutral)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ════════════════════════════════════════════
  // BƯỚC 3: Review + Submit
  // ════════════════════════════════════════════
  Widget _buildStep3Review() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Kiểm tra thông tin', style: AppTextStyles.headline3),
        const SizedBox(height: 6),
        Text('Vui lòng rà soát các thông tin trước khi gửi yêu cầu xét duyệt.',
            style: AppTextStyles.bodyMedium
                .copyWith(color: AppColors.textSecondary)),
        const SizedBox(height: 20),

        // Info card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              _infoRow(Icons.apartment_outlined, 'Thông tin cơ bản', null,
                  trailing: TextButton(
                    onPressed: () => setState(() => _currentStep = 0),
                    child: Text('Chỉnh sửa',
                        style: AppTextStyles.bodyMedium
                            .copyWith(color: AppColors.primary)),
                  )),
              const Divider(),
              _infoRow(null, 'TÊN TỔ CHỨC', _orgNameController.text),
              _infoRow(null, 'LOẠI HÌNH', _selectedOrgType ?? '-'),
              _infoRow(null, 'ĐỊA CHỈ TRỤ SỞ', _addressController.text),
              _infoRow(null, 'SĐT', _phoneController.text),
              const SizedBox(height: 8),
              // Loại đồ nhận quyên góp
              Align(
                alignment: Alignment.centerLeft,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('LOẠI ĐỒ NHẬN QUYÊN GÓP',
                        style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: _selectedAcceptedTypes
                          .map((t) => Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(t,
                            style: AppTextStyles.bodySmall.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w600)),
                      ))
                          .toList(),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Tài liệu đã tải lên
        if (_idCardImage != null || _licenseImage != null)
          Container(
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
                    Text('Tài liệu đã tải lên',
                        style: AppTextStyles.bodyMedium
                            .copyWith(fontWeight: FontWeight.w600)),
                    TextButton(
                      onPressed: () => setState(() => _currentStep = 1),
                      child: Text('Chỉnh sửa',
                          style: AppTextStyles.bodyMedium
                              .copyWith(color: AppColors.primary)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    if (_idCardImage != null)
                      _docThumb(_idCardImage!, 'CMND/CCCD'),
                    if (_licenseImage != null)
                      _docThumb(_licenseImage!, 'Giấy phép'),
                    if (_officeImage != null)
                      _docThumb(_officeImage!, 'Trụ sở'),
                    if (_activityImage != null)
                      _docThumb(_activityImage!, 'Hoạt động'),
                  ],
                ),
              ],
            ),
          ),
        const SizedBox(height: 16),

        // Checkbox cam kết
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Checkbox(
              value: _agreedToTerms,
              activeColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(4)),
              onChanged: (v) =>
                  setState(() => _agreedToTerms = v ?? false),
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

  Widget _docThumb(File file, String label) {
    return Column(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.file(file, width: 90, height: 70, fit: BoxFit.cover),
        ),
        const SizedBox(height: 4),
        Text(label,
            style: AppTextStyles.bodySmall
                .copyWith(color: AppColors.textSecondary)),
      ],
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

  // ════════════════════════════════════════════
  // Màn hình chờ duyệt
  // ════════════════════════════════════════════
  Widget _buildSuccessScreen() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: Column(
        children: [
          // Icon đồng hồ
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
          const SizedBox(height: 16),

          // Badge trạng thái
          Container(
            padding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.secondary.withOpacity(0.15),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.schedule,
                    color: AppColors.secondary, size: 16),
                const SizedBox(width: 6),
                Text('Trạng thái: Chờ duyệt',
                    style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.secondary,
                        fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Text('Đang chờ xét duyệt', style: AppTextStyles.headline3),
          const SizedBox(height: 12),
          Text(
            'Hồ sơ tổ chức của bạn đang được xem xét. Thường mất 1-2 ngày làm việc. Chúng tôi sẽ thông báo qua email/app khi có kết quả.',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodyMedium
                .copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 12),

          // Tiến độ
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Tiến độ xét duyệt',
                      style: AppTextStyles.bodySmall
                          .copyWith(color: AppColors.textSecondary)),
                  Text('65%',
                      style: AppTextStyles.bodySmall
                          .copyWith(color: AppColors.primary)),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: 0.65,
                  backgroundColor: AppColors.border,
                  color: AppColors.primary,
                  minHeight: 6,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Tips
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.info_outline,
                        color: AppColors.primary, size: 16),
                    const SizedBox(width: 6),
                    Text('Cần lưu ý?',
                        style: AppTextStyles.bodyMedium
                            .copyWith(fontWeight: FontWeight.w600)),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Bạn vẫn có thể cập nhật thông tin liên hệ trong khi chờ đợi.',
                  style: AppTextStyles.bodyMedium
                      .copyWith(color: AppColors.textSecondary),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.mail_outline,
                        color: AppColors.primary, size: 16),
                    const SizedBox(width: 6),
                    Text('Hộp thư đến',
                        style: AppTextStyles.bodyMedium
                            .copyWith(fontWeight: FontWeight.w600)),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Kiểm tra email của bạn để nhận thông báo.',
                  style: AppTextStyles.bodyMedium
                      .copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          AppButton(
            label: 'Về trang chủ',
            onPressed: () => context.go(RouteNames.productList),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: () {},
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(double.infinity, 48),
              side: const BorderSide(color: AppColors.primary, width: 1.5),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Text('Liên hệ hỗ trợ',
                style: AppTextStyles.bodyLarge.copyWith(
                    color: AppColors.primary, fontWeight: FontWeight.w600)),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}