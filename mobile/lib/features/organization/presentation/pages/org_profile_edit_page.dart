import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../../../shared/widgets/app_text_field.dart';
import '../../data/organization_detail_model.dart';

class OrgProfileEditPage extends StatefulWidget {
  final OrganizationDetailModel org;
  const OrgProfileEditPage({super.key, required this.org});

  @override
  State<OrgProfileEditPage> createState() => _OrgProfileEditPageState();
}

class _OrgProfileEditPageState extends State<OrgProfileEditPage> {
  late TextEditingController _nameController;
  late TextEditingController _descController;
  late TextEditingController _addressController;
  late TextEditingController _websiteController;
  bool _isLoading = false;

  final List<String> _allAcceptedTypes = [
    'Quần áo', 'Giày dép', 'Đồ chơi trẻ em', 'Sách vở', 'Đồ gia dụng', 'Thực phẩm khô',
  ];
  late List<String> _selectedTypes;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.org.orgName);
    _descController = TextEditingController(text: widget.org.description);
    _addressController = TextEditingController(text: widget.org.address);
    _websiteController = TextEditingController(text: widget.org.websiteUrl ?? '');
    _selectedTypes = List.from(widget.org.acceptedTypes);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    _addressController.dispose();
    _websiteController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    setState(() => _isLoading = true);
    try {
      // OrganizationDetailReq — field khớp đúng với BE
      // (src/main/java/.../dto/request/organizationDetail/OrganizationDetailReq.java)
      await ApiClient.dio.put('/api/organization-details/${widget.org.id}', data: {
        'orgName': _nameController.text.trim(),
        'avtOrg': widget.org.avtOrg,
        'description': _descController.text.trim(),
        'address': _addressController.text.trim(),
        'websiteUrl': _websiteController.text.trim(),
        'latitude': widget.org.latitude,
        'longitude': widget.org.longitude,
        'acceptedTypes': _selectedTypes,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Cập nhật hồ sơ tổ chức thành công!'),
        backgroundColor: AppColors.primary,
      ));
      Navigator.pop(context, true);
    } on DioException catch (e) {
      debugPrint('🔴 Update org profile error: ${e.response?.data}');
      final msg = e.response?.data?['message'] ?? 'Cập nhật thất bại';
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(msg.toString()),
        backgroundColor: AppColors.error,
      ));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Chỉnh sửa hồ sơ tổ chức', style: AppTextStyles.headline3),
        actions: [
          TextButton(
            onPressed: _isLoading ? null : _handleSave,
            child: Text('Lưu',
                style: AppTextStyles.bodyLarge
                    .copyWith(color: AppColors.primary, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AppTextField(label: 'Tên tổ chức', controller: _nameController),
            const SizedBox(height: 16),
            AppTextField(label: 'Mô tả', controller: _descController),
            const SizedBox(height: 16),
            AppTextField(label: 'Địa chỉ', controller: _addressController),
            const SizedBox(height: 16),
            AppTextField(label: 'Website', controller: _websiteController),
            const SizedBox(height: 16),
            Text('Loại đồ nhận quyên góp', style: AppTextStyles.label),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _allAcceptedTypes.map((t) {
                final selected = _selectedTypes.contains(t);
                return GestureDetector(
                  onTap: () => setState(() {
                    selected ? _selectedTypes.remove(t) : _selectedTypes.add(t);
                  }),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: selected ? AppColors.primary : AppColors.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: selected ? AppColors.primary : AppColors.border),
                    ),
                    child: Text(t,
                        style: AppTextStyles.label
                            .copyWith(color: selected ? Colors.white : AppColors.textSecondary)),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 32),
            AppButton(label: 'Lưu thay đổi', isLoading: _isLoading, onPressed: _handleSave),
          ],
        ),
      ),
    );
  }
}