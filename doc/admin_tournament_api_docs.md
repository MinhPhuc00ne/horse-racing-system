# Hướng dẫn Tích hợp API: Admin Tạo Giải đấu & Vòng đua

Tài liệu này tổng hợp toàn bộ các API đã hoàn thiện phục vụ cho luồng **Admin tạo giải đấu và vòng đua**. 

---

## I. Chi tiết các API của Admin

### 1. Upload ảnh đại diện giải đấu
* **API Endpoint**: `POST /api/files/upload`
* **Mô tả**: Dùng để tải lên ảnh đại diện của giải đấu lên server.
* **Headers**: 
  * `Content-Type: multipart/form-data`
* **Request Body (form-data)**:
  * Key: `files` (chọn kiểu File, hỗ trợ upload nhiều ảnh cùng lúc)
* **Response (JSON)**:
  ```json
  [
    "/uploads/6a4b3d7c-8e9f-4b3c-9a1b-2c3d4e5f6g7h.jpg"
  ]
  ```

---

### 2. Lấy danh sách Sân thi đấu (Venue / Track)
* **API Endpoint**: `GET /api/admin/tracks`
* **Mô tả**: Lấy toàn bộ danh sách các sân đua hiện có để đưa vào Cascading Dropdown (Chọn Sân đua).
* **Headers**: 
  * `Authorization: Bearer <access_token_cua_admin>`
* **Response (JSON)**:
  ```json
  [
    {
      "id": 1,
      "name": "Grand National Track",
      "location": "City Center",
      "surfaceCondition": "Good"
    }
  ]
  ```
  * **Cách tích hợp lên UI**: 
    1. Nhóm các phần tử theo thuộc tính `location` để làm dropdown **Khu vực tổ chức (Region)**.
    2. Khi chọn Region, hiển thị các sân thuộc Region đó trong dropdown **Sân thi đấu (Venue)**.
    3. Hiển thị thông số `surfaceCondition` (Độ sạch mặt sân/Loại cỏ...) ở chế độ chỉ đọc (Read-only).

---

### 3. Lấy danh sách Trọng tài (Race Referee)
* **API Endpoint**: `GET /api/admin/referees`
* **Mô tả**: Lấy toàn bộ danh sách người dùng có vai trò là Trọng tài (`RACE_REFEREE`) để đưa vào dropdown Chọn Trọng tài khi tạo giải đấu/vòng đua.
* **Headers**: 
  * `Authorization: Bearer <access_token_cua_admin>`
* **Response (JSON)**:
  ```json
  [
    {
      "id": 3,
      "username": "referee_john",
      "email": "referee@gmail.com",
      "fullName": "Nguyễn Văn Trọng Tài",
      "role": "RACE_REFEREE",
      "provider": "LOCAL",
      "enabled": true,
      "createdAt": "2026-06-15T12:00:00"
    }
  ]
  ```

---

### 4. Tạo Giải Đấu (Tournament)
* **API Endpoint**: `POST /api/admin/tournaments`
* **Mô tả**: Tạo giải đấu mới. Giải đấu mới tạo sẽ mặc định ở trạng thái `"Upcoming"`.
* **Headers**:
  * `Authorization: Bearer <access_token_cua_admin>`
  * `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "tournamentName": "Spring Championship 2026",
    "location": "City Center",
    "description": "Giải vô địch mùa xuân năm 2026.",
    "registrationOpeningTime": "2026-06-15T08:00:00",
    "registrationDeadline": "2026-06-20T17:00:00",
    "officialRaceTime": "2026-07-01T09:00:00",
    "minSlots": 8,
    "maxSlots": 8,
    "startDate": "2026-07-01",
    "endDate": "2026-07-15",
    "prizeFirst": 50000000.00,
    "prizeSecond": 25000000.00,
    "prizeThird": 10000000.00,
    "minBetAmount": 50000.00,
    "imageUrl": "/uploads/6a4b3d7c-8e9f-4b3c-9a1b-2c3d4e5f6g7h.jpg",
    "refereeId": 3,
    "entryFee": 100000.00,
    "allowedClasses": "A,B",
    "allowedAges": "2-3,4-6",
    "allowedGenders": "Male,Female"
  }
  ```
* **Response (JSON)**:
  ```json
  {
    "id": 1,
    "tournamentName": "Spring Championship 2026",
    "location": "City Center",
    "description": "Giải vô địch mùa xuân năm 2026.",
    "registrationOpeningTime": "2026-06-15T08:00:00",
    "registrationDeadline": "2026-06-20T17:00:00",
    "officialRaceTime": "2026-07-01T09:00:00",
    "minSlots": 8,
    "maxSlots": 8,
    "startDate": "2026-07-01",
    "endDate": "2026-07-15",
    "totalPrize": 85000000.00,
    "tournamentStatus": "Upcoming",
    "prizeFirst": 50000000.00,
    "prizeSecond": 25000000.00,
    "prizeThird": 10000000.00,
    "minBetAmount": 50000.00,
    "imageUrl": "/uploads/6a4b3d7c-8e9f-4b3c-9a1b-2c3d4e5f6g7h.jpg",
    "refereeId": 3,
    "refereeName": "Nguyễn Văn Trọng Tài",
    "entryFee": 100000.00,
    "allowedClasses": "A,B",
    "allowedAges": "2-3,4-6",
    "allowedGenders": "Male,Female",
    "createdAt": "2026-06-15T13:42:00.000",
    "updatedAt": "2026-06-15T13:42:00.000"
  }
  ```

---

### 5. Cập nhật Giải đấu (Tournament)
* **API Endpoint**: `PUT /api/admin/tournaments/{id}`
* **Mô tả**: Cập nhật thông tin giải đấu. Lưu ý: Không thể cập nhật giải đấu đã ở trạng thái `Finished` hoặc `Cancelled`.
* **Headers**:
  * `Authorization: Bearer <access_token_cua_admin>`
  * `Content-Type: application/json`
* **Request Body (JSON)**: (Tương tự như dữ liệu Tạo giải đấu ở phần 4)
* **Response (JSON)**: Trả về thông tin giải đấu sau khi cập nhật (TournamentResponse).

---

### 6. Cập nhật Trạng thái Giải đấu (Tournament Status)
* **API Endpoint**: `PUT /api/admin/tournaments/{id}/status`
* **Mô tả**: Thay đổi trạng thái giải đấu nhanh chóng (ví dụ: kích hoạt hoặc hủy giải đấu).
* **Headers**:
  * `Authorization: Bearer <access_token_cua_admin>`
  * `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "status": "Active"
  }
  ```
  *(Các trạng thái hợp lệ: `"Upcoming"`, `"Active"`, `"Finished"`, `"Cancelled"`)*
* **Response (JSON)**: Trả về thông tin giải đấu sau khi đổi trạng thái (TournamentResponse).

---

### 7. Xóa Giải đấu (Delete Tournament)
* **API Endpoint**: `DELETE /api/admin/tournaments/{id}`
* **Mô tả**: Xóa giải đấu. Lưu ý: Chỉ có thể xóa giải đấu **chưa tạo vòng đua (Races)** nào. Nếu đã có vòng đua, hệ thống sẽ trả về lỗi `400` yêu cầu đổi trạng thái giải đấu sang `Cancelled` thay vì xóa để tránh lỗi dữ liệu.
* **Headers**:
  * `Authorization: Bearer <access_token_cua_admin>`
* **Response (JSON)**:
  ```json
  {
    "message": "Tournament deleted successfully"
  }
  ```

---

### 8. Tạo Vòng Đua (Race)
* **API Endpoint**: `POST /api/admin/races`
* **Mô tả**: Tạo vòng đua cụ thể thuộc một giải đấu vừa được tạo. Vòng đua mới tạo mặc định ở trạng thái `"OPEN_FOR_REGISTER"`.
* **Headers**:
  * `Authorization: Bearer <access_token_cua_admin>`
  * `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "raceName": "Vòng loại 1",
    "tournamentId": 1,
    "raceTrackId": 1,
    "raceDate": "2026-07-01",
    "startTime": "09:00:00",
    "endTime": "10:30:00",
    "raceRound": 1,
    "maxHorses": 8,
    "distance": 1200.0,
    "surfaceType": "Grass",
    "weather": "Sunny",
    "refereeId": 3
  }
  ```
* **Response (JSON)**:
  ```json
  {
    "id": 5,
    "raceName": "Vòng loại 1",
    "tournamentId": 1,
    "tournamentName": "Spring Championship 2026",
    "raceTrackId": 1,
    "raceTrackName": "Grand National Track",
    "raceDate": "2026-07-01",
    "startTime": "09:00:00",
    "endTime": "10:30:00",
    "raceRound": 1,
    "maxHorses": 8,
    "distance": 1200.0,
    "surfaceType": "Grass",
    "weather": "Sunny",
    "status": "OPEN_FOR_REGISTER",
    "refereeId": 3,
    "refereeName": "Nguyễn Văn Trọng Tài"
  }
  ```

---

### 9. Lấy danh sách đăng ký tham gia (Race Registrations)
* **API Endpoint**: `GET /api/admin/race-registrations`
* **Mô tả**: Admin lấy danh sách tất cả các đơn đăng ký thi đấu của các chủ ngựa để tiến hành duyệt/từ chối.
* **Headers**:
  * `Authorization: Bearer <access_token_cua_admin>`
* **Response (JSON)**:
  ```json
  [
    {
      "id": 1,
      "raceId": 5,
      "raceName": "Vòng loại 1",
      "horseId": 4,
      "horseName": "Red Thunder",
      "jockeyId": 3,
      "jockeyName": "Trần Văn A",
      "ownerId": 1,
      "ownerName": "Test Owner 1",
      "status": "PENDING",
      "jockeySharePercent": 30.0,
      "ownerSharePercent": 70.0,
      "createdAt": "2026-06-15T14:30:00"
    }
  ]
  ```

---

### 10. Duyệt đăng ký tham gia (Approve Registration)
* **API Endpoint**: `PUT /api/admin/race-registrations/{id}/approve`
* **Mô tả**: Admin duyệt đơn đăng ký tham gia vòng đua để đưa ngựa vào danh sách được chọn.
* **Headers**:
  * `Authorization: Bearer <access_token_cua_admin>`
* **Response (JSON)**: Trả về thông tin đăng ký sau khi duyệt (RaceRegistrationResponse) với trạng thái `"status": "APPROVED"`.

---

### 11. Từ chối đăng ký tham gia (Reject Registration)
* **API Endpoint**: `PUT /api/admin/race-registrations/{id}/reject`
* **Mô tả**: Admin từ chối đơn đăng ký tham gia vòng đua.
* **Headers**:
  * `Authorization: Bearer <access_token_cua_admin>`
* **Response (JSON)**: Trả về thông tin đăng ký sau khi từ chối (RaceRegistrationResponse) với trạng thái `"status": "REJECTED"`.

---

### 12. Xác nhận danh sách thi đấu chính thức (Confirm Registration)
* **API Endpoint**: `POST /api/admin/races/{raceId}/confirm-registration`
* **Mô tả**: Chốt danh sách thi đấu chính thức của vòng đua, tự động hoàn trả phí đăng ký cho các ngựa trong hàng đợi không được chọn.
* **Headers**:
  * `Authorization: Bearer <access_token_cua_admin>`
* **Response (JSON)**:
  ```json
  {
    "message": "Registrations confirmed successfully. Waiting list cleared and refunded."
  }
  ```

---

## II. Các API xem Danh sách Giải đấu & Vòng đua (Dành cho cả FE và Khách)

### 1. Lấy danh sách toàn bộ Giải đấu
* **API Endpoint**: `GET /api/tournaments`
* **Mô tả**: Lấy toàn bộ danh sách các giải đấu hiện có để hiển thị lên UI.
* **Response (JSON)**:
  ```json
  [
    {
      "id": 1,
      "tournamentName": "Spring Championship 2026",
      "location": "City Center",
      "description": "Giải vô địch mùa xuân năm 2026.",
      "registrationOpeningTime": "2026-06-15T08:00:00",
      "registrationDeadline": "2026-06-20T17:00:00",
      "officialRaceTime": "2026-07-01T09:00:00",
      "minSlots": 8,
      "maxSlots": 8,
      "startDate": "2026-07-01",
      "endDate": "2026-07-15",
      "totalPrize": 85000000.00,
      "tournamentStatus": "Upcoming",
      "prizeFirst": 50000000.00,
      "prizeSecond": 25000000.00,
      "prizeThird": 10000000.00,
      "minBetAmount": 50000.00,
      "imageUrl": "/uploads/6a4b3d7c-8e9f-4b3c-9a1b-2c3d4e5f6g7h.jpg",
      "refereeId": 3,
      "refereeName": "Nguyễn Văn Trọng Tài"
    }
  ]
  ```

### 2. Chi tiết một Giải đấu
* **API Endpoint**: `GET /api/tournaments/{id}`
* **Mô tả**: Lấy chi tiết thông tin của một giải đấu cụ thể theo ID.
* **Response (JSON)**:
  ```json
  {
    "id": 1,
    "tournamentName": "Spring Championship 2026",
    "location": "City Center",
    "description": "Giải vô địch mùa xuân năm 2026.",
    "registrationOpeningTime": "2026-06-15T08:00:00",
    "registrationDeadline": "2026-06-20T17:00:00",
    "officialRaceTime": "2026-07-01T09:00:00",
    "minSlots": 8,
    "maxSlots": 8,
    "startDate": "2026-07-01",
    "endDate": "2026-07-15",
    "totalPrize": 85000000.00,
    "tournamentStatus": "Upcoming",
    "prizeFirst": 50000000.00,
    "prizeSecond": 25000000.00,
    "prizeThird": 10000000.00,
    "minBetAmount": 50000.00,
    "imageUrl": "/uploads/6a4b3d7c-8e9f-4b3c-9a1b-2c3d4e5f6g7h.jpg",
    "refereeId": 3,
    "refereeName": "Nguyễn Văn Trọng Tài"
  }
  ```

### 3. Lấy danh sách Vòng đua của một Giải đấu
* **API Endpoint**: `GET /api/tournaments/{id}/races`
* **Mô tả**: Lấy toàn bộ danh sách các vòng đua thuộc một giải đấu cụ thể.
* **Response (JSON)**:
  ```json
  [
    {
      "id": 5,
      "raceName": "Vòng loại 1",
      "tournamentId": 1,
      "tournamentName": "Spring Championship 2026",
      "raceTrackId": 1,
      "raceTrackName": "Grand National Track",
      "raceDate": "2026-07-01",
      "startTime": "09:00:00",
      "endTime": "10:30:00",
      "raceRound": 1,
      "maxHorses": 8,
      "distance": 1200.0,
      "surfaceType": "Grass",
      "weather": "Sunny",
      "status": "OPEN_FOR_REGISTER",
      "refereeId": 3,
      "refereeName": "Nguyễn Văn Trọng Tài"
    }
  ]
  ```

---

## III. Bản Đồ Liên Kết Cấu Trúc Thực Tế (DB vs Java Entity)

Dữ liệu của luồng tạo giải đấu được ánh xạ đồng bộ từ SQL Server sang các thực thể Java (Entity) như sau:

| Bảng SQL Server | Thực thể Java (Entity) | Cột trong DB | Thuộc tính trong Java | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **`tournaments`** | [Tournament.java](file:///Users/minhvu2201/Documents/horse-racing-system/backend/src/main/java/com/horseracing/entities/Tournament.java) | `image_url` | `imageUrl` | **Đã hỗ trợ** |
| | | `referee_id` | `referee` (User) | **Đã hỗ trợ** |
| | | `entry_fee` | `entryFee` | **Đã hỗ trợ** |
| | | `min_slots` | `minSlots` | **Đã hỗ trợ** |
| | | `allowed_classes` | `allowedClasses` | **Đã hỗ trợ** |
| | | `allowed_ages` | `allowedAges` | **Đã hỗ trợ** |
| | | `allowed_genders` | `allowedGenders` | **Đã hỗ trợ** |
| | | `registration_opening_time` | `registrationOpeningTime` | **Đã hỗ trợ** |
| | | `official_race_time` | `officialRaceTime` | **Đã hỗ trợ** |
| **`races`** | [Race.java](file:///Users/minhvu2201/Documents/horse-racing-system/backend/src/main/java/com/horseracing/entities/Race.java) | `referee_id` | `referee` (User) | **Đã hỗ trợ** |

---

## IV. Các Lưu Ý Bổ Sung Khi Tích Hợp

1. **Tính năng Đặt cược (Betting)**:
   * Cá cược luôn luôn được **bật mặc định** cho mọi giải đấu/vòng đua (định mức cược tối thiểu được quản lý qua trường `minBetAmount`). Do đó, Frontend không cần gửi trường `allowBetting` hay thiết lập cờ bật/tắt cá cược lên Backend. Giao diện có thể để hiển thị mặc định hoặc bỏ nút gạt bật/tắt đi.
2. **Quản lý đa chọn (Multi-select) của Hạng ngựa, Tuổi và Giới tính**:
   * Frontend gửi lên các chuỗi phân tách bởi dấu phẩy (Ví dụ: `"A,B"`, `"2-3,4-6"`, `"Male,Female"`). Backend sẽ lưu trữ trực tiếp dưới dạng String và trả về nguyên trạng cho Frontend xử lý.
