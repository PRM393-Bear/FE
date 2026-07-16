// mobile/lib/features/donation/presentation/pages/donation_shipping_page.dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../organization/data/donation_request_model.dart';
import '../../../organization/data/donation_request_service.dart';

class DonationShippingPage extends StatefulWidget {
  final DonationRequestModel request;
  const DonationShippingPage({super.key, required this.request});

  @override
  State<DonationShippingPage> createState() => _DonationShippingPageState();
}

class _DonationShippingPageState extends State<DonationShippingPage> {
  final _trackingController = TextEditingController();
  File? _proofImage;
  bool _isSubmitting = false;

  bool get _needsShippingStep => widget.request.status == 'ACCEPTED';

  @override
  void dispose() {
    _trackingController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    // Chuyển sang camera để "chụp ảnh xác nhận" như yêu cầu trước đó
    final img = await picker.pickImage(source: ImageSource.camera, imageQuality: 85);
    if (img == null) return;
    setState(() => _proofImage = File(img.path));
  }

  Future<void> _handleSubmit() async {
    if (_trackingController.text.trim().isEmpty || _proofImage == null) {
      _showSnack('Vui lòng nhập mã vận đơn và chọn ảnh gửi hàng');
      return;
    }
    setState(() => _isSubmitting = true);
    try {
      // Bước 1 (chỉ khi đơn đang ACCEPTED): chuyển sang SHIPPING trước.
      if (_needsShippingStep) {
        await DonationRequestService.shipping(widget.request.id);
      }
      // Bước 2: gửi mã vận đơn + ảnh, chuyển sang SHIPPED.
      await DonationRequestService.shipped(
        widget.request.id,
        _trackingController.text.trim(),
        _proofImage!.path,
      );
      if (!mounted) return;
      _showSnack('Đã gửi hàng thành công! Chờ tổ chức xác nhận nhận hàng.');
      Navigator.pop(context, true);
    } catch (e) {
      debugPrint('🔴 Shipping error: $e');
      _showSnack('Gửi hàng thất bại, thử lại nhé');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Gửi hàng cho tổ chức', style: AppTextStyles.headline3),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Nhập mã vận đơn (nếu gửi qua bưu điện/shipper) và chụp ảnh gói hàng trước khi gửi đi.',
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _trackingController,
              decoration: InputDecoration(
                labelText: 'Mã vận đơn',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 20),
            GestureDetector(
              onTap: _pickImage,
              child: Container(
                height: 180,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: _proofImage == null
                    ? const Center(
                        child: Icon(Icons.add_a_photo_outlined, size: 40, color: AppColors.neutral),
                      )
                    : ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.file(_proofImage!, fit: BoxFit.cover),
                      ),
              ),
            ),
            const SizedBox(height: 32),
            AppButton(
              label: 'Xác nhận đã gửi hàng',
              isLoading: _isSubmitting,
              onPressed: _handleSubmit,
            ),
          ],
        ),
      ),
    );
  }
}
