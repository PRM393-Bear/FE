// mobile/lib/features/donation/presentation/pages/my_donations_page.dart
import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../organization/data/donation_request_model.dart';
import '../../../organization/data/donation_request_service.dart';
import 'donation_shipping_page.dart';

class MyDonationsPage extends StatefulWidget {
  const MyDonationsPage({super.key});

  @override
  State<MyDonationsPage> createState() => _MyDonationsPageState();
}

class _MyDonationsPageState extends State<MyDonationsPage> {
  List<DonationRequestModel> _requests = [];
  bool _isLoading = true;
  int _tabIndex = 0;
  final _tabs = ['Tất cả', 'Chờ xác nhận', 'Đang gửi', 'Hoàn tất'];

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _isLoading = true);
    try {
      final list = await DonationRequestService.getMyDonations();
      setState(() {
        _requests = list;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch my donations error: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<DonationRequestModel> get _filtered {
    switch (_tabIndex) {
      case 1:
        return _requests.where((r) => r.status == 'PENDING').toList();
      case 2:
        return _requests
            .where((r) =>
        r.status == 'ACCEPTED' || r.status == 'SHIPPING' || r.status == 'SHIPPED')
            .toList();
      case 3:
        return _requests.where((r) => r.status == 'RECEIVED').toList();
      default:
        return _requests;
    }
  }

  String _statusText(String status) {
    switch (status) {
      case 'PENDING':
        return 'Chờ tổ chức duyệt';
      case 'ACCEPTED':
        return 'Đã duyệt - cần gửi hàng';
      case 'REJECTED':
        return 'Đã bị từ chối';
      case 'SHIPPING':
        return 'Đang chuẩn bị gửi';
      case 'SHIPPED':
        return 'Đã gửi - chờ tổ chức nhận';
      case 'RECEIVED':
        return 'Tổ chức đã nhận - hoàn tất';
      case 'CANCELLED':
        return 'Đã huỷ';
      default:
        return status;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'RECEIVED':
        return AppColors.primary;
      case 'REJECTED':
      case 'CANCELLED':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Đơn quyên góp của tôi', style: AppTextStyles.headline3),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 44,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _tabs.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, i) {
                final selected = _tabIndex == i;
                return GestureDetector(
                  onTap: () => setState(() => _tabIndex = i),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: selected ? AppColors.primary : AppColors.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: selected ? AppColors.primary : AppColors.border),
                    ),
                    child: Center(
                      child: Text(
                        _tabs[i],
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: selected ? Colors.white : AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : _filtered.isEmpty
                ? RefreshIndicator(
              onRefresh: _fetch,
              child: ListView(
                children: [
                  SizedBox(
                    height: MediaQuery.of(context).size.height * 0.6,
                    child: Center(
                      child: Text('Chưa có yêu cầu nào', style: AppTextStyles.bodyMedium),
                    ),
                  ),
                ],
              ),
            )
                : RefreshIndicator(
              onRefresh: _fetch,
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: _filtered.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final r = _filtered[index];
                  return Container(
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
                            Expanded(
                              child: Text(
                                r.eventName ?? 'Chiến dịch quyên góp',
                                style: AppTextStyles.bodyLarge,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Text(
                              _statusText(r.status),
                              style: AppTextStyles.label.copyWith(color: _statusColor(r.status)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          r.description.isNotEmpty ? r.description : 'Không có mô tả',
                          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (r.status == 'ACCEPTED' || r.status == 'SHIPPING') ...[
                          const SizedBox(height: 10),
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton(
                              onPressed: () async {
                                final changed = await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => DonationShippingPage(request: r),
                                  ),
                                );
                                if (changed == true) _fetch();
                              },
                              child: const Text('Gửi hàng cho tổ chức'),
                            ),
                          ),
                        ],
                      ],
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}