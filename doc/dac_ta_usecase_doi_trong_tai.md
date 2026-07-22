# ĐẶC TẢ USE CASE: TRỌNG TÀI HỦY PHÂN CÔNG GIẢI ĐẤU

Tài liệu này đặc tả chi tiết quy định và chức năng **Trọng tài hủy phân công giải đấu** trong hệ thống Quản lý đua ngựa.

---

## UC-01: Trọng tài tự hủy phân công trước khi đóng đăng ký giải đấu (Referee Self-cancels Assignment)

### a. Functionalities (Chức năng)
Cho phép Trọng tài chủ động hủy việc được phân công vào một Giải đấu mà không cần Admin phê duyệt, miễn là thời gian giải đấu vẫn chưa đóng đăng ký (trước `registration_deadline`).

### b. Bản mô tả Use Case (Functional Description)

| Thành phần mô tả | Nội dung chi tiết |
| :--- | :--- |
| **UC ID and Name** | **UC-01: Trọng tài tự hủy phân công trước khi đóng đăng ký** |
| **Primary Actor** | Trọng tài cuộc đua (`RACE_REFEREE`) |
| **Secondary Actors** | Hệ thống |
| **Trigger** | Trọng tài chọn "Hủy tham gia" đối với giải đấu được phân công. |
| **Description** | Trọng tài có thể tự hủy việc tham gia quản lý giải đấu nếu giải đấu vẫn đang trong thời hạn mở đăng ký (chưa tới hạn `registration_deadline`). Việc hủy có hiệu lực ngay lập tức, gỡ tên Trọng tài khỏi Giải đấu và toàn bộ các Vòng đua (Races) liên quan. |
| **Preconditions** | 1. Trọng tài đã đăng nhập và đang được phân công quản lý giải đấu.<br>2. Thời điểm hiện tại phải trước thời gian `registration_deadline` của giải đấu. |
| **Postconditions** | Trọng tài được gỡ khỏi giải đấu (cột `referee_id` trong bảng `tournaments` và bảng `races` đều được cập nhật thành `NULL`). |
| **Normal Flow** | 1. Trọng tài xem thông tin giải đấu mà mình đang được phân công.<br>2. Trọng tài nhấn nút "Hủy tham gia".<br>3. Hệ thống hiển thị hộp thoại xác nhận.<br>4. Trọng tài xác nhận hủy.<br>5. Hệ thống kiểm tra thời gian hiện tại so với `registration_deadline`.<br>6. Hệ thống thực hiện cập nhật DB (gỡ `referee_id` của giải đấu và các vòng đua liên quan).<br>7. Hệ thống thông báo thành công. |
| **Exceptions** | **Ngoại lệ (Quá hạn hủy):** Nếu thời điểm hiện tại đã vượt qua `registration_deadline`, nút hủy bị vô hiệu hóa và backend chặn với thông báo lỗi `"Cannot cancel assignment after registration has closed"`. |
| **Business Rules** | • Việc hủy phân công chỉ HỢP LỆ khi thời điểm hiện tại < `registration_deadline`.<br>• Sau khi giải đấu đã đóng cổng đăng ký dành cho chủ ngựa, Trọng tài KHÔNG ĐƯỢC PHÉP hủy phân công. |
| **Other Information** | **Endpoint API:** `PUT /api/referee/tournaments/{tournamentId}/cancel-assignment`<br>**Response:** `{"message": "Successfully cancelled assignment for the tournament."}` |
