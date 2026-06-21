import 'package:flutter/material.dart';
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
  final List<String> _selectedImages = [];
  final int _maxImages = 10;

  void _addMockImage() {
    if (_selectedImages.length < _maxImages) {
      setState(() {
        _selectedImages.add(
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
        );
      });
    }
  }

  void _removeImage(int index) {
    setState(() => _selectedImages.removeAt(index));
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
              onTap: _addMockImage,
              child: Container(
                width: double.infinity,
                height: 180,
                decoration: BoxDecoration(
                  border: Border.all(
                    color: AppColors.primary,
                    width: 1.5,
                  ),
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
                      child: const Icon(
                        Icons.camera_alt_rounded,
                        color: AppColors.primary,
                        size: 28,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Chụp hoặc tải ảnh sản phẩm',
                      style: AppTextStyles.bodyLarge.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Tối đa 10 ảnh • Ảnh đầu là ảnh bìa',
                      style: AppTextStyles.bodyMedium.copyWith(fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Danh sách ảnh đã chọn
            if (_selectedImages.isNotEmpty) ...[
              Text(
                'Đã tải lên (${_selectedImages.length}/$_maxImages)',
                style: AppTextStyles.label,
              ),
              const SizedBox(height: 10),
              SizedBox(
                height: 90,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _selectedImages.length + 1,
                  itemBuilder: (context, index) {
                    if (index == _selectedImages.length) {
                      if (_selectedImages.length >= _maxImages) {
                        return const SizedBox();
                      }
                      return GestureDetector(
                        onTap: _addMockImage,
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
                            child: Image.network(
                              _selectedImages[index],
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
              label: 'Tiếp theo →',
              onPressed: _selectedImages.isEmpty
                  ? null
                  : () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ListingFormPage(
                      imagePaths: _selectedImages,
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}