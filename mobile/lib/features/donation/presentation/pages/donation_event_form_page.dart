import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_text_field.dart';
import '../../../organization/data/organization_service.dart';
import '../../data/donation_event_model.dart';

class DonationEventFormPage extends StatefulWidget {
  final DonationEventModel? existingEvent; // null = tạo mới
  const DonationEventFormPage({super.key, this.existingEvent});

  @override
  State<DonationEventFormPage> createState() => _DonationEventFormPageState();
}

class _DonationEventFormPageState extends State<DonationEventFormPage> {
  final _pageController = PageController();
  int _step = 0; // 0,1,2 = 3 bước

  late TextEditingController _titleController;
  late TextEditingController _descController;
  late TextEditingController _locationController;
  late TextEditingController _targetController;
  DateTime? _startDate;
  DateTime? _endDate;
  File? _bannerImage;
  String? _existingBannerUrl;
  bool _isLoading = false;
  bool _isUploadingBanner = false;

  final List<String> _allAcceptedTypes = [
    'Quần áo', 'Giày dép', 'Đồ chơi trẻ em', 'Sách vở', 'Đồ gia dụng', 'Thực phẩm khô',
  ];
  late List<String> _selectedTypes;

  bool get _isEditMode => widget.existingEvent != null;

  static const _stepTitles = ['Thông tin cơ bản', 'Thời gian & loại đồ', 'Xem lại & đăng'];

  @override
  void initState() {
    super.initState();
    final e = widget.existingEvent;
    _titleController = TextEditingController(text: e?.title ?? '');
    _descController = TextEditingController(text: e?.description ?? '');
    _locationController = TextEditingController(text: e?.location ?? '');
    _targetController = TextEditingController(text: e?.targetQuantity.toString() ?? '');
    _selectedTypes = List.from(e?.acceptedTypes ?? []);
    _startDate = e?.startDate != null ? DateTime.tryParse(e!.startDate!) : null;
    _endDate = e?.endDate != null ? DateTime.tryParse(e!.endDate!) : null;
    _existingBannerUrl = e?.bannerUrl;
  }

  @override
  void dispose() {
    _pageController.dispose();
    _titleController.dispose();
    _descController.dispose();
    _locationController.dispose();
    _targetController.dispose();
    super.dispose();
  }

  Future<void> _pickBanner() async {
    final picker = ImagePicker();
    final img = await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (img == null) return;
    setState(() => _bannerImage = File(img.path));
  }

  /// Cùng pattern upload ảnh đã dùng ở org_register_page.dart — verify lại tên field
  /// form-data ('file') và key đọc response ('url') khớp với API thật của BE trước khi test.
  Future<String?> _uploadBannerIfNeeded() async {
    if (_bannerImage == null) return _existingBannerUrl;
    setState(() => _isUploadingBanner = true);
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(_bannerImage!.path),
      });
      final res = await ApiClient.dio.post('/api/upload/image', data: formData);
      final data = res.data;
      if (data is String) return data;
      if (data is Map) return (data['url'] ?? data['imageUrl'] ?? data['data'])?.toString();
      return null;
    } finally {
      if (mounted) setState(() => _isUploadingBanner = false);
    }
  }

  Future<void> _pickDate({required bool isStart}) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked == null) return;
    setState(() => isStart ? _startDate = picked : _endDate = picked);
  }

  bool _validateStep(int step) {
    if (step == 0) {
      if (_titleController.text.trim().isEmpty || _locationController.text.trim().isEmpty) {
        _showSnack('Vui lòng nhập tên chiến dịch và địa điểm nhận đồ', isError: true);
        return false;
      }
    } else if (step == 1) {
      if (_targetController.text.trim().isEmpty) {
        _showSnack('Vui lòng nhập số lượng mục tiêu', isError: true);
        return false;
      }
      if (_startDate == null || _endDate == null) {
        _showSnack('Vui lòng chọn đủ ngày bắt đầu và ngày kết thúc', isError: true);
        return false;
      }
      if (_endDate!.isBefore(_startDate!)) {
        _showSnack('Ngày kết thúc phải sau ngày bắt đầu', isError: true);
        return false;
      }
      if (_selectedTypes.isEmpty) {
        _showSnack('Chọn ít nhất 1 loại đồ nhận quyên góp', isError: true);
        return false;
      }
    }
    return true;
  }

  void _goNext() {
    if (!_validateStep(_step)) return;
    if (_step == 2) {
      _handleSubmit();
      return;
    }
    setState(() => _step++);
    _pageController.animateToPage(_step,
        duration: const Duration(milliseconds: 250), curve: Curves.easeInOut);
  }

  void _goBack() {
    if (_step == 0) {
      Navigator.pop(context);
      return;
    }
    setState(() => _step--);
    _pageController.animateToPage(_step,
        duration: const Duration(milliseconds: 250), curve: Curves.easeInOut);
  }

  Future<void> _handleSubmit() async {
    setState(() => _isLoading = true);
    try {
      final bannerUrl = await _uploadBannerIfNeeded();
      final body = {
        'title': _titleController.text.trim(),
        'description': _descController.text.trim(),
        'location': _locationController.text.trim(),
        'latitude': 10.7769, // TODO: geocoding thật giống org_register_page.dart
        'longitude': 106.7009,
        'startDate': _startDate?.toIso8601String(),
        'endDate': _endDate?.toIso8601String(),
        'acceptedTypes': _selectedTypes,
        'targetQuantity': int.tryParse(_targetController.text.trim()) ?? 0,
        'status': 'ACTIVE',
        'bannerUrl': bannerUrl,
      };

      if (_isEditMode) {
        await ApiClient.dio.put(
          '/api/donation-events/${widget.existingEvent!.id}',
          data: body,
        );
      } else {
        final myOrg = await OrganizationService.getMine();
        if (myOrg == null) {
          _showSnack('Không tìm thấy hồ sơ tổ chức của bạn', isError: true);
          setState(() => _isLoading = false);
          return;
        }
        await ApiClient.dio.post(
          '/api/donation-events',
          data: body,
          queryParameters: {'orgId': myOrg.id},
        );
      }

      if (!mounted) return;
      _showSnack(_isEditMode ? 'Cập nhật chiến dịch thành công!' : 'Đăng sự kiện thành công!');
      Navigator.pop(context, true);
    } on DioException catch (e) {
      debugPrint('🔴 Donation event submit error: ${e.response?.data}');
      _showSnack(e.response?.data?['message']?.toString() ?? 'Có lỗi xảy ra', isError: true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleClose() async {
    setState(() => _isLoading = true);
    try {
      await ApiClient.dio.put(
        '/api/donation-events/${widget.existingEvent!.id}',
        data: {'status': 'CLOSED'},
      );
      if (!mounted) return;
      _showSnack('Đã đóng chiến dịch');
      Navigator.pop(context, true);
    } on DioException catch (e) {
      _showSnack(e.response?.data?['message']?.toString() ?? 'Đóng chiến dịch thất bại',
          isError: true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
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
          onPressed: _goBack,
        ),
        title: Text(_isEditMode ? 'Chỉnh sửa chiến dịch' : 'Tạo sự kiện',
            style: AppTextStyles.headline3),
        actions: _isEditMode
            ? [
                TextButton(
                  onPressed: _isLoading ? null : _handleClose,
                  child: Text('Đóng chiến dịch',
                      style: AppTextStyles.bodyMedium.copyWith(color: AppColors.error)),
                ),
              ]
            : null,
      ),
      body: Column(
        children: [
          _buildStepIndicator(),
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(), // chỉ đi tiếp/lùi bằng nút
              children: [
                _buildStep1(),
                _buildStep2(),
                _buildStep3(),
              ],
            ),
          ),
          _buildBottomBar(),
        ],
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
      child: Row(
        children: List.generate(3, (i) {
          final active = i <= _step;
          return Expanded(
            child: Row(
              children: [
                CircleAvatar(
                  radius: 14,
                  backgroundColor: active ? AppColors.primary : AppColors.surface,
                  child: i < _step
                      ? const Icon(Icons.check, size: 16, color: Colors.white)
                      : Text('${i + 1}',
                          style: AppTextStyles.label.copyWith(
                              color: active ? Colors.white : AppColors.textSecondary)),
                ),
                if (i < 2)
                  Expanded(
                    child: Container(
                      height: 2,
                      color: i < _step ? AppColors.primary : AppColors.border,
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
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(_stepTitles[0], style: AppTextStyles.headline3),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: _pickBanner,
            child: Container(
              width: double.infinity,
              height: 160,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.05),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.primary.withOpacity(0.4)),
                image: _bannerImage != null
                    ? DecorationImage(image: FileImage(_bannerImage!), fit: BoxFit.cover)
                    : (_existingBannerUrl != null && _existingBannerUrl!.isNotEmpty
                        ? DecorationImage(
                            image: NetworkImage(_existingBannerUrl!), fit: BoxFit.cover)
                        : null),
              ),
              child: (_bannerImage == null &&
                      (_existingBannerUrl == null || _existingBannerUrl!.isEmpty))
                  ? Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.image_outlined, color: AppColors.primary, size: 32),
                        const SizedBox(height: 8),
                        Text('Thêm ảnh bìa chiến dịch',
                            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primary)),
                      ],
                    )
                  : null,
            ),
          ),
          const SizedBox(height: 20),
          AppTextField(label: 'Tên chiến dịch', controller: _titleController),
          const SizedBox(height: 16),
          AppTextField(label: 'Mô tả', controller: _descController),
          const SizedBox(height: 16),
          AppTextField(label: 'Địa điểm nhận đồ', controller: _locationController),
        ],
      ),
    );
  }

  Widget _buildStep2() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(_stepTitles[1], style: AppTextStyles.headline3),
          const SizedBox(height: 16),
          AppTextField(
            label: 'Số lượng mục tiêu',
            controller: _targetController,
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => _pickDate(isStart: true),
                  child: Text(_startDate == null
                      ? 'Ngày bắt đầu *'
                      : '${_startDate!.day}/${_startDate!.month}/${_startDate!.year}'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => _pickDate(isStart: false),
                  child: Text(_endDate == null
                      ? 'Ngày kết thúc *'
                      : '${_endDate!.day}/${_endDate!.month}/${_endDate!.year}'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text('* Ngày kết thúc là bắt buộc (BE yêu cầu) dù mockup không có ở bước này.',
              style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 20),
          Text('Loại đồ nhận quyên góp', style: AppTextStyles.label),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _allAcceptedTypes.map((t) {
              final selected = _selectedTypes.contains(t);
              return GestureDetector(
                onTap: () => setState(() {
                  selected ? _selectedTypes.remove(t) : _selectedTypes.add(t);
                }),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: selected ? AppColors.primary : AppColors.surface,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: selected ? AppColors.primary : AppColors.border),
                  ),
                  child: Text(t,
                      style: AppTextStyles.label
                          .copyWith(color: selected ? Colors.white : AppColors.textSecondary)),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildStep3() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(_stepTitles[2], style: AppTextStyles.headline3),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _reviewRow('Tên chiến dịch', _titleController.text),
                _reviewRow('Mô tả', _descController.text.isEmpty ? '-' : _descController.text),
                _reviewRow('Địa điểm', _locationController.text),
                _reviewRow('Số lượng mục tiêu', _targetController.text),
                _reviewRow('Ngày bắt đầu',
                    _startDate == null ? '-' : '${_startDate!.day}/${_startDate!.month}/${_startDate!.year}'),
                _reviewRow('Ngày kết thúc',
                    _endDate == null ? '-' : '${_endDate!.day}/${_endDate!.month}/${_endDate!.year}'),
                _reviewRow('Loại đồ nhận', _selectedTypes.isEmpty ? '-' : _selectedTypes.join(', ')),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Kiểm tra kỹ thông tin trước khi đăng — sau khi đăng, chiến dịch sẽ hiển thị công '
            'khai cho member đăng ký quyên góp.',
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _reviewRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(value,
                textAlign: TextAlign.end,
                style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, -2))],
      ),
      child: Row(
        children: [
          if (_step > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: _isLoading ? null : _goBack,
                child: const Text('Quay lại'),
              ),
            ),
          if (_step > 0) const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: AppButton(
              label: _step == 2 ? (_isEditMode ? 'Lưu thay đổi' : 'Đăng sự kiện') : 'Tiếp theo',
              isLoading: _isLoading || _isUploadingBanner,
              onPressed: _goNext,
            ),
          ),
        ],
      ),
    );
  }
}
