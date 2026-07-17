class PostCommentModel {
  final String id;
  final String content;
  final DateTime? createdAt;
  final String? parentCommentId;
  final String authorId;
  final String authorName;
  final String? authorAvatar;

  PostCommentModel({
    required this.id,
    required this.content,
    this.createdAt,
    this.parentCommentId,
    required this.authorId,
    required this.authorName,
    this.authorAvatar,
  });

  factory PostCommentModel.fromJson(Map<String, dynamic> json) {
    return PostCommentModel(
      id: json['id']?.toString() ?? '',
      content: json['content'] ?? '',
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      parentCommentId: json['parentCommentId']?.toString(),
      authorId: json['authorId']?.toString() ?? '',
      authorName: json['authorName'] ?? 'Người dùng',
      authorAvatar: json['authorAvatar'],
    );
  }
}