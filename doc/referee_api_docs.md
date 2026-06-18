# TÀI LIỆU API VÀ ÁNH XẠ DATABASE: TRỌNG TÀI ĐIỀU HÀNH CUỘC ĐUA (REFEREE API & DB DOCS)

Tài liệu này đặc tả toàn bộ các API Backend dành cho vai trò **Trọng tài (Race Referee)** và cách ánh xạ dữ liệu trực tiếp từ các trường của UI xuống các bảng trong Cơ sở dữ liệu (Database).

---

## I. THIẾT KẾ CÁC API CHI TIẾT (REFEREE APIs)

Toàn bộ các API phục vụ luồng Trọng tài yêu cầu xác thực JWT và quyền truy cập `@PreAuthorize("hasRole('RACE_REFEREE')")`.

### 1. Lấy danh sách vòng đua được phân công
* **Endpoint**: `GET /api/referee/races`
* **Query Params**:
  * `status`: Lọc theo trạng thái (`UPCOMING`, `RUNNING`, `FINISHED`).
* **Response (JSON)**:
  ```json
  [
    {
      "raceId": 5,
      "raceName": "Vòng loại 1",
      "tournamentName": "Spring Championship 2026",
      "raceDate": "2026-07-01",
      "startTime": "09:00:00",
      "endTime": "10:30:00",
      "status": "OPEN_FOR_REGISTER",
      "distance": 1200.0,
      "surfaceType": "Grass",
      "venue": "Grand National Track"
    }
  ]
  ```

### 2. Xem chi tiết & Danh sách kiểm tra trước trận (Pre-check)
* **Endpoint**: `GET /api/referee/races/{raceId}/pre-check`
* **Response (JSON)**:
  ```json
  {
    "raceId": 5,
    "raceName": "Vòng loại 1",
    "trackCondition": "Good",
    "weather": "Sunny",
    "participants": [
      {
        "participantId": 12,
        "horseId": 4,
        "horseName": "Red Thunder",
        "jockeyId": 3,
        "jockeyName": "Trần Văn A",
        "registeredWeight": 52.5,
        "actualWeight": null,
        "status": "READY"
      }
    ]
  }
  ```

### 3. Cập nhật thời tiết và điều kiện sân đua
* **Endpoint**: `PUT /api/referee/races/{raceId}/conditions`
* **Request Body (JSON)**:
  ```json
  {
    "weather": "Rainy",
    "trackCondition": "Muddy"
  }
  ```
* **Response**: Trả về thông tin Race sau khi cập nhật.

### 4. Nhập cân nặng thực tế của Jockey
* **Endpoint**: `PUT /api/referee/races/{raceId}/jockeys/{jockeyId}/weight`
* **Request Body (JSON)**:
  ```json
  {
    "actualWeight": 53.2
  }
  ```
* **Response**: Thông báo cập nhật cân nặng thành công.

### 5. Loại bỏ cặp đấu vi phạm trước trận đấu
* **Endpoint**: `PUT /api/referee/races/{raceId}/participants/{participantId}/disqualify`
* **Request Body (JSON)**:
  ```json
  {
    "reason": "Jockey quá cân nặng quy định và không thể giảm cân trước giờ đấu."
  }
  ```
* **Response (JSON)**:
  ```json
  {
    "message": "Participant has been disqualified. Betting orders for this horse have been refunded.",
    "participantId": 12,
    "status": "DISQUALIFIED"
  }
  ```

### 6. Bắt đầu cuộc đua (Trigger Start)
* **Endpoint**: `POST /api/referee/races/{raceId}/start`
* **Response (JSON)**:
  ```json
  {
    "raceId": 5,
    "status": "RUNNING",
    "message": "Race has started. Betting window closed."
  }
  ```

### 7. Gắn cờ vi phạm cho ngựa đang đua
* **Endpoint**: `POST /api/referee/races/{raceId}/flags`
* **Request Body (JSON)**:
  ```json
  {
    "horseId": 4,
    "simulationId": 1,
    "violationType": "LANE_VIOLATION",
    "description": "Ngựa lấn làn chạy cản đường đối thủ ở mét thứ 500."
  }
  ```
* **Response (JSON)**:
  ```json
  {
    "flagId": 1,
    "horseId": 4,
    "totalFlags": 1,
    "penaltySeconds": 3,
    "isDisqualified": false
  }
  ```

### 8. Đưa tài khoản vi phạm vào Blacklist
* **Endpoint**: `POST /api/referee/blacklist`
* **Request Body (JSON)**:
  ```json
  {
    "targetType": "USER", // USER hoặc HORSE
    "targetId": 3,        // user_id của Jockey hoặc Horse Owner
    "reason": "Gian lận nghiêm trọng cân nặng trước cuộc đua.",
    "isPermanent": false,
    "endDate": "2026-09-16" // Cấm 3 tháng
  }
  ```
* **Response**: Chi tiết bản ghi Blacklist được tạo.

### 9. Xác nhận kết quả chung cuộc & Trả thưởng
* **Endpoint**: `POST /api/referee/races/{raceId}/confirm-results`
* **Response (JSON)**:
  ```json
  {
    "raceId": 5,
    "status": "FINISHED",
    "message": "Results confirmed. Prize distribution and bet payouts completed successfully."
  }
  ```

---

## II. BẢN ĐỒ LIÊN KẾT CƠ SỞ DỮ LIỆU (DATABASE MAPPING)

| Nghiệp vụ Trọng tài | Bảng Database liên quan | Cột Database tác động | Mô tả hành động |
| :--- | :--- | :--- | :--- |
| **Chọn/Xem trận đấu** | `races` | `referee_id`, `status` | Trọng tài chỉ quản lý các bản ghi có `referee_id` trùng với ID của mình. |
| **Cập nhật mặt sân/thời tiết** | `races` | `weather`, `surface_type` | Cập nhật thông số môi trường thi đấu. |
| **Nhập cân nặng Jockey** | `jockey_profiles` | `weight` (hoặc lưu tạm trong cache/form kiểm tra) | Dùng để đối chiếu trước khi cho phép chạy. |
| **Loại bỏ trước trận** | `race_participants` | `status` -> `'DISQUALIFIED'` | Đánh dấu loại bỏ cặp đấu. |
| **Hoàn tiền cược** | `bets` | `status` -> `'REFUNDED'` | Tự động chuyển trạng thái cược và hoàn tiền vào ví `wallets`. |
| **Bắt đầu cuộc đua** | `races` | `status` -> `'RUNNING'` | Chuyển trạng thái trận đấu, đóng cổng cược. |
| **Ghi nhận cờ phạt** | `referee_flags` | `referee_id`, `horse_id`, `violation_type`, `description` | Lưu trữ chi tiết cờ phạt trọng tài rút ra. |
| **Cấm tài khoản** | `blacklist`, `ban_history` | `target_type`, `target_id`, `reason`, `status`, `action_by` | Tạo danh sách cấm và lưu lịch sử xử lý của trọng tài. |
| **Xác nhận kết quả** | `race_participants` | `final_rank`, `finish_time`, `average_speed` | Lưu trữ kết quả xếp hạng và thời gian chạy cuối cùng của ngựa. |
| **Chia thưởng** | `prize_distributions`, `wallet_transactions` | `owner_amount`, `jockey_amount`, `distributed_at` | Thực hiện giao dịch chuyển tiền thưởng vào ví của Owner và Jockey. |
