# 🎓 Kịch Bản Thuyết Trình Đồ Án Tốt Nghiệp

Dưới đây là nội dung chi tiết cho 12 slide thuyết trình, được chắt lọc và trình bày ngắn gọn, súc tích (dạng Bullet points) để hội đồng dễ theo dõi. Đồng thời mình có ghi chú cụ thể các ảnh bạn cần chụp để đưa vào slide nhé.

---

## 1. Slide 1 – Trang bìa
*Trang trình bày đầu tiên, thiết kế trang trọng, lịch sự*

- **TRƯỜNG ĐẠI HỌC CÔNG NGHỆ ĐÔNG Á**
- **Khoa:** Công Nghệ Thông Tin
- **TÊN ĐỀ TÀI:** XÂY DỰNG WEBSITE BÁN HÀNG TÍCH HỢP CHATBOT TƯ VẤN SẢN PHẨM DỰA TRÊN TẬP CÂU HỎI SẴN CÓ
- **Sinh viên thực hiện:** Hoàng Văn Tuyên (Mã SV: 20220594)
- **Giảng viên hướng dẫn:** ThS. Lưu Thị Thảo
- **Thời gian:** Bắc Ninh, năm 2026

---

## 2. Slide 2 – Giới thiệu đề tài
*Nhấn mạnh vào lý do và bối cảnh thực tế dẫn đến việc chọn đề tài*

**Bối cảnh thực tế:**
- Thương mại điện tử bùng nổ, mua sắm trực tuyến thành xu hướng.
- Người dùng có nhu cầu rất lớn về việc được giải đáp thắc mắc liên tục 24/7 (size, màu sắc, bảo hành, ship...).
- Tư vấn thủ công tốn nhân lực, chậm trễ, dễ làm mất khách hàng.

**Lý do chọn đề tài:**
- Website bán hàng truyền thống thiếu tính tương tác trực tiếp.
- Cần một giải pháp tự động hóa khâu CSKH để tối ưu vận hành.

**Mục tiêu chính:** 
- Xây dựng hệ thống E-Commerce hoàn chỉnh kết hợp sức mạnh của AI Chatbot nhằm nâng cao trải nghiệm mua sắm và tự động hóa tư vấn.

---

## 3. Slide 3 – Mục tiêu & phạm vi
*Định hình rõ ràng ranh giới của đồ án để hội đồng không hỏi lan man ngoài phạm vi*

**Mục tiêu cụ thể:**
- Xây dựng Website mua sắm chuẩn UI/UX cho đa thiết bị.
- Phát triển công cụ quản trị (Admin Dashboard) toàn diện.
- Tích hợp Chatbot AI (Gemini) dựa trên hệ cơ sở tri thức (FAQ) nội bộ.

**Phạm vi:**
- **Làm gì:** Xây dựng luồng mua hàng (Xem -> Giỏ hàng -> Đặt hàng), Quản trị sản phẩm/đơn hàng/doanh thu, Chatbot tra cứu FAQ & Gợi ý sản phẩm.
- **Không làm gì:** Chưa tích hợp với các hệ thống giao hàng thực tế (GHTK, Viettel Post). Tính năng thanh toán trực tuyến (VNPay/Momo) mới ở mức mô phỏng (Sandbox).

---

## 4. Slide 4 – Cơ sở lý thuyết / công nghệ
*Trình bày các công nghệ hiện đại đang sử dụng bằng Icon/Logo cho đẹp mắt*

**Công nghệ sử dụng:**
- **Frontend:** Next.js, React, TailwindCSS (Tối ưu SEO và hiệu năng hiển thị SSR/CSR).
- **Backend:** NestJS (TypeScript), RESTful API, JWT (Kiến trúc chặt chẽ, bảo mật cao).
- **Cơ sở dữ liệu:** PostgreSQL kết hợp Prisma ORM (Quản lý dữ liệu quan hệ mạnh mẽ).
- **Trí tuệ nhân tạo:** API Google Gemini (Xử lý ngôn ngữ tự nhiên cho Chatbot).
- **Triển khai:** Docker & Docker Compose (Đóng gói và triển khai đồng nhất).

**Mô hình kiến trúc:**
- Sử dụng mô hình Client-Server. Backend tuân thủ kiến trúc MVC (Model - View - Controller).

---

## 5. Slide 5 – Phân tích hệ thống
*Thể hiện cái nhìn tổng quan về chức năng qua góc nhìn của người dùng*

**Tác nhân (Actor):**
1. **Khách hàng (Customer):** Mua sắm, tra cứu đơn hàng, tương tác Chatbot.
2. **Quản trị viên (Admin):** Quản lý sản phẩm, đơn hàng, thống kê, nạp dữ liệu (FAQ) cho Chatbot.
3. **Chatbot (Hệ thống):** Tự động trả lời, phân tích ý định, gợi ý mua hàng.

**Use case chính:** 
- Luồng khách hàng: Đặt hàng, Áp dụng khuyến mãi, Hỏi đáp AI.
- Luồng Admin: Quản lý trạng thái đơn, Quản lý kho, Dashboard thống kê.

*(📸 **Ảnh cần chụp:** Bạn hãy chèn `Sơ đồ Use Case tổng quát toàn hệ thống` ở Trang 31 vào slide này để hội đồng nhìn rõ)*

---

## 6. Slide 6 – Thiết kế hệ thống
*Trình bày về mặt kỹ thuật và kiến trúc*

**Kiến trúc tổng thể:**
- Kiến trúc 3 lớp (Three-tier): Presentation Layer (Next.js) ↔ Application Layer (NestJS) ↔ Data Layer (PostgreSQL).

**Cơ sở dữ liệu:**
- Được chuẩn hóa để lưu trữ từ Dữ liệu bán hàng (Product, Order, Category) đến Dữ liệu đào tạo AI (FAQ, Chatbot_Log).

*(📸 **Ảnh cần chụp:**)*
1. Chụp `Biểu đồ triển khai (Deployment Diagram)` ở trang 68.
2. Chụp `Sơ đồ ERD tổng quát` ở Trang 75 (Thu nhỏ vừa vặn).

---

## 7. Slide 7 – Demo: Trải nghiệm mua sắm trực tuyến
*Bắt đầu phần Demo - Giới thiệu tính năng của Khách hàng*

- Giao diện thân thiện, hiện đại, hỗ trợ bộ lọc và tìm kiếm nhanh.
- Luồng mua hàng liền mạch từ Chi tiết sản phẩm -> Giỏ hàng -> Checkout.

*(📸 **Ảnh cần chụp:**)*
1. Chụp ảnh **Trang chủ (Trang 94)** thật đẹp.
2. Chụp ảnh **Trang Đặt hàng & Thanh toán (Trang 98)** hiển thị rõ phần áp mã giảm giá.

---

## 8. Slide 8 – Demo: Tính năng nổi bật - AI Chatbot
*Phần ăn điểm nhất của đồ án, cần tập trung nhấn mạnh*

- Hoạt động 24/7 như một nhân viên Sale thực thụ.
- Hiểu ngôn ngữ tự nhiên thông qua API Gemini.
- Trả lời chính xác về chính sách cửa hàng (nhờ nạp bộ FAQ).
- Trực tiếp hiển thị thẻ sản phẩm (Product Card) ngay trong cửa sổ chat để khách bấm vào mua luôn.

*(📸 **Ảnh cần chụp:**)*
1. Chụp ảnh **Giao diện Chatbot đang hoạt động (Trang 100 hoặc Trang 73)**. Nên chụp lúc Chatbot vừa gợi ý xong 1 sản phẩm có kèm hình ảnh.

---

## 9. Slide 9 – Demo: Hệ thống Quản trị (Admin)
*Giới thiệu tính năng dành cho chủ cửa hàng*

- Bảng điều khiển (Dashboard) trực quan, theo dõi doanh thu theo thời gian thực.
- Thống kê tỷ lệ đơn hàng (Biểu đồ).
- Quản trị bộ dữ liệu FAQ để "dạy" Chatbot dễ dàng trên giao diện UI.

*(📸 **Ảnh cần chụp:**)*
1. Chụp ảnh **Giao diện Dashboard Tổng quan (Trang 99 hoặc 74)** có đầy đủ biểu đồ doanh thu.
2. (Tùy chọn) Chụp ảnh **Giao diện quản lý FAQ** (Từ màn hình ứng dụng thực tế).

---

## 10. Slide 10 – Kết quả đạt được
*Khẳng định sự thành công của đồ án bằng số liệu thực tế*

**Những gì đã làm được:**
- Xây dựng thành công Website hoàn chỉnh đáp ứng đầy đủ yêu cầu nghiệp vụ E-Commerce.
- Chatbot AI hoạt động trơn tru, lấy đúng thông tin từ Database để phản hồi.
- Tự động hóa kiểm thử (Automation Test) thành công 100% (11/11 Test Cases).

**Đánh giá hiệu quả (Hiệu năng):**
- Thông lượng (Throughput) đạt **>360 requests/s**. Thời gian phản hồi siêu tốc **~53ms**.
- Hệ thống phòng thủ bảo mật tốt (Rate Limiting) chặn đứng 100% các request spam.

*(📸 **Ảnh cần chụp:** Bạn mở Terminal chạy lệnh `node run-load-test.js` vừa nãy và chụp lại **Bảng thống kê màu xanh/đỏ** đẹp mắt để cho hội đồng thấy bằng chứng hệ thống chạy cực nhanh)*

---

## 11. Slide 11 – Hạn chế
*Nêu ra một cách trung thực để thấy sự nhìn nhận khách quan*

- **Công nghệ AI:** Chatbot vẫn phụ thuộc vào API của bên thứ 3 (Google Gemini) nên cần kết nối mạng ổn định, thỉnh thoảng có độ trễ của API.
- **Thanh toán:** Cổng thanh toán trực tuyến mới chỉ dừng ở mức môi trường thử nghiệm (Sandbox), chưa cấu hình tài khoản doanh nghiệp thực.
- **Nghiệp vụ:** Chưa có hệ thống quản lý Kho (Inventory) và Vận chuyển đa kho phức tạp.

---

## 12. Slide 12 – Hướng phát triển
*Định hướng tương lai nếu phát triển tiếp*

**Nâng cấp trong tương lai:**
- Áp dụng các mô hình RAG (Retrieval-Augmented Generation) tiên tiến kết hợp Vector Database để Chatbot thông minh và hiểu ngữ cảnh sâu hơn.
- Kết nối API của các đơn vị giao hàng (GHTK, Viettel Post) để tính phí ship theo khoảng cách thực tế.
- Bổ sung hệ thống gửi Email/SMS Marketing tự động.

**Ứng dụng thực tế:**
- Đồ án sẵn sàng để đóng gói và cung cấp cho các shop bán hàng online quy mô vừa và nhỏ.

---

## 13. Slide cuối – Kết luận & Cảm ơn

- **Kết luận:** Đồ án đã giải quyết tốt bài toán thương mại điện tử hiện đại, chứng minh hiệu quả của việc kết hợp AI vào quản lý kinh doanh.
- **Cảm ơn:** Xin chân thành cảm ơn cô **Lưu Thị Thảo** và các thầy cô trong Hội đồng đã lắng nghe và góp ý!
- *Mời quý thầy cô đặt câu hỏi!*
