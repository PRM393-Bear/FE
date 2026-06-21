import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../listing/data/listing_model.dart';
import '../../../listing/presentation/pages/listing_form_page.dart';
import '../../../listing/presentation/pages/upload_image_page.dart';
import '../../../product/data/product_model.dart';
import '../../../product/presentation/pages/product_detail_page.dart';

class MyListingsPage extends StatefulWidget {
  const MyListingsPage({super.key});

  @override
  State<MyListingsPage> createState() => _MyListingsPageState();
}

class _MyListingsPageState extends State<MyListingsPage> {
  String _selectedTab = 'Đang bán';
  final List<String> _tabs = ['Đang bán', 'Đã bán', 'Nháp', 'Ẩn'];

  List<ProductModel> _products = [];
  bool _isLoading = true;
  String? _userId;

  @override
  void initState() {
    super.initState();
    _fetchMyProducts();
  }

  Future<void> _fetchMyProducts() async {
    setState(() => _isLoading = true);
    try {
      const storage = FlutterSecureStorage();
      final token = await storage.read(key: 'auth_token');
      if (token == null) throw Exception('Chưa đăng nhập');

      final parts = token.split('.');
      String payload = parts[1];
      while (payload.length % 4 != 0) payload += '=';
      final decoded = utf8.decode(base64Url.decode(payload));
      final Map<String, dynamic> claims = jsonDecode(decoded);
      _userId = claims['userId']?.toString() ?? claims['sub']?.toString();
      if (_userId == null) throw Exception('Không lấy được userId');

      final res = await ApiClient.dio
          .get('/api/products/user/product?userId=$_userId');
      final list = (res.data as List<dynamic>)
          .map((e) => ProductModel.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() {
        _products = list;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch my products error: $e');
      setState(() => _isLoading = false);
    }
  }

  List<ProductModel> get _filteredProducts {
    switch (_selectedTab) {
      case 'Đang bán':
        return _products.where((p) => p.status == 'AVAILABLE').toList();
      case 'Đã bán':
        return _products
            .where((p) => p.status == 'SOLD' || p.status == 'DONATED')
            .toList();
      case 'Ẩn':
        return _products.where((p) => p.status == 'HIDDEN').toList();
      default:
        return _products;
    }
  }

  int get _availableCount =>
      _products.where((p) => p.status == 'AVAILABLE').length;
  int get _soldCount =>
      _products.where((p) => p.status == 'SOLD' || p.status == 'DONATED').length;
  int get _hiddenCount =>
      _products.where((p) => p.status == 'HIDDEN').length;

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
    );
  }

  Future<void> _hideProduct(String productId) async {
    try {
      await ApiClient.dio.put('/api/products/hide?productId=$productId');
      _fetchMyProducts();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Đã ẩn sản phẩm'),
          backgroundColor: AppColors.primary,
        ));
      }
    } catch (e) {
      debugPrint('🔴 Hide error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Không thể ẩn sản phẩm'),
          backgroundColor: AppColors.error,
        ));
      }
    }
  }

  // TODO: Khi BE có API update status → AVAILABLE thì gắn vào đây
  Future<void> _unhideProduct(String productId) async {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Tính năng hiện lại sản phẩm đang phát triển'),
        backgroundColor: AppColors.neutral,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        automaticallyImplyLeading: false,
        elevation: 0,
        title: Row(
          children: [
            const Icon(Icons.eco_rounded, color: AppColors.primary, size: 20),
            const SizedBox(width: 6),
            Text('Bài đăng của tôi', style: AppTextStyles.headline3),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
          child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _fetchMyProducts,
        child: Column(
          children: [
            // Stats row
            Container(
              margin: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  _buildStat('$_availableCount', 'Đang bán'),
                  _buildStatDivider(),
                  _buildStat('$_soldCount', 'Đã bán'),
                  _buildStatDivider(),
                  _buildStat('$_hiddenCount', 'Đã ẩn'),
                ],
              ),
            ),

            // Filter tabs
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _tabs.map((tab) {
                    final isSelected = tab == _selectedTab;
                    return GestureDetector(
                      onTap: () =>
                          setState(() => _selectedTab = tab),
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
                          tab,
                          style: AppTextStyles.label.copyWith(
                            color: isSelected
                                ? Colors.white
                                : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),

            const SizedBox(height: 12),

            // List
            Expanded(
              child: _filteredProducts.isEmpty
                  ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      _selectedTab == 'Ẩn'
                          ? Icons.visibility_off_outlined
                          : Icons.inbox_outlined,
                      size: 60,
                      color: AppColors.neutral,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _selectedTab == 'Ẩn'
                          ? 'Không có sản phẩm nào đang ẩn'
                          : 'Chưa có bài đăng nào',
                      style: AppTextStyles.bodyLarge,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _selectedTab == 'Đang bán'
                          ? 'Hãy đăng bán món đồ đầu tiên của bạn!'
                          : '',
                      style: AppTextStyles.bodyMedium,
                    ),
                  ],
                ),
              )
                  : ListView.builder(
                padding: const EdgeInsets.only(
                    left: 16, right: 16, bottom: 100),
                itemCount: _filteredProducts.length,
                itemBuilder: (context, index) {
                  final product = _filteredProducts[index];
                  return _buildProductCard(product);
                },
              ),
            ),
          ],
        ),
      ),

      // FAB
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const UploadImagePage()),
          );
          _fetchMyProducts();
        },
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: Text('Đăng bán mới',
            style: AppTextStyles.label.copyWith(color: Colors.white)),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _buildProductCard(ProductModel product) {
    final isHidden = product.status == 'HIDDEN';

    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
            builder: (_) => ProductDetailPage(product: product)),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isHidden
              ? AppColors.surface.withOpacity(0.7)
              : AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isHidden ? AppColors.neutral.withOpacity(0.3) : AppColors.border,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Ảnh — mờ nếu đang ẩn
            Opacity(
              opacity: isHidden ? 0.5 : 1.0,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: product.imageUrl.isNotEmpty
                    ? Image.network(
                  product.imageUrl,
                  width: 80,
                  height: 80,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => _imagePlaceholder(),
                )
                    : _imagePlaceholder(),
              ),
            ),
            const SizedBox(width: 12),

            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.title,
                    style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.w600,
                      color: isHidden ? AppColors.textSecondary : AppColors.textPrimary,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${_formatPrice(product.price)}đ',
                    style: AppTextStyles.bodyLarge.copyWith(
                      color: isHidden ? AppColors.neutral : AppColors.primary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: _statusColor(product.status).withOpacity(0.12),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          _statusText(product.status),
                          style: AppTextStyles.label.copyWith(
                            color: _statusColor(product.status),
                            fontSize: 11,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Cập nhật: Vừa xong',
                        style: AppTextStyles.bodyMedium.copyWith(fontSize: 11),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Action buttons — khác nhau tùy status
            Column(
              children: [
                if (!isHidden) ...[
                  // Nút Edit (chỉ hiện khi đang bán)
                  GestureDetector(
                    onTap: () async {
                      final listing = ListingModel(
                        title: product.title,
                        category: product.category,
                        brand: '',
                        color: product.color,
                        condition: _conditionText(product.condition),
                        tags: product.aiTags,
                        price: product.price,
                        size: product.size,
                        description: product.description,
                        shipNationwide: true,
                        meetInPerson: false,
                        imagePaths: product.images,
                      );
                      await Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => ListingFormPage(
                            imagePaths: product.images,
                            existingListing: listing,
                            existingProductId: product.id,
                          ),
                        ),
                      );
                      _fetchMyProducts();
                    },
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.edit_outlined,
                          color: AppColors.primary, size: 18),
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Nút Ẩn
                  GestureDetector(
                    onTap: () => showDialog(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Ẩn sản phẩm'),
                        content: const Text(
                            'Sản phẩm sẽ không hiển thị với người mua. Bạn có thể hiện lại sau.'),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(ctx),
                            child: const Text('Hủy'),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.pop(ctx);
                              _hideProduct(product.id);
                            },
                            child: const Text('Ẩn',
                                style: TextStyle(color: Colors.redAccent)),
                          ),
                        ],
                      ),
                    ),
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.orange.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.visibility_off_outlined,
                          color: Colors.orange, size: 18),
                    ),
                  ),
                ] else ...[
                  // Nút Hiện lại (chỉ hiện khi đang ẩn)
                  GestureDetector(
                    onTap: () => showDialog(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Hiện lại sản phẩm'),
                        content: const Text(
                            'Sản phẩm sẽ được hiển thị lại với người mua.'),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(ctx),
                            child: const Text('Hủy'),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.pop(ctx);
                              _unhideProduct(product.id);
                            },
                            child: Text('Hiện lại',
                                style: TextStyle(
                                    color: AppColors.primary)),
                          ),
                        ],
                      ),
                    ),
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.visibility_outlined,
                          color: AppColors.primary, size: 18),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _statusText(String status) {
    switch (status) {
      case 'AVAILABLE': return '● Đang bán';
      case 'SOLD': return '● Đã bán';
      case 'DONATED': return '● Đã tặng';
      case 'HIDDEN': return '● Đã ẩn';
      default: return status;
    }
  }

  String _conditionText(int condition) {
    switch (condition) {
      case 5: return 'Như mới (95-99%)';
      case 4: return 'Tốt (85-95%)';
      case 3: return 'Khá tốt (70-85%)';
      default: return 'Đã qua sử dụng';
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'AVAILABLE': return AppColors.primary;
      case 'SOLD': return AppColors.tertiary;
      case 'DONATED': return AppColors.secondary;
      case 'HIDDEN': return AppColors.neutral;
      default: return AppColors.neutral;
    }
  }

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

  Widget _imagePlaceholder() => Container(
    width: 80,
    height: 80,
    decoration: BoxDecoration(
      color: AppColors.background,
      borderRadius: BorderRadius.circular(8),
    ),
    child: const Icon(Icons.image_outlined,
        color: AppColors.neutral, size: 32),
  );
}