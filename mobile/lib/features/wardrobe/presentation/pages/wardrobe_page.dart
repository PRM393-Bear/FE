// mobile/lib/features/wardrobe/presentation/pages/wardrobe_page.dart
import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../data/wardrobe_model.dart';

class WardrobePage extends StatefulWidget {
  const WardrobePage({super.key});

  @override
  State<WardrobePage> createState() => _WardrobePageState();
}

class _WardrobePageState extends State<WardrobePage> {
  List<WardrobeModel> _items = [];
  List<WardrobeModel> _filtered = [];
  bool _isLoading = true;
  String _selectedCategory = 'Tất cả';

  final List<String> _categories = [
    'Tất cả', 'Áo', 'Quần', 'Đầm', 'Giày', 'Túi', 'Phụ kiện'
  ];

  @override
  void initState() {
    super.initState();
    _fetchWardrobe();
  }

  Future<void> _fetchWardrobe() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiClient.dio.get('/api/wardrobe-items/my-wardrobe');
      final list = (res.data as List)
          .map((e) => WardrobeModel.fromJson(e))
          .toList();
      setState(() {
        _items = list;
        _applyFilter();
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch wardrobe error: $e');
      setState(() => _isLoading = false);
    }
  }

  void _applyFilter() {
    if (_selectedCategory == 'Tất cả') {
      _filtered = List.from(_items);
    } else {
      _filtered = _items
          .where((item) =>
      item.category?.toLowerCase().contains(
        _selectedCategory.toLowerCase(),
      ) ??
          false)
          .toList();
    }
  }

  int get _availableCount =>
      _items.where((i) => i.status == 'AVAILABLE').length;
  int get _soldCount => _items.where((i) => i.status == 'SOLD').length;
  int get _donatedCount => _items.where((i) => i.status == 'DONATED').length;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Tủ đồ của tôi 👗', style: AppTextStyles.headline3),
      ),
      body: _isLoading
          ? const Center(
          child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _fetchWardrobe,
        child: CustomScrollView(
          slivers: [
            // Stats
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      _buildStat('$_availableCount', 'Đang có'),
                      _buildStatDivider(),
                      _buildStat('$_soldCount', 'Đã bán'),
                      _buildStatDivider(),
                      _buildStat('$_donatedCount', 'Đã tặng'),
                    ],
                  ),
                ),
              ),
            ),

            // Banner
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: AppColors.primary.withOpacity(0.2)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Làm mới phong cách mỗi ngày',
                              style: AppTextStyles.bodyLarge.copyWith(
                                fontWeight: FontWeight.w600,
                                color: AppColors.primary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Mỗi món đồ đều xứng đáng có một vòng đời mới.',
                              style: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text('👗👖👟', style: TextStyle(fontSize: 28)),
                    ],
                  ),
                ),
              ),
            ),

            // Category filter
            SliverToBoxAdapter(
              child: SizedBox(
                height: 40,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _categories.length,
                  itemBuilder: (context, index) {
                    final cat = _categories[index];
                    final isSelected = cat == _selectedCategory;
                    return GestureDetector(
                      onTap: () => setState(() {
                        _selectedCategory = cat;
                        _applyFilter();
                      }),
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.primary
                              : AppColors.surface,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.border,
                          ),
                        ),
                        child: Text(
                          cat,
                          style: AppTextStyles.label.copyWith(
                            color: isSelected
                                ? Colors.white
                                : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 16)),

            // Grid items
            _filtered.isEmpty
                ? SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.checkroom_outlined,
                        size: 60, color: AppColors.neutral),
                    const SizedBox(height: 12),
                    Text('Tủ đồ trống!',
                        style: AppTextStyles.bodyLarge),
                    const SizedBox(height: 4),
                    Text('Hãy mua sắm để thêm vào tủ đồ nhé!',
                        style: AppTextStyles.bodyMedium),
                  ],
                ),
              ),
            )
                : SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverGrid(
                gridDelegate:
                const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.75,
                ),
                delegate: SliverChildBuilderDelegate(
                      (context, index) =>
                      _buildWardrobeCard(_filtered[index]),
                  childCount: _filtered.length,
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 32)),
          ],
        ),
      ),
    );
  }

  Widget _buildWardrobeCard(WardrobeModel item) {
    final isSold = item.status == 'SOLD';
    final isDonated = item.status == 'DONATED';
    final isUnavailable = isSold || isDonated;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image + Badge
          Stack(
            children: [
              ClipRRect(
                borderRadius:
                const BorderRadius.vertical(top: Radius.circular(12)),
                child: item.imageUrl.isNotEmpty
                    ? Image.network(
                  item.imageUrl,
                  height: 140,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  color: isUnavailable
                      ? Colors.black.withOpacity(0.3)
                      : null,
                  colorBlendMode: isUnavailable
                      ? BlendMode.darken
                      : null,
                  errorBuilder: (_, __, ___) => _imagePlaceholder(),
                )
                    : _imagePlaceholder(),
              ),
              // Status badge
              Positioned(
                top: 8,
                left: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: isSold
                        ? AppColors.tertiary
                        : isDonated
                        ? AppColors.secondary
                        : AppColors.primary,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.circle,
                          size: 6, color: Colors.white),
                      const SizedBox(width: 4),
                      Text(
                        isSold
                            ? 'ĐÃ BÁN'
                            : isDonated
                            ? 'ĐÃ TẶNG'
                            : 'CỦA TÔI',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Info
          Padding(
            padding: const EdgeInsets.all(8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.title,
                  style: AppTextStyles.label,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  '${item.brand ?? 'Unknown'} • Size ${item.size ?? '--'}',
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _imagePlaceholder() => Container(
    height: 140,
    width: double.infinity,
    color: AppColors.background,
    child: const Icon(Icons.checkroom_outlined,
        color: AppColors.neutral, size: 40),
  );

  Widget _buildStat(String value, String label) {
    return Expanded(
      child: Column(
        children: [
          Text(value,
              style: AppTextStyles.headline2
                  .copyWith(color: AppColors.primary)),
          const SizedBox(height: 4),
          Text(label, style: AppTextStyles.bodyMedium),
        ],
      ),
    );
  }

  Widget _buildStatDivider() =>
      Container(width: 1, height: 40, color: AppColors.border);
}