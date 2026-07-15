import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
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

  @override
  void initState() {
    super.initState();
    _fetchWardrobe();
  }

  Future<void> _fetchWardrobe() async {
    try {
      final res = await ApiClient.dio.get('/api/wardrobe-items/my-wardrobe');
      final list = (res.data as List).map((e) => WardrobeModel.fromJson(e)).toList();
      setState(() {
        // Chỉ cho chọn đồ chưa bán/chưa tặng — verify tên trạng thái thật
        // với BE (WardrobeStatus.OWNED) trước khi merge.
        _items = list
            .where((i) => i.status == 'AVAILABLE' || i.status == 'OWNED')
            .toList();
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch wardrobe for donation error: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleSubmit() async {
    if (_selectedItemId == null) {
      _showSnack('Vui lòng chọn 1 món đồ để quyên góp', isError: true);
      return;
    }
    setState(() => _isSubmitting = true);
    try {
      // DonationRequestReq — khớp field thật với BE
      // (dto/request/donationRequest/DonationRequestReq.java)
      await ApiClient.dio.post('/api/donation-requests', data: {
        'donationEventId': widget.donationEventId,
        'description': _descController.text.trim(),
        'wardrobeItemId': _selectedItemId,
      });
      if (!mounted) return;
      _showSnack('Đăng ký quyên góp thành công! Chờ tổ chức xác nhận.');
      Navigator.pop(context, true);
    } on DioException catch (e) {
      debugPrint('🔴 Donation register error: ${e.response?.data}');
      _showSnack(e.response?.data?['message']?.toString() ?? 'Đăng ký thất bại',
          isError: true);
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Đăng ký quyên góp', style: AppTextStyles.headline3),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Chiến dịch: ${widget.eventTitle}',
                style: AppTextStyles.headline3.copyWith(color: AppColors.primary)),
            const SizedBox(height: 4),
            Text('Tổ chức: ${widget.orgName}',
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
            const SizedBox(height: 24),
            AppTextField(label: 'Ghi chú (loại đồ, số lượng...)', controller: _descController),
            const SizedBox(height: 20),
            Text('Chọn món đồ từ Tủ đồ của bạn', style: AppTextStyles.label),
            const SizedBox(height: 8),
            if (_items.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Text('Bạn chưa có món đồ nào khả dụng trong Tủ đồ'),
              )
            else
              ..._items.map((item) => RadioListTile<String>(
                value: item.id,
                groupValue: _selectedItemId,
                onChanged: (v) => setState(() => _selectedItemId = v),
                title: Text(item.title),
                subtitle: Text(item.category ?? ''),
                activeColor: AppColors.primary,
              )),
            const SizedBox(height: 32),
            AppButton(
              label: 'Xác nhận đăng ký',
              isLoading: _isSubmitting,
              onPressed: _handleSubmit,
            ),
          ],
        ),
      ),
    );
  }
}