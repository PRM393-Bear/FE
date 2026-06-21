# Frontend Monorepo

Đây là kho lưu trữ tổng (Monorepo) chứa mã nguồn Frontend cho cả hai nền tảng Web và Mobile của dự án. 
Việc gom chung nhằm dễ dàng quản lý chung phiên bản, tài liệu, và tránh phân mảnh dự án.

## Cấu trúc thư mục

- `/mobile`: Chứa mã nguồn ứng dụng Mobile được phát triển bằng Flutter.
- `/web`: Chứa mã nguồn ứng dụng Web được phát triển bằng Vite (Vanilla JS / JavaScript).
- `/shared-packages`: Thư mục dùng chung chứa Assets (Logo, Icon, Font), cấu hình API, hàm helper/validation và quy chuẩn code để chia sẻ tài nguyên giữa Web và Mobile.

## Hướng dẫn làm việc

Để đảm bảo không bị xung đột, mỗi developer (Web hoặc Mobile) sẽ làm việc độc lập trong thư mục tương ứng của mình.

### Dành cho Mobile Developer
1. Mở thư mục `mobile` bằng Android Studio hoặc VS Code.
2. Đảm bảo bạn đã cài đặt Flutter SDK.
3. Chạy lệnh để lấy các dependencies:
   ```bash
   cd mobile
   flutter pub get
   ```
4. Chạy ứng dụng:
   ```bash
   flutter run
   ```

### Dành cho Web Developer
1. Mở thư mục `web` bằng VS Code.
2. Đảm bảo bạn đã cài đặt Node.js.
3. Cài đặt các thư viện cần thiết:
   ```bash
   cd web
   npm install
   ```
4. Chạy môi trường dev:
   ```bash
   npm run dev
   ```
5. Build cho production:
   ```bash
   npm run build
   ```

## Quy tắc chung
- Không sửa đổi mã nguồn ở thư mục chéo nếu không phải phận sự của mình (Developer Web không sửa code Mobile và ngược lại) để tránh gây ra xung đột khi gộp code.
- Các file `.gitignore` cụ thể cho từng công nghệ đã được đặt sẵn trong từng thư mục `/mobile` và `/web`. File `.gitignore` ở thư mục gốc chỉ dùng để chặn các file rác của hệ điều hành và IDE.
