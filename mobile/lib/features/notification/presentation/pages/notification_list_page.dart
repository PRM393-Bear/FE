import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../data/notification_model.dart';

class NotificationListPage extends StatefulWidget {
  const NotificationListPage({super.key});

  @override
  State<NotificationListPage> createState() => _NotificationListPageState();
}

class _NotificationListPageState extends State<NotificationListPage> {
  List<NotificationModel> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
  }

  Future<String?> _getCurrentUserId() async {
    const storage = FlutterSecureStorage();
    final token = await storage.read(key: 'auth_token');
    if (token == null) return null;
    final parts = token.split('.');
    String payload = parts[1];
    while (payload.length % 4 != 0) payload += '=';
    final decoded = utf8.decode(base64Url.decode(payload));
    final claims = jsonDecode(decoded) as Map<String, dynamic>;
    return claims['userId']?.toString() ?? claims['sub']?.toString();
  }

  Future<void> _fetchNotifications() async {
    setState(() => _isLoading = true);
    try {
      final userId = await _getCurrentUserId();
      if (userId == null) throw Exception('Chưa đăng nhập');

      final res = await ApiClient.dio.get('/api/notifications/user/$userId');
      final list = (res.data as List<dynamic>)
          .map((e) => NotificationModel.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() {
        _notifications = list;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('🔴 Fetch notifications error: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _markAsRead(NotificationModel n) async {
    if (n.isRead) return;
    try {
      await ApiClient.dio.put('/api/notifications/${n.id}/read');
      _fetchNotifications();
    } catch (e) {
      debugPrint('🔴 Mark as read error: $e');
    }
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'chat':
        return Icons.chat_bubble_outline_rounded;
      case 'order':
        return Icons.shopping_bag_outlined;
      case 'donation':
        return Icons.volunteer_activism_outlined;
      default:
        return Icons.notifications_outlined;
    }
  }

  String _formatTime(String createdAt) {
    try {
      final dt = DateTime.parse(createdAt);
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inMinutes < 1) return 'Vừa xong';
      if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
      if (diff.inHours < 24) return '${diff.inHours} giờ trước';
      return '${diff.inDays} ngày trước';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Thông báo', style: AppTextStyles.headline3),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _fetchNotifications,
        child: _notifications.isEmpty
            ? ListView(
          children: [
            SizedBox(height: MediaQuery.of(context).size.height * 0.3),
            const Icon(Icons.notifications_none_rounded,
                size: 60, color: AppColors.neutral),
            const SizedBox(height: 12),
            Center(
              child: Text('Chưa có thông báo nào',
                  style: AppTextStyles.bodyLarge),
            ),
          ],
        )
            : ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: _notifications.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, index) {
            final n = _notifications[index];
            return GestureDetector(
              onTap: () => _markAsRead(n),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: n.isRead
                      ? AppColors.surface
                      : AppColors.primary.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(_iconForType(n.type),
                          color: AppColors.primary, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(n.title,
                              style: AppTextStyles.bodyLarge.copyWith(
                                  fontWeight: n.isRead
                                      ? FontWeight.normal
                                      : FontWeight.w700)),
                          const SizedBox(height: 4),
                          Text(n.message, style: AppTextStyles.bodyMedium),
                          const SizedBox(height: 4),
                          Text(_formatTime(n.createdAt),
                              style: AppTextStyles.bodySmall
                                  .copyWith(color: AppColors.textSecondary)),
                        ],
                      ),
                    ),
                    if (!n.isRead)
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: AppColors.error,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}