import 'package:flutter/material.dart';
import '../../../../core/auth/auth_storage.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../data/community_post_model.dart';
import '../../data/community_post_service.dart';
import 'create_post_page.dart';
import 'post_comments_page.dart';
import '../../../donation/presentation/pages/donation_event_detail_page.dart';
import '../../../chat/presentation/pages/chat_detail_page.dart';

class CommunityPage extends StatefulWidget {
  const CommunityPage({super.key});

  @override
  State<CommunityPage> createState() => _CommunityPageState();
}

class _CommunityPageState extends State<CommunityPage> {
  List<CommunityPostModel> _posts = [];
  bool _isLoading = true;
  bool _isLoadingMore = false;
  bool _isLast = true;
  int _page = 0;
  String? _role;
  String? _myUserId;

  @override
  void initState() {
    super.initState();
    _loadUser();
    _fetch(reset: true);
  }

  Future<void> _loadUser() async {
    final role = await AuthStorage.getRole();
    final userId = await AuthStorage.getCurrentUserId();
    if (mounted) setState(() {
      _role = role;
      _myUserId = userId;
    });
  }

  Future<void> _fetch({bool reset = false}) async {
    if (reset) setState(() { _isLoading = true; _page = 0; });
    try {
      final result = await CommunityPostService.getAllPosts(page: _page, size: 10);
      final newPosts = result['posts'] as List<CommunityPostModel>;
      setState(() {
        _posts = reset ? newPosts : [..._posts, ...newPosts];
        _isLast = result['isLast'] as bool;
        _isLoading = false;
        _isLoadingMore = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch community posts error: $e');
      if (mounted) setState(() { _isLoading = false; _isLoadingMore = false; });
    }
  }

  Future<void> _loadMore() async {
    if (_isLast || _isLoadingMore) return;
    setState(() { _isLoadingMore = true; _page++; });
    await _fetch();
  }

  Future<void> _toggleLike(CommunityPostModel post) async {
    final index = _posts.indexWhere((p) => p.id == post.id);
    if (index == -1) return;
    setState(() {
      _posts[index] = post.copyWith(
        isLikedByMe: !post.isLikedByMe,
        likeCount: post.isLikedByMe ? post.likeCount - 1 : post.likeCount + 1,
      );
    });
    try {
      await CommunityPostService.toggleLike(post.id);
    } catch (e) {
      debugPrint('🔴 Toggle like error: $e');
      if (mounted) setState(() => _posts[index] = post);
    }
  }

  Future<void> _confirmDelete(CommunityPostModel post) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Xoá bài viết'),
        content: const Text('Bạn có chắc muốn xoá bài viết này?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Huỷ')),
          TextButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Xoá')),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await CommunityPostService.deletePost(post.id);
      _fetch(reset: true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Xoá thất bại, thử lại nhé')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final isOrg = _role == 'ORGANIZATION';
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Cộng đồng', style: AppTextStyles.headline3),
        actions: [
          if (isOrg)
            TextButton.icon(
              onPressed: () async {
                final created = await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CreatePostPage()),
                );
                if (created == true) _fetch(reset: true);
              },
              icon: const Icon(Icons.edit_outlined, color: AppColors.primary),
              label: Text('Đăng bài', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primary)),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () => _fetch(reset: true),
        child: _posts.isEmpty
            ? ListView(
          children: const [
            SizedBox(height: 120),
            Center(child: Text('Chưa có bài viết nào trong cộng đồng')),
          ],
        )
            : NotificationListener<ScrollNotification>(
          onNotification: (n) {
            if (n.metrics.pixels >= n.metrics.maxScrollExtent - 200) _loadMore();
            return false;
          },
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 12),
            itemCount: _posts.length + (_isLast ? 0 : 1),
            itemBuilder: (context, index) {
              if (index >= _posts.length) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
                );
              }
              return _buildPostCard(_posts[index]);
            },
          ),
        ),
      ),
    );
  }

  Widget _buildPostCard(CommunityPostModel post) {
    final isMine = post.authorId == _myUserId;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(12),
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
                radius: 20,
                backgroundColor: AppColors.primary.withOpacity(0.15),
                backgroundImage: post.authorAvatar != null ? NetworkImage(post.authorAvatar!) : null,
                child: post.authorAvatar == null
                    ? Text(post.authorName.isNotEmpty ? post.authorName[0].toUpperCase() : '?',
                    style: AppTextStyles.bodyLarge.copyWith(color: AppColors.primary))
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(post.authorName, style: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.w600)),
                    Text(post.timeAgoText, style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
                  ],
                ),
              ),
              if (!isMine)
                IconButton(
                  icon: const Icon(Icons.chat_bubble_outline_rounded, color: AppColors.primary, size: 20),
                  tooltip: 'Nhắn tin',
                  onPressed: () => Navigator.push(context, MaterialPageRoute(
                      builder: (_) => ChatDetailPage(otherUserId: post.authorId, otherUsername: post.authorName))),
                ),
              if (isMine)
                PopupMenuButton<String>(
                  onSelected: (v) { if (v == 'delete') _confirmDelete(post); },
                  itemBuilder: (_) => [const PopupMenuItem(value: 'delete', child: Text('Xoá bài viết'))],
                ),
            ],
          ),
          const SizedBox(height: 10),
          Text(post.content, style: AppTextStyles.bodyMedium),
          if (post.images.isNotEmpty) ...[
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: post.images.length == 1
                  ? Image.network(post.images.first, fit: BoxFit.cover, width: double.infinity, height: 220)
                  : SizedBox(
                height: 160,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: post.images.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (_, i) => ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(post.images[i], fit: BoxFit.cover, width: 160, height: 160),
                  ),
                ),
              ),
            ),
          ],
          if (post.donationEventId != null) ...[
            const SizedBox(height: 10),
            InkWell(
              onTap: () => Navigator.push(context, MaterialPageRoute(
                  builder: (_) => DonationEventDetailPage(eventId: post.donationEventId!))),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.volunteer_activism_outlined, size: 18, color: AppColors.primary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text('Xem chiến dịch: ${post.donationEventTitle ?? ""}',
                          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primary, fontWeight: FontWeight.w600)),
                    ),
                    const Icon(Icons.chevron_right_rounded, color: AppColors.primary),
                  ],
                ),
              ),
            ),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              InkWell(
                onTap: () => _toggleLike(post),
                child: Row(
                  children: [
                    Icon(post.isLikedByMe ? Icons.favorite : Icons.favorite_border,
                        size: 20, color: post.isLikedByMe ? AppColors.error : AppColors.textSecondary),
                    const SizedBox(width: 6),
                    Text('${post.likeCount}', style: AppTextStyles.bodySmall),
                  ],
                ),
              ),
              const SizedBox(width: 24),
              InkWell(
                onTap: () async {
                  await Navigator.push(context, MaterialPageRoute(builder: (_) => PostCommentsPage(postId: post.id)));
                  _fetch(reset: true);
                },
                child: Row(
                  children: [
                    const Icon(Icons.chat_bubble_outline_rounded, size: 20, color: AppColors.textSecondary),
                    const SizedBox(width: 6),
                    Text('${post.commentCount}', style: AppTextStyles.bodySmall),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}