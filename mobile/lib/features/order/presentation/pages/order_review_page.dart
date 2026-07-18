import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';

class OrderReviewPage extends StatefulWidget {
  final String orderId;
  final String productTitle;
  const OrderReviewPage({super.key, required this.orderId, required this.productTitle});

  @override
  State<OrderReviewPage> createState() => _OrderReviewPageState();
}

class _OrderReviewPageState extends State<OrderReviewPage> {
  int _rating = 5;
  final _commentController = TextEditingController();
  bool _isSubmitting = false;

  Future<void> _handleSubmit() async {
    setState(() => _isSubmitting = true);
    try {
      await ApiClient.dio.post('/api/reviews', data: {
        'orderId': widget.orderId,
        'rating': _rating,
        'comment': _commentController.text.trim(),
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Cảm ơn bạn đã đánh giá đơn hàng!'),
        backgroundColor: AppColors.primary,
      ));
      Navigator.pop(context, true);
    } on DioException catch (e) {
      debugPrint('🔴 Submit review error: ${e.response?.data}');
      final data = e.response?.data;
      String msg = 'Gửi đánh giá thất bại';
      if (data is Map && data['message'] != null) msg = data['message'].toString();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(msg),
        backgroundColor: AppColors.error,
      ));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
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
        title: Text('Đánh giá đơn hàng', style: AppTextStyles.headline3),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.productTitle,
                style: AppTextStyles.bodyLarge, maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 24),
            Text('Bạn đánh giá sản phẩm này thế nào?', style: AppTextStyles.label),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (i) {
                final star = i + 1;
                return GestureDetector(
                  onTap: () => setState(() => _rating = star),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Icon(
                      star <= _rating ? Icons.star_rounded : Icons.star_border_rounded,
                      color: AppColors.secondary,
                      size: 40,
                    ),
                  ),
                );
              }),
            ),
            const SizedBox(height: 24),
            Text('Nhận xét (không bắt buộc)', style: AppTextStyles.label),
            const SizedBox(height: 8),
            TextField(
              controller: _commentController,
              maxLines: 4,
              style: AppTextStyles.bodyLarge,
              decoration: const InputDecoration(
                hintText: 'Chia sẻ trải nghiệm của bạn về sản phẩm và người bán...',
              ),
            ),
            const SizedBox(height: 32),
            AppButton(
              label: 'Gửi đánh giá',
              isLoading: _isSubmitting,
              onPressed: _isSubmitting ? null : _handleSubmit,
            ),
          ],
        ),
      ),
    );
  }
}
