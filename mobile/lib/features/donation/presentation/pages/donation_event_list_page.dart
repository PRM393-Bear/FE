import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geolocator_android/geolocator_android.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../data/donation_event_model.dart';
import '../../../organization/data/organization_detail_model.dart';
import '../../../organization/data/organization_service.dart';
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
  List<OrganizationDetailModel> _nearbyOrgs = [];
  Position? _myPosition;
  bool _isLoadingMap = false;
  String? _mapError;
  final MapController _mapController = MapController();
  String? _filterOrgId;

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
                _buildToggleChip('Map', _isMapView, () {
                  setState(() => _isMapView = true);
                  if (_nearbyOrgs.isEmpty && !_isLoadingMap) _loadMapData();
                }),
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
            ? _buildMap()
            : _buildList(),
      ),
    );
  }

  Future<void> _loadMapData() async {
    debugPrint('>>> [1] _loadMapData BẮT ĐẦU');
    setState(() { _isLoadingMap = true; _mapError = null; });
    try {
      debugPrint('>>> [2] check location service');
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      debugPrint('>>> [3] serviceEnabled = $serviceEnabled');
      if (!serviceEnabled) {
        setState(() { _mapError = 'Vui lòng bật định vị (GPS) để xem tổ chức gần đây'; _isLoadingMap = false; });
        return;
      }
      debugPrint('>>> [4] check permission');
      LocationPermission permission = await Geolocator.checkPermission();
      debugPrint('>>> [5] permission = $permission');
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        debugPrint('>>> [5b] permission sau khi xin = $permission');
      }
      if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
        setState(() { _mapError = 'Cần quyền truy cập vị trí để xem tổ chức gần đây'; _isLoadingMap = false; });
        return;
      }
      debugPrint('>>> [6] gọi getCurrentPosition');
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: AndroidSettings(
          accuracy: LocationAccuracy.medium,
          forceLocationManager: true, // MỚI: đọc trực tiếp GPS provider, tương thích adb emu geo fix
        ),
      ).timeout(
        const Duration(seconds: 15),
        onTimeout: () => throw Exception('Hết thời gian chờ định vị (15s)'),
      );
      debugPrint('>>> [7] CÓ vị trí: ${pos.latitude}, ${pos.longitude}');
      debugPrint('>>> [8] gọi API getNearby');
      final orgs = await OrganizationService.getNearby(
        latitude: pos.latitude, longitude: pos.longitude, radius: 50,
      ).timeout(
        const Duration(seconds: 20),
        onTimeout: () => throw Exception('Hết thời gian chờ server (20s)'),
      );
      debugPrint('>>> [9] CÓ ${orgs.length} tổ chức gần đây');
      setState(() { _myPosition = pos; _nearbyOrgs = orgs; _isLoadingMap = false; });
      debugPrint('>>> [10] XONG');
    } catch (e) {
      debugPrint('🔴 Load map error: $e');
      setState(() { _mapError = 'Không tải được dữ liệu bản đồ'; _isLoadingMap = false; });
    }
  }

  void _showOrgSheet(OrganizationDetailModel org) {
    double? distanceKm;
    if (_myPosition != null && org.latitude != null && org.longitude != null) {
      distanceKm = Geolocator.distanceBetween(_myPosition!.latitude,
              _myPosition!.longitude, org.latitude!, org.longitude!) /
          1000;
    }
    showModalBottomSheet(
      context: context,
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(org.orgName, style: AppTextStyles.headline3),
              const SizedBox(height: 4),
              Text(org.address, style: AppTextStyles.bodyMedium),
              if (distanceKm != null) ...[
                const SizedBox(height: 4),
                Text('Cách bạn ${distanceKm.toStringAsFixed(1)} km',
                    style: AppTextStyles.bodyMedium
                        .copyWith(color: AppColors.primary)),
              ],
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary),
                  onPressed: () {
                    Navigator.pop(context);
                    setState(() {
                      _filterOrgId = org.id;
                      _isMapView = false;
                    });
                  },
                  child: const Text('Xem chiến dịch của tổ chức này',
                      style: TextStyle(color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMap() {
    if (_isLoadingMap) {
      return const Center(
          child: CircularProgressIndicator(color: AppColors.primary));
    }
    if (_mapError != null) {
      return ListView(
        children: [
          SizedBox(height: MediaQuery.of(context).size.height * 0.3),
          const Icon(Icons.location_off_outlined,
              size: 60, color: AppColors.neutral),
          const SizedBox(height: 12),
          Center(
              child: Text(_mapError!,
                  textAlign: TextAlign.center, style: AppTextStyles.bodyLarge)),
          const SizedBox(height: 16),
          Center(
              child:
                  TextButton(onPressed: _loadMapData, child: const Text('Thử lại'))),
        ],
      );
    }
    final myPos = _myPosition;
    if (myPos == null) return const SizedBox.shrink();

    final myLatLng = LatLng(myPos.latitude, myPos.longitude);

    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(initialCenter: myLatLng, initialZoom: 13),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.prm393bear.bear_market_mobile',
        ),
        MarkerLayer(
          markers: [
            Marker(
              point: myLatLng,
              width: 36,
              height: 36,
              child: const Icon(Icons.my_location, color: Colors.blue, size: 30),
            ),
            ..._nearbyOrgs
                .where((o) => o.latitude != null && o.longitude != null)
                .map(
                  (o) => Marker(
                    point: LatLng(o.latitude!, o.longitude!),
                    width: 40,
                    height: 40,
                    child: GestureDetector(
                      onTap: () => _showOrgSheet(o),
                      child: const Icon(Icons.location_on,
                          color: AppColors.error, size: 36),
                    ),
                  ),
                ),
          ],
        ),
      ],
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



  Widget _buildList() {
    final displayEvents = _filterOrgId == null
        ? _events
        : _events.where((e) => e.organizationDetailId == _filterOrgId).toList();
    if (displayEvents.isEmpty) {
      return ListView(
        children: [
          SizedBox(height: MediaQuery.of(context).size.height * 0.3),
          const Icon(Icons.volunteer_activism_outlined,
              size: 60, color: AppColors.neutral),
          const SizedBox(height: 12),
          Center(
              child: Text('Chưa có sự kiện quyên góp nào',
                  style: AppTextStyles.bodyLarge)),
        ],
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: displayEvents.length,
      itemBuilder: (context, index) => _buildEventCard(displayEvents[index]),
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
                if (event.bannerUrl != null && event.bannerUrl!.startsWith('http'))
                  Image.network(
                    event.bannerUrl!,
                    height: 160,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      height: 160,
                      color: AppColors.background,
                      child: const Icon(Icons.image_outlined, size: 40, color: AppColors.neutral),
                    ),
                  )
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