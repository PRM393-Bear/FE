import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../data/donation_event_model.dart';

class DonationEventDetailPage extends StatefulWidget {
  final String eventId;
  const DonationEventDetailPage({super.key, required this.eventId});

  @override
  State<DonationEventDetailPage> createState() => _DonationEventDetailPageState();
}

class _DonationEventDetailPageState extends State<DonationEventDetailPage> {
  DonationEventModel? _event;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchDetail();
  }

  // BE hiện chỉ có GET /api/donation-events (list) — chưa có GET /{id} riêng.
  // Nên tạm thời lấy từ list rồi lọc theo id. Nếu event nhiều, nên báo BE thêm
  // GET /api/donation-events/{id} để đỡ tốn băng thông.
  Future<void> _fetchDetail() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiClient.dio.get('/api/donation-events');
      final list = (res.data as List<dynamic>)
          .map((e) => DonationEventModel.fromJson(e as Map<String, dynamic>))
          .toList();
      final found = list.firstWhere((e) => e.id == widget.eventId);
      setState(() {
        _event = found;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch event detail error: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }
    if (_event == null) {
      return Scaffold(
        appBar: AppBar(leading: BackButton(onPressed: () => Navigator.pop(context))),
        body: const Center(child: Text('Không tìm thấy sự kiện')),
      );
    }
    final event = _event!;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            backgroundColor: AppColors.primary,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  if (event.bannerUrl != null && event.bannerUrl!.isNotEmpty)
                    Image.network(event.bannerUrl!, fit: BoxFit.cover)
                  else
                    Container(color: AppColors.primary),
                  if (event.daysLeftText.isNotEmpty)
                    Positioned(
                      top: 60, right: 16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text('⏱ ${event.daysLeftText}', style: AppTextStyles.label),
                      ),
                    ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const CircleAvatar(radius: 14, backgroundColor: AppColors.primary,
                          child: Icon(Icons.volunteer_activism, size: 16, color: Colors.white)),
                      const SizedBox(width: 8),
                      Text(event.orgName, style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(event.title, style: AppTextStyles.headline2),
                  const SizedBox(height: 16),
                  if (event.startDate != null) ...[
                    Row(children: [
                      const Icon(Icons.calendar_today_outlined, size: 18, color: AppColors.primary),
                      const SizedBox(width: 8),
                      Text(event.startDate!, style: AppTextStyles.bodyMedium),
                    ]),
                    const SizedBox(height: 8),
                  ],
                  Row(children: [
                    const Icon(Icons.location_on_outlined, size: 18, color: AppColors.primary),
                    const SizedBox(width: 8),
                    Expanded(child: Text(event.location, style: AppTextStyles.bodyMedium)),
                  ]),
                  const SizedBox(height: 20),
                  Text('Nhu cầu đóng góp', style: AppTextStyles.headline3),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8, runSpacing: 8,
                    children: event.acceptedTypes.map((t) => Chip(
                      label: Text(t),
                      backgroundColor: AppColors.background,
                      side: BorderSide(color: AppColors.border),
                    )).toList(),
                  ),
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                          Text('Tiến độ quyên góp', style: AppTextStyles.bodyMedium),
                          Text('${event.currentQuantity} / ${event.targetQuantity} bộ đồ',
                              style: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.primary, fontWeight: FontWeight.w700)),
                        ]),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(20),
                          child: LinearProgressIndicator(
                            value: event.progress, minHeight: 8,
                            backgroundColor: AppColors.border, color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text('Về sự kiện này', style: AppTextStyles.headline3),
                  const SizedBox(height: 8),
                  Text(event.description, style: AppTextStyles.bodyMedium),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        decoration: BoxDecoration(color: AppColors.surface, border: Border(top: BorderSide(color: AppColors.border))),
        child: AppButton(
          label: 'Đăng ký quyên góp',
          onPressed: () {
            // TODO: điều hướng sang form tạo Donation Request thật
            // (chọn item trong Wardrobe, mô tả, ảnh) — sẽ code ở bước tiếp theo,
            // vì đây là 1 form riêng, không phải nút RSVP đơn giản.
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text('Màn hình tạo yêu cầu quyên góp sẽ làm ở bước tiếp theo'),
            ));
          },
        ),
      ),
    );
  }
}