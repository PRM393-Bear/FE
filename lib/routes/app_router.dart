import 'package:flutter/material.dart'; // Thêm import này để dùng được Placeholder
import 'package:go_router/go_router.dart';
import '../features/auth/presentation/pages/login_page.dart';
import '../features/auth/presentation/pages/register_page.dart';
import '../features/product/presentation/pages/product_list_page.dart';
import '../features/product/presentation/pages/product_detail_page.dart';
import '../features/product/data/product_model.dart';
import '../features/listing/presentation/pages/upload_image_page.dart';
import '../features/main/presentation/pages/main_screen.dart';
import '../features/listing/presentation/pages/my_listings_page.dart';
import 'route_names.dart';

final appRouter = GoRouter(
  initialLocation: RouteNames.login,
  routes: [
    GoRoute(
      path: RouteNames.login,
      builder: (context, state) => const LoginPage(),
    ),
    GoRoute(
      path: RouteNames.register,
      builder: (context, state) => const RegisterPage(),
    ),

    ShellRoute(
      builder: (context, state, child) => MainScreen(child: child),
      routes: [
        GoRoute(
          path: RouteNames.productList,
          builder: (context, state) => const ProductListPage(),
        ),
        GoRoute(
          path: RouteNames.productDetail,
          builder: (context, state) => ProductDetailPage(
            product: state.extra as ProductModel,
          ),
        ),
        GoRoute(
          path: RouteNames.myListings,
          builder: (context, state) => const MyListingsPage(),
        ),
        GoRoute(
          path: RouteNames.profile,
          builder: (context, state) => const Placeholder(),
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
      path: RouteNames.createListing,
      builder: (context, state) => const UploadImagePage(),
    ),
  ],
);