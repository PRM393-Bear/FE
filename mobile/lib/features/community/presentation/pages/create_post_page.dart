import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../shared/widgets/app_button.dart';
import '../../data/community_post_service.dart';
import '../../../organization/data/organization_service.dart';
import '../../../donation/data/donation_event_model.dart';
import '../../../../core/auth/auth_storage.dart';
import '../../../../core/network/api_client.dart';

class CreatePostPage extends StatefulWidget {
  const CreatePostPage({super.key});

  @override
  State<CreatePostPage> createState() => _CreatePostPageState();
}

class _CreatePostPageState extends State<CreatePostPage> {
  final _contentController = TextEditingController();
  final List<File> _selectedImages = [];
  bool _isSubmitting = false;
  final int _maxImages = 5;
  List<DonationEventModel> _myCampaigns = [];
  String? _selectedEventId;

  @override
  void initState() {
    super.initState();
    _fetchMyCampaigns();
  }

  Future<void> _fetchMyCampaigns() async {
    try {
      final myOrg = await OrganizationService.getMine();
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
      debugPrint('🔴 Fetch my campaigns for post error: $e');
    }
  }

  @override
  void dispose() {
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    if (_selectedImages.length >= _maxImages) return;
    final picker = ImagePicker();
    final img = await picker.pickImage(source: source, imageQuality: 85);
    if (img == null) return;
    setState(() => _selectedImages.add(File(img.path)));
  }

  void _showPickerSheet() {
    showModalBottomSheet(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt_outlined, color: AppColors.primary),
              title: const Text('Chụp ảnh'),
              onTap: () { Navigator.pop(context); _pickImage(ImageSource.camera); },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined, color: AppColors.primary),
              title: const Text('Chọn từ thư viện'),
              onTap: () { Navigator.pop(context); _pickImage(ImageSource.gallery); },
            ),
          ],
        ),
      ),
    );
  }

  void _removeImage(int index) => setState(() => _selectedImages.removeAt(index));

  Future<void> _handleSubmit() async {
    if (_contentController.text.trim().isEmpty) {
      _showSnack('Vui lòng nhập nội dung bài viết', isError: true);
      return;
    }
    setState(() => _isSubmitting = true);
    try {
      final imageUrls = <String>[];
      for (final file in _selectedImages) {
        final url = await CommunityPostService.uploadImage(file);
        if (url != null) imageUrls.add(url);
      }
      await CommunityPostService.createPost(
        content: _contentController.text.trim(),
        images: imageUrls,
        donationEventId: _selectedEventId,
      );
      if (!mounted) return;
      _showSnack('Đăng bài thành công!');
      Navigator.pop(context, true);
    } catch (e) {
      debugPrint('🔴 Create post error: $e');
      _showSnack('Đăng bài thất bại, thử lại nhé', isError: true);
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? AppColors.error : AppColors.primary,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.pop(context)),
        title: Text('Đăng bài cộng đồng', style: AppTextStyles.headline3),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: _contentController,
              maxLines: 6,
              decoration: const InputDecoration(hintText: 'Chia sẻ điều gì đó với cộng đồng...', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            if (_myCampaigns.isNotEmpty) ...[
              Text('Gắn với chiến dịch (không bắt buộc)', style: AppTextStyles.label),
              const SizedBox(height: 8),
              DropdownButtonFormField<String?>(
                value: _selectedEventId,
                decoration: const InputDecoration(border: OutlineInputBorder()),
                items: [
                  const DropdownMenuItem(value: null, child: Text('Không gắn chiến dịch')),
                  ..._myCampaigns.map((e) => DropdownMenuItem(value: e.id, child: Text(e.title))),
                ],
                onChanged: (v) => setState(() => _selectedEventId = v),
              ),
              const SizedBox(height: 16),
            ],
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ..._selectedImages.asMap().entries.map((entry) {
                  final i = entry.key;
                  final file = entry.value;
                  return Stack(
                    children: [
                      ClipRRect(borderRadius: BorderRadius.circular(12), child: Image.file(file, width: 90, height: 90, fit: BoxFit.cover)),
                      Positioned(
                        top: 2, right: 2,
                        child: GestureDetector(
                          onTap: () => _removeImage(i),
                          child: const CircleAvatar(radius: 10, backgroundColor: Colors.black54, child: Icon(Icons.close, size: 14, color: Colors.white)),
                        ),
                      ),
                    ],
                  );
                }),
                if (_selectedImages.length < _maxImages)
                  GestureDetector(
                    onTap: _showPickerSheet,
                    child: Container(
                      width: 90, height: 90,
                      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
                      child: const Icon(Icons.add_photo_alternate_outlined, color: AppColors.primary),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 32),
            AppButton(label: 'Đăng bài', isLoading: _isSubmitting, onPressed: _handleSubmit),
          ],
        ),
      ),
    );
  }
}