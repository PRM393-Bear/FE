import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../../../core/constants/listing_constants.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_text_field.dart';
import '../../data/listing_model.dart';
import '../widgets/step_indicator.dart';
import 'listing_preview_page.dart';

class ListingFormPage extends StatefulWidget {
  final List<String> imagePaths;
  final ListingModel? existingListing;
  final int? existingIndex;
  final String? existingProductId; // ← ID sản phẩm khi edit

  const ListingFormPage({
    super.key,
    required this.imagePaths,
    this.existingListing,
    this.existingIndex,
    this.existingProductId,
  });

  @override
  State<ListingFormPage> createState() => _ListingFormPageState();
}

class _ListingFormPageState extends State<ListingFormPage> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _titleController;
  late TextEditingController _brandController;
  late TextEditingController _priceController;
  late TextEditingController _descController;
  late TextEditingController _shippingFeeController;
  final _tagController = TextEditingController();

  late String _selectedCategory;
  late String _selectedCondition;
  late String _selectedSize;
  late String _selectedColor;
  late bool _shipNationwide;
  late bool _meetInPerson;
  late List<String> _tags;
  bool _isLoading = false;

  bool get _isEditMode => widget.existingListing != null;

  @override
  void initState() {
    super.initState();
    final l = widget.existingListing;
    if (l != null) {
      _titleController = TextEditingController(text: l.title);
      _brandController = TextEditingController(text: l.brand);
      _priceController =
          TextEditingController(text: l.price.toStringAsFixed(0));
      _descController = TextEditingController(text: l.description);
      _shippingFeeController = TextEditingController(
        text: l.shippingFee?.toStringAsFixed(0) ?? '',
      );
      _selectedCategory = l.category;
      _selectedCondition = l.condition;
      _selectedSize = l.size;
      _selectedColor = l.color;
      _shipNationwide = l.shipNationwide;
      _meetInPerson = l.meetInPerson;
      _tags = List.from(l.tags);
    } else {
      _titleController = TextEditingController();
      _brandController = TextEditingController();
      _priceController = TextEditingController();
      _descController = TextEditingController();
      _shippingFeeController = TextEditingController();
      _selectedCategory = '';
      _selectedCondition = '';
      _selectedSize = '';
      _selectedColor = '';
      _shipNationwide = true;
      _meetInPerson = false;
      _tags = [];
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _brandController.dispose();
    _priceController.dispose();
    _descController.dispose();
    _shippingFeeController.dispose();
    _tagController.dispose();
    super.dispose();
  }

  // Map condition string → số
  int _mapCondition(String condition) {
    if (condition.contains('95-99')) return 5;
    if (condition.contains('85-95')) return 4;
    if (condition.contains('70-85')) return 3;
    return 2;
  }

  void _addTag(String tag) {
    final cleaned = tag.trim();
    if (cleaned.isNotEmpty && !_tags.contains('#$cleaned')) {
      setState(() {
        _tags.add('#$cleaned');
        _tagController.clear();
      });
    }
  }

  void _removeTag(String tag) => setState(() => _tags.remove(tag));

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final listing = ListingModel(
      title: _titleController.text,
      category: _selectedCategory,
      brand: _brandController.text,
      color: _selectedColor,
      condition: _selectedCondition,
      tags: _tags,
      price: double.tryParse(_priceController.text) ?? 0,
      size: _selectedSize,
      description: _descController.text,
      shipNationwide: _shipNationwide,
      meetInPerson: _meetInPerson,
      shippingFee: double.tryParse(_shippingFeeController.text),
      imagePaths: widget.imagePaths,
    );

    if (_isEditMode && widget.existingProductId != null) {
      // ── Edit mode: gọi API PUT /api/products/{id} ──
      setState(() => _isLoading = true);
      try {
        await ApiClient.dio.put(
          '/api/products/${widget.existingProductId}',
          data: {
            'title': listing.title,
            'description': listing.description,
            'category': listing.category,
            'type': 'ITEM',
            'condition': _mapCondition(listing.condition),
            'price': listing.price.toInt(),
            'size': listing.size,
            'color': listing.color,
            'images': listing.imagePaths,
            'aiTags': listing.tags,
            'lifecycleGeneration': 1,
          },
        );

        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Cập nhật sản phẩm thành công!'),
          backgroundColor: AppColors.primary,
        ));
        Navigator.pop(context);
      } on DioException catch (e) {
        debugPrint('🔴 Update product error: ${e.response?.data}');
        final msg =
            e.response?.data?['message'] ?? 'Cập nhật thất bại';
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Lỗi: $msg'),
          backgroundColor: AppColors.error,
        ));
      } catch (e) {
        debugPrint('🔴 Unknown error: $e');
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Đã có lỗi xảy ra'),
          backgroundColor: AppColors.error,
        ));
      } finally {
        setState(() => _isLoading = false);
      }
    } else {
      // ── Create mode: qua preview ──
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => ListingPreviewPage(listing: listing),
        ),
      );
    }
  }

  Widget _buildSectionTitle(String title) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Text(title, style: AppTextStyles.headline3),
  );

  Widget _buildChipSelector({
    required List<String> items,
    required String selected,
    required Function(String) onSelect,
  }) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: items.map((item) {
        final isSelected = item == selected;
        return GestureDetector(
          onTap: () => onSelect(item),
          child: Container(
            padding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color:
              isSelected ? AppColors.primary : AppColors.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected
                    ? AppColors.primary
                    : AppColors.border,
              ),
            ),
            child: Text(
              item,
              style: AppTextStyles.label.copyWith(
                color: isSelected
                    ? Colors.white
                    : AppColors.textSecondary,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          _isEditMode ? 'Chỉnh sửa bài đăng' : 'Đăng bán',
          style: AppTextStyles.headline3,
        ),
        actions: _isEditMode
            ? [
          TextButton(
            onPressed: _isLoading ? null : _handleSubmit,
            child: Text(
              'Lưu',
              style: AppTextStyles.bodyLarge.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ]
            : null,
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (!_isEditMode) ...[
                const StepIndicator(currentStep: 2, totalSteps: 4),
                const SizedBox(height: 24),
              ],

              // Ảnh hiện tại (khi edit)
              if (_isEditMode && widget.imagePaths.isNotEmpty) ...[
                _buildSectionTitle('Ảnh sản phẩm'),
                SizedBox(
                  height: 90,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: widget.imagePaths.length,
                    itemBuilder: (context, index) => Container(
                      width: 80,
                      height: 80,
                      margin: const EdgeInsets.only(right: 8),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          widget.imagePaths[index],
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            color: AppColors.border,
                            child: const Icon(Icons.image_outlined),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
              ],

              AppTextField(
                label: 'Tên sản phẩm',
                hint: 'VD: Áo khoác denim Levi\'s cổ điển',
                controller: _titleController,
                validator: (v) => v == null || v.isEmpty
                    ? 'Vui lòng nhập tên sản phẩm'
                    : null,
              ),
              const SizedBox(height: 20),

              _buildSectionTitle('Danh mục'),
              _buildChipSelector(
                items: ListingConstants.categories,
                selected: _selectedCategory,
                onSelect: (v) => setState(() => _selectedCategory = v),
              ),
              const SizedBox(height: 20),

              AppTextField(
                label: 'Thương hiệu',
                hint: 'VD: Levi\'s, Zara, Uniqlo...',
                controller: _brandController,
              ),
              const SizedBox(height: 20),

              _buildSectionTitle('Màu sắc'),
              _buildChipSelector(
                items: ListingConstants.colors,
                selected: _selectedColor,
                onSelect: (v) => setState(() => _selectedColor = v),
              ),
              const SizedBox(height: 20),

              _buildSectionTitle('Tình trạng'),
              _buildChipSelector(
                items: ListingConstants.conditions,
                selected: _selectedCondition,
                onSelect: (v) => setState(() => _selectedCondition = v),
              ),
              const SizedBox(height: 20),

              _buildSectionTitle('Tags'),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  ..._tags.map((tag) => Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                          color:
                          AppColors.primary.withOpacity(0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(tag,
                            style: AppTextStyles.label.copyWith(
                                color: AppColors.primary)),
                        const SizedBox(width: 4),
                        GestureDetector(
                          onTap: () => _removeTag(tag),
                          child: const Icon(Icons.close_rounded,
                              size: 14, color: AppColors.primary),
                        ),
                      ],
                    ),
                  )),
                  SizedBox(
                    width: 120,
                    height: 36,
                    child: TextField(
                      controller: _tagController,
                      style: AppTextStyles.label,
                      decoration: InputDecoration(
                        hintText: '+ Thêm tag',
                        hintStyle: AppTextStyles.bodyMedium
                            .copyWith(color: AppColors.primary),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20),
                          borderSide: BorderSide(
                              color:
                              AppColors.primary.withOpacity(0.3)),
                        ),
                        contentPadding:
                        const EdgeInsets.symmetric(horizontal: 12),
                      ),
                      onSubmitted: _addTag,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              AppTextField(
                label: 'Giá bán (đ)',
                hint: '0',
                controller: _priceController,
                keyboardType: TextInputType.number,
                validator: (v) =>
                v == null || v.isEmpty ? 'Vui lòng nhập giá' : null,
              ),
              const SizedBox(height: 20),

              _buildSectionTitle('Kích cỡ'),
              _buildChipSelector(
                items: ListingConstants.sizes,
                selected: _selectedSize,
                onSelect: (v) => setState(() => _selectedSize = v),
              ),
              const SizedBox(height: 20),

              Text('Mô tả thêm', style: AppTextStyles.label),
              const SizedBox(height: 6),
              TextFormField(
                controller: _descController,
                maxLines: 4,
                style: AppTextStyles.bodyLarge,
                decoration: InputDecoration(
                  hintText:
                  'VD: Áo còn mới, không có vết ố hay rách...',
                  hintStyle: AppTextStyles.bodyMedium
                      .copyWith(color: AppColors.textHint),
                ),
              ),
              const SizedBox(height: 20),

              _buildSectionTitle('Phương thức giao hàng'),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    SwitchListTile(
                      value: _shipNationwide,
                      activeColor: AppColors.primary,
                      onChanged: (v) =>
                          setState(() => _shipNationwide = v),
                      title: Text('Ship toàn quốc',
                          style: AppTextStyles.bodyLarge),
                      subtitle: Text(
                        'Giao hàng qua các đối tác vận chuyển',
                        style: AppTextStyles.bodyMedium
                            .copyWith(fontSize: 12),
                      ),
                      secondary: const Icon(
                          Icons.local_shipping_outlined,
                          color: AppColors.primary),
                    ),
                    const Divider(height: 1),
                    SwitchListTile(
                      value: _meetInPerson,
                      activeColor: AppColors.primary,
                      onChanged: (v) =>
                          setState(() => _meetInPerson = v),
                      title: Text('Gặp trực tiếp',
                          style: AppTextStyles.bodyLarge),
                      subtitle: Text(
                        'Người mua có thể đến lấy tại địa chỉ của bạn',
                        style: AppTextStyles.bodyMedium
                            .copyWith(fontSize: 12),
                      ),
                      secondary: const Icon(Icons.location_on_outlined,
                          color: AppColors.primary),
                    ),
                  ],
                ),
              ),

              if (_shipNationwide) ...[
                const SizedBox(height: 16),
                AppTextField(
                  label: 'Phí ship dự kiến (tuỳ chọn)',
                  hint: 'Nhập phí ship nếu muốn cố định',
                  controller: _shippingFeeController,
                  keyboardType: TextInputType.number,
                ),
              ],

              const SizedBox(height: 28),

              AppButton(
                label: _isEditMode
                    ? 'Lưu thay đổi'
                    : 'Xem trước bài đăng →',
                isLoading: _isLoading,
                onPressed: _handleSubmit,
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}