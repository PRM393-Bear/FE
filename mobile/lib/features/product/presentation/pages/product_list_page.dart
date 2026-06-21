import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../data/product_model.dart';
import '../../widgets/product_card.dart';
import '../../../../routes/route_names.dart';

class ProductListPage extends StatefulWidget {
  const ProductListPage({super.key});

  @override
  State<ProductListPage> createState() => _ProductListPageState();
}

class _ProductListPageState extends State<ProductListPage> {
  final List<String> _categories = [
    'Tất cả', 'Áo khoác', 'Áo thun', 'Quần jean', 'Váy', 'Giày', 'Túi xách', 'Phụ kiện'
  ];
  String _selectedCategory = 'Tất cả';

  List<ProductModel> _products = [];
  List<ProductModel> _filtered = [];
  bool _isLoading = true;
  String? _error;

  // Search
  final _searchController = TextEditingController();
  bool _isSearching = false;
  bool _isSearchLoading = false;
  DateTime? _lastSearchTime;

  // Filter
  String? _selectedSize;
  String? _selectedColor;
  String? _sortBy;

  final List<String> _sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  final List<String> _colors = ['Đen', 'Trắng', 'Xám', 'Xanh', 'Đỏ', 'Vàng', 'Hồng', 'Nâu'];
  final List<Map<String, String>> _sortOptions = [
    {'label': 'Mới nhất', 'value': 'newest'},
    {'label': 'Giá thấp → cao', 'value': 'priceAsc'},
    {'label': 'Giá cao → thấp', 'value': 'priceDesc'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchProducts();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchProducts() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final res = await ApiClient.dio.get('/api/products');
      final list = (res.data as List<dynamic>)
          .map((e) => ProductModel.fromJson(e as Map<String, dynamic>))
          .where((p) => p.status == 'AVAILABLE')
          .toList();
      setState(() {
        _products = list;
        _applyFilter();
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch products error: $e');
      setState(() {
        _error = 'Không thể tải sản phẩm, vui lòng thử lại';
        _isLoading = false;
      });
    }
  }

  Future<void> _searchProducts(String keyword) async {
    if (keyword.trim().isEmpty) {
      setState(() { _isSearching = false; });
      _applyFilter();
      return;
    }
    setState(() { _isSearchLoading = true; _isSearching = true; });
    try {
      final res = await ApiClient.dio.get('/api/products/search-by-keyword',
          queryParameters: {'keyword': keyword.trim()});
      final list = (res.data as List<dynamic>)
          .map((e) => ProductModel.fromJson(e as Map<String, dynamic>))
          .where((p) => p.status == 'AVAILABLE')
          .toList();
      setState(() {
        _filtered = list;
        _isSearchLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Search error: $e');
      setState(() => _isSearchLoading = false);
    }
  }

  Future<void> _applyApiFilter() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiClient.dio.get('/api/products/filter',
          queryParameters: {
            if (_selectedCategory != 'Tất cả') 'category': _selectedCategory,
            if (_selectedSize != null) 'size': _selectedSize,
            if (_selectedColor != null) 'color': _selectedColor,
            if (_sortBy != null) 'sortBy': _sortBy,
          });
      final list = (res.data as List<dynamic>)
          .map((e) => ProductModel.fromJson(e as Map<String, dynamic>))
          .where((p) => p.status == 'AVAILABLE')
          .toList();
      setState(() {
        _filtered = list;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Filter error: $e');
      setState(() => _isLoading = false);
    }
  }

  void _applyFilter() {
    if (_selectedCategory == 'Tất cả') {
      _filtered = List.from(_products);
    } else {
      _filtered = _products.where((p) => p.category == _selectedCategory).toList();
    }
  }

  void _showFilterSheet() {
    String? tempSize = _selectedSize;
    String? tempColor = _selectedColor;
    String? tempSort = _sortBy;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Bộ lọc', style: AppTextStyles.headline3),
                  TextButton(
                    onPressed: () {
                      setModalState(() {
                        tempSize = null;
                        tempColor = null;
                        tempSort = null;
                      });
                    },
                    child: Text('Xóa hết',
                        style: AppTextStyles.bodyMedium
                            .copyWith(color: AppColors.error)),
                  ),
                ],
              ),
              const Divider(),

              // Sắp xếp
              Text('Sắp xếp theo', style: AppTextStyles.headline3),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: _sortOptions.map((opt) {
                  final isSelected = tempSort == opt['value'];
                  return GestureDetector(
                    onTap: () => setModalState(
                            () => tempSort = isSelected ? null : opt['value']),
                    child: _filterChip(opt['label']!, isSelected),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),

              // Kích cỡ
              Text('Kích cỡ', style: AppTextStyles.headline3),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: _sizes.map((s) {
                  final isSelected = tempSize == s;
                  return GestureDetector(
                    onTap: () => setModalState(
                            () => tempSize = isSelected ? null : s),
                    child: _filterChip(s, isSelected),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),

              // Màu sắc
              Text('Màu sắc', style: AppTextStyles.headline3),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: _colors.map((c) {
                  final isSelected = tempColor == c;
                  return GestureDetector(
                    onTap: () => setModalState(
                            () => tempColor = isSelected ? null : c),
                    child: _filterChip(c, isSelected),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),

              // Apply button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _selectedSize = tempSize;
                      _selectedColor = tempColor;
                      _sortBy = tempSort;
                    });
                    Navigator.pop(ctx);
                    _applyApiFilter();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    minimumSize: const Size(double.infinity, 48),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Áp dụng',
                      style: TextStyle(color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _filterChip(String label, bool isSelected) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: isSelected ? AppColors.primary : AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isSelected ? AppColors.primary : AppColors.border,
        ),
      ),
      child: Text(label,
          style: AppTextStyles.label.copyWith(
            color: isSelected ? Colors.white : AppColors.textSecondary,
          )),
    );
  }

  bool get _hasActiveFilter =>
      _selectedSize != null || _selectedColor != null || _sortBy != null;

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          title: Row(
            children: [
              const Icon(Icons.eco_rounded, color: AppColors.primary, size: 20),
              const SizedBox(width: 6),
              Text('Lifecycle',
                  style: AppTextStyles.headline3
                      .copyWith(color: AppColors.primary)),
            ],
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.search_rounded),
              onPressed: () => setState(() => _isSearching = !_isSearching),
            ),
            Stack(
              children: [
                IconButton(
                  icon: const Icon(Icons.tune_rounded),
                  onPressed: _showFilterSheet,
                ),
                if (_hasActiveFilter)
                  Positioned(
                    top: 8, right: 8,
                    child: Container(
                      width: 8, height: 8,
                      decoration: const BoxDecoration(
                        color: AppColors.error,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            ),
            IconButton(
              icon: const Icon(Icons.notifications_outlined),
              onPressed: () {},
            ),
          ],
        ),
        body: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: _fetchProducts,
          child: CustomScrollView(
            slivers: [
              // Search bar
              if (_isSearching)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                    child: TextField(
                      controller: _searchController,
                      autofocus: true,
                      style: AppTextStyles.bodyLarge,
                      decoration: InputDecoration(
                        hintText: 'Tìm kiếm sản phẩm...',
                        hintStyle: AppTextStyles.bodyMedium
                            .copyWith(color: AppColors.textHint),
                        prefixIcon: const Icon(Icons.search_rounded,
                            color: AppColors.neutral),
                        suffixIcon: _searchController.text.isNotEmpty
                            ? IconButton(
                          icon: const Icon(Icons.close_rounded),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _isSearching = false);
                            _applyFilter();
                          },
                        )
                            : null,
                        filled: true,
                        fillColor: AppColors.surface,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                      ),
                      onSubmitted: _searchProducts,
                      onChanged: (val) {
                        setState(() {});
                        if (val.isEmpty) {
                          setState(() => _isSearching = false);
                          _applyFilter();
                          return;
                        }
                        // Debounce 500ms - chờ user gõ xong mới search
                        _lastSearchTime = DateTime.now();
                        Future.delayed(const Duration(milliseconds: 500), () {
                          if (DateTime.now().difference(_lastSearchTime!) >=
                              const Duration(milliseconds: 500)) {
                            _searchProducts(val);
                          }
                        });
                      },
                    ),
                  ),
                ),

              // Location
              if (!_isSearching)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                    child: Row(
                      children: [
                        const Icon(Icons.location_on_outlined,
                            size: 16, color: AppColors.neutral),
                        const SizedBox(width: 4),
                        Text('TP. Hồ Chí Minh',
                            style: AppTextStyles.bodyMedium),
                        const Icon(Icons.keyboard_arrow_down_rounded,
                            size: 16, color: AppColors.neutral),
                      ],
                    ),
                  ),
                ),

              // Category tabs
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 48,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 8),
                    itemCount: _categories.length,
                    itemBuilder: (context, index) {
                      final cat = _categories[index];
                      final isSelected = cat == _selectedCategory;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedCategory = cat;
                            _isSearching = false;
                            _searchController.clear();
                          });
                          if (_hasActiveFilter) {
                            _applyApiFilter();
                          } else {
                            _applyFilter();
                          }
                        },
                        child: Container(
                          margin: const EdgeInsets.only(right: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 16),
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
                          child: Center(
                            child: Text(cat,
                                style: AppTextStyles.label.copyWith(
                                  color: isSelected
                                      ? Colors.white
                                      : AppColors.textSecondary,
                                )),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),

              // Active filter chips
              if (_hasActiveFilter)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
                    child: Wrap(
                      spacing: 8,
                      children: [
                        if (_selectedSize != null)
                          _activeFilterChip(
                              'Size: $_selectedSize',
                                  () => setState(() {
                                _selectedSize = null;
                                _applyApiFilter();
                              })),
                        if (_selectedColor != null)
                          _activeFilterChip(
                              'Màu: $_selectedColor',
                                  () => setState(() {
                                _selectedColor = null;
                                _applyApiFilter();
                              })),
                        if (_sortBy != null)
                          _activeFilterChip(
                              _sortOptions.firstWhere(
                                      (o) => o['value'] == _sortBy)['label']!,
                                  () => setState(() {
                                _sortBy = null;
                                _applyApiFilter();
                              })),
                      ],
                    ),
                  ),
                ),

              // Banner
              if (!_isSearching)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Container(
                      height: 120,
                      decoration: BoxDecoration(
                        color: AppColors.secondary,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Sự kiện quyên góp\ncuối tuần này tại Quận 1',
                                  style: AppTextStyles.bodyLarge.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 12, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text('Xem ngay',
                                      style: AppTextStyles.label.copyWith(
                                          color: AppColors.secondary)),
                                ),
                              ],
                            ),
                          ),
                          const Icon(Icons.volunteer_activism,
                              size: 60, color: Colors.white),
                        ],
                      ),
                    ),
                  ),
                ),

              // Section title
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _isSearching && _searchController.text.isNotEmpty
                            ? 'Kết quả tìm kiếm'
                            : _hasActiveFilter
                            ? 'Kết quả lọc'
                            : 'Mới đăng hôm nay',
                        style: AppTextStyles.headline3,
                      ),
                      Text('${_filtered.length} sản phẩm',
                          style: AppTextStyles.bodyMedium
                              .copyWith(color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ),

              // Loading / Error / Grid
              if (_isLoading || _isSearchLoading)
                const SliverFillRemaining(
                  child: Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                )
              else if (_error != null)
                SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline,
                            color: AppColors.neutral, size: 48),
                        const SizedBox(height: 12),
                        Text(_error!,
                            style: AppTextStyles.bodyMedium,
                            textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _fetchProducts,
                          style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary),
                          child: const Text('Thử lại',
                              style: TextStyle(color: Colors.white)),
                        ),
                      ],
                    ),
                  ),
                )
              else if (_filtered.isEmpty)
                  SliverFillRemaining(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.inventory_2_outlined,
                              color: AppColors.neutral, size: 48),
                          const SizedBox(height: 12),
                          Text(
                            _isSearching
                                ? 'Không tìm thấy sản phẩm nào'
                                : 'Chưa có sản phẩm nào',
                            style: AppTextStyles.bodyMedium,
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: SliverGrid(
                      gridDelegate:
                      const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 0.62,
                      ),
                      delegate: SliverChildBuilderDelegate(
                            (context, index) {
                          final product = _filtered[index];
                          return ProductCard(
                            product: product,
                            onTap: () => context.push(
                              RouteNames.productDetail,
                              extra: product,
                            ),
                          );
                        },
                        childCount: _filtered.length,
                      ),
                    ),
                  ),

              const SliverToBoxAdapter(child: SizedBox(height: 32)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _activeFilterChip(String label, VoidCallback onRemove) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label,
              style: AppTextStyles.label
                  .copyWith(color: AppColors.primary, fontSize: 12)),
          const SizedBox(width: 4),
          GestureDetector(
            onTap: onRemove,
            child: const Icon(Icons.close_rounded,
                size: 14, color: AppColors.primary),
          ),
        ],
      ),
    );
  }
}