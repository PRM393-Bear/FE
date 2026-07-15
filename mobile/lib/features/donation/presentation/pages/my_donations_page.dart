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
  String _selectedTab = 'Tất cả';
  final List<String> _tabs = ['Tất cả', 'Chờ xác nhận', 'Đang gửi', 'Hoàn tất'];

  @override
  void initState() {
    super.initState();
    _fetchRequests();
  }

  Future<void> _fetchRequests() async {
    setState(() => _isLoading = true);
    try {
      final list = await DonationRequestService.getMyRequests();
      setState(() {
        _requests = list;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch my donations error: $e');
      setState(() => _isLoading = false);
    }
  }

  List<DonationRequestModel> get _filtered {
    switch (_selectedTab) {
      case 'Chờ xác nhận':
        return _requests.where((r) => r.status == 'PENDING').toList();
      case 'Đang gửi':
        return _requests
            .where((r) => r.status == 'ACCEPTED' || r.status == 'SHIPPING' || r.status == 'SHIPPED')
            .toList();
      case 'Hoàn tất':
        return _requests
            .where((r) => r.status == 'RECEIVED' || r.status == 'COMPLETED')
            .toList();
      default:
        return _requests;
    }
  }

  String _statusText(String status) {
    switch (status) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'ACCEPTED':
        return 'Đã chấp nhận - Chờ gửi hàng';
      case 'SHIPPING':
      case 'SHIPPED':
        return 'Đang vận chuyển';
      case 'RECEIVED':
        return 'Tổ chức đã nhận';
      case 'COMPLETED':
        return 'Hoàn tất';
      case 'REJECTED':
        return 'Đã từ chối';
      default:
        return status;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'PENDING':
        return Colors.orange;
      case 'ACCEPTED':
        return AppColors.primary;
      case 'SHIPPING':
      case 'SHIPPED':
        return Colors.blue;
      case 'RECEIVED':
      case 'COMPLETED':
        return AppColors.primary;
      case 'REJECTED':
        return Colors.red;
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
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _tabs.length,
              itemBuilder: (context, index) {
                final tab = _tabs[index];
                final isSelected = tab == _selectedTab;
                return GestureDetector(
                  onTap: () => setState(() => _selectedTab = tab),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary : AppColors.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected ? AppColors.primary : AppColors.border,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        tab,
                        style: AppTextStyles.label.copyWith(
                          color: isSelected ? Colors.white : AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : _filtered.isEmpty
                    ? Center(child: Text('Chưa có yêu cầu nào', style: AppTextStyles.bodyLarge))
                    : RefreshIndicator(
                        onRefresh: _fetchRequests,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _filtered.length,
                          itemBuilder: (context, index) => _buildCard(_filtered[index]),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard(DonationRequestModel r) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
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
                  r.eventName ?? 'Quyên góp cá nhân',
                  style: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _statusColor(r.status).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  _statusText(r.status),
                  style: AppTextStyles.label.copyWith(color: _statusColor(r.status), fontSize: 11),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text('Tổ chức: ${r.organizationName}', style: AppTextStyles.bodyMedium),
          const SizedBox(height: 4),
          Text(
            r.description.isNotEmpty ? r.description : '(Không có mô tả)',
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
          ),
          if (r.trackingCode != null) ...[
            const SizedBox(height: 8),
            Text('Mã vận đơn: ${r.trackingCode}',
                style: AppTextStyles.bodySmall.copyWith(color: AppColors.primary)),
          ],
          const SizedBox(height: 12),
          if (r.status == 'ACCEPTED')
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: () async {
                  final ok = await Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => DonationShippingPage(request: r)),
                  );
                  if (ok == true) _fetchRequests();
                },
                child: const Text('Gửi hàng & Nhập mã vận đơn'),
              ),
            ),
        ],
      ),
    );
  }
}
