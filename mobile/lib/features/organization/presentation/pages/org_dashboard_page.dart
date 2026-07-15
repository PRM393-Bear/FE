import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../notification/presentation/pages/notification_list_page.dart';
import '../../data/donation_request_model.dart';
import '../../data/donation_request_service.dart';
import '../../data/organization_service.dart';
import '../../data/organization_detail_model.dart';
import 'org_donations_page.dart';
import '../../../donation/presentation/pages/donation_event_form_page.dart';
import '../../../donation/presentation/pages/my_campaigns_page.dart';
import '../../../donation/data/donation_event_model.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/auth/auth_storage.dart';

class OrgDashboardPage extends StatefulWidget {
  const OrgDashboardPage({super.key});

  @override
  State<OrgDashboardPage> createState() => _OrgDashboardPageState();
}

class _OrgDashboardPageState extends State<OrgDashboardPage> {
  List<DonationRequestModel> _requests = [];
  List<DonationEventModel> _myCampaigns = [];
  String _orgName = 'Tổ chức';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchAll();
  }

  Future<void> _fetchAll() async {
    setState(() => _isLoading = true);
    try {
      final org = await OrganizationService.getMine();
      // Trước: DonationRequestService.getMyOrganizationRequests()  — thiếu orgId, luôn 404.
      final requests = org != null
          ? await DonationRequestService.getMyOrganizationRequests(org.id)
          : <DonationRequestModel>[];

      await _fetchMyCampaigns(org);

      setState(() {
        _orgName = org?.orgName ?? 'Tổ chức';
        _requests = requests;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch org dashboard error: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchMyCampaigns(OrganizationDetailModel? myOrg) async {
    try {
      final myIds = await AuthStorage.getMyCampaignIds();
      final res = await ApiClient.dio.get('/api/donation-events');
      final all = (res.data as List)
          .map((e) => DonationEventModel.fromJson(e as Map<String, dynamic>))
          .toList();

      setState(() {
        _myCampaigns = all.where((e) =>
            (myOrg != null && e.organizationDetailId == myOrg.id) ||
            myIds.contains(e.id) ||
            (myOrg != null && e.orgName == myOrg.orgName)
        ).toList();
      });
    } catch (e) {
      debugPrint('🔴 Fetch my campaigns on dashboard error: $e');
    }
  }

  int get _pendingCount => _requests.where((r) => r.status == 'PENDING').length;
  int get _shippingCount => _requests
      .where((r) => r.status == 'SHIPPING' || r.status == 'SHIPPED').length;
  int get _receivedCount => _requests
      .where((r) => r.status == 'RECEIVED' || r.status == 'COMPLETED').length;
  int get _totalCount => _requests.length;

  List<DonationRequestModel> get _recentRequests {
    final sorted = List<DonationRequestModel>.from(_requests)
      ..sort((a, b) =>
          (b.createdAt ?? DateTime(2000)).compareTo(a.createdAt ?? DateTime(2000)));
    return sorted.take(3).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: _fetchAll,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : ListView(
                padding: EdgeInsets.zero,
                children: [
                  _buildHeader(),
                  _buildStatCards(),
                  const SizedBox(height: 24),
                  _buildQuickActions(),
                  const SizedBox(height: 24),
                  _buildRecentRequests(),
                  const SizedBox(height: 24),
                ],
              ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 56, 20, 32),
      decoration: const BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Chào mừng trở lại,',
                    style: AppTextStyles.bodyMedium.copyWith(color: Colors.white70)),
                const SizedBox(height: 4),
                Text('Xin chào, $_orgName 👋',
                    style: AppTextStyles.headline2.copyWith(color: Colors.white)),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.campaign_outlined, color: Colors.white),
            tooltip: 'Quản lý chiến dịch',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const MyCampaignsPage()),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: Colors.white),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const NotificationListPage()),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCards() {
    final cards = [
      _StatCardData('Đồ chờ xác nhận', _pendingCount, Icons.hourglass_top_rounded,
          Colors.orange),
      _StatCardData(
          'Đang vận chuyển', _shippingCount, Icons.local_shipping_outlined, Colors.blue),
      _StatCardData('Đã nhận', _receivedCount, Icons.check_circle_outline, AppColors.primary),
      _StatCardData('Tổng yêu cầu', _totalCount, Icons.inventory_2_outlined, Colors.purple),
      _StatCardData('Chiến dịch', _myCampaigns.length, Icons.campaign_outlined, Colors.teal),
    ];
    return SizedBox(
      height: 148,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: cards.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, i) {
          final c = cards[i];
          return Container(
            width: 140,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration:
                      BoxDecoration(color: c.color.withOpacity(0.12), shape: BoxShape.circle),
                  child: Icon(c.icon, color: c.color, size: 20),
                ),
                const Spacer(),
                Text(c.label,
                    style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
                const SizedBox(height: 4),
                Text('${c.value}', style: AppTextStyles.headline2.copyWith(color: c.color)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildQuickActions() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('THAO TÁC NHANH',
              style: AppTextStyles.label.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _QuickActionCard(
                  icon: Icons.assignment_outlined,
                  label: 'Donation mới',
                  badge: _pendingCount > 0 ? _pendingCount.toString() : null,
                  filled: true,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => OrgDonationsPage(initialRequests: _requests),
                    ),
                  ).then((_) => _fetchAll()),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _QuickActionCard(
                  icon: Icons.campaign_outlined,
                  label: 'Đăng bài',
                  filled: false,
                  onTap: () => ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Tính năng đang phát triển')),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _QuickActionCard(
            icon: Icons.event_outlined,
            label: 'Tạo sự kiện',
            filled: false,
            fullWidth: true,
            onTap: () async {
              final created = await Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const DonationEventFormPage()),
              );
              if (created == true) _fetchAll();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildRecentRequests() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('YÊU CẦU GẦN ĐÂY',
                  style: AppTextStyles.label.copyWith(color: AppColors.textSecondary)),
              GestureDetector(
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => OrgDonationsPage(initialRequests: _requests),
                  ),
                ).then((_) => _fetchAll()),
                child: Text('Xem tất cả',
                    style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primary)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (_recentRequests.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Center(child: Text('Chưa có yêu cầu nào', style: AppTextStyles.bodyMedium)),
            )
          else
            ..._recentRequests.map((r) => Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: AppColors.primary.withOpacity(0.15),
                        child: Text(
                          r.username.isNotEmpty ? r.username[0].toUpperCase() : '?',
                          style: AppTextStyles.bodyLarge.copyWith(color: AppColors.primary),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(r.username, style: AppTextStyles.bodyLarge),
                            Text(
                              r.description.isNotEmpty ? r.description : 'Quyên góp',
                              style: AppTextStyles.bodyMedium
                                  .copyWith(color: AppColors.textSecondary),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right, color: AppColors.textSecondary),
                    ],
                  ),
                )),
        ],
      ),
    );
  }
}

class _StatCardData {
  final String label;
  final int value;
  final IconData icon;
  final Color color;
  _StatCardData(this.label, this.value, this.icon, this.color);
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? badge;
  final bool filled;
  final bool fullWidth;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.icon,
    required this.label,
    this.badge,
    required this.filled,
    this.fullWidth = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: fullWidth ? double.infinity : null,
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: filled ? AppColors.primary : AppColors.primary.withOpacity(0.08),
          borderRadius: BorderRadius.circular(14),
          border: filled ? null : Border.all(color: AppColors.primary.withOpacity(0.3)),
        ),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Center(child: Icon(icon, color: filled ? Colors.white : AppColors.primary, size: 26)),
                const SizedBox(height: 8),
                Text(label,
                    textAlign: TextAlign.center,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: filled ? Colors.white : AppColors.primary,
                      fontWeight: FontWeight.w600,
                    )),
              ],
            ),
            if (badge != null)
              Positioned(
                top: -8,
                right: fullWidth ? null : 8,
                left: fullWidth ? 8 : null,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                  child: Text(badge!,
                      style: const TextStyle(
                          color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
