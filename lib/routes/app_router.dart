import 'package:go_router/go_router.dart';
import '../features/auth/presentation/pages/login_page.dart';
import '../features/auth/presentation/pages/register_page.dart';
import '../features/product/presentation/pages/product_list_page.dart';
import '../features/product/presentation/pages/product_detail_page.dart';
import '../features/product/data/product_model.dart';
import 'route_names.dart';

final appRouter = GoRouter(
  initialLocation: RouteNames.login, // ← giữ login làm màn hình đầu
  routes: [
    GoRoute(
      path: RouteNames.login,
      builder: (context, state) => const LoginPage(),
    ),
    GoRoute(
      path: RouteNames.register,
      builder: (context, state) => const RegisterPage(),
    ),
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
  ],
);