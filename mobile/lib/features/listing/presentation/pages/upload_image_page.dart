import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../widgets/step_indicator.dart';
import 'listing_form_page.dart';

class UploadImagePage extends StatefulWidget {
  const UploadImagePage({super.key});

  @override
  State<UploadImagePage> createState() => _UploadImagePageState();
}

class _UploadImagePageState extends State<UploadImagePage> {
  final List<File> _selectedFiles = [];
  final List<String> _uploadedUrls = [];
  final int _maxImages = 10;
  bool _isUploading = false;
  final _picker = ImagePicker();

  Future<void> _pickImage(ImageSource source) async {
    if (_selectedFiles.length >= _maxImages) return;

    final img = await _picker.pickImage(source: source, imageQuality: 85);
    if (img == null) return;

    final file = File(img.path);
    setState(() => _selectedFiles.add(file));
  }

  void _showPickerSheet() {
    showModalBottomSheet(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt_outlined,
                  color: AppColors.primary),
              title: const Text('Chụp ảnh'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined,
                  color: AppColors.primary),
              title: const Text('Chọn từ thư viện'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _removeImage(int index) {
    setState(() {
      _selectedFiles.removeAt(index);
    });
  }

  Future<void> _handleNext() async {
    if (_selectedFiles.isEmpty) return;

    setState(() => _isUploading = true);

    try {
      _uploadedUrls.clear();

      for (final file in _selectedFiles) {
        final formData = FormData.fromMap({
          'file': await MultipartFile.fromFile(file.path),
        });
        final res = await ApiClient.dio.post(
          '/api/upload/image',
          data: formData,
          options: Options(contentType: 'multipart/form-data'),
        );
        final url = res.data['url'] as String?;
        if (url != null) _uploadedUrls.add(url);
      }

      if (!mounted) return;

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => ListingFormPage(imagePaths: _uploadedUrls),
        ),
      );
    } catch (e) {
      debugPrint('🔴 Upload error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Lỗi upload ảnh, vui lòng thử lại'),
          backgroundColor: AppColors.error,
        ));
      }
    } finally {
      setState(() => _isUploading = false);
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
        title: Text('Đăng sản phẩm', style: AppTextStyles.headline3),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const StepIndicator(currentStep: 1, totalSteps: 4),
            const SizedBox(height: 24),

            // Upload area
            GestureDetector(
              onTap: _showPickerSheet,
              child: Container(
                width: double.infinity,
                height: 180,
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.primary, width: 1.5),
                  borderRadius: BorderRadius.circular(12),
                  color: AppColors.primary.withOpacity(0.04),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.camera_alt_rounded,
                          color: AppColors.primary, size: 28),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Chụp hoặc tải ảnh sản phẩm',
                      style: AppTextStyles.bodyLarge
                          .copyWith(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Tối đa 10 ảnh • Ảnh đầu là ảnh bìa',
                      style:
                      AppTextStyles.bodyMedium.copyWith(fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Danh sách ảnh đã chọn
            if (_selectedFiles.isNotEmpty) ...[
              Text(
                'Đã chọn (${_selectedFiles.length}/$_maxImages)',
                style: AppTextStyles.label,
              ),
              const SizedBox(height: 10),
              SizedBox(
                height: 90,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _selectedFiles.length + 1,
                  itemBuilder: (context, index) {
                    // Nút thêm ảnh
                    if (index == _selectedFiles.length) {
                      if (_selectedFiles.length >= _maxImages) {
                        return const SizedBox();
                      }
                      return GestureDetector(
                        onTap: _showPickerSheet,
                        child: Container(
                          width: 80,
                          height: 80,
                          margin: const EdgeInsets.only(right: 8),
                          decoration: BoxDecoration(
                            border: Border.all(color: AppColors.border),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.add_rounded,
                              color: AppColors.neutral),
                        ),
                      );
                    }

                    return Stack(
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          margin: const EdgeInsets.only(right: 8),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            border: index == 0
                                ? Border.all(
                                color: AppColors.primary, width: 2)
                                : null,
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.file(
                              _selectedFiles[index],
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        if (index == 0)
                          Positioned(
                            bottom: 0,
                            left: 0,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 4, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                borderRadius: const BorderRadius.only(
                                  bottomLeft: Radius.circular(8),
                                  topRight: Radius.circular(4),
                                ),
                              ),
                              child: Text(
                                'Ảnh bìa',
                                style: AppTextStyles.label.copyWith(
                                  color: Colors.white,
                                  fontSize: 9,
                                ),
                              ),
                            ),
                          ),
                        Positioned(
                          top: 0,
                          right: 8,
                          child: GestureDetector(
                            onTap: () => _removeImage(index),
                            child: Container(
                              width: 20,
                              height: 20,
                              decoration: const BoxDecoration(
                                color: Colors.red,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.close_rounded,
                                  size: 12, color: Colors.white),
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ],

            const Spacer(),

            AppButton(
              label: _isUploading ? 'Đang tải ảnh...' : 'Tiếp theo →',
              isLoading: _isUploading,
              onPressed: _selectedFiles.isEmpty ? null : _handleNext,
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}