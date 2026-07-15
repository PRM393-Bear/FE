import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../organization/data/organization_service.dart';
import '../../data/donation_event_model.dart';
import 'donation_event_form_page.dart';
import '../../../../core/auth/auth_storage.dart';

class MyCampaignsPage extends StatefulWidget {
  const MyCampaignsPage({super.key});

  @override
  State<MyCampaignsPage> createState() => _MyCampaignsPageState();
}

class _MyCampaignsPageState extends State<MyCampaignsPage> {
  List<DonationEventModel> _myEvents = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _isLoading = true);
    try {
      final myOrg = await OrganizationService.getMine();
      final myIds = await AuthStorage.getMyCampaignIds();
      final res = await ApiClient.dio.get('/api/donation-events');
      final all = (res.data as List)
          .map((e) => DonationEventModel.fromJson(e as Map<String, dynamic>))
          .toList();

      setState(() {
        _myEvents = all.where((e) =>
            (myOrg != null && e.organizationDetailId == myOrg.id) ||   // ← ưu tiên, giờ đã đáng tin
            myIds.contains(e.id) ||                                     // fallback: id lưu cục bộ lúc tạo
            (myOrg != null && e.orgName == myOrg.orgName)                // fallback: so tên (phòng hờ)
        ).toList();
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch my campaigns error: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Chiến dịch của tôi', style: AppTextStyles.headline3),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: AppColors.primary),
            onPressed: () async {
              final created = await Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const DonationEventFormPage()),
              );
              if (created == true) _fetch();
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetch,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : _myEvents.isEmpty
            ? ListView(children: const [
          SizedBox(height: 120),
          Center(child: Text('Chưa có chiến dịch nào')),
        ])
            : ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: _myEvents.length,
          itemBuilder: (context, i) {
            final e = _myEvents[i];
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                title: Text(e.title, style: AppTextStyles.bodyLarge),
                subtitle: Text(
                    '${e.currentQuantity}/${e.targetQuantity} • ${e.status}'),
                trailing: const Icon(Icons.edit_outlined),
                onTap: () async {
                  final updated = await Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => DonationEventFormPage(existingEvent: e)),
                  );
                  if (updated == true) _fetch();
                },
              ),
            );
          },
        ),
      ),
    );
  }
}