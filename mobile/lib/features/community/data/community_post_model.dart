class CommunityPostModel {
  final String id;
  final String content;
  final List<String> images;
  final DateTime? createdAt;
  final String authorId;
  final String authorName;
  final String? authorAvatar;
  final int likeCount;
  final int commentCount;
  final bool isLikedByMe;
  final bool isHidden;
  final String? donationEventId;
  final String? donationEventTitle;

  CommunityPostModel({
    required this.id,
    required this.content,
    required this.images,
    this.createdAt,
    required this.authorId,
    required this.authorName,
    this.authorAvatar,
    required this.likeCount,
    required this.commentCount,
    required this.isLikedByMe,
    required this.isHidden,
    this.donationEventId,
    this.donationEventTitle,
  });

  factory CommunityPostModel.fromJson(Map<String, dynamic> json) {
    return CommunityPostModel(
      id: json['id']?.toString() ?? '',
      content: json['content'] ?? '',
      images: (json['images'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      authorId: json['authorId']?.toString() ?? '',
      authorName: json['authorName'] ?? 'Người dùng',
      authorAvatar: json['authorAvatar'],
      likeCount: (json['likeCount'] as num?)?.toInt() ?? 0,
      commentCount: (json['commentCount'] as num?)?.toInt() ?? 0,
      isLikedByMe: json['isLikedByMe'] ?? false,
      isHidden: json['isHidden'] ?? false,
      donationEventId: json['donationEventId']?.toString(),
      donationEventTitle: json['donationEventTitle'],
    );
  }

  CommunityPostModel copyWith({int? likeCount, bool? isLikedByMe, int? commentCount}) {
    return CommunityPostModel(
      id: id,
      content: content,
      images: images,
      createdAt: createdAt,
      authorId: authorId,
      authorName: authorName,
      authorAvatar: authorAvatar,
      likeCount: likeCount ?? this.likeCount,
      commentCount: commentCount ?? this.commentCount,
      isLikedByMe: isLikedByMe ?? this.isLikedByMe,
      isHidden: isHidden,
      donationEventId: donationEventId,
      donationEventTitle: donationEventTitle,
    );
  }

  String get timeAgoText {
    if (createdAt == null) return '';
    final diff = DateTime.now().difference(createdAt!);
    if (diff.inMinutes < 1) return 'Vừa xong';
    if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
    if (diff.inHours < 24) return '${diff.inHours} giờ trước';
    return '${diff.inDays} ngày trước';
  }
}