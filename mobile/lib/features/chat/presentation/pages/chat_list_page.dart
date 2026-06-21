import 'package:flutter/material.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../data/chat_model.dart';
import 'chat_detail_page.dart';
import 'ai_chat_page.dart';

class ChatListPage extends StatefulWidget {
  const ChatListPage({super.key});

  @override
  State<ChatListPage> createState() => _ChatListPageState();
}

class _ChatListPageState extends State<ChatListPage> {
  List<ChatRoomModel> _rooms = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchRooms();
  }

  Future<void> _fetchRooms() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiClient.dio.get('/api/chat/rooms');
      final list = (res.data as List)
          .map((e) => ChatRoomModel.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() {
        _rooms = list;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch rooms error: $e');
      setState(() => _isLoading = false);
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
        title: Text('Tin nhắn', style: AppTextStyles.headline3),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
          child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _fetchRooms,
        child: _rooms.isEmpty
            ? Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.chat_bubble_outline_rounded,
                  size: 60, color: AppColors.neutral),
              const SizedBox(height: 12),
              Text('Chưa có tin nhắn nào',
                  style: AppTextStyles.bodyLarge),
              const SizedBox(height: 4),
              Text('Hãy bắt đầu trò chuyện!',
                  style: AppTextStyles.bodyMedium),
            ],
          ),
        )
            : ListView.separated(
          itemCount: _rooms.length,
          separatorBuilder: (_, __) => const Divider(
              height: 1, indent: 72, endIndent: 16),
          itemBuilder: (context, index) {
            final room = _rooms[index];
            return ListTile(
              contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 8),
              leading: CircleAvatar(
                radius: 24,
                backgroundColor:
                AppColors.primary.withOpacity(0.2),
                child: Text(
                  room.otherUsername.isNotEmpty
                      ? room.otherUsername[0].toUpperCase()
                      : '?',
                  style: AppTextStyles.bodyLarge.copyWith(
                      color: AppColors.primary),
                ),
              ),
              title: Text(room.otherUsername,
                  style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.w600)),
              subtitle: Text(
                room.lastMessage ?? 'Bắt đầu trò chuyện',
                style: AppTextStyles.bodyMedium,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              trailing: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (room.unreadCount > 0)
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        '${room.unreadCount}',
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold),
                      ),
                    ),
                ],
              ),
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => ChatDetailPage(
                    otherUserId: room.otherUserId,
                    otherUsername: room.otherUsername,
                  ),
                ),
              ),
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const AiChatPage()),
        ),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.auto_awesome, color: Colors.white),
        label: Text('AI Assistant',
            style: AppTextStyles.label.copyWith(color: Colors.white)),
      ),
    );
  }
}