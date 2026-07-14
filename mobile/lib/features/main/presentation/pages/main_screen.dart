// mobile/lib/features/main/presentation/pages/main_screen.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/auth/auth_storage.dart';
import '../../../../core/auth/auth_state.dart';
import '../../../../routes/route_names.dart';
import '../../../../shared/widgets/login_prompt_sheet.dart';

class MainScreen extends StatefulWidget {
  final Widget child;
  const MainScreen({super.key, required this.child});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  String _role = 'GUEST';
  String? _orgStatus;
  bool _loaded = false;

  @override
  void initState() {
    super.initState();
    _loadRole();
    // Lắng nghe tín hiệu đăng nhập/đăng xuất từ bất kỳ đâu trong app, để
    // tự load lại role dù widget này không bị huỷ/tạo lại (do dùng push()
    // để giữ màn phía sau cho back-button hoạt động).
    AuthState.version.addListener(_loadRole);
  }

  @override
  void dispose() {
    AuthState.version.removeListener(_loadRole);
    super.dispose();
  }

  Future<void> _loadRole() async {
    // Guest = chưa có token đăng nhập. Phải check trước getRole(),
    // vì getRole() mặc định trả 'MEMBER' khi không đọc được role,
    // sẽ nhầm guest thành member nếu không tách riêng ở đây.
    final loggedIn = await AuthStorage.isLoggedIn();
    if (!loggedIn) {
      setState(() {
        _role = 'GUEST';
        _orgStatus = null;
        _loaded = true;
      });
      return;
    }
    final role = await AuthStorage.getRole();
    final status = await AuthStorage.getOrganizationStatus();
    setState(() {
      // Nếu là Tổ chức mà chưa được duyệt -> Ép Role về GUEST để hiện giao diện khách
      if (role == 'ORGANIZATION' && status != 'APPROVED') {
        _role = 'GUEST';
      } else {
        _role = role ?? 'MEMBER';
      }
      _orgStatus = status;
      _loaded = true;
    });
  }

  // Danh sách path tương ứng theo role — thứ tự phải khớp với items bên dưới.
  // Với GUEST, 2 mục "Đăng bán" và "Chat" không có route thật (giá trị bắt
  // đầu bằng '#') — chúng bị chặn lại trong _onItemTapped trước khi điều
  // hướng nên sẽ không bao giờ được dùng để gọi context.go().
  List<String> get _paths {
    if (_role == 'ORGANIZATION') {
      return [
        RouteNames.orgDashboard,
        RouteNames.explore,
        RouteNames.community,
        RouteNames.profile,
      ];
    }
    if (_role == 'GUEST') {
      return [
        RouteNames.productList,
        RouteNames.explore,
        '#guest-locked-sell',
        '#guest-locked-chat',
        RouteNames.login,
      ];
    }
    return [
      RouteNames.productList,
      RouteNames.explore,
      RouteNames.myListings,
      RouteNames.chat,
      RouteNames.profile,
    ];
  }

  List<BottomNavigationBarItem> get _items {
    if (_role == 'ORGANIZATION') {
      return const [
        BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Chiến dịch'),
        BottomNavigationBarItem(icon: Icon(Icons.explore_outlined), label: 'Khám phá'),
        BottomNavigationBarItem(icon: Icon(Icons.groups_outlined), label: 'Cộng đồng'),
        BottomNavigationBarItem(icon: Icon(Icons.person_outline_rounded), label: 'Hồ sơ'),
      ];
    }
    if (_role == 'GUEST') {
      return const [
        BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'Trang chủ'),
        BottomNavigationBarItem(icon: Icon(Icons.explore_outlined), label: 'Khám phá'),
        BottomNavigationBarItem(icon: Icon(Icons.add_circle_outline_rounded), label: 'Đăng bán'),
        BottomNavigationBarItem(icon: Icon(Icons.chat_bubble_outline_rounded), label: 'Chat'),
        BottomNavigationBarItem(icon: Icon(Icons.login_rounded), label: 'Đăng nhập'),
      ];
    }
    return const [
      BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'Trang chủ'),
      BottomNavigationBarItem(icon: Icon(Icons.explore_outlined), label: 'Khám phá'),
      BottomNavigationBarItem(icon: Icon(Icons.add_circle_outline_rounded), label: 'Đăng bán'),
      BottomNavigationBarItem(icon: Icon(Icons.chat_bubble_outline_rounded), label: 'Chat'),
      BottomNavigationBarItem(icon: Icon(Icons.person_outline_rounded), label: 'Hồ sơ'),
    ];
  }

  int _calculateSelectedIndex(BuildContext context) {
    final String location = GoRouterState.of(context).uri.path;
    final paths = _paths;
    for (int i = 0; i < paths.length; i++) {
      if (paths[i].startsWith('#')) continue; // bỏ qua path khoá của guest
      if (location.startsWith(paths[i])) return i;
    }
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    if (_role == 'GUEST') {
      if (index == 2) {
        LoginPromptSheet.show(context,
            message: 'Đăng nhập để đăng bán sản phẩm của bạn');
        return;
      }
      if (index == 3) {
        LoginPromptSheet.show(context,
            message: 'Đăng nhập để nhắn tin với người bán');
        return;
      }
      if (index == 4) {
        // Dùng push (không dùng go) để màn login được CHỒNG lên trên,
        // giữ nguyên màn guest bên dưới -> có thể back về được.
        context.push(RouteNames.login);
        return;
      }
    }
    context.go(_paths[index]);
  }

  @override
  Widget build(BuildContext context) {
    if (!_loaded) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    return Scaffold(
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _calculateSelectedIndex(context),
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.neutral,
        type: BottomNavigationBarType.fixed,
        onTap: (index) => _onItemTapped(index, context),
        items: _items,
      ),
    );
  }
}