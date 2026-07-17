import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../core/network/api_client.dart';
import 'community_post_model.dart';
import 'post_comment_model.dart';

class CommunityPostService {
  static Future<Map<String, dynamic>> getAllPosts({int page = 0, int size = 10}) async {
    final res = await ApiClient.dio.get('/api/community-posts',
        queryParameters: {'page': page, 'size': size});
    final data = res.data;
    final posts = (data['content'] as List<dynamic>)
        .map((e) => CommunityPostModel.fromJson(e as Map<String, dynamic>))
        .toList();
    return {'posts': posts, 'isLast': data['last'] ?? true};
  }

  static Future<String?> uploadImage(File file) async {
    try {
      final formData = FormData.fromMap({'file': await MultipartFile.fromFile(file.path)});
      final res = await ApiClient.dio.post('/api/upload/image',
          data: formData, options: Options(contentType: 'multipart/form-data'));
      return res.data['url'] as String?;
    } catch (e) {
      debugPrint('🔴 Upload error: $e');
      return null;
    }
  }

  static Future<CommunityPostModel> createPost({
    required String content,
    required List<String> images,
    String? donationEventId,
  }) async {
    final res = await ApiClient.dio.post('/api/community-posts', data: {
      'content': content,
      'images': images,
      if (donationEventId != null) 'donationEventId': donationEventId,
    });
    return CommunityPostModel.fromJson(res.data as Map<String, dynamic>);
  }

  static Future<void> deletePost(String postId) => ApiClient.dio.delete('/api/community-posts/$postId');
  static Future<void> hidePost(String postId) => ApiClient.dio.put('/api/community-posts/$postId/hide');
  static Future<void> unhidePost(String postId) => ApiClient.dio.put('/api/community-posts/$postId/unhide');
  static Future<void> toggleLike(String postId) => ApiClient.dio.post('/api/community-posts/$postId/like');

  static Future<PostCommentModel> addComment(String postId, String content, {String? parentCommentId}) async {
    final res = await ApiClient.dio.post('/api/community-posts/$postId/comments', data: {
      'content': content,
      if (parentCommentId != null) 'parentCommentId': parentCommentId,
    });
    return PostCommentModel.fromJson(res.data as Map<String, dynamic>);
  }

  static Future<List<PostCommentModel>> getComments(String postId, {int page = 0, int size = 20}) async {
    final res = await ApiClient.dio.get('/api/community-posts/$postId/comments',
        queryParameters: {'page': page, 'size': size});
    return ((res.data)['content'] as List<dynamic>)
        .map((e) => PostCommentModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}