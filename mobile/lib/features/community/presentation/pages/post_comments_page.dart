import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../data/community_post_service.dart';
import '../../data/post_comment_model.dart';

class PostCommentsPage extends StatefulWidget {
  final String postId;
  const PostCommentsPage({super.key, required this.postId});

  @override
  State<PostCommentsPage> createState() => _PostCommentsPageState();
}

class _PostCommentsPageState extends State<PostCommentsPage> {
  List<PostCommentModel> _comments = [];
  bool _isLoading = true;
  bool _isSending = false;
  final _commentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _fetch() async {
    setState(() => _isLoading = true);
    try {
      final comments = await CommunityPostService.getComments(widget.postId, size: 50);
      setState(() { _comments = comments; _isLoading = false; });
    } catch (e) {
      debugPrint('🔴 Fetch comments error: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleSend() async {
    final text = _commentController.text.trim();
    if (text.isEmpty) return;
    setState(() => _isSending = true);
    try {
      await CommunityPostService.addComment(widget.postId, text);
      _commentController.clear();
      await _fetch();
    } catch (e) {
      debugPrint('🔴 Add comment error: $e');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Gửi bình luận thất bại, thử lại nhé')));
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text('Bình luận', style: AppTextStyles.headline3)),
      body: Column(
        children: [
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : _comments.isEmpty
                ? const Center(child: Text('Chưa có bình luận nào'))
                : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _comments.length,
              separatorBuilder: (_, __) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final c = _comments[index];
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: AppColors.primary.withOpacity(0.15),
                      backgroundImage: c.authorAvatar != null ? NetworkImage(c.authorAvatar!) : null,
                      child: c.authorAvatar == null
                          ? Text(c.authorName.isNotEmpty ? c.authorName[0].toUpperCase() : '?',
                          style: AppTextStyles.bodySmall.copyWith(color: AppColors.primary))
                          : null,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(12)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(c.authorName, style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                            const SizedBox(height: 4),
                            Text(c.content, style: AppTextStyles.bodyMedium),
                          ],
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _commentController,
                      decoration: const InputDecoration(
                        hintText: 'Viết bình luận...',
                        border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(24))),
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(onPressed: _isSending ? null : _handleSend, icon: const Icon(Icons.send_rounded, color: AppColors.primary)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}