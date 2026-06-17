# BÁO CÁO ĐỒ ÁN PHÁT TRIỂN ỨNG DỤNG WEB

## 1. Kiến trúc Phát triển Web (MVC/MVVM)

Hệ thống **SmartShop AI** được phát triển dựa trên biến thể hiện đại của mô hình kiến trúc **MVC (Model - View - Controller)** kết hợp với **SPA (Single Page Application)**, trong đó chia tách rõ ràng hai tầng Backend và Frontend:

- **Model (Tầng Dữ liệu)**: Sử dụng `Prisma ORM` kết nối với cơ sở dữ liệu. Model quản lý cấu trúc dữ liệu, các ràng buộc và thao tác truy vấn (CRUD). Tầng này đảm bảo tính toàn vẹn của dữ liệu (Database Integrity).
- **Controller (Tầng Xử lý)**: Sử dụng `NestJS` (framework của Node.js). Controller đóng vai trò nhận các Request (RESTful APIs), chuyển cho Service xử lý nghiệp vụ (Business Logic), tương tác với Model và trả về Dữ liệu thô (JSON) thay vì trả về giao diện HTML như MVC truyền thống.
- **View / ViewModel (Tầng Giao diện)**: Sử dụng `Next.js` và `React`. Tầng View không chỉ đơn thuần là hiển thị mà còn sử dụng kiến trúc **MVVM (Model-View-ViewModel)** thu nhỏ thông qua `Zustand` và `React Query`.
  - **View**: Các component React/TailwindCSS đảm nhiệm hiển thị.
  - **ViewModel**: Các Store (`cartStore`, `authStore`) giữ trạng thái (State) và làm trung gian tự động cập nhật View mỗi khi Model (Data từ API) thay đổi.

**Lý do lựa chọn kiến trúc này**: Đảm bảo hiệu năng cao, dễ dàng chia đội nhóm (Front/Back) làm việc độc lập, và khả năng mở rộng ứng dụng lớn (Scalability) linh hoạt hơn so với kiến trúc Monolithic truyền thống.

---

## 2. Quy trình Phát triển Phần mềm (Agile/Scrum)

Dự án áp dụng quy trình **Agile** với khung làm việc **Scrum** - là quy trình phổ biến nhất tại các công ty công nghệ hiện đại.

- **Sprint (Phân đoạn)**: Dự án được chia thành các vòng lặp (Sprint) kéo dài 2 tuần. Mỗi Sprint hướng tới việc phát hành một nhóm tính năng có thể chạy được (Potentially Shippable Product Increment).
  - *Sprint 1*: Khởi tạo hệ thống, Database và chức năng Đăng nhập, Quản lý tài khoản.
  - *Sprint 2*: Quản lý danh mục, Sản phẩm, Tìm kiếm và Lọc (Backend Filtering).
  - *Sprint 3*: Tích hợp Chatbot AI, Quản lý Giỏ hàng và Đặt hàng.
  - *Sprint 4*: Tối ưu hóa hiệu năng, Bảo mật, và Thống kê (Dashboard).
- **Daily Scrum**: Họp ngắn 15 phút mỗi ngày để cập nhật tiến độ (Đã làm gì? Sẽ làm gì? Có gặp khó khăn gì không?).
- **Sprint Review & Retrospective**: Đánh giá sản phẩm sau mỗi Sprint và rút kinh nghiệm để cải tiến quy trình.

**Lý do lựa chọn quy trình này**: Đồ án có nhiều tính năng thay đổi liên tục, Agile giúp tiếp nhận phản hồi nhanh chóng (từ giảng viên/người dùng) và linh hoạt thích ứng với các thay đổi thay vì phải lập kế hoạch cứng nhắc từ đầu (như mô hình Thác nước - Waterfall).

---

## 3. An toàn Thông tin - 10 Lỗ hổng Bảo mật OWASP

Hệ thống được thiết kế để phòng thủ chủ động trước top 10 lỗ hổng bảo mật phổ biến nhất theo chuẩn OWASP:

1. **Injection (Lỗi chèn mã độc)**: Đã được khắc phục hoàn toàn bằng việc sử dụng Prisma ORM. Prisma tự động sử dụng Parametrized Queries (Truy vấn tham số hóa), loại bỏ hoàn toàn rủi ro SQL Injection.
2. **Broken Authentication**: Quản lý xác thực bằng chuỗi Token JWT an toàn, mật khẩu được mã hóa một chiều bằng thuật toán `bcrypt` kết hợp muối (salt). Cung cấp cơ chế xác thực 2 bước (OTP) qua Email khi đổi mật khẩu để chống chiếm quyền.
3. **Cross Site Scripting (XSS)**: Hệ thống sử dụng React.js, công cụ này tự động thực hiện "escape" (thoát chuỗi) toàn bộ dữ liệu đầu vào trước khi render ra DOM, ngăn chặn kịch bản chạy mã JS độc hại do người dùng nhập vào.
4. **Insecure Direct Object References (IDOR)**: Toàn bộ API đều kiểm tra quyền hạn và `userId` của Token. Một User (khách hàng) không thể sửa URL (ví dụ: `/api/orders/2`) để xem đơn hàng của người khác vì Backend đã chặn quyền.
5. **Security Misconfiguration**: Đã tích hợp module `Helmet` trong NestJS để tự động thiết lập các tiêu đề HTTP bảo mật (HSTS, X-Frame-Options) và `Cors` để chặn truy cập API trái phép từ các domain lạ.
6. **Sensitive Data Exposure**: Thông tin nhạy cảm (JWT Secret, API Keys) được quản lý qua biến môi trường (`.env`), không bị đưa lên Source Code.
7. **Missing Function Level Access Control**: Phân quyền nghiêm ngặt bằng Role-based Access Control (RBAC). Các API nhạy cảm được bảo vệ bằng Guard `@Roles(Role.ADMIN)`.
8. **Cross-Site Request Forgery (CSRF)**: Thay vì dùng Session Cookie truyền thống, dự án truyền Authorization Bearer Token qua Header, tự động loại bỏ được cuộc tấn công CSRF.
9. **Using Component with Known Vulnerabilities**: Sử dụng các thư viện phổ biến và luôn quét qua `npm audit` định kỳ.
10. **Unvalidated Redirects and Forwards**: Hệ thống kiểm soát chặt chẽ URL chuyển hướng nội bộ trên Frontend thông qua Next.js Router thay vì phụ thuộc dữ liệu ngoài.

**Công cụ Kiểm thử áp dụng**: Có thể dùng *CyStack Cloud Security*, *OWASP ZAP* để quét thực tế.

---

## 4. Các Thông Số Hiệu Năng Của Web (Performance Metrics)

Dưới đây là các định nghĩa quan trọng liên quan đến trải nghiệm tải trang và hiệu năng máy chủ mà đồ án hướng tới đo lường:

- **Response time**: Thời gian tính từ khi máy khách (Client) gửi yêu cầu (Request) đến khi nhận được byte dữ liệu phản hồi (Response) đầu tiên từ Server (Thường phải < 200ms).
- **Average load time**: Thời gian trung bình để toàn bộ nội dung của trang web được tải về và hiển thị đầy đủ (Target: < 3s).
- **Peak response time**: Thời gian phản hồi chậm nhất trong một khung thời gian lấy mẫu, thường rơi vào lúc máy chủ quá tải (Bottleneck).
- **Wait time (TTFB - Time to First Byte)**: Thời gian chờ máy chủ xử lý logic và truy vấn Database trước khi trả về kết quả.
- **Requests per second (RPS / Throughput)**: Tổng số yêu cầu mà hệ thống có thể xử lý thành công trong 1 giây. Đây là chỉ số chính biểu diễn sức mạnh hệ thống.
- **Concurrent users**: Số lượng người dùng truy cập và thao tác *đồng thời* tại cùng một thời điểm.
- **CPU/Memory utilization**: Tỉ lệ phần trăm CPU và RAM đang bị chiếm dụng trên Server.
- **Error rate / Transactions failed**: Tỉ lệ các yêu cầu bị lỗi (trả về mã 5xx) so với tổng số yêu cầu gửi lên.

**Công cụ đo lường áp dụng trong hệ thống**: 
- Sử dụng **PageSpeed Insights** / Lighthouse để chấm điểm Frontend (FCP, LCP, CLS).
- Sử dụng **Apache JMeter** để đo tải (Load Testing) sức chịu đựng của Backend API. (Đã cung cấp sẵn file test plan `docs/jmeter_test_plan.jmx`).

---

## 5. Yêu cầu Phi Chức năng: Thu thập hành vi người dùng

Để hiểu và tối ưu hóa hệ thống, Web đã được gắn các công cụ theo dõi (Tracking):

- **Công cụ áp dụng**: `Google Analytics 4` (thông qua thư viện `@next/third-parties/google`).
- **Nhiệm vụ thu thập**:
  1. *Lưu lượng truy cập (Traffic)*: Phân tích số lượt xem trang (Pageviews), thời gian trên trang (Time on page).
  2. *Hành vi mua sắm (E-commerce Behavior)*: Thống kê khách hàng xem sản phẩm nào nhiều nhất (Sản phẩm thịnh hành), luồng khách hàng nhấp chuột từ danh mục đến giỏ hàng.
  3. *Trực quan hóa (Visualization)*: Tất cả dữ liệu được vẽ thành biểu đồ Real-time trên bảng điều khiển của Google Analytics (Analytics Dashboard), bao gồm cả khu vực địa lý của người dùng và thiết bị họ đang sử dụng (Mobile/PC).
- **Tính năng cục bộ**: Frontend sử dụng `Zustand (Local Storage)` lưu lại lịch sử "Sản phẩm bạn vừa xem" để hiển thị lại cho khách hàng ngay lập tức mà không cần gọi mạng.
