import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_text_field.dart';
import '../../../organization/data/donation_request_model.dart';
import '../../../organization/data/donation_request_service.dart';

class DonationShippingPage extends StatefulWidget {
  final DonationRequestModel request;
  const DonationShippingPage({super.key, required this.request});

  @override
  State<DonationShippingPage> createState() => _DonationShippingPageState();
}

class _DonationShippingPageState extends State<DonationShippingPage> {
  final _codeController = TextEditingController();
  bool _isSubmitting = false;

  Future<void> _handleSubmit() async {
    final code = _codeController.text.trim();
    if (code.isEmpty) {
      _showSnack('Vui lòng nhập mã vận đơn');
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      await DonationRequestService.submitTrackingCode(widget.request.id, code);
      if (!mounted) return;
      _showSnack('Đã cập nhật thông tin vận chuyển!');
      Navigator.pop(context, true);
    } catch (e) {
      debugPrint('🔴 Submit tracking code error: $e');
      _showSnack('Cập nhật thất bại, thử lại nhé');
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
        title: Text('Thông tin vận chuyển', style: AppTextStyles.headline3),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.05),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.primary.withOpacity(0.2)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Hướng dẫn:', style: AppTextStyles.label.copyWith(color: AppColors.primary)),
                  const SizedBox(height: 8),
                  const Text(
                    '1. Bạn vui lòng đóng gói vật phẩm quyên góp.\n'
                    '2. Mang ra đơn vị vận chuyển (GHTK, Viettel Post, J&T...) để gửi đến địa chỉ của tổ chức.\n'
                    '3. Nhập mã vận đơn (tracking number) vào ô bên dưới để tổ chức có thể theo dõi.',
                    style: TextStyle(fontSize: 14, height: 1.5),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            Text('Thông tin yêu cầu:', style: AppTextStyles.label),
            const SizedBox(height: 8),
            _infoRow('Tổ chức', widget.request.organizationName),
            _infoRow('Vật phẩm', widget.request.description),
            const SizedBox(height: 32),
            AppTextField(
              label: 'Mã vận đơn',
              controller: _codeController,
              hint: 'Ví dụ: SPX123456789',
            ),
            const SizedBox(height: 40),
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

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Text('$label: ', style: const TextStyle(fontWeight: FontWeight.w600)),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
