# Hướng dẫn Tích hợp và Chạy Demo Thanh toán (Nạp / Rút)

Tài liệu này giải thích chi tiết mục đích của các công cụ (PayOS, Ngrok/Localhost.run) và cung cấp luồng test hoàn chỉnh từ A đến Z bằng Postman để bạn có thể tự tin demo.

---

## 1. TỔNG QUAN HỆ THỐNG (Giải thích để Demo)

### 1.1. PayOS đóng vai trò gì?
- **PayOS** là cổng thanh toán trung gian chuyên về chuyển khoản ngân hàng (VietQR).
- Hệ thống của chúng ta sử dụng PayOS để tạo ra một đường link (Checkout URL) chứa mã QR. Khi User quét mã QR đó và chuyển khoản thành công, PayOS sẽ nhận được tiền và có trách nhiệm "báo cáo" về cho Backend của chúng ta biết để cộng tiền cho User.

### 1.2. Tại sao phải dùng Ngrok / localhost.run?
- Khi PayOS nhận được tiền, nó báo cáo về cho Backend thông qua một cơ chế gọi là **Webhook**.
- Nhưng Backend của bạn đang chạy ở máy tính cá nhân (`http://localhost:8080`). Máy chủ của PayOS nằm trên Internet nên **không thể truy cập được vào localhost**.
- **Giải pháp:** Chúng ta dùng công cụ như **Ngrok** hoặc **localhost.run**. Công cụ này sinh ra một đường link Public (Ví dụ: `https://abcd-123.lhr.life`), và nối đường link đó thẳng vào cổng `8080` trên máy bạn. Khi PayOS gửi tín hiệu vào link Public kia, tín hiệu sẽ được chuyển vào thẳng code Spring Boot của bạn.

---

## 2. CHUẨN BỊ MÔI TRƯỜNG TRƯỚC KHI DEMO (RẤT QUAN TRỌNG)

Để hệ thống nhận được tiền tự động, bắt buộc phải setup Webhook trước khi chạy demo.

**Bước 1: Mở cổng mạng (Tunnel)**
- Mở một tab Terminal / PowerShell mới.
- Chạy lệnh sau:
  ```bash
  ngrok http 8080

  ```
/api/payments/payos/webhook



http://localhost:8080/api/auth/login

{
    "email": "email_that_cua_ban@gmail.com",
    "password": "Password!123"
}


{
    "email": "admin@gmail.com",
    "password": "Admin@12345"
}


## 3. NẠP TIỀN TEST

** Kiểm tra số dư**
- **Method:** `GET`
- **URL:** `http://localhost:8080/api/wallets/balance`
- **Header:** `Authorization: Bearer <token_cua_user>`

** Tạo yêu cầu nạp tiền**
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/wallets/deposit`
- **Header:** `Authorization: Bearer <token_cua_user>`
- **Body (JSON):**
  ```json
  {
    "amount": 50000
  }
  ```
- **Kết quả:** Code sẽ trả về một object có chứa `checkoutUrl`.



## 4. LUỒNG TEST: RÚT TIỀN (WITHDRAW) BẰNG POSTMAN

Luồng rút tiền không chạy qua PayOS, mà chạy theo cơ chế: **User yêu cầu -> Tiền bị trừ (đóng băng) -> Admin chuyển khoản bằng tay -> Admin vào code duyệt -> Xong.**

**Bước 1: User yêu cầu rút tiền**
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/wallets/withdraw`
- **Header:** `Authorization: Bearer <token_cua_user>`
- **Body (JSON):**
  ```json
  {
    "amount": 20000
  }
  ```
- Gọi xong, gọi lại API check Balance bạn sẽ thấy tiền bị trừ ngay lập tức. Tiền này đang bị "đóng băng".

**Bước 2: Xem lịch sử giao dịch (Lấy ID)**
- **Method:** `GET`
- **URL:** `http://localhost:8080/api/wallets/transactions`
- **Header:** `Authorization: Bearer <token_cua_user>`
- Kết quả sẽ hiện ra 1 giao dịch có `"transactionType": "WITHDRAW"` và `"status": "PENDING"`.
- **👉 COPY lại cái `"id"` của giao dịch này (Ví dụ: `id: 1`).**

**Bước 3: Admin duyệt giao dịch**
- Giả sử Admin đã mở điện thoại và ck 20k cho User ngoài đời thực. Lúc này Admin sẽ vào duyệt.
- Lấy Token của tài khoản Admin (tài khoản có Role là ADMIN).
- **Method:** `PUT`
- **URL:** `http://localhost:8080/api/admin/wallets/transactions/1/approve` *(Thay số 1 bằng ID bạn vừa copy ở Bước 2).*
- **Header:** `Authorization: Bearer <token_cua_ADMIN>`
- **Kết quả:** Báo `"Withdrawal approved successfully"`. Giao dịch chính thức chuyển thành `SUCCESS`.

*(Trường hợp Admin muốn từ chối rút tiền, chỉ cần gọi API `PUT /api/admin/wallets/transactions/1/reject`. Trạng thái sẽ thành `FAILED` và 20k sẽ được hoàn trả lại ví cho User).*
--------------------------------------------
## 5. TỔNG HỢP CÁC API DÀNH CHO FRONTEND (FE)

Đây là tài liệu tóm tắt các endpoint để các bạn làm Frontend dễ dàng gọi và tích hợp vào giao diện UI.
*Lưu ý: Tất cả các API này đều yêu cầu gửi kèm `Authorization: Bearer <token>` trong Header.*

### 5.1. Lấy số dư ví (Get Balance)
Dùng để hiển thị số dư hiện tại trên thanh điều hướng hoặc trang cá nhân của User.
- **Endpoint:** `GET /api/wallets/balance`
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "balance": 50000.00
  }
  ```

### 5.2. Nạp tiền (Deposit)
Khi User nhập số tiền muốn nạp và bấm nút "Nạp tiền".
- **Endpoint:** `POST /api/wallets/deposit`
- **Body:**
  ```json
  {
    "amount": 50000,
    "returnUrl": "http://localhost:5173/payment-success",
    "cancelUrl": "http://localhost:5173/payment-cancel"
  }
  ```
  *(Truyền thêm `returnUrl` và `cancelUrl` là link trang web React/Vue của FE để PayOS tự động redirect về sau khi thanh toán).*
- **Response (200 OK):**
  ```json
  {
    "checkoutUrl": "https://pay.payos.vn/web/...",
    "qrCode": "00020101021138570010A...",
    "orderCode": 1718449432123
  }
  ```
- **Hành động của FE:** Dùng `window.location.href = response.checkoutUrl` để chuyển hướng User sang màn hình quét QR của PayOS.

### 5.3. Rút tiền (Withdraw)
Khi User nhập số tiền muốn rút và thông tin ngân hàng của họ.
- **Endpoint:** `POST /api/wallets/withdraw`
- **Body:**
  ```json
  {
    "amount": 20000
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": 15,
    "transactionType": "WITHDRAW",
    "amount": 20000.00,
    "status": "PENDING"
  }
  ```
- **Hành động của FE:** Hiện popup thông báo "Yêu cầu rút tiền thành công, đang chờ Admin duyệt" và load lại số dư (lúc này tiền đã tự động bị trừ đi để đưa vào trạng thái đóng băng).

### 5.4. Lịch sử giao dịch (Transaction History)
Hiển thị bảng danh sách các lần nạp/rút tiền của User để họ tiện theo dõi.
- **Endpoint:** `GET /api/wallets/transactions`
- **Response (200 OK):**
  ```json
  [
    {
      "id": 15,
      "transactionType": "WITHDRAW",
      "amount": 20000.00,
      "status": "PENDING",
      "createdAt": "2026-06-16T00:00:00"
    },
    {
      "id": 14,
      "transactionType": "DEPOSIT",
      "amount": 50000.00,
      "status": "SUCCESS",
      "createdAt": "2026-06-15T23:30:00"
    }
  ]
  ```
------------------------------------------------
### Hướng dẫn: Đăng nhập Google (Google Login)
1. **Chuẩn bị cấu hình:**
   - Đảm bảo file `.env` ở Backend đã có `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET`. Hai mã này tạo tại **Google Cloud Console** (API & Services > Credentials).
2. **Luồng hoạt động để Demo:**
   - **Frontend:** Người dùng bấm nút "Login with Google", hiện popup chọn tài khoản.
   - **Lấy Token:** Google trả về cho Frontend một chuỗi mã gọi là `Google Token` (Credential).
   - **Gọi Backend:** Frontend lấy mã Token đó, gọi lên API `POST /api/auth/google`.
   - **Hoàn tất:** Backend nhận Token, xác minh tính hợp lệ với server của Google. Nếu OK, Backend tự động tạo tài khoản (nếu là người mới) và trả về `accessToken` của hệ thống để user đăng nhập thành công.

### Hướng dẫn: Quên mật khẩu (Gửi OTP qua Email)
1. **Chuẩn bị cấu hình:**
   - Trong file `.env` cài đặt email gửi đi: `SPRING_MAIL_USERNAME` (Email của bạn) và `SPRING_MAIL_PASSWORD`.
   - *Lưu ý:* Mật khẩu ở đây là **App Password** (Mật khẩu ứng dụng) lấy trong phần *Bảo mật > Xác minh 2 bước* của tài khoản Google, không phải mật khẩu đăng nhập Gmail thông thường.
-------
### Hướng dẫn: Tích hợp AI Chatbot (Trợ lý Ảo)
1. **Chuẩn bị cấu hình:**
   - Trong file `.env` cần có `GEMINI_API_KEY`. Mã này lấy miễn phí tại **Google AI Studio**.
   - "Não bộ" và luật chơi của AI được cài cắm sẵn ở file `backend/src/main/resources/prompts/system-prompt.txt`.
2. **Luồng hoạt động để Demo (Kỹ thuật System Prompt):**
   - User nhập câu hỏi: *"Làm sao để đăng ký làm Nài Ngựa?"*.
   - Frontend gửi câu hỏi lên API `POST /api/v1/chat`.
   - **Hệ thống xử lý:** Backend sẽ âm thầm đọc nội dung luật chơi từ file `system-prompt.txt`, **ghép chung** với câu hỏi của User rồi mới gửi lên cho Google Gemini. (Quá trình này giúp AI không bịa câu trả lời mà chỉ bám sát luật của hệ thống).
   - **Hoàn tất:** Gemini trả về câu trả lời chính xác, Backend hứng lấy và phản hồi `{"reply": "..."}` cho Frontend hiển thị.
3. **Cách Test bằng Postman (để Demo):**
   - **Method:** `POST`
   - **URL:** `http://localhost:8080/api/v1/chat`
   - **Body (raw, JSON):**
     ```json
     {
       "message": "Xin chào, làm sao để tôi nạp tiền?"
     }
     ```
   - Bấm **Send**, hệ thống sẽ trả về phản hồi chứa thông tin nạp tiền thông qua cổng PayOS (như đã quy định ở file System Prompt).
