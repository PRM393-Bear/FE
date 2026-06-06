# Shared Packages

Thư mục này chứa các tài nguyên, mã nguồn và cấu hình được dùng chung cho cả dự án Web và Mobile. Việc sử dụng chung giúp nhất quán logic, giao diện và tiết kiệm thời gian phát triển.

## Cấu trúc thư mục

- `/assets`: Chứa các tài nguyên dùng chung như hình ảnh (Logo), Icon, và Fonts.
- `/api`: Định nghĩa các endpoints, constants cấu hình API chung.
- `/utils`: Chứa các hàm helper, format dữ liệu, hoặc logic validation dùng chung (ví dụ: validate email, format tiền tệ).
- `/config`: Nơi chứa các cấu hình tiêu chuẩn cho dự án (Linter rules, Git Hooks, v.v.).

## Cách sử dụng
- **Web**: Có thể import trực tiếp các hàm JS/TS hoặc cấu hình từ thư mục này thông qua alias hoặc đường dẫn tương đối.
- **Mobile**: Với Flutter, có thể cần tạo các script để sync tài nguyên từ thư mục `assets` vào bên trong thư mục của mobile, hoặc chia sẻ logic qua các package/FFI nếu tương thích, hoặc chỉ dùng chung các hằng số tĩnh bằng cách gen code.
