# Hướng dẫn Chuẩn bị Đưa Hệ Thống Lên Môi Trường Thực Tế (Production Guide)

Tài liệu này hướng dẫn chi tiết 2 bước quan trọng nhất trước khi public hệ thống E-commerce của bạn: **Test Hiệu Năng (Load Testing) với JMeter** và **Thiết lập Bảo mật SSL (HTTPS) cho Server**.

---

## Phần 1: Hướng Dẫn Chạy Kịch Bản Test Hiệu Năng (JMeter)

> [!NOTE]
> Mục tiêu của việc này là giả lập có hàng trăm/hàng ngàn người dùng cùng truy cập vào website của bạn cùng một lúc để xem server có bị treo hay không.

### Bước 1: Cài đặt công cụ
1. **Cài đặt Java:** JMeter yêu cầu Java 8 trở lên. Tải và cài đặt [Java JRE/JDK](https://www.oracle.com/java/technologies/downloads/).
2. **Tải Apache JMeter:** 
   - Truy cập trang [Apache JMeter Downloads](https://jmeter.apache.org/download_jmeter.cgi) và tải file `.zip` (ví dụ: `apache-jmeter-5.6.3.zip`).
   - Giải nén file ra ổ đĩa của bạn (ví dụ: `C:\apache-jmeter`).

### Bước 2: Mở file kịch bản
1. Vào thư mục `bin` của JMeter vừa giải nén (ví dụ: `C:\apache-jmeter\bin`).
2. Mở file **`jmeter.bat`** (trên Windows) để khởi động giao diện JMeter.
3. Trong JMeter, chọn **File > Open**, sau đó điều hướng tới thư mục dự án của bạn và chọn file:
   `docs/jmeter_test_plan.jmx`

### Bước 3: Cấu hình tải (Load Configuration)
1. Ở cột bên trái, bấm vào biểu tượng mở rộng của **Thread Group (Khách hàng truy cập)**.
2. Tại đây, bạn có thể chỉnh sửa các thông số:
   - **Number of Threads (users):** Số lượng người dùng ảo. (Bắt đầu thử với `50`, sau đó tăng lên `100`, `500`).
   - **Ramp-up period (seconds):** Thời gian để đạt được số lượng người dùng trên. (Ví dụ: 50 users trong 10 giây => mỗi giây thêm 5 user).
   - **Loop Count:** Số lần lặp lại kịch bản (để là `1` để chạy 1 vòng).
3. **Cấu hình IP:** Bấm vào **HTTP Request Defaults**. Sửa ô `Server Name or IP` thành địa chỉ IP server của bạn (hoặc giữ `localhost` nếu test tại máy cá nhân).

### Bước 4: Bắt đầu Test & Xem kết quả
1. Bấm nút **Play màu xanh lá cây** trên thanh công cụ trên cùng để bắt đầu chạy.
2. Nhìn cột bên trái, bấm vào **View Results Tree** (để xem chi tiết từng request báo đỏ hay xanh).
3. Bấm vào **Summary Report** để xem chỉ số tổng quan. Các chỉ số cần quan tâm nhất:
   - **Error %:** Tỉ lệ lỗi (Càng gần 0% càng tốt. Nếu vượt quá 5% nghĩa là server đang bị quá tải, sập).
   - **Throughput:** Số Request / Giây server xử lý được (Càng cao càng tốt).
   - **Average:** Thời gian phản hồi trung bình (Cần dưới `500ms` là tốt, vượt qua `2000ms` là web đang rất lag).

---

## Phần 2: Hướng Dẫn Thiết Lập Bảo Mật SSL (HTTPS) cho Server

> [!IMPORTANT]
> Hướng dẫn này giả định bạn đang sử dụng một Server (VPS) chạy hệ điều hành **Ubuntu/Debian Linux**. Hệ thống của chúng ta chạy Node.js ở các port (3000, 3001), chúng ta sẽ dùng Nginx làm "bảo vệ cổng" (Reverse Proxy) để gắn SSL.

### Bước 1: Cài đặt Nginx
Truy cập SSH vào server của bạn và chạy lệnh:
```bash
sudo apt update
sudo apt install nginx -y
```

### Bước 2: Cấu hình Nginx kết nối với Next.js & NestJS
Tạo một file cấu hình cho domain của bạn:
```bash
sudo nano /etc/nginx/sites-available/ecommerce
```
Dán cấu hình sau vào (thay `yourdomain.com` bằng tên miền thực của bạn):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com api.yourdomain.com;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (NestJS)
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Lưu file (`Ctrl+O`, `Enter`, `Ctrl+X`). Sau đó kích hoạt cấu hình và khởi động lại Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```
Lúc này website của bạn đã có thể truy cập qua `http://yourdomain.com`.

### Bước 3: Cài đặt SSL miễn phí với Certbot (Let's Encrypt)
Chạy các lệnh sau để cài đặt công cụ Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

Chạy lệnh lấy chứng chỉ (Nó sẽ tự động tìm Nginx và cấu hình lại HTTPS cho bạn):
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

Làm theo hướng dẫn trên màn hình (nhập email, đồng ý điều khoản). Certbot sẽ hỏi bạn có muốn tự động chuyển hướng (Redirect) HTTP sang HTTPS không, hãy chọn **2 (Redirect)**.

### Bước 4: Kiểm tra gia hạn tự động
Chứng chỉ Let's Encrypt có hạn 90 ngày. Certbot đã tự động thêm lịch gia hạn. Bạn có thể test lệnh gia hạn bằng:
```bash
sudo certbot renew --dry-run
```
Nếu không báo lỗi gì, hệ thống của bạn đã được bảo vệ bằng HTTPS (Ổ khóa xanh) vĩnh viễn và hoàn toàn tự động!

> [!TIP]
> Sau khi cài SSL thành công, hãy nhớ vào file `frontend/.env` và `backend/.env` để cập nhật các đường dẫn từ `http://` sang `https://` nhé.
