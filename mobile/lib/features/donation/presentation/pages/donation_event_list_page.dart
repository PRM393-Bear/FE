import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../data/donation_event_model.dart';
import 'donation_event_detail_page.dart';

class DonationEventListPage extends StatefulWidget {
  const DonationEventListPage({super.key});

  @override
  State<DonationEventListPage> createState() => _DonationEventListPageState();
}

class _DonationEventListPageState extends State<DonationEventListPage> {
  List<DonationEventModel> _events = [];
  bool _isLoading = true;
  bool _isMapView = false;

  @override
  void initState() {
    super.initState();
    _fetchEvents();
  }

  Future<void> _fetchEvents() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiClient.dio.get('/api/donation-events');
      final list = (res.data as List<dynamic>)
          .map((e) => DonationEventModel.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() {
        _events = list;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch donation events error: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text('Sự kiện Quyên góp', style: AppTextStyles.headline3),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Row(
              children: [
                _buildToggleChip('List', !_isMapView, () => setState(() => _isMapView = false)),
                const SizedBox(width: 6),
                _buildToggleChip('Map', _isMapView, () => setState(() => _isMapView = true)),
              ],
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _fetchEvents,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : _isMapView
            ? _buildMapPlaceholder()
            : _buildList(),
      ),
    );
  }

  Widget _buildToggleChip(String label, bool selected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary : AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: selected ? AppColors.primary : AppColors.border),
        ),
        child: Text(label,
            style: AppTextStyles.label
                .copyWith(color: selected ? Colors.white : AppColors.textSecondary)),
      ),
    );
  }

  Widget _buildMapPlaceholder() {
    return ListView(
      children: [
        SizedBox(height: MediaQuery.of(context).size.height * 0.3),
        const Icon(Icons.map_outlined, size: 60, color: AppColors.neutral),
        const SizedBox(height: 12),
        Center(
          child: Text('Chế độ bản đồ đang phát triển', style: AppTextStyles.bodyLarge),
        ),
      ],
    );
  }

  Widget _buildList() {
    if (_events.isEmpty) {
      return ListView(
        children: [
          SizedBox(height: MediaQuery.of(context).size.height * 0.3),
          const Icon(Icons.volunteer_activism_outlined, size: 60, color: AppColors.neutral),
          const SizedBox(height: 12),
          Center(child: Text('Chưa có sự kiện quyên góp nào', style: AppTextStyles.bodyLarge)),
        ],
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _events.length,
      itemBuilder: (context, index) => _buildEventCard(_events[index]),
    );
  }

  Widget _buildEventCard(DonationEventModel event) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => DonationEventDetailPage(eventId: event.id)),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                if (event.bannerUrl != null && event.bannerUrl!.isNotEmpty)
                  Image.network(event.bannerUrl!, height: 160, width: double.infinity, fit: BoxFit.cover)
                else
                  Container(height: 160, color: AppColors.background,
                      child: const Icon(Icons.image_outlined, size: 40, color: AppColors.neutral)),
                if (event.daysLeftText.isNotEmpty)
                  Positioned(
                    top: 12, right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text('⏱ ${event.daysLeftText}',
                          style: AppTextStyles.label.copyWith(fontSize: 11)),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(event.title, style: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.verified, size: 14, color: AppColors.primary),
                      const SizedBox(width: 4),
                      Text(event.orgName, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primary)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 14, color: AppColors.neutral),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(event.location,
                            style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                            maxLines: 1, overflow: TextOverflow.ellipsis),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Mục tiêu quyên góp', style: AppTextStyles.bodySmall),
                      Text('${event.currentQuantity}/${event.targetQuantity} bộ đồ',
                          style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.secondary, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: LinearProgressIndicator(
                      value: event.progress,
                      minHeight: 8,
                      backgroundColor: AppColors.border,
                      color: AppColors.secondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}