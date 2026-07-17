import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../data/chat_model.dart';

class ChatDetailPage extends StatefulWidget {
  final String otherUserId;
  final String otherUsername;

  const ChatDetailPage({
    super.key,
    required this.otherUserId,
    required this.otherUsername,
  });

  @override
  State<ChatDetailPage> createState() => _ChatDetailPageState();
}

class _ChatDetailPageState extends State<ChatDetailPage> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  List<ChatMessageModel> _messages = [];
  bool _isLoading = true;
  bool _isUploadingImage = false;
  String _currentUserId = '';
  StompClient? _stompClient;
  bool _isConnected = false;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await _getCurrentUserId();
    await _fetchHistory();
    _connectWebSocket();
  }

  Future<void> _getCurrentUserId() async {
    const storage = FlutterSecureStorage();
    final token = await storage.read(key: 'auth_token');
    if (token == null) return;

    final parts = token.split('.');
    String payload = parts[1];
    while (payload.length % 4 != 0) payload += '=';
    final decoded = utf8.decode(base64Url.decode(payload));
    final claims = jsonDecode(decoded) as Map<String, dynamic>;
    _currentUserId = claims['userId']?.toString() ?? claims['sub']?.toString() ?? '';
  }

  Future<void> _fetchHistory() async {
    try {
      final res = await ApiClient.dio.get('/api/chat/history/${widget.otherUserId}');
      final list = (res.data as List)
          .map((e) => ChatMessageModel.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() {
        _messages = list;
        _isLoading = false;
      });
      _scrollToBottom();
    } catch (e) {
      debugPrint('🔴 Fetch history error: $e');
      setState(() => _isLoading = false);
    }
  }

  void _connectWebSocket() async {
    const storage = FlutterSecureStorage();
    final token = await storage.read(key: 'auth_token');
    if (token == null) return;

    _stompClient = StompClient(
      config: StompConfig(
        url: 'wss://prm393-backend.onrender.com/ws/websocket',
        webSocketConnectHeaders: {'Authorization': 'Bearer $token'},
        stompConnectHeaders: {'Authorization': 'Bearer $token'},
        onConnect: _onConnect,
        reconnectDelay: const Duration(seconds: 5),
        onDisconnect: (frame) {
          debugPrint('🔴 WebSocket disconnected');
          if (mounted) setState(() => _isConnected = false);
        },
        onWebSocketError: (e) {
          debugPrint('🔴 WebSocket error: $e');
          if (mounted) setState(() => _isConnected = false);
        },
        onStompError: (f) {
          debugPrint('🔴 STOMP error: ${f.body}');
          if (mounted) setState(() => _isConnected = false);
        },
      ),
    );
    _stompClient!.activate();
  }

  void _onConnect(StompFrame frame) {
    debugPrint('✅ WebSocket connected');
    if (mounted) setState(() => _isConnected = true);
    _stompClient!.subscribe(
      destination: '/user/queue/messages',
      callback: (frame) {
        if (frame.body == null) return;
        final msg = ChatMessageModel.fromJson(jsonDecode(frame.body!) as Map<String, dynamic>);
        // Tránh hiện trùng tin nhắn mình vừa tự gửi (optimistic) khi server vọng lại —
        // so cả content LẪN imageUrl vì tin ảnh có content null giống nhau hết.
        final isEchoOfMine = msg.senderId == _currentUserId &&
            _messages.any((m) =>
                m.id.startsWith('local-') &&
                m.content == msg.content &&
                m.imageUrl == msg.imageUrl);
        if (isEchoOfMine) return;
        setState(() => _messages.add(msg));
        _scrollToBottom();
      },
    );
  }

  void _sendMessage() {
    final content = _messageController.text.trim();
    if (content.isEmpty) return;

    if (_stompClient == null || !_isConnected) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Chưa kết nối được tới máy chủ chat, vui lòng thử lại sau vài giây.'),
        backgroundColor: AppColors.error,
      ));
      return;
    }

    final optimisticMsg = ChatMessageModel(
      id: 'local-${DateTime.now().millisecondsSinceEpoch}',
      roomId: '',
      senderId: _currentUserId,
      content: content,
      createdAt: DateTime.now().toIso8601String(),
      status: 'SENT',
    );
    setState(() => _messages.add(optimisticMsg));
    _scrollToBottom();
    _messageController.clear();

    try {
      _stompClient!.send(
        destination: '/app/chat.send',
        body: jsonEncode({
          'receiverId': widget.otherUserId,
          'content': content,
          'imageUrl': null,
        }),
      );
    } catch (e) {
      debugPrint('🔴 Send message error: $e');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Gửi tin nhắn thất bại, vui lòng thử lại.'),
        backgroundColor: AppColors.error,
      ));
    }
  }

  // MỚI — chụp/chọn ảnh, upload lên Cloudinary (tái dùng /api/upload/image),
  // rồi gửi tin nhắn chỉ có imageUrl (không có content) qua đúng kênh chat.send cũ.
  Future<void> _pickAndSendImage(ImageSource source) async {
    final picker = ImagePicker();
    final img = await picker.pickImage(source: source, imageQuality: 85);
    if (img == null) return;

    if (_stompClient == null || !_isConnected) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Chưa kết nối được tới máy chủ chat, vui lòng thử lại sau vài giây.'),
        backgroundColor: AppColors.error,
      ));
      return;
    }

    setState(() => _isUploadingImage = true);
    try {
      final formData = FormData.fromMap({'file': await MultipartFile.fromFile(img.path)});
      final uploadRes = await ApiClient.dio.post('/api/upload/image',
          data: formData, options: Options(contentType: 'multipart/form-data'));
      final url = uploadRes.data['url'] as String?;
      if (url == null) throw Exception('Upload không trả về url');

      final optimisticMsg = ChatMessageModel(
        id: 'local-${DateTime.now().millisecondsSinceEpoch}',
        roomId: '',
        senderId: _currentUserId,
        content: null,
        imageUrl: url,
        createdAt: DateTime.now().toIso8601String(),
        status: 'SENT',
      );
      setState(() => _messages.add(optimisticMsg));
      _scrollToBottom();

      _stompClient!.send(
        destination: '/app/chat.send',
        body: jsonEncode({
          'receiverId': widget.otherUserId,
          'content': null,
          'imageUrl': url,
        }),
      );
    } catch (e) {
      debugPrint('🔴 Send image error: $e');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Gửi ảnh thất bại, vui lòng thử lại.'),
        backgroundColor: AppColors.error,
      ));
    } finally {
      if (mounted) setState(() => _isUploadingImage = false);
    }
  }

  void _showImagePickerSheet() {
    showModalBottomSheet(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt_outlined, color: AppColors.primary),
              title: const Text('Chụp ảnh'),
              onTap: () { Navigator.pop(context); _pickAndSendImage(ImageSource.camera); },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined, color: AppColors.primary),
              title: const Text('Chọn từ thư viện'),
              onTap: () { Navigator.pop(context); _pickAndSendImage(ImageSource.gallery); },
            ),
          ],
        ),
      ),
    );
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _stompClient?.deactivate();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  String _formatTime(String createdAt) {
    try {
      final dt = DateTime.parse(createdAt);
      return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: AppColors.primary.withOpacity(0.2),
              child: Text(
                widget.otherUsername.isNotEmpty ? widget.otherUsername[0].toUpperCase() : '?',
                style: AppTextStyles.label.copyWith(color: AppColors.primary),
              ),
            ),
            const SizedBox(width: 8),
            Text(widget.otherUsername, style: AppTextStyles.headline3),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : _messages.isEmpty
                    ? Center(child: Text('Bắt đầu trò chuyện!', style: AppTextStyles.bodyMedium))
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: _messages.length,
                        itemBuilder: (context, index) {
                          final msg = _messages[index];
                          final isMe = msg.senderId == _currentUserId;
                          return _buildMessageBubble(msg, isMe);
                        },
                      ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            decoration: BoxDecoration(
              color: AppColors.surface,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: Row(
              children: [
                GestureDetector(
                  onTap: _isUploadingImage ? null : _showImagePickerSheet,
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.border),
                    ),
                    child: _isUploadingImage
                        ? const Padding(
                            padding: EdgeInsets.all(12),
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                          )
                        : const Icon(Icons.image_outlined, color: AppColors.primary, size: 22),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    style: AppTextStyles.bodyLarge,
                    decoration: InputDecoration(
                      hintText: 'Nhập tin nhắn...',
                      hintStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.textHint),
                      filled: true,
                      fillColor: AppColors.background,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: _sendMessage,
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                    child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessageModel msg, bool isMe) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
            CircleAvatar(
              radius: 14,
              backgroundColor: AppColors.primary.withOpacity(0.2),
              child: Text(
                widget.otherUsername.isNotEmpty ? widget.otherUsername[0].toUpperCase() : '?',
                style: const TextStyle(fontSize: 10, color: AppColors.primary),
              ),
            ),
            const SizedBox(width: 6),
          ],
          Column(
            crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              Container(
                constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.65),
                padding: msg.imageUrl != null
                    ? const EdgeInsets.all(4)
                    : const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: isMe ? AppColors.primary : AppColors.surface,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(16),
                    topRight: const Radius.circular(16),
                    bottomLeft: Radius.circular(isMe ? 16 : 4),
                    bottomRight: Radius.circular(isMe ? 4 : 16),
                  ),
                  border: isMe ? null : Border.all(color: AppColors.border),
                ),
                child: msg.imageUrl != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          msg.imageUrl!,
                          fit: BoxFit.cover,
                          width: 200,
                          height: 200,
                          loadingBuilder: (context, child, progress) => progress == null
                              ? child
                              : const SizedBox(
                                  width: 200,
                                  height: 200,
                                  child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
                                ),
                          errorBuilder: (_, __, ___) => const SizedBox(
                              width: 200, height: 200, child: Icon(Icons.broken_image_outlined)),
                        ),
                      )
                    : Text(
                        msg.content ?? '',
                        style: AppTextStyles.bodyLarge.copyWith(
                          color: isMe ? Colors.white : AppColors.textPrimary,
                        ),
                      ),
              ),
              const SizedBox(height: 2),
              Text(_formatTime(msg.createdAt),
                  style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
            ],
          ),
        ],
      ),
    );
  }
}
