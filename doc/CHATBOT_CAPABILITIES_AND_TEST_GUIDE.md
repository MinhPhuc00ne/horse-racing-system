# TÀI LIỆU KHẢ NĂNG CỦA AI CHATBOT VÀ HƯỚNG DẪN KIỂM THỬ THEO VAI TRÒ
*(AI CHATBOT CAPABILITIES & ROLE-BASED TESTING GUIDE)*

---

## 📌 1. TỔNG QUAN VỀ MODULE AI CHATBOT

Module AI Chatbot trong Hệ thống Quản Lý Đua Ngựa được xây dựng với kiến trúc an toàn 2 lớp (Dual-Layer Security) và trải nghiệm người dùng hiện đại:

1. **Phân Quyền Nghiêm Ngặt (Role-Based Security Guardrails)**:
   - **Backend Layer**: `AiActionSecurityValidator.java` chứa Ma trận Phân quyền (`HashMap<Role, Set<String>> ROLE_ALLOWED_ACTIONS`). Mọi phản hồi chứa Action không đúng vai trò sẽ bị loại bỏ lập tức tại server.
   - **Frontend Layer**: `chatActionHandler.js` tự động lọc quyền trước khi thực thi chuyển trang hoặc auto-fill.
2. **Tự Động Chuyển Trang & Mở Form (Form Auto-Fill & Partial Argument Navigation)**:
   - Khi người dùng yêu cầu thực hiện hành động (như Thêm ngựa, Nạp/Rút tiền, Tìm kỵ thủ, Nâng cấp tài khoản), hệ thống sẽ **tự động chuyển hướng tới chính xác URL sub-page**, **tự động mở Modal/Form**, và **tự động điền các thông tin đã biết**.
   - Kể cả khi người dùng nhập **thiếu thông tin** (chỉ bảo *"Thêm ngựa Bạch Long"* mà chưa có tuổi/cân nặng), AI vẫn sinh Action, giao diện vẫn tự động bật Modal và tự động điền sẵn tên `Bạch Long`.
3. **Phân Định Rõ Ràng Luồng Nạp & Rút Tiền**:
   - Phân biệt tuyệt đối giữa `DEPOSIT_FUNDS` (mở tab Nạp tiền PayOS) và `WITHDRAW_FUNDS` (mở tab Rút tiền về Ngân hàng). KHÔNG BỊ LẪN LỘN LUỒNG.
4. **Hiệu Ứng Phản Hồi Tự Nhiên (800ms Natural Execution Delay)**:
   - Thêm khoảng delay 800ms trước khi thực thi Action để tạo cảm giác chân thực rằng AI thực sự đang thao tác thay người dùng.
5. **Quy Tắc An Toàn Cho ADMIN (Manual-Only for Admin)**:
   - Các thao tác Admin như Duyệt nâng cấp, Khóa tài khoản, Tạo giải đấu **TUYỆT ĐỐI KHÔNG TỰ ĐỘNG BẤM DUYỆT**. AI chỉ điều hướng Admin tới đúng sub-page quản trị để Admin kiểm tra và bấm duyệt bằng tay.

---

## 📊 2. MA TRẬN PHÂN QUYỀN HÀNH ĐỘNG (ROLE VS ACTION PERMISSION MATRIX)

## Role vs Action Permission Matrix

| Action Type | Description | GUEST | SPECTATOR | HORSE_OWNER | JOCKEY | RACE_REFEREE | ADMIN |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `NAVIGATE` | Navigate to permitted page | ✅ (Public) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `DEPOSIT_FUNDS` | PayOS VietQR Deposit | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `WITHDRAW_FUNDS` | Request Wallet Withdrawal | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `UPDATE_BANK_INFO` | Prefill Bank Info | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PLACE_BET` | Prefill Bet Placement | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `REQUEST_UPGRADE` | Prefill Role Upgrade Request | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `ADD_HORSE` | Prefill Horse Registration | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `REGISTER_HORSE_RACE` | Register Horse for Tournament | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `SEARCH_JOCKEY` | Search & Contract Jockey | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `VIEW_SCHEDULE` | View Assigned Race Schedule | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| `UPDATE_RACE_RESULT` | Record Race Results / Confirm | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `RECORD_VIOLATION` | Record Violation / Flags | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `APPROVE_UPGRADE` | Approve/Reject Upgrade | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `CREATE_TOURNAMENT` | Create Tournament | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `ASSIGN_REFEREE` | Assign Referee | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `MANAGE_TRANSACTIONS` | Review Withdrawals/Transactions | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `MANAGE_BLACKLIST` | Blacklist Management | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 👥 3. BẢNG CHI TIẾT ĐƯỜNG DẪN URL TUYỆT ĐỐI THEO VAI TRÒ (ROLE URL MAPPING)

| Vai Trò (Role) | Chức Năng Cho Phép | Đường Dẫn URL Tuyệt Đối | Hành Động Tự Động (AI Action) |
|---|---|---|---|
| **GUEST** *(Chưa Đăng Nhập)* | • Hỏi đáp tính năng hệ thống<br>• Hướng dẫn quy trình nạp tiền PayOS<br>• Hướng dẫn đăng ký tài khoản | `http://localhost:5173/login`<br>`http://localhost:5173/signup` | Hướng dẫn đăng nhập / đăng ký. Không sinh Action giao dịch. |
| **SPECTATOR** *(Khán Giả)* | • Nạp tiền qua PayOS<br>• Rút tiền về Ngân hàng<br>• Cập nhật Thông tin Ngân hàng<br>• Đặt cược đua ngựa<br>• Gửi yêu cầu Nâng cấp Role | `http://localhost:5173/spectators/wallet`<br>`http://localhost:5173/spectators/wallet`<br>`http://localhost:5173/spectators/profile`<br>`http://localhost:5173/tournaments`<br>`http://localhost:5173/spectators/upgrade` | • Tự động mở Tab Nạp tiền PayOS & điền số tiền.<br>• Tự động mở Tab Rút tiền & điền số tiền, STK.<br>• Chuyển Profile & điền Ngân hàng & STK.<br>• Mở Modal Đặt cược & điền số tiền.<br>• Mở Modal Nâng cấp & điền thông tin. |
| **HORSE OWNER** *(Chủ Ngựa)* | • Thêm Ngựa mới<br>• Tìm kiếm Kỵ Thủ<br>• Đăng ký Ngựa vào Cuộc đua<br>• Nạp/Rút tiền & Ngân hàng | `http://localhost:5173/owner/stable`<br>`http://localhost:5173/owner/friends`<br>`http://localhost:5173/owner/entries`<br>`http://localhost:5173/owner/financials` | • **Tự động mở Modal Thêm Ngựa** & điền tên, giống, tuổi, cân nặng.<br>• Mở sub-tab Tìm kiếm, điền từ khóa & **Kích hoạt tìm kiếm lập tức**.<br>• Chuyển hướng trang Đăng ký cuộc đua.<br>• Chuyển hướng Quản lý Tài chính. |
| **JOCKEY** *(Kỵ Thủ)* | • Xem Lịch đua cá nhân<br>• Sửa Ngân hàng & Hồ sơ<br>• Quản lý Ví & Nạp/Rút | `http://localhost:5173/jockey/races`<br>`http://localhost:5173/jockey/profile`<br>`http://localhost:5173/jockey/financials` | • Chuyển hướng trang Lịch đua.<br>• Tự động điền Ngân hàng & STK tại Profile.<br>• Chuyển hướng Quản lý Tài chính & Ví. |
| **RACE REFEREE** *(Trọng Tài)* | • Xem Giải đấu phân công<br>• Xác nhận kết quả trận đấu<br>• Viết phiếu phạt / Vi phạm<br>• Sửa Thông tin & Ngân hàng | `http://localhost:5173/referee/assigned-tournaments`<br>`http://localhost:5173/referee/confirm-results`<br>`http://localhost:5173/referee/violations`<br>`http://localhost:5173/referee/profile` | • Chuyển hướng Bảng phân công Trọng tài.<br>• Chuyển tới trang Xác nhận kết quả trận đấu.<br>• Chuyển tới trang Viết phiếu phạt vi phạm.<br>• Tự động điền Ngân hàng & STK tại Profile. |
| **ADMIN** *(Quản Trị Viên)* | • Duyệt Nâng Cấp Role<br>• Quản Lý & Tạo Giải Đấu<br>• Quản Lý Rút Tiền<br>• Admin Nạp/Rút Ví Cá Nhân<br>• Quản Lý Danh Sách Chặn | `http://localhost:5173/admin/upgradeuserrole`<br>`http://localhost:5173/admin/tournamentmanagement`<br>`http://localhost:5173/admin/transactions`<br>`http://localhost:5173/admin/my-wallet`<br>`http://localhost:5173/admin/blacklist` | • **ĐIỀU HƯỚNG TRANG DẤU VẾT**. Tuyệt đối **KHÔNG TỰ ĐỘNG BẤM DUYỆT**. Admin tự xem xét và nhấn nút thủ công.<br>• Chuyển tới trang Ví cá nhân Admin để Nạp/Rút.<br>• Chuyển tới trang Danh sách chặn. |

---

## 🧪 4. QUY TRÌNH KIỂM THỬ CHI TIẾT (TESTING PROCEDURE VIA TEST ACCOUNTS)

Căn cứ danh sách 36 tài khoản test tại `TEST_ACCOUNTS.md`:

### 🔑 THÔNG TIN MẬT KHẨU CHUNG:
- Mật khẩu Admin (`admin`): `Admin@12345`
- Mật khẩu tất cả 35 tài khoản test khác: `SlimeTempest@2026`

---

### KỊCH BẢN 1: TEST ROLE GUEST (Khách Chưa Đăng Nhập)
- **Thao tác**: Mở trình duyệt ở tab ẩn danh (chưa Đăng nhập).
- **Test Case 1.1**: Chat *"Hệ thống này có những giải đua nào?"*
  - **Kỳ vọng**: AI giải thích lịch sự các giải đua, khuyên đăng nhập/đăng ký.
- **Test Case 1.2 (Chặn Action khi chưa Login)**: Chat *"Nạp 100,000đ cho tôi qua PayOS"*
  - **Kỳ vọng**: AI **từ chối tạo Action**, thông báo cần đăng nhập để nạp tiền. Không xuất hiện nút bấm.
- **Test Case 1.3 (Nội dung ngoài phạm vi)**: Chat *"Viết bài thơ về mùa thu"* hoặc *"Công thức nấu phở bò"*
  - **Kỳ vọng**: AI từ chối lịch sự: *"Tôi là Trợ lý Đua ngựa ảo. Tôi chỉ hỗ trợ các thông tin và thao tác liên quan tới Hệ thống Đua ngựa..."*

---

### KỊCH BẢN 2: TEST ROLE SPECTATOR (Khán Giả)
- **Tài khoản test**: `shuna` (`shuna@tempest.com` / `SlimeTempest@2026`)
- **Test Case 2.1 (Nạp tiền PayOS)**: Chat *"Tôi muốn nạp 100,000đ qua PayOS"*
  - **Kỳ vọng**: Delay 800ms -> Chuyển hướng tới `http://localhost:5173/spectators/wallet` -> **Mở Tab Nạp tiền** -> Tự động điền số tiền `100,000`.
- **Test Case 2.2 (Rút tiền về Ngân hàng)**: Chat *"Tôi muốn rút 50,000đ về Vietcombank STK 123456789"*
  - **Kỳ vọng**: Delay 800ms -> Chuyển hướng tới `http://localhost:5173/spectators/wallet` -> **Mở Tab Rút tiền** -> Tự động điền 50,000đ, Vietcombank & STK.
- **Test Case 2.3 (Cập nhật Ngân hàng)**: Chat *"Cập nhật tài khoản ngân hàng Vietcombank số 99998888"*
  - **Kỳ vọng**: Chuyển hướng tới `http://localhost:5173/spectators/profile` -> Tự động điền Vietcombank & STK.
- **Test Case 2.4 (Nâng cấp tài khoản)**: Chat *"Nâng cấp lên Chủ Ngựa tên chuồng Ngựa Shuna địa chỉ Tempest"*
  - **Kỳ vọng**: Chuyển hướng tới `http://localhost:5173/spectators/upgrade` -> Tự động chọn HORSE_OWNER và điền Tên chuồng, Địa chỉ.

---

### KỊCH BẢN 3: TEST ROLE HORSE OWNER (Chủ Ngựa)
- **Tài khoản test**: `benimaru` (`benimaru@tempest.com` / `SlimeTempest@2026`)
- **Test Case 3.1 (Thêm ngựa mới)**: Chat *"Thêm cho tôi con ngựa Xích Thố, giống Thoroughbred, 4 tuổi, cân nặng 450kg"*
  - **Kỳ vọng**: Delay 800ms -> Chuyển tới `http://localhost:5173/owner/stable` -> **Tự động mở Modal Thêm Ngựa Mới** -> Điền sẵn Xích Thố, Thoroughbred, 4, 450.
- **Test Case 3.2 (Tìm kiếm Kỵ thủ & Tự động chạy truy vấn)**: Chat *"Tìm cho tôi kỵ thủ Diablo"*
  - **Kỳ vọng**: Chuyển tới `http://localhost:5173/owner/friends` -> Mở sub-tab Tìm kiếm -> Điền "Diablo" vào ô Search & **Tự động kích hoạt tải danh sách tìm kiếm trên màn hình**.

---

### KỊCH BẢN 4: TEST ROLE JOCKEY (Kỵ Thủ)
- **Tài khoản test**: `diablo` (`diablo@tempest.com` / `SlimeTempest@2026`)
- **Test Case 4.1 (Cập nhật Ngân hàng Profile)**: Chat *"Cập nhật tài khoản ngân hàng Vietcombank STK 88889999"*
  - **Kỳ vọng**: Delay 800ms -> Chuyển hướng tới `http://localhost:5173/jockey/profile` -> Tự động điền Vietcombank & STK.
- **Test Case 4.2 (Xem lịch đua)**: Chat *"Cho tôi xem lịch đua sắp tới của tôi"*
  - **Kỳ vọng**: Delay 800ms -> Chuyển hướng tới `http://localhost:5173/jockey/races`.

---

### KỊCH BẢN 5: TEST ROLE RACE REFEREE (Trọng Tài)
- **Tài khoản test**: `guy_crimson` (`guy.crimson@tempest.com` / `SlimeTempest@2026`)
- **Test Case 5.1 (Xác nhận trận đấu)**: Chat *"Xác nhận kết quả trận đấu"*
  - **Kỳ vọng**: Delay 800ms -> Chuyển hướng tới `http://localhost:5173/referee/confirm-results`.
- **Test Case 5.2 (Viết phiếu phạt)**: Chat *"Viết phiếu phạt vi phạm"*
  - **Kỳ vọng**: Delay 800ms -> Chuyển hướng tới `http://localhost:5173/referee/violations`.
- **Test Case 5.3 (Sửa ngân hàng Profile)**: Chat *"Cập nhật ngân hàng Vietcombank 77778888"*
  - **Kỳ vọng**: Delay 800ms -> Chuyển hướng tới `http://localhost:5173/referee/profile` -> Tự động điền thông tin.

---

### KỊCH BẢN 6: TEST ROLE ADMIN (Quản Trị Viên)
- **Tài khoản test**: `admin` (`admin@gmail.com` / `Admin@12345`)
- **Test Case 6.1 (Quản lý Rút tiền)**: Chat *"Quản lý đơn rút tiền"*
  - **Kỳ vọng**: Delay 800ms -> Chuyển hướng tới `http://localhost:5173/admin/transactions`.
- **Test Case 6.2 (Admin Nạp / Rút ví cá nhân)**: Chat *"Tôi muốn nạp 500,000đ vào ví Admin"*
  - **Kỳ vọng**: Delay 800ms -> Chuyển hướng tới `http://localhost:5173/admin/my-wallet` -> Mở form Nạp tiền.
- **Test Case 6.3 (Quản lý Danh sách chặn)**: Chat *"Mở quản lý danh sách chặn"*
  - **Kỳ vọng**: Delay 800ms -> Chuyển hướng tới `http://localhost:5173/admin/blacklist`.
