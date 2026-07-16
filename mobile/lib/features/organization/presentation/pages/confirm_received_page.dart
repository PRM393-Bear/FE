import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../data/donation_request_model.dart';
import '../../data/donation_request_service.dart';

class ConfirmReceivedPage extends StatefulWidget {
  final DonationRequestModel request;
  const ConfirmReceivedPage({super.key, required this.request});

  @override
  State<ConfirmReceivedPage> createState() => _ConfirmReceivedPageState();
}

class _ConfirmReceivedPageState extends State<ConfirmReceivedPage> {
  File? _proofImage;
  bool _isSubmitting = false;

  Future<void> _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final img = await picker.pickImage(source: source, imageQuality: 85);
    if (img == null) return;
    setState(() => _proofImage = File(img.path));
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
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined, color: AppColors.primary),
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

  Future<void> _handleConfirm() async {
    if (_proofImage == null) {
      _showSnack('Vui lòng chọn ảnh xác nhận nhận hàng');
      return;
    }
    setState(() => _isSubmitting = true);
    try {
      await DonationRequestService.confirmReceived(widget.request.id, _proofImage!.path);
      if (!mounted) return;
      _showSnack('Đã xác nhận nhận hàng!');
      Navigator.pop(context, true);
    } catch (e) {
      debugPrint('🔴 Confirm received error: $e');
      _showSnack('Xác nhận thất bại, thử lại nhé');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    final r = widget.request;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Xác nhận nhận hàng', style: AppTextStyles.headline3),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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
                  Text('CHI TIẾT YÊU CẦU',
                      style: AppTextStyles.label.copyWith(color: AppColors.textSecondary)),
                  const SizedBox(height: 12),
                  _infoRow('Người gửi', r.username),
                  _infoRow('Vật phẩm', r.description.isNotEmpty ? r.description : '-'),
                  _infoRow('Mã vận đơn', r.trackingCode ?? '-'),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text('Ảnh xác nhận',
                style: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            if (_proofImage == null)
              GestureDetector(
                onTap: _showPickerSheet,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 32),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.primary.withOpacity(0.4)),
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.camera_alt_outlined, color: AppColors.primary, size: 32),
                      const SizedBox(height: 8),
                      Text('Upload ảnh xác nhận nhận hàng',
                          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primary)),
                      const SizedBox(height: 4),
                      Text('Chạm để chụp ảnh hoặc chọn từ thư viện',
                          style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              )
            else
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: Image.file(_proofImage!,
                        width: double.infinity, height: 220, fit: BoxFit.cover),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: GestureDetector(
                      onTap: () => setState(() => _proofImage = null),
                      child: const CircleAvatar(
                        radius: 14,
                        backgroundColor: Colors.white,
                        child: Icon(Icons.close, size: 16, color: Colors.red),
                      ),
                    ),
                  ),
                ],
              ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.06),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                'Vui lòng chụp rõ vật phẩm nhận được cùng mã vận đơn nếu có để đảm bảo tính '
                    'minh bạch cho quy trình quyên góp.',
                style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
              ),
            ),
            const SizedBox(height: 28),
            AppButton(
              label: 'Xác nhận đã nhận',
              isLoading: _isSubmitting,
              onPressed: _handleConfirm,
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
          Text(value, style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}