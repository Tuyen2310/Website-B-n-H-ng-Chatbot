# Nội dung Slide Thuyết Trình Đồ Án Tốt Nghiệp

Dưới đây là nội dung chi tiết cho 12 slide thuyết trình, được chắt lọc từ báo cáo file Word và thực tế hệ thống. Bạn có thể copy nội dung này trực tiếp vào PowerPoint.

---

## Slide 1 – Trang bìa

**XÂY DỰNG WEBSITE BÁN HÀNG TÍCH HỢP CHATBOT TƯ VẤN SẢN PHẨM DỰA TRÊN TẬP CÂU HỎI SẴN CÓ**

- **Giảng viên hướng dẫn:** ThS. Lưu Thị Thảo
- **Sinh viên thực hiện:** Hoàng Văn Tuyên (MSSV: 20220594 - Lớp: DCCNTT13.10.4)
- **Trường/Khoa:** Trường Đại học Công Nghệ Đông Á / Khoa Công Nghệ Thông Tin
- **Thời gian:** Bắc Ninh, Năm 2026

---

## Slide 2 – Giới thiệu đề tài

**Giới thiệu đề tài**

- **Lý do chọn đề tài:** Sự bùng nổ của thương mại điện tử đòi hỏi các cửa hàng phải chuyển đổi số và nâng cao chất lượng dịch vụ chăm sóc khách hàng trực tuyến 24/7.
- **Bối cảnh thực tế / Vấn đề tồn tại:** Người mua có nhiều thắc mắc trước khi mua (kích cỡ, chính sách, v.v.). Việc tư vấn thủ công tốn thời gian, chi phí và không đáp ứng kịp khi lưu lượng truy cập lớn.
- **Mục tiêu chính:** Tích hợp Chatbot tư vấn thông minh (dựa trên FAQ) vào website bán hàng để tự động giải đáp thắc mắc, tăng tương tác và nâng cao trải nghiệm mua sắm.

---

## Slide 3 – Mục tiêu & phạm vi

**Mục tiêu & Phạm vi nghiên cứu**

**Mục tiêu cụ thể:**
- Xây dựng thành công Website TMĐT với đầy đủ chức năng quản trị và mua hàng.
- Tích hợp Chatbot tự động trả lời và gợi ý sản phẩm dựa trên tập câu hỏi cho trước.

**Phạm vi:**
- **Làm gì:** Quản lý sản phẩm, giỏ hàng, đặt hàng, quản trị FAQ cho Chatbot, thống kê doanh thu.
- **Không làm gì:** Không sử dụng các mô hình AI sinh ngôn ngữ tự nhiên (LLM) phức tạp; Không tích hợp thanh toán ngân hàng thật (chỉ dùng sandbox/mô phỏng).

---

## Slide 4 – Cơ sở lý thuyết / công nghệ

**Cơ sở lý thuyết & Công nghệ sử dụng**

- **Kiến trúc hệ thống:** Mô hình 3 lớp (Client - Server - Database) kết hợp kiến trúc MVC (Model - View - Controller).
- **Công nghệ Frontend:** 
  - Next.js (React Framework), TypeScript
  - TailwindCSS, shadcn/ui
- **Công nghệ Backend:** 
  - NestJS, RESTful API
- **Cơ sở dữ liệu & Triển khai:** 
  - PostgreSQL, Prisma ORM
  - Docker & Docker Compose (Container hóa)
- **Thuật toán Chatbot (Retrieval-based):** Đối sánh câu hỏi người dùng với tập FAQ (Câu hỏi thường gặp) bằng TF-IDF cosine similarity / từ khóa.

---

## Slide 5 – Phân tích hệ thống

**Phân tích hệ thống**

- **Các Actor (Người dùng) chính:**
  - **Khách hàng (Customer):** Mua sắm, đánh giá, tương tác Chatbot.
  - **Quản trị viên (Admin):** Quản lý sản phẩm, đơn hàng, quản lý dữ liệu Chatbot (FAQ), thống kê.
  - **Chatbot System:** Tự động đối sánh và trả lời tin nhắn.

- **Use case chính:**
  - *Quản lý bán hàng:* Đặt hàng, Áp mã khuyến mãi, Cập nhật trạng thái đơn.
  - *Chatbot:* Thêm/Sửa/Xóa câu hỏi FAQ, Gợi ý sản phẩm liên quan.

*(Gợi ý: Chèn ảnh Sơ đồ Use Case tổng quát từ file báo cáo vào đây - Hình trang 29 hoặc 30)*

---

## Slide 6 – Thiết kế hệ thống

**Thiết kế kiến trúc tổng thể**

- **Luồng hoạt động (Client-Server):**
  1. Trình duyệt (Client) gửi yêu cầu HTTP/HTTPS.
  2. Nginx (Reverse Proxy) điều hướng yêu cầu.
  3. Backend (NestJS) xử lý logic nghiệp vụ và truy vấn CSDL.
  4. Database (PostgreSQL) trả về dữ liệu.
- **Cơ sở dữ liệu:** Gồm 15 bảng (Bảng cốt lõi: `users`, `products`, `orders`, `faq`, `chatbot_log`).

*(Gợi ý: Chèn ảnh Biểu đồ Triển Khai (Deployment Diagram) trang 66 hoặc Sơ đồ ERD trang 73 vào đây)*

---

## Slide 7 – Demo chức năng chính (Khách hàng)

**Demo Chức năng Khách Hàng (Customer)**

- Giao diện thiết kế theo phong cách hiện đại, trực quan (UI/UX).
- Tính năng: Xem danh sách sản phẩm, lọc theo danh mục, xem chi tiết và đánh giá sản phẩm.

*(Gợi ý: Chèn 1-2 ảnh chụp màn hình Trang chủ và Trang Danh mục sản phẩm - Hình trang 67, 68)*

---

## Slide 8 – Demo chức năng chính (Đặt hàng & Quản trị)

**Demo Chức năng Đặt hàng & Quản trị (Admin)**

- **Khách hàng:** Quy trình Checkout (Thanh toán) mượt mà, quản lý giỏ hàng.
- **Admin:** Dashboard thống kê doanh thu, trạng thái đơn hàng trực quan. Quản lý toàn diện hệ thống.

*(Gợi ý: Chèn ảnh màn hình Giỏ hàng/Thanh toán và ảnh Dashboard Admin - Hình trang 70, 72)*

---

## Slide 9 – Demo chức năng chính (Chatbot Tư vấn)

**Demo Tính năng Chatbot Tự động**

- Chatbot Widget tích hợp nổi trên mọi trang.
- Tự động nhận diện câu hỏi và đưa ra câu trả lời dựa trên kho FAQ của Admin.
- Tích hợp gợi ý trực tiếp thẻ sản phẩm (Product Card) ngay trong khung chat để khách hàng nhấn mua ngay.

*(Gợi ý: Chèn ảnh màn hình giao diện Chatbot đang tư vấn sản phẩm - Hình trang 71 hoặc 97)*

---

## Slide 10 – Kết quả đạt được

**Kết quả đạt được & Đánh giá hiệu quả**

- **Những gì đã làm được:** Hoàn thiện 100% các chức năng cốt lõi của một trang TMĐT thực tế. Hệ thống vận hành ổn định, tốc độ phản hồi nhanh.
- **So sánh trước - sau:** 
  - *Trước:* Người mua phải tự tìm đọc chính sách, chờ đợi nhân viên trực page trả lời tin nhắn.
  - *Sau:* Chatbot trả lời tức thì (dưới 2 giây) 24/7, tỷ lệ chốt đơn nhanh hơn nhờ có link sản phẩm gợi ý.
- **Kiểm thử (Testing):** Vượt qua bài Test tải (Load Testing) với 500 người dùng đồng thời, hệ thống bảo mật an toàn trước các cuộc tấn công spam (Rate Limiting).

---

## Slide 11 – Hạn chế

**Hạn chế & Khó khăn gặp phải**

- **Những điểm chưa làm được:**
  - Mô hình Chatbot hiện tại chỉ dựa trên từ khóa (Rule-based/FAQ-based), chưa có khả năng "hiểu sâu" ngôn ngữ tự nhiên phức tạp như các AI lớn hiện nay.
  - Chức năng thanh toán trực tuyến mới dừng ở mức mô phỏng (Sandbox).
- **Khó khăn gặp phải:** 
  - Việc chuẩn bị một bộ dữ liệu FAQ (Hỏi-Đáp) đủ lớn và bao quát toàn bộ ngữ cảnh mua hàng tốn rất nhiều thời gian.
  - Tối ưu hóa hiệu năng render phía Frontend (Next.js) để tránh lỗi Hydration.

---

## Slide 12 – Hướng phát triển

**Hướng phát triển trong tương lai**

- **Nâng cấp công nghệ Chatbot:** Tích hợp các mô hình AI/LLM (như ChatGPT API, Gemini) kết hợp RAG (Retrieval-Augmented Generation) để chatbot giao tiếp tự nhiên và thông minh hơn.
- **Hoàn thiện tính năng bán hàng:** Tích hợp trực tiếp API thanh toán thật (VNPay, MoMo, ZaloPay). Thêm các chiến dịch Flash Sale nâng cao, Quản lý kho hàng chuyên sâu.
- **Ứng dụng thực tế:** Đóng gói hệ thống thành một giải pháp SaaS (Software as a Service) có thể bán lại hoặc áp dụng ngay cho các chuỗi cửa hàng bán lẻ quy mô vừa và nhỏ.

---

## Slide Cuối

**KẾT LUẬN & CẢM ƠN**

- **Kết luận:** Đề tài đã giải quyết tốt bài toán ứng dụng công nghệ để tự động hóa quy trình chăm sóc khách hàng trong TMĐT. Quá trình làm đồ án giúp củng cố vững chắc kiến thức chuyên ngành.
- **Cảm ơn:** Em xin gửi lời cảm ơn chân thành đến ThS. Lưu Thị Thảo cùng các thầy cô Khoa CNTT đã tận tình hướng dẫn em hoàn thành đồ án này!

*Xin trân trọng cảm ơn Hội đồng đã lắng nghe!*
