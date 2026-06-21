import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/presentation/pages/login_page.dart';
import '../features/auth/presentation/pages/register_page.dart';
import '../features/auth/presentation/pages/select_role_page.dart';
import '../features/auth/presentation/pages/shop_register_page.dart';
import '../features/auth/presentation/pages/org_register_page.dart';
import '../features/product/presentation/pages/product_list_page.dart';
import '../features/product/presentation/pages/product_detail_page.dart';
import '../features/product/data/product_model.dart';
import '../features/listing/presentation/pages/upload_image_page.dart';
import '../features/listing/presentation/pages/my_listings_page.dart';
import '../features/main/presentation/pages/main_screen.dart';
import '../features/profile/presentation/pages/profile_page.dart';
import '../features/profile/presentation/pages/edit_profile_page.dart';
import 'route_names.dart';
 import '../features/wardrobe/presentation/pages/wardrobe_page.dart';

final appRouter = GoRouter(
  initialLocation: RouteNames.login,
  routes: [
    GoRoute(
      path: RouteNames.login,
      builder: (context, state) => const LoginPage(),
    ),
    GoRoute(
      path: RouteNames.selectRole,
      builder: (context, state) => const SelectRolePage(),
    ),
    GoRoute(
      path: RouteNames.register,
      builder: (context, state) {
        final role = state.extra as String? ?? 'MEMBER';
        return RegisterPage(roleName: role);
      },
    ),
    GoRoute(
      path: RouteNames.registerShop,
      builder: (context, state) => const ShopRegisterPage(),
    ),
    GoRoute(
      path: RouteNames.registerOrg,
      builder: (context, state) => const OrgRegisterPage(),
    ),

    ShellRoute(
      builder: (context, state, child) => MainScreen(child: child),
      routes: [
        GoRoute(
          path: RouteNames.productList,
          builder: (context, state) => const ProductListPage(),
        ),
        GoRoute(
          path: RouteNames.myListings,
          builder: (context, state) => const MyListingsPage(),
        ),
        GoRoute(
          path: RouteNames.profile,
          builder: (context, state) => const ProfilePage(),
        ),
        GoRoute(
          path: RouteNames.wardrobe,
          builder: (context, state) => const WardrobePage(),
        ),
        GoRoute(
          path: RouteNames.chat,
          builder: (context, state) => const Placeholder(),
        ),
        GoRoute(
          path: RouteNames.explore,
          builder: (context, state) => const Placeholder(),
        ),
      ],
    ),

    GoRoute(
      path: RouteNames.productDetail,
      builder: (context, state) {
        final product = state.extra as ProductModel;
        return ProductDetailPage(product: product);
      },
    ),
    GoRoute(
      path: RouteNames.createListing,
      builder: (context, state) => const UploadImagePage(),
    ),
  ],
);