import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/constants/listing_constants.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_text_field.dart';
import '../../../wardrobe/data/wardrobe_model.dart';

class DonationRegisterPage extends StatefulWidget {
  final String donationEventId;
  final String eventTitle;
  final String orgName;
  const DonationRegisterPage({
    super.key,
    required this.donationEventId,
    required this.eventTitle,
    required this.orgName,
  });

  @override
  State<DonationRegisterPage> createState() => _DonationRegisterPageState();
}

class _DonationRegisterPageState extends State<DonationRegisterPage> {
  final _descController = TextEditingController();
  List<WardrobeModel> _items = [];
  String? _selectedItemId;
  bool _isLoading = true;
  bool _isSubmitting = false;

  // MỚI — luồng "tự khai báo đồ quyên góp" (không cần có sẵn trong Tủ đồ),
  // dùng endpoint POST /api/donation-requests/custom (mục 27.1)
  bool _useCustomFlow = false;
  final _itemNameController = TextEditingController();
  final _conditionNoteController = TextEditingController();
  String? _customCategory;
  String? _customCondition;
  File? _customImage;

  @override
  void initState() {
    super.initState();
    _fetchWardrobe();
  }

  @override
  void dispose() {
    _descController.dispose();
    _itemNameController.dispose();
    _conditionNoteController.dispose();
    super.dispose();
  }

  Future<void> _fetchWardrobe() async {
    try {
      final res = await ApiClient.dio.get('/api/wardrobe-items/my-wardrobe');
      final list = (res.data as List).map((e) => WardrobeModel.fromJson(e)).toList();
      final available = list.where((i) => i.status == 'AVAILABLE' || i.status == 'OWNED').toList();
      setState(() {
        _items = available;
        _isLoading = false;
        // Chưa có món đồ khả dụng nào -> tự gợi ý luôn luồng "tự khai báo"
        if (available.isEmpty) _useCustomFlow = true;
      });
    } catch (e) {
      debugPrint('🔴 Fetch wardrobe for donation error: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _pickCustomImage(ImageSource source) async {
    final picker = ImagePicker();
    final img = await picker.pickImage(source: source, imageQuality: 85);
    if (img == null) return;
    setState(() => _customImage = File(img.path));
  }

  void _showPickerSheet() {
    showModalBottomSheet(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt_outlined, color: AppColors.primary),
              title: const Text('Chụp ảnh'),
              onTap: () { Navigator.pop(context); _pickCustomImage(ImageSource.camera); },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined, color: AppColors.primary),
              title: const Text('Chọn từ thư viện'),
              onTap: () { Navigator.pop(context); _pickCustomImage(ImageSource.gallery); },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleSubmit() async {
    if (_useCustomFlow) {
      await _handleSubmitCustom();
    } else {
      await _handleSubmitFromWardrobe();
    }
  }

  Future<void> _handleSubmitFromWardrobe() async {
    if (_selectedItemId == null) {
      _showSnack('Vui lòng chọn 1 món đồ để quyên góp', isError: true);
      return;
    }
    setState(() => _isSubmitting = true);
    try {
      await ApiClient.dio.post('/api/donation-requests', data: {
        'donationEventId': widget.donationEventId,
        'description': _descController.text.trim(),
        'wardrobeItemIds': [_selectedItemId],
      });
      if (!mounted) return;
      _showSnack('Đăng ký quyên góp thành công! Chờ tổ chức xác nhận.');
      Navigator.pop(context, true);
    } on DioException catch (e) {
      debugPrint('🔴 Donation register error: ${e.response?.data}');
      _showSnack(e.response?.data?['message']?.toString() ?? 'Đăng ký thất bại', isError: true);
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> _handleSubmitCustom() async {
    if (_itemNameController.text.trim().isEmpty ||
        _customCategory == null ||
        _customCondition == null ||
        _customImage == null) {
      _showSnack('Vui lòng nhập đủ tên món đồ, loại, tình trạng và chọn ảnh', isError: true);
      return;
    }
    setState(() => _isSubmitting = true);
    try {
      // DonationRequestCustomReq (multipart/form-data), field khớp đúng BE
      final formData = FormData.fromMap({
        'donationEventId': widget.donationEventId,
        'description': _descController.text.trim(),
        'itemName': _itemNameController.text.trim(),
        'category': _customCategory,
        'condition': _customCondition,
        'conditionNote': _conditionNoteController.text.trim(),
        'image': await MultipartFile.fromFile(_customImage!.path),
      });
      await ApiClient.dio.post('/api/donation-requests/custom',
          data: formData, options: Options(contentType: 'multipart/form-data'));
      if (!mounted) return;
      _showSnack('Đăng ký quyên góp thành công! Chờ tổ chức xác nhận.');
      Navigator.pop(context, true);
    } on DioException catch (e) {
      debugPrint('🔴 Donation register custom error: ${e.response?.data}');
      _showSnack(e.response?.data?['message']?.toString() ?? 'Đăng ký thất bại', isError: true);
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? AppColors.error : AppColors.primary,
    ));
  }

  Widget _buildToggle() {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _useCustomFlow = false),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(color: !_useCustomFlow ? AppColors.primary : Colors.transparent, borderRadius: BorderRadius.circular(8)),
                child: Text('Từ Tủ đồ có sẵn', textAlign: TextAlign.center,
                    style: AppTextStyles.bodyMedium.copyWith(color: !_useCustomFlow ? Colors.white : AppColors.textSecondary, fontWeight: FontWeight.w600)),
              ),
            ),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _useCustomFlow = true),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(color: _useCustomFlow ? AppColors.primary : Colors.transparent, borderRadius: BorderRadius.circular(8)),
                child: Text('Tự khai báo đồ', textAlign: TextAlign.center,
                    style: AppTextStyles.bodyMedium.copyWith(color: _useCustomFlow ? Colors.white : AppColors.textSecondary, fontWeight: FontWeight.w600)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWardrobeFlow() {
    if (_items.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 16),
        child: Text('Bạn chưa có món đồ nào khả dụng trong Tủ đồ. Hãy dùng "Tự khai báo đồ" ở trên để quyên góp món đồ chưa có trong app.'),
      );
    }
    return Column(
      children: _items
          .map((item) => RadioListTile<String>(
                value: item.id,
                groupValue: _selectedItemId,
                onChanged: (v) => setState(() => _selectedItemId = v),
                title: Text(item.title),
                subtitle: Text(item.category ?? ''),
                activeColor: AppColors.primary,
              ))
          .toList(),
    );
  }

  Widget _buildCustomFlow() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AppTextField(label: 'Tên món đồ', controller: _itemNameController),
        const SizedBox(height: 16),
        Text('Loại đồ', style: AppTextStyles.label),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _customCategory,
          decoration: const InputDecoration(border: OutlineInputBorder()),
          items: ListingConstants.categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
          onChanged: (v) => setState(() => _customCategory = v),
        ),
        const SizedBox(height: 16),
        Text('Tình trạng', style: AppTextStyles.label),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _customCondition,
          decoration: const InputDecoration(border: OutlineInputBorder()),
          items: ListingConstants.conditions.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
          onChanged: (v) => setState(() => _customCondition = v),
        ),
        const SizedBox(height: 16),
        AppTextField(label: 'Ghi chú tình trạng (không bắt buộc)', controller: _conditionNoteController),
        const SizedBox(height: 16),
        Text('Ảnh món đồ', style: AppTextStyles.label),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: _showPickerSheet,
          child: Container(
            height: 160,
            width: double.infinity,
            decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
            child: _customImage == null
                ? Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.add_a_photo_outlined, color: AppColors.primary, size: 32),
                      const SizedBox(height: 8),
                      Text('Chạm để chụp ảnh hoặc chọn từ thư viện', style: AppTextStyles.bodySmall),
                    ],
                  )
                : ClipRRect(borderRadius: BorderRadius.circular(12), child: Image.file(_customImage!, fit: BoxFit.cover, width: double.infinity)),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios_new_rounded), onPressed: () => Navigator.pop(context)),
        title: Text('Đăng ký quyên góp', style: AppTextStyles.headline3),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Chiến dịch: ${widget.eventTitle}', style: AppTextStyles.headline3.copyWith(color: AppColors.primary)),
                  const SizedBox(height: 4),
                  Text('Tổ chức: ${widget.orgName}', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
                  const SizedBox(height: 20),
                  AppTextField(label: 'Ghi chú (loại đồ, số lượng...)', controller: _descController),
                  const SizedBox(height: 20),
                  _buildToggle(),
                  const SizedBox(height: 16),
                  if (_useCustomFlow) _buildCustomFlow() else _buildWardrobeFlow(),
                  const SizedBox(height: 32),
                  AppButton(label: 'Xác nhận đăng ký', isLoading: _isSubmitting, onPressed: _handleSubmit),
                ],
              ),
            ),
    );
  }
}