class ChatMessageModel {
  final String id;
  final String roomId;
  final String senderId;
  final String? content;
  final String? imageUrl;
  final String createdAt;
  final String status;

  ChatMessageModel({
    required this.id,
    required this.roomId,
    required this.senderId,
    this.content,
    this.imageUrl,
    required this.createdAt,
    required this.status,
  });

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) {
    return ChatMessageModel(
      id: json['id']?.toString() ?? '',
      roomId: json['roomId']?.toString() ?? '',
      senderId: json['senderId']?.toString() ?? '',
      content: json['content'],
      imageUrl: json['imageUrl'],
      createdAt: json['createdAt']?.toString() ?? '',
      status: json['status'] ?? 'SENT',
    );
  }
}

class ChatRoomModel {
  final String id;
  final String otherUserId;
  final String otherUsername;
  final String? lastMessage;
  final String? lastMessageAt;
  final int unreadCount;

  ChatRoomModel({
    required this.id,
    required this.otherUserId,
    required this.otherUsername,
    this.lastMessage,
    this.lastMessageAt,
    required this.unreadCount,
  });

  factory ChatRoomModel.fromJson(Map<String, dynamic> json) {
    return ChatRoomModel(
      id: json['id']?.toString() ?? '',
      otherUserId: json['otherUserId']?.toString() ?? '',
      otherUsername: json['otherUsername'] ?? json['otherUserName'] ?? '',
      lastMessage: json['lastMessage'],
      lastMessageAt: json['lastMessageAt']?.toString(),
      unreadCount: json['unreadCount'] ?? 0,
    );
  }
}