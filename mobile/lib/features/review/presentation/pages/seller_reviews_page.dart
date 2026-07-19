import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../data/review_model.dart';

class SellerReviewsPage extends StatefulWidget {
  const SellerReviewsPage({super.key});

  @override
  State<SellerReviewsPage> createState() => _SellerReviewsPageState();
}

class _SellerReviewsPageState extends State<SellerReviewsPage> {
  List<ReviewModel> _reviews = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchReviews();
  }

  Future<void> _fetchReviews() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiClient.dio.get('/api/reviews/seller');
      final list = (res.data as List)
          .map((e) => ReviewModel.fromJson(e as Map<String, dynamic>))
          .toList()
        ..sort((a, b) =>
            (b.createdAt ?? DateTime(0)).compareTo(a.createdAt ?? DateTime(0)));
      if (!mounted) return;
      setState(() {
        _reviews = list;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch seller reviews error: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  double get _avgRating {
    if (_reviews.isEmpty) return 0;
    return _reviews.map((r) => r.rating).reduce((a, b) => a + b) / _reviews.length;
  }

  String _formatDate(DateTime? date) {
    if (date == null) return '';
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Đánh giá nhận được', style: AppTextStyles.headline3),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _reviews.isEmpty
          ? Center(
        child: Text('Bạn chưa nhận được đánh giá nào',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
      )
          : RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _fetchReviews,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _buildSummaryCard(),
            const SizedBox(height: 16),
            ..._reviews.map(_buildReviewCard),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Text(_avgRating.toStringAsFixed(1),
              style: AppTextStyles.headline3.copyWith(fontSize: 32, color: AppColors.primary)),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: List.generate(5, (i) {
                    final filled = i < _avgRating.round();
                    return Icon(
                      filled ? Icons.star_rounded : Icons.star_border_rounded,
                      color: AppColors.secondary,
                      size: 20,
                    );
                  }),
                ),
                const SizedBox(height: 4),
                Text('${_reviews.length} đánh giá', style: AppTextStyles.bodyMedium),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewCard(ReviewModel review) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(review.reviewerName ?? 'Ẩn danh',
                  style: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.w600)),
              Text(_formatDate(review.createdAt),
                  style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
            ],
          ),
          if (review.productTitle != null && review.productTitle!.trim().isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              review.productTitle!,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
          const SizedBox(height: 6),
          Row(
            children: List.generate(5, (i) {
              final filled = i < review.rating;
              return Icon(
                filled ? Icons.star_rounded : Icons.star_border_rounded,
                color: AppColors.secondary,
                size: 16,
              );
            }),
          ),
          if (review.comment != null && review.comment!.trim().isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(review.comment!, style: AppTextStyles.bodyMedium),
          ],
        ],
      ),
    );
  }
}