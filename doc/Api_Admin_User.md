# Tài liệu API - Quản lý Người dùng dành cho Admin (Api_Admin_User)

Tài liệu này đặc tả toàn bộ các API Backend phục vụ chức năng quản lý người dùng (User CRUD) dành riêng cho vai trò **Admin**, hỗ trợ tìm kiếm, lọc, tạo mới, chỉnh sửa trạng thái/quyền hạn và xóa tài khoản người dùng trong hệ thống.

> [!NOTE]
> Tất cả các API yêu cầu xác thực người dùng qua mã Token JWT ở Header dưới dạng `Authorization: Bearer <TOKEN>` và tài khoản đăng nhập phải có vai trò `ADMIN`.

---

## BẢNG TỔNG HỢP API QUẢN LÝ NGƯỜI DÙNG

| Stt | API Endpoint | Phương thức | Mô tả |
| :--- | :--- | :--- | :--- |
| 1 | `/api/admin/users` | `GET` | Lấy danh sách người dùng (hỗ trợ tìm kiếm, lọc theo vai trò và trạng thái hoạt động) |
| 2 | `/api/admin/users/{id}` | `GET` | Lấy chi tiết thông tin một người dùng theo ID |
| 3 | `/api/admin/users` | `POST` | Tạo mới một tài khoản người dùng (tự động tạo hồ sơ vai trò nếu là Jockey hoặc Horse Owner) |
| 4 | `/api/admin/users/{id}` | `PUT` | Cập nhật thông tin người dùng (hỗ trợ đổi mật khẩu, phân lại vai trò và kích hoạt/khóa tài khoản) |
| 5 | `/api/admin/users/{id}` | `DELETE` | Xóa người dùng (tự động dọn dẹp các hồ sơ rác liên quan, chặn xóa nếu có dữ liệu giao dịch phát sinh) |

---

## CHI TIẾT CÁC API VÀ ĐỊNH DẠNG DỮ LIỆU

### 1. Lấy danh sách người dùng (`GET /api/admin/users`)
Truy vấn danh sách tất cả tài khoản người dùng trong hệ thống, hỗ trợ các tham số tìm kiếm và bộ lọc linh hoạt.

* **Headers**: `Authorization: Bearer <TOKEN>`
* **Query Parameters** (Tùy chọn):
  * `search` (String): Từ khóa tìm kiếm (khớp theo Tên đầy đủ, Email hoặc Username - không phân biệt hoa thường).
  * `role` (String): Lọc theo vai trò của người dùng (`ADMIN`, `SPECTATOR`, `HORSE_OWNER`, `JOCKEY`, `RACE_REFEREE`).
  * `enabled` (Boolean): Lọc theo trạng thái hoạt động (`true`: Đang kích hoạt, `false`: Bị khóa).
* **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "username": "owner1",
      "email": "owner1@test.com",
      "fullName": "Test HORSE_OWNER 1",
      "role": "HORSE_OWNER",
      "provider": "LOCAL",
      "enabled": true,
      "createdAt": "2026-06-19T09:10:35"
    },
    {
      "id": 2,
      "username": "jockey1",
      "email": "jockey1@test.com",
      "fullName": "Test JOCKEY 1",
      "role": "JOCKEY",
      "provider": "LOCAL",
      "enabled": false,
      "createdAt": "2026-06-19T09:11:00"
    }
  ]
  ```

---

### 2. Xem chi tiết người dùng (`GET /api/admin/users/{id}`)
Lấy thông tin chi tiết của một tài khoản cụ thể dựa trên ID.

* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "username": "owner1",
    "email": "owner1@test.com",
    "fullName": "Test HORSE_OWNER 1",
    "role": "HORSE_OWNER",
    "provider": "LOCAL",
    "enabled": true,
    "createdAt": "2026-06-19T09:10:35"
  }
  ```
* **Response (404 Not Found)**: Nếu không tìm thấy người dùng có ID tương ứng.
  ```json
  {
    "status": 404,
    "message": "User not found with ID: 999"
  }
  ```

---

### 3. Tạo mới tài khoản người dùng (`POST /api/admin/users`)
Cho phép Admin chủ động khởi tạo một tài khoản người dùng mới. Nếu gán vai trò là `HORSE_OWNER` hoặc `JOCKEY`, hệ thống sẽ tự động tạo hồ sơ chi tiết tương ứng (`HorseOwnerProfile` / `JockeyProfile`) với trạng thái đã duyệt (`APPROVED`).

* **Headers**: `Authorization: Bearer <TOKEN>`
* **Request Body** (`application/json`):
  ```json
  {
    "username": "newreferee",
    "email": "newreferee@gmail.com",
    "fullName": "Trọng tài Mới",
    "password": "Password123!",
    "phone": "0912345678",
    "avatarUrl": "https://example.com/avatar.jpg",
    "role": "RACE_REFEREE",
    "enabled": true
  }
  ```
  > [!IMPORTANT]
  > Mật khẩu bắt buộc phải có độ dài từ 8 đến 100 ký tự, chứa ít nhất một chữ cái viết hoa và một ký tự đặc biệt.
* **Response (201 Created)**: Trả về tài khoản vừa khởi tạo thành công.
  ```json
  {
    "id": 15,
    "username": "newreferee",
    "email": "newreferee@gmail.com",
    "fullName": "Trọng tài Mới",
    "role": "RACE_REFEREE",
    "provider": "LOCAL",
    "enabled": true,
    "createdAt": "2026-06-19T22:30:00"
  }
  ```
* **Response (400 Bad Request)**: Trả về lỗi khi vi phạm ràng buộc (Email/Username đã đăng ký hoặc mật khẩu yếu).
  ```json
  {
    "status": 400,
    "message": "Email is already registered"
  }
  ```

---

### 4. Cập nhật thông tin người dùng (`PUT /api/admin/users/{id}`)
Cập nhật một hoặc nhiều thông tin của tài khoản. Nếu thay đổi quyền (`role`), hệ thống tự động khởi tạo hồ sơ dữ liệu mới nếu trước đó vai trò cũ không sở hữu.

* **Headers**: `Authorization: Bearer <TOKEN>`
* **Request Body** (`application/json` - tất cả các trường đều là tùy chọn):
  ```json
  {
    "fullName": "Tên Cập Nhật",
    "phone": "0988888888",
    "avatarUrl": "https://example.com/new_avatar.jpg",
    "role": "JOCKEY",
    "enabled": false,
    "password": "NewPassword123!"
  }
  ```
* **Response (200 OK)**: Trả về thông tin chi tiết sau khi cập nhật.
  ```json
  {
    "id": 15,
    "username": "newreferee",
    "email": "newreferee@gmail.com",
    "fullName": "Tên Cập Nhật",
    "role": "JOCKEY",
    "provider": "LOCAL",
    "enabled": false,
    "createdAt": "2026-06-19T22:30:00"
  }
  ```

---

### 5. Xóa tài khoản người dùng (`DELETE /api/admin/users/{id}`)
Cho phép xóa tài khoản người dùng khỏi hệ thống.
* Hệ thống sẽ tự động tìm kiếm và xóa các thực thể hồ sơ đi kèm như `HorseOwnerProfile` hay `JockeyProfile` trước để đảm bảo không bị lỗi ràng buộc khóa ngoại đơn giản.
* **Quy tắc an toàn tài chính**: Nếu người dùng đã phát sinh các dữ liệu giao dịch phức tạp (ví dụ: đã đặt cược giải đấu, có giao dịch ví điện tử, sở hữu ngựa đã được đăng ký chạy đua), hệ thống sẽ từ chối xóa và yêu cầu Admin đổi trạng thái hoạt động sang khóa tài khoản (`enabled = false`) thay thế.

* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response (200 OK)**: Xóa thành công.
  ```json
  {
    "message": "User deleted successfully"
  }
  ```
* **Response (400 Bad Request)**: Từ chối xóa do ràng buộc giao dịch.
  ```json
  {
    "status": 400,
    "message": "Cannot delete user because they have active transactional data (bets, races, etc.). Consider deactivating/disabling the user instead."
  }
  ```
