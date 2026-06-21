import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';

class DonationRequest {
  final String id;
  final String senderName;
  final String senderCity;
  final String productName;
  final String sentDate;
  final String status;

  DonationRequest({
    required this.id,
    required this.senderName,
    required this.senderCity,
    required this.productName,
    required this.sentDate,
    required this.status,
  });

  factory DonationRequest.fromJson(Map<String, dynamic> json) {
    return DonationRequest(
      id: json['id']?.toString() ?? '',
      senderName: json['senderName'] ?? json['requesterName'] ?? 'Người dùng',
      senderCity: json['senderCity'] ?? json['city'] ?? '',
      productName: json['productName'] ?? json['itemName'] ?? 'Sản phẩm',
      sentDate: json['createdAt']?.toString().substring(0, 10) ?? '',
      status: json['status'] ?? 'PENDING',
    );
  }
}

class OrgDashboardPage extends StatefulWidget {
  const OrgDashboardPage({super.key});

  @override
  State<OrgDashboardPage> createState() => _OrgDashboardPageState();
}

class _OrgDashboardPageState extends State<OrgDashboardPage> {
  List<DonationRequest> _requests = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchDonations();
  }

  Future<void> _fetchDonations() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final res = await ApiClient.dio.get('/api/donation-requests/lists');
      final list = (res.data as List)
          .map((e) => DonationRequest.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() {
        _requests = list;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch donations error: $e');
      setState(() {
        _error = 'Không thể tải dữ liệu';
        _isLoading = false;
      });
    }
  }

  Future<void> _acceptRequest(String id) async {
    try {
      await ApiClient.dio.patch('/api/donation-requests/$id/accept');
      _fetchDonations();
      _showSnack('Đã chấp nhận yêu cầu!', isSuccess: true);
    } catch (e) {
      debugPrint('🔴 Accept error: $e');
      _showSnack('Không thể chấp nhận');
    }
  }

  Future<void> _rejectRequest(String id) async {
    final reasonController = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Từ chối yêu cầu'),
        content: TextField(
          controller: reasonController,
          decoration: const InputDecoration(
            hintText: 'Nhập lý do từ chối...',
          ),
          maxLines: 3,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Từ chối',
                style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await ApiClient.dio.patch(
        '/api/donation-requests/$id/reject',
        data: {'reason': reasonController.text},
      );
      _fetchDonations();
      _showSnack('Đã từ chối yêu cầu');
    } on DioException catch (e) {
      debugPrint('🔴 Reject error: ${e.response?.data}');
      _showSnack('Không thể từ chối');
    }
  }

  void _showSnack(String msg, {bool isSuccess = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isSuccess ? AppColors.primary : AppColors.error,
    ));
  }

  int get _pendingCount =>
      _requests.where((r) => r.status == 'PENDING').length;
  int get _shippingCount =>
      _requests.where((r) => r.status == 'SHIPPING').length;
  int get _totalCount => _requests.length;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: _isLoading
          ? const Center(
          child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _fetchDonations,
        child: CustomScrollView(
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: Container(
                width: double.infinity,
                padding: EdgeInsets.fromLTRB(
                    16,
                    MediaQuery.of(context).padding.top + 16,
                    16,
                    24),
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.vertical(
                      bottom: Radius.circular(24)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment:
                      MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(
                                Icons.volunteer_activism_outlined,
                                color: Colors.white,
                                size: 20),
                            const SizedBox(width: 8),
                            Text('Tổng quan',
                                style: AppTextStyles.bodyLarge
                                    .copyWith(color: Colors.white)),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(
                              Icons.notifications_outlined,
                              color: Colors.white),
                          onPressed: () {},
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text('Xin chào,',
                        style: AppTextStyles.bodyMedium
                            .copyWith(color: Colors.white70)),
                    Text('Tổ chức từ thiện',
                        style: AppTextStyles.headline2
                            .copyWith(color: Colors.white)),
                    const SizedBox(height: 8),
                    if (_pendingCount > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Bạn có $_pendingCount yêu cầu đang chờ xử lý!',
                          style: AppTextStyles.bodyMedium
                              .copyWith(color: Colors.white),
                        ),
                      ),
                  ],
                ),
              ),
            ),

            // Stats
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.5,
                  children: [
                    _buildStatCard(
                      icon: Icons.hourglass_top_rounded,
                      label: 'Chờ xử lý',
                      value: '$_pendingCount',
                      color: AppColors.secondary,
                    ),
                    _buildStatCard(
                      icon: Icons.local_shipping_outlined,
                      label: 'Đang vận chuyển',
                      value: '$_shippingCount',
                      color: AppColors.tertiary,
                    ),
                    _buildStatCard(
                      icon: Icons.check_circle_outline_rounded,
                      label: 'Đã nhận',
                      value: '${_requests.where((r) => r.status == 'RECEIVED' || r.status == 'COMPLETED').length}',
                      color: AppColors.primary,
                    ),
                    _buildStatCard(
                      icon: Icons.volunteer_activism_outlined,
                      label: 'Tổng đã nhận',
                      value: '$_totalCount',
                      color: Colors.purple,
                    ),
                  ],
                ),
              ),
            ),

            // Danh sách yêu cầu
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Yêu cầu đang chờ xử lý',
                        style: AppTextStyles.headline3),
                    Text('$_pendingCount yêu cầu',
                        style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.textSecondary)),
                  ],
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 12)),

            _requests.isEmpty
                ? SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                        Icons.volunteer_activism_outlined,
                        size: 60,
                        color: AppColors.neutral),
                    const SizedBox(height: 12),
                    Text('Chưa có yêu cầu nào',
                        style: AppTextStyles.bodyLarge),
                  ],
                ),
              ),
            )
                : SliverPadding(
              padding: const EdgeInsets.symmetric(
                  horizontal: 16),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                      (context, index) {
                    final req = _requests[index];
                    return _buildRequestCard(req);
                  },
                  childCount: _requests.length,
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 32)),
          ],
        ),
      ),
    );
  }

  Widget _buildRequestCard(DonationRequest req) {
    final isPending = req.status == 'PENDING';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: AppColors.primary.withOpacity(0.2),
                child: Text(
                  req.senderName.isNotEmpty
                      ? req.senderName[0].toUpperCase()
                      : '?',
                  style: AppTextStyles.bodyLarge
                      .copyWith(color: AppColors.primary),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(req.senderName,
                        style: AppTextStyles.bodyLarge
                            .copyWith(fontWeight: FontWeight.w600)),
                    if (req.senderCity.isNotEmpty)
                      Text(req.senderCity,
                          style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.textSecondary)),
                  ],
                ),
              ),
              _buildStatusBadge(req.status),
            ],
          ),
          const Divider(height: 16),
          Row(
            children: [
              const Icon(Icons.inventory_2_outlined,
                  size: 14, color: AppColors.neutral),
              const SizedBox(width: 6),
              Expanded(
                child: Text(req.productName,
                    style: AppTextStyles.bodyMedium),
              ),
            ],
          ),
          if (req.sentDate.isNotEmpty) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.calendar_today_outlined,
                    size: 14, color: AppColors.neutral),
                const SizedBox(width: 6),
                Text(req.sentDate,
                    style: AppTextStyles.bodySmall
                        .copyWith(color: AppColors.textSecondary)),
              ],
            ),
          ],
          if (isPending) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _acceptRequest(req.id),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(0, 40),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text('Chấp nhận'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _rejectRequest(req.id),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.error),
                      minimumSize: const Size(0, 40),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text('Từ chối'),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String label;
    switch (status) {
      case 'PENDING':
        color = AppColors.secondary;
        label = 'Chờ duyệt';
        break;
      case 'ACCEPTED':
        color = AppColors.primary;
        label = 'Đã chấp nhận';
        break;
      case 'SHIPPING':
        color = AppColors.tertiary;
        label = 'Đang giao';
        break;
      case 'RECEIVED':
        color = Colors.purple;
        label = 'Đã nhận';
        break;
      case 'COMPLETED':
        color = AppColors.primary;
        label = 'Hoàn thành';
        break;
      case 'REJECTED':
        color = AppColors.error;
        label = 'Từ chối';
        break;
      default:
        color = AppColors.neutral;
        label = status;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(label,
          style: AppTextStyles.bodySmall.copyWith(
              color: color, fontWeight: FontWeight.w600)),
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color, size: 24),
          Text(value,
              style: AppTextStyles.headline2.copyWith(color: color)),
          Text(label,
              style: AppTextStyles.bodySmall
                  .copyWith(color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}