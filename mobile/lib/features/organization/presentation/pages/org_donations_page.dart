import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../data/donation_request_model.dart';
import '../../data/donation_request_service.dart';
import 'confirm_received_page.dart';

class OrgDonationsPage extends StatefulWidget {
  final List<DonationRequestModel> initialRequests;
  const OrgDonationsPage({super.key, this.initialRequests = const []});

  @override
  State<OrgDonationsPage> createState() => _OrgDonationsPageState();
}

class _OrgDonationsPageState extends State<OrgDonationsPage> {
  late List<DonationRequestModel> _requests;
  bool _isLoading = false;
  int _tabIndex = 0;
  final _tabs = ['Mới', 'Chờ vận chuyển', 'Đã nhận', 'Tất cả'];

  @override
  void initState() {
    super.initState();
    _requests = widget.initialRequests;
    if (_requests.isEmpty) _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _isLoading = true);
    try {
      final list = await DonationRequestService.getMyOrganizationRequests();
      setState(() {
        _requests = list;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch donations error: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<DonationRequestModel> get _filtered {
    switch (_tabIndex) {
      case 0:
        return _requests.where((r) => r.status == 'PENDING').toList();
      case 1:
        return _requests
            .where((r) =>
        r.status == 'ACCEPTED' || r.status == 'SHIPPING' || r.status == 'SHIPPED')
            .toList();
      case 2:
        return _requests
            .where((r) => r.status == 'RECEIVED' || r.status == 'COMPLETED')
            .toList();
      default:
        return _requests;
    }
  }

  Future<void> _accept(DonationRequestModel r) async {
    try {
      await DonationRequestService.accept(r.id);
      _fetch();
    } catch (e) {
      _showSnack('Chấp nhận thất bại');
    }
  }

  Future<void> _reject(DonationRequestModel r) async {
    final reasonController = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Từ chối yêu cầu'),
        content: TextField(
            controller: reasonController,
            decoration: const InputDecoration(hintText: 'Lý do từ chối')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Huỷ')),
          TextButton(
              onPressed: () => Navigator.pop(context, true), child: const Text('Từ chối')),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await DonationRequestService.reject(r.id, reasonController.text.trim());
      _fetch();
    } catch (e) {
      _showSnack('Từ chối thất bại');
    }
  }

  void _showSnack(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text('Donations', style: AppTextStyles.headline3)),
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
                final selected = i == _tabIndex;
                final count =
                i == 0 ? _requests.where((r) => r.status == 'PENDING').length : null;
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
                        count != null ? '${_tabs[i]} ($count)' : _tabs[i],
                        style: AppTextStyles.label
                            .copyWith(color: selected ? Colors.white : AppColors.textSecondary),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _fetch,
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                  : _filtered.isEmpty
                  ? ListView(children: const [
                SizedBox(height: 120),
                Center(child: Text('Hết yêu cầu trong mục này')),
              ])
                  : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _filtered.length,
                itemBuilder: (context, i) => _buildCard(_filtered[i]),
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
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.primary.withOpacity(0.15),
                child: Text(r.username.isNotEmpty ? r.username[0].toUpperCase() : '?',
                    style: TextStyle(color: AppColors.primary)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(r.username,
                        style: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.w600)),
                    Text(r.timeAgoText,
                        style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(r.description.isNotEmpty ? r.description : '(Không có mô tả)',
              style: AppTextStyles.bodyMedium),
          if (r.images.isNotEmpty) ...[
            const SizedBox(height: 10),
            SizedBox(
              height: 90,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: r.images.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, i) => ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.network(r.images[i],
                      width: 90,
                      height: 90,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                          width: 90,
                          height: 90,
                          color: AppColors.background,
                          child: const Icon(Icons.image_outlined, color: AppColors.neutral))),
                ),
              ),
            ),
          ],
          const SizedBox(height: 12),
          if (r.status == 'PENDING')
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(onPressed: () => _reject(r), child: const Text('Từ chối')),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child:
                  ElevatedButton(onPressed: () => _accept(r), child: const Text('Chấp nhận')),
                ),
              ],
            )
          else if (r.status == 'SHIPPED')
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  final ok = await Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => ConfirmReceivedPage(request: r)),
                  );
                  if (ok == true) _fetch();
                },
                child: const Text('Xác nhận nhận hàng'),
              ),
            )
          else
            Align(
              alignment: Alignment.centerRight,
              child:
              Text(r.status, style: AppTextStyles.label.copyWith(color: AppColors.textSecondary)),
            ),
        ],
      ),
    );
  }
}