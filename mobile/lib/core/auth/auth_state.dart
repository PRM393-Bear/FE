// mobile/lib/core/auth/auth_state.dart
import 'package:flutter/foundation.dart';

/// Bộ đếm số lần trạng thái đăng nhập thay đổi (login/logout/đăng ký xong).
/// MainScreen lắng nghe biến này để tự load lại role mỗi khi có thay đổi,
/// kể cả khi bản thân widget MainScreen không bị huỷ/tạo lại (trường hợp
/// dùng context.push() để giữ lại màn phía sau cho back-button).
class AuthState {
  static final ValueNotifier<int> version = ValueNotifier<int>(0);

  static void notifyChanged() {
    version.value++;
  }
}