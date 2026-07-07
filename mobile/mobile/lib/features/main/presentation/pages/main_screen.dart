import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../routes/route_names.dart';

class MainScreen extends StatelessWidget {
  final Widget child; // Đây là nội dung của tab hiện tại do GoRouter truyền vào

  const MainScreen({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child, // Hiển thị trang tương ứng với tab
      bottomNavigationBar: BottomNavigationBar(
        // Tính toán currentIndex dựa trên đường dẫn hiện tại
        currentIndex: _calculateSelectedIndex(context),
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.neutral,
        type: BottomNavigationBarType.fixed,
        onTap: (index) => _onItemTapped(index, context),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'Trang chủ'),
          BottomNavigationBarItem(icon: Icon(Icons.explore_outlined), label: 'Khám phá'),
          BottomNavigationBarItem(icon: Icon(Icons.add_circle_outline_rounded), label: 'Đăng bán'),
          BottomNavigationBarItem(icon: Icon(Icons.chat_bubble_outline_rounded), label: 'Chat'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline_rounded), label: 'Hồ sơ'),
        ],
      ),
    );
  }

  int _calculateSelectedIndex(BuildContext context) {
    final String location = GoRouterState.of(context).uri.path;
    if (location.startsWith('/products')) return 0;
    if (location.startsWith('/explore')) return 1;
    if (location.startsWith('/my-listings')) return 2;
    if (location.startsWith('/chat')) return 3;
    if (location.startsWith('/profile')) return 4;

    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0: context.go('/products'); break;
      case 1: context.go('/explore'); break;
      case 2: context.go(RouteNames.myListings); break;
      case 3: context.go('/chat'); break;
      case 4: context.go('/profile'); break;
    }
  }
}