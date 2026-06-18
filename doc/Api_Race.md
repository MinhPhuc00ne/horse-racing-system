# Tài liệu API - Quy trình Vận hành Trận đấu (Api_Race)

Tài liệu này tổng hợp toàn bộ các API Backend phục vụ quy trình vận hành giải đấu và trận đấu: Từ khi Admin khởi tạo giải đấu, Chủ ngựa đăng ký, Admin xét duyệt, Trọng tài điều khiển cuộc đua cho đến khi trận đấu kết thúc và phát thưởng.

> [!NOTE]
> Để tránh trùng lặp, tài liệu này **chỉ liệt kê các API chưa được gọi (chưa được cài đặt gọi thực tế) ở phía Frontend**. Các API đã được FE tích hợp sẵn (như xem danh sách giải đấu công khai, xem lịch trình kỵ sĩ, và kỵ sĩ duyệt lời mời...) được lược bỏ khỏi tài liệu này.

---

## BẢNG TỔNG HỢP API CHƯA ĐƯỢC TÍCH HỢP

| Stt | Vai trò | API Endpoint | Phương thức | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Admin** | `/api/admin/tournaments` | `POST` | Tạo giải đấu mới |
| 2 | **Admin** | `/api/admin/tournaments/{id}` | `PUT` | Cập nhật giải đấu (chỉ cho phép ở trạng thái *Upcoming*) |
| 3 | **Admin** | `/api/admin/tournaments/{id}/status` | `PUT` | Thay đổi trạng thái giải đấu (*Upcoming/Active/Finished/Cancelled*) |
| 4 | **Admin** | `/api/admin/tournaments/{id}` | `DELETE` | Xóa giải đấu (chỉ khi chưa có trận đua nào) |
| 5 | **Admin** | `/api/admin/races` | `POST` | Tạo trận đua mới trong giải đấu |
| 6 | **Owner** | `/api/owner/race-registrations` | `POST` | Gửi đăng ký đua (Chủ ngựa chọn ngựa & Jockey) |
| 7 | **Owner** | `/api/owner/race-registrations` | `GET` | Lấy danh sách đơn đăng ký của tôi |
| 8 | **Owner** | `/api/owner/race-registrations/{id}` | `PUT` | Chỉnh sửa đơn đăng ký khi giải đấu đang mở |
| 9 | **Owner** | `/api/owner/race-registrations/{id}/cancel` | `PUT` | Rút đăng ký (hoàn lệ phí nếu cổng đang mở) |
| 10 | **Admin** | `/api/admin/race-registrations` | `GET` | Lấy danh sách toàn bộ đăng ký thi đấu |
| 11 | **Admin** | `/api/admin/race-registrations/{id}/approve` | `PUT` | Phê duyệt thủ công đơn đăng ký thi đấu |
| 12 | **Admin** | `/api/admin/race-registrations/{id}/reject` | `PUT` | Từ chối đơn đăng ký thi đấu (**KHÔNG hoàn tiền cọc**) |
| 13 | **Admin** | `/api/admin/races/{raceId}/confirm-registration` | `POST` | Chốt danh sách tham gia trận đấu |
| 14 | **Referee** | `/api/referee/races` | `GET` | Xem danh sách trận đua được phân công |
| 15 | **Referee** | `/api/referee/races/{raceId}/pre-check` | `GET` | Xem thông tin kiểm tra trước trận đấu |
| 16 | **Referee** | `/api/referee/races/{raceId}/conditions` | `PUT` | Cập nhật thời tiết/mặt sân thực tế trước giờ đua |
| 17 | **Referee** | `/api/referee/races/{raceId}/jockeys/{jockeyId}/weight` | `PUT` | Cập nhật cân nặng thực tế của kỵ sĩ trước khi đua |
| 18 | **Referee** | `/api/referee/races/{raceId}/participants/{participantId}/disqualify` | `PUT` | Truất quyền thi đấu của ngựa (**KHÔNG hoàn cọc cho Owner, hoàn cược cho Spectator**) |
| 19 | **Referee** | `/api/referee/races/{raceId}/start` | `POST` | Bắt đầu chạy trận đấu (**Tự động hoàn cọc cho đơn chờ**) |
| 20 | **Referee** | `/api/referee/races/{raceId}/flags` | `POST` | Phạt lỗi kỵ sĩ trong trận đấu (Cộng giây / Loại nếu đủ 3 cờ) |
| 21 | **Referee** | `/api/referee/blacklist` | `POST` | Cấm người dùng hoặc ngựa vi phạm thi đấu |
| 22 | **Referee** | `/api/referee/races/{raceId}/confirm-results` | `POST` | Xác nhận kết quả chung cuộc, chia thưởng & trả thưởng cược |

---

## CHI TIẾT CÁC API VÀ ĐỊNH DẠNG DỮ LIỆU

### Giai đoạn 1: Admin tạo Giải đấu & Trận đấu

#### 1. Tạo giải đấu (`POST /api/admin/tournaments`)
* **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
* **Request Body** (`application/json`):
  ```json
  {
    "tournamentName": "Giải vô địch Mùa Hè 2026",
    "location": "Sân đua Đại Nam, Bình Dương",
    "description": "Giải đua ngựa thường niên quy tụ các chiến mã xuất sắc.",
    "registrationOpeningTime": "2026-06-20T08:00:00",
    "registrationDeadline": "2026-06-28T18:00:00",
    "officialRaceTime": "2026-07-01T09:00:00",
    "startDate": "2026-07-01",
    "endDate": "2026-07-05",
    "maxSlots": 12,
    "minSlots": 6,
    "entryFee": 500000.00,
    "minBetAmount": 50000.00,
    "prizeFirst": 50000000.00,
    "prizeSecond": 25000000.00,
    "prizeThird": 10000000.00,
    "imageUrl": "https://example.com/tournament-banner.jpg",
    "refereeId": 3,
    "allowedClasses": "Thoroughbred, Arabian",
    "allowedAges": "3-5",
    "allowedGenders": "Male"
  }
  ```
* **Response (201 Created)**: Trả về chi tiết giải đấu vừa tạo gồm `id` và trạng thái ban đầu `"Upcoming"`.

#### 2. Tạo trận đua trong giải đấu (`POST /api/admin/races`)
* **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
* **Request Body** (`application/json`):
  ```json
  {
    "raceName": "Vòng loại Bảng A - Cự ly 1200m",
    "tournamentId": 1,
    "raceTrackId": 2,
    "raceDate": "2026-07-01",
    "startTime": "09:30:00",
    "endTime": "10:00:00",
    "raceRound": 1,
    "maxHorses": 8,
    "distance": 1200.0,
    "surfaceType": "Turf",
    "weather": "Sunny",
    "refereeId": 3
  }
  ```
* **Response (201 Created)**: Trả về thông tin trận đua, trạng thái ban đầu mặc định là `"OPEN_FOR_REGISTER"`.

---

### Giai đoạn 2: Chủ ngựa đăng ký tham gia Đua (Owner)

#### 3. Gửi đơn đăng ký thi đấu (`POST /api/owner/race-registrations`)
* **Mô tả**: Chủ ngựa đăng ký ngựa của mình và chỉ định kỵ sĩ đồng hành.
* **Headers**: `Authorization: Bearer <OWNER_TOKEN>`
* **Request Body** (`application/json`):
  ```json
  {
    "raceId": 1,
    "horseId": 4,
    "jockeyId": 2,
    "ownerSharePercent": 70.0,
    "jockeySharePercent": 30.0
  }
  ```
* **Lưu ý**: 
  * `ownerSharePercent + jockeySharePercent` phải đúng bằng `100.0`.
  * Tài khoản ví của Chủ ngựa sẽ bị trừ tiền đăng ký bằng lệ phí giải đấu (`entryFee`).
* **Response (201 Created)**: Trả về thông tin đăng ký có trạng thái `"PENDING_JOCKEY"`.

#### 4. Xem danh sách đơn đăng ký đã gửi (`GET /api/owner/race-registrations`)
* **Headers**: `Authorization: Bearer <OWNER_TOKEN>`
* **Response (200 OK)**: Trả về danh sách đơn đăng ký kèm trạng thái duyệt của kỵ sĩ và hệ thống.

#### 5. Chỉnh sửa đơn đăng ký (`PUT /api/owner/race-registrations/{id}`)
* **Mô tả**: Cho phép chủ ngựa sửa lại ngựa hoặc kỵ sĩ đồng hành khi cổng đăng ký còn mở.
* **Request Body**: Tương tự như API gửi đơn đăng ký.
* **Lưu ý**: Lượt đăng ký sau khi chỉnh sửa sẽ chuyển về trạng thái `"PENDING_JOCKEY"` để kỵ sĩ xác nhận lại, đồng thời thời gian đăng ký cập nhật làm **đẩy đơn này xuống cuối danh sách đăng ký**.

#### 6. Rút đăng ký thi đấu (`PUT /api/owner/race-registrations/{id}/cancel`)
* **Mô tả**: Cho phép rút lui trước khi chốt danh sách.
* **Headers**: `Authorization: Bearer <OWNER_TOKEN>`
* **Response (200 OK)**: Trả về trạng thái đơn đã `"CANCELLED"`. Số tiền lệ phí đăng ký sẽ tự động được hoàn về ví của chủ ngựa.

---

### Giai đoạn 3: Phê duyệt & Chốt danh sách đua (Admin)

#### 7. Lấy danh sách đăng ký thi đấu (`GET /api/admin/race-registrations`)
* **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
* **Response (200 OK)**: Trả về danh sách các cặp ngựa-kỵ sĩ đăng ký thi đấu trong giải đấu.

#### 8. Từ chối đơn đăng ký (`PUT /api/admin/race-registrations/{id}/reject`)
* **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
* **Lưu ý quan trọng**: Đơn bị từ chối bởi Admin ở giai đoạn này **sẽ KHÔNG được hoàn trả tiền cọc** lệ phí giải đấu.

#### 9. Chốt danh sách đua chính thức (`POST /api/admin/races/{raceId}/confirm-registration`)
* **Mô tả**: Khi Admin chốt đăng ký, hệ thống sẽ đóng cổng đăng ký (trạng thái trận đấu chuyển sang `"CLOSED_FOR_REGISTER"`).
* **Lưu ý**: Hệ thống không còn tự động phê duyệt hàng loạt nữa. Admin dựa vào danh sách chờ và phê duyệt thủ công từng lượt. Ngựa bị từ chối sẽ nhường vị trí cho ngựa tiếp theo trong danh sách chờ đôn lên.

---

### Giai đoạn 4: Vận hành & Kết thúc trận đấu (Trọng tài - Referee)

#### 10. Xem danh sách trận đấu được phân công (`GET /api/referee/races`)
* **Headers**: `Authorization: Bearer <REFEREE_TOKEN>`
* **Query Params**: `status` (Không bắt buộc, giá trị có thể là: `upcoming`, `running`, `finished`)
* **Response (200 OK)**: Trả về danh sách trận đấu mà trọng tài này được gán quản lý.

#### 11. Đăng ký thông số Pre-check (`GET /api/referee/races/{raceId}/pre-check`)
* **Response (200 OK)**: Trả về thông số chi tiết sân và tình trạng cân nặng của kỵ sĩ để trọng tài kiểm duyệt.

#### 12. Cập nhật cân nặng kỵ sĩ trước giờ đua (`PUT /api/referee/races/{raceId}/jockeys/{jockeyId}/weight`)
* **Headers**: `Authorization: Bearer <REFEREE_TOKEN>`
* **Request Body** (`application/json`):
  ```json
  {
    "actualWeight": 62.5
  }
  ```

#### 13. Bắt đầu trận đua (`POST /api/referee/races/{raceId}/start`)
* **Mô tả**: Cho phép trọng tài nhấn còi xuất phát cuộc đua.
* **Lưu ý**:
  * Trận đấu chuyển sang trạng thái `"RUNNING"`.
  * Các đơn đăng ký vẫn còn ở trạng thái chờ (`PENDING`/`PENDING_JOCKEY`) mà không được chọn đua chính thức sẽ tự động chuyển thành `"REJECTED"` và **được hoàn trả 100% lệ phí đăng ký** về ví chủ ngựa.
  * Hệ thống kích hoạt mô phỏng thời gian thực chạy ngầm.

#### 14. Phạt lỗi thi đấu trong trận (`POST /api/referee/races/{raceId}/flags`)
* **Headers**: `Authorization: Bearer <REFEREE_TOKEN>`
* **Request Body** (`application/json`):
  ```json
  {
    "simulationId": 1,
    "horseId": 4,
    "violationType": "Kích động ngựa quá mức",
    "description": "Nài ngựa sử dụng roi ngoài vùng cho phép."
  }
  ```
* **Lưu ý**: Mỗi lần gọi API phạt cờ lỗi, ngựa bị phạt sẽ bị cộng thêm 3 giây phạt vào tổng thời gian thi đấu. Nếu tích lũy đủ **3 cờ phạt**, ngựa đó sẽ bị **truất quyền thi đấu lập tức** (`DISQUALIFIED`).

#### 15. Đưa tài khoản vi phạm vào Blacklist (`POST /api/referee/blacklist`)
* **Headers**: `Authorization: Bearer <REFEREE_TOKEN>`
* **Request Body** (`application/json`):
  ```json
  {
    "targetType": "USER",
    "targetId": 15,
    "reason": "Phát hiện có hành vi dàn xếp tỉ số thi đấu.",
    "endDate": "2026-12-31",
    "isPermanent": false
  }
  ```
* **Lưu ý**: 
  * `targetType` có thể là `USER` (Kỵ sĩ/Chủ ngựa) hoặc `HORSE` (Ngựa đua).
  * Nếu là `USER`, tài khoản người dùng sẽ bị vô hiệu hóa lập tức và không thể đăng nhập. Trên màn hình đăng nhập, người dùng sẽ nhận thông báo: `"Tài khoản của bạn đã bị khóa/cấm do vi phạm điều khoản."`

#### 16. Xác nhận kết quả thi đấu & Phát thưởng (`POST /api/referee/races/{raceId}/confirm-results`)
* **Headers**: `Authorization: Bearer <REFEREE_TOKEN>`
* **Mô tả**: Trọng tài chốt kết quả khi cuộc đua kết thúc.
* **Hệ thống xử lý**:
  1. Trận đấu đổi trạng thái sang `"FINISHED"`.
  2. Chia thưởng giải đấu cho chủ ngựa & kỵ sĩ đạt Top 3 (tiền tự động chuyển về ví tương ứng).
  3. Hoàn tất việc trả thưởng cá cược cho những Spectator đặt cược chính xác ngựa vô địch (Tiền thắng cược = `Số tiền cược * Odds` được chuyển về ví của người thắng cược). Các vé cược thua chuyển thành `"LOST"`.
