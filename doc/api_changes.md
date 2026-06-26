# ĐẶC TẢ THAY ĐỔI CỦA CÁC API (API CHANGES DOCUMENT)

Tài liệu này ghi nhận các thay đổi và ràng buộc nghiệp vụ mới được áp dụng vào hệ thống API kể từ sau khi đồng bộ mã nguồn từ GitHub.

---

## 1. API Đặt cược của Người xem (Spectator Place Bet)

* **Endpoint**: `POST /api/bets`
* **Quyền truy cập (Authorization)**: Chỉ dành cho người dùng đăng nhập có vai trò `SPECTATOR`.
* **Request Body**:
  ```json
  {
    "raceId": 12,
    "participantId": 34,
    "amount": 50000.0
  }
  ```

### Các ràng buộc mới bổ sung (New Validations):
1. **Ràng buộc vai trò (Role-based Restriction)**:
   - Hệ thống kiểm tra vai trò của User. Nếu người dùng **không phải** là `SPECTATOR` (ví dụ: `ADMIN`, `HORSE_OWNER`, `JOCKEY`, `RACE_REFEREE`), hệ thống sẽ trả về lỗi `403 Forbidden` với thông điệp:
     > `"Chỉ người xem (SPECTATOR) mới được phép đặt cược."`
2. **Ràng buộc trạng thái cuộc đua (Race Status Restriction)**:
   - Chỉ cho phép đặt cược khi cuộc đua ở trạng thái **`LOCKED_LIST`** (danh sách đã chốt và công bố chính thức).
   - Nếu cuộc đua ở bất kỳ trạng thái nào khác (ví dụ: `OPEN_FOR_REGISTER`, `CLOSED_FOR_REGISTER`, `RUNNING`, `FINISHED`), hệ thống sẽ trả về lỗi `400 Bad Request` với thông điệp:
     > `"Cổng đặt cược đã đóng. Đặt cược chỉ khả dụng khi danh sách đã được chốt và công bố."`
3. **Ràng buộc tiến trình giả lập (Simulation Progress Restriction)**:
   - Chặn đặt cược nếu quá trình giả lập/mô phỏng cuộc đua đã chạy xong (Bản ghi `RaceSimulation` có trạng thái là `FINISHED`), kể cả khi trạng thái cuộc đua chưa cập nhật xong.
   - Nếu vi phạm, hệ thống trả về lỗi `400 Bad Request` với thông điệp:
     > `"Cuộc đua đã chạy xong, cổng đặt cược đã đóng."`

---

## 2. API Bắt đầu cuộc đua của Trọng tài (Referee Start Race)

* **Endpoint**: `POST /api/referee/races/{id}/start`
* **Quyền truy cập (Authorization)**: Chỉ Trọng tài (`RACE_REFEREE`) được phân công quản lý cuộc đua.

### Các ràng buộc mới bổ sung (New Validations):
1. **Ràng buộc trạng thái cuộc đua bắt đầu (Race Status Restriction)**:
   - Trạng thái cuộc đua bắt buộc phải là **`LOCKED_LIST`**. Nếu không, hệ thống trả về lỗi:
     > `"Race must be LOCKED_LIST to start"`
2. **Ràng buộc kiểm định ngựa tham gia (Pre-race Inspection Validation)**:
   - Hệ thống kiểm tra toàn bộ các ngựa tham gia đăng ký trong cuộc đua.
   - Nếu còn bất kỳ ngựa nào chưa hoàn tất kiểm định (vẫn ở trạng thái **`PENDING_INSPECTION`**), hệ thống sẽ chặn và trả về lỗi:
     > `"Cannot start race. All participants must be inspected first."`
3. **Ràng buộc số lượng ngựa hợp lệ tối thiểu (Approved Participants Validation)**:
   - Phải có ít nhất **1 ngựa** đã được duyệt kiểm định thành công (trạng thái là **`APPROVED`**).
   - Nếu không có ngựa nào được duyệt (ví dụ: tất cả đều bị từ chối/loại), hệ thống sẽ chặn và trả về lỗi:
     > `"Cannot start race. No approved participants in this race."`
4. **Logic cập nhật trạng thái ngựa khi bắt đầu (Participant Status Transition)**:
   - Chỉ các chú ngựa có trạng thái kiểm định là **`APPROVED`** mới được cập nhật sang trạng thái **`RACING`** để tham gia chạy giả lập.
   - Các chú ngựa bị loại trước trận (`DISQUALIFIED`) hoặc bị từ chối (`REJECTED`) sẽ giữ nguyên trạng thái và không được tham gia cuộc đua.

---

## 3. API Xác nhận kết quả cuộc đua của Trọng tài (Referee Confirm Results)

* **Endpoint**: `POST /api/referee/races/{id}/confirm-results`
* **Quyền truy cập (Authorization)**: Chỉ Trọng tài (`RACE_REFEREE`) được phân công quản lý cuộc đua.

### Ràng buộc mới bổ sung (New Validation):
1. **Kiểm tra tiến trình giả lập (Simulation Completion Check)**:
   - Chỉ cho phép xác nhận kết quả nếu quá trình giả lập cuộc đua (Race Simulation) đã hoàn tất và kết thúc hoàn toàn (trạng thái của `RaceSimulation` là **`FINISHED`**).
   - Nếu cuộc đua đang chạy giả lập chưa xong hoặc chưa được kích hoạt chạy, hệ thống sẽ chặn và trả về lỗi:
     > `"Cannot confirm results. The race simulation has not finished yet."`

---

## 4. API Chốt danh sách đăng ký cuộc đua (Confirm Registration)

* **Endpoint**: `POST /api/referee/races/{id}/confirm-registration` (được gọi từ Referee / Admin)

### Thay đổi hành vi (Behavioral Change):
1. **Trạng thái cuộc đua sau khi chốt**:
   - Khi chốt danh sách và đóng cổng đăng ký thành công, trạng thái cuộc đua sẽ chuyển thành **`LOCKED_LIST`** (thay vì `CLOSED_FOR_REGISTER` như trước).
---

## 5. API Lấy danh sách cuộc đua của Trọng tài (Referee Get Races)

* **Endpoint**: `GET /api/referee/races`
* **Tham số lọc**: `status=upcoming` hoặc `status=preparation`
* **Thay đổi hành vi**:
  - Trước đây: Chỉ trả về các cuộc đua có trạng thái là `Upcoming` hoặc `CLOSED_FOR_REGISTER`.
  - Hiện tại: Trả về thêm các cuộc đua có trạng thái là `OPEN_FOR_REGISTER` và `LOCKED_LIST`. Điều này giúp Trọng tài có thể nhìn thấy các cuộc đua ở trạng thái mới để tiến hành kiểm định chất lượng ngựa chuẩn bị cho cuộc đua.

---

## 6. API Dashboard của Trọng tài (Referee Dashboard Summary)

* **Endpoint**: `GET /api/referee/dashboard`
* **Thay đổi hành vi**:
  - Chỉ số cuộc đua sắp tới (`upcomingRaces`) và số lượng ngựa cần kiểm định (`horsesToInspect`) đã được mở rộng để quét qua cả các cuộc đua có trạng thái là `LOCKED_LIST` và `OPEN_FOR_REGISTER` (bên cạnh các trạng thái cũ).

---

## 7. API Lịch thi đấu sắp tới của Jockey (Jockey Get Schedule)

* **Endpoint**: `GET /api/jockeys/schedule`
* **Thay đổi hành vi**:
  - Bổ sung bộ lọc điều kiện trên luồng trả về: Loại bỏ hoàn toàn các cuộc đua đã kết thúc (`FINISHED`) hoặc bị hủy bỏ (`CANCELLED`). Jockey sẽ chỉ thấy lịch thi đấu thực sự chuẩn bị diễn ra.

---

## 8. API Lịch sử thi đấu của Jockey (Jockey Get History)

* **Endpoint**: `GET /api/jockeys/history`
* **Thay đổi hành vi**:
  - Sửa đổi điều kiện truy vấn dữ liệu từ cơ sở dữ liệu: Thay vì lọc theo trạng thái của người tham gia (Participant Status = `FINISHED` - vốn không chính xác vì đây là trạng thái của ngựa chạy), hệ thống đã chuyển sang lọc chuẩn xác theo trạng thái của chính cuộc đua (Race Status = `FINISHED`).
