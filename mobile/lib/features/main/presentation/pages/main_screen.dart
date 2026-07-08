import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/auth/auth_storage.dart';
import '../../../../routes/route_names.dart';

class MainScreen extends StatefulWidget {
  final Widget child;
  const MainScreen({super.key, required this.child});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  String _role = 'MEMBER';
  bool _loaded = false;

  @override
  void initState() {
    super.initState();
    _loadRole();
  }

  Future<void> _loadRole() async {
    final role = await AuthStorage.getRole();
    setState(() {
      _role = role ?? 'MEMBER';
      _loaded = true;
    });
  }

  // Danh sách path tương ứng theo role — thứ tự phải khớp với items bên dưới
  List<String> get _paths {
    if (_role == 'ORGANIZATION') {
      return [
        RouteNames.orgDashboard,
        RouteNames.explore,
        RouteNames.community,
        RouteNames.profile,
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
      if (location.startsWith(paths[i])) return i;
    }
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    context.go(_paths[index]);
  }

  @override
  Widget build(BuildContext context) {
    if (!_loaded) {
      return const Scaffold(body: Center(child: CircularProgressIndicator(color: AppColors.primary)));
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
