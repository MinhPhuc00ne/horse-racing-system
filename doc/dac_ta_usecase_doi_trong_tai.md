# ĐẶC TẢ USE CASE: YÊU CẦU THAY ĐỔI TRỌNG TÀI (REFEREE CHANGE REQUEST USE CASES)

Tài liệu này đặc tả chi tiết các Use Case liên quan đến tính năng **Yêu cầu thay đổi Trọng tài** trong hệ thống Quản lý đua ngựa, dựa trên cấu trúc backend (BE) và cơ sở dữ liệu (DB) hiện tại.

---

## 1. UC-01: Gửi yêu cầu thay đổi Trọng tài (Request Referee Change)

### a. Functionalities (Chức năng)
Cho phép trọng tài đang được phân công quản lý một giải đấu gửi yêu cầu xin đổi trọng tài khác quản lý thay mình kèm lý do cụ thể. Yêu cầu này sẽ chờ Admin phê duyệt.

### b. Bản mô tả Use Case (Functional Description)

| Thành phần mô tả | Nội dung chi tiết |
| :--- | :--- |
| **UC ID and Name** | **UC-01: Yêu cầu thay đổi Trọng tài (Request Referee Change)** |
| **Created By** | Antigravity AI |
| **Date Created** | 2026-07-17 |
| **Primary Actor** | Trọng tài cuộc đua (`RACE_REFEREE`) |
| **Secondary Actors** | Admin (Quản trị viên nhận yêu cầu) |
| **Trigger** | Trọng tài được phân công quản lý giải đấu muốn xin rút lui hoặc đổi người điều hành do lý do cá nhân hoặc công việc đột xuất. |
| **Description** | Trọng tài chọn giải đấu đang phụ trách, nhập lý do muốn xin đổi trọng tài và gửi lên hệ thống. Yêu cầu này được lưu dưới trạng thái `PENDING` chờ Admin xem xét. |
| **Preconditions** | 1. Trọng tài đã đăng nhập vào hệ thống thành công.<br>2. Trọng tài đúng là người đang được phân công quản lý giải đấu (kiểm tra `tournament.referee.id == current_user.id`).<br>3. Giải đấu phải tồn tại trong hệ thống.<br>4. Chưa có bất kỳ yêu cầu thay đổi nào cho giải đấu này đang ở trạng thái chờ duyệt (`status = 'PENDING'`). |
| **Postconditions** | Một bản ghi yêu cầu thay đổi trọng tài mới được tạo thành công trong bảng `referee_change_requests` với trạng thái ban đầu là `PENDING`. |
| **Normal Flow** | 1. Trọng tài chọn giải đấu mình đang quản lý mà muốn yêu cầu thay thế.<br>2. Trọng tài nhập lý do xin thay đổi (trường `reason` không được để trống).<br>3. Trọng tài nhấn nút "Gửi yêu cầu".<br>4. Hệ thống kiểm tra vai trò của người dùng (phải là `RACE_REFEREE`).<br>5. Hệ thống kiểm tra xem người dùng có thực sự là trọng tài được phân công cho giải đấu này hay không.<br>6. Hệ thống kiểm tra xem có yêu cầu chờ duyệt nào khác cho giải đấu này đang tồn tại hay không.<br>7. Hệ thống tạo mới bản ghi `RefereeChangeRequest` với trạng thái `PENDING` và lưu vào cơ sở dữ liệu.<br>8. Hệ thống trả về thông tin yêu cầu đã tạo thành công (`RefereeChangeResponseDto`). |
| **Alternative Flows** | Không có luồng thay thế trực tiếp từ phía Trọng tài. Yêu cầu sẽ nằm chờ ở trạng thái `PENDING` cho đến khi Admin duyệt hoặc từ chối (xem UC-02). |
| **Exceptions** | **Ngoại lệ 1 (Không tìm thấy người dùng):** Hệ thống báo lỗi `"Referee not found"` (Mã lỗi 400).<br>**Ngoại lệ 2 (Sai vai trò):** Nếu người dùng không phải vai trò `RACE_REFEREE`, hệ thống chặn và báo lỗi `"Only referees can create change requests"` (Mã lỗi 400).<br>**Ngoại lệ 3 (Không tìm thấy giải đấu):** Hệ thống báo lỗi `"Tournament not found"` (Mã lỗi 400).<br>**Ngoại lệ 4 (Sai trọng tài phân công):** Nếu trọng tài hiện tại không phải người quản lý giải đấu, hệ thống chặn và báo lỗi `"You are not the assigned referee for this tournament"` (Mã lỗi 400).<br>**Ngoại lệ 5 (Yêu cầu trùng lặp đang chờ):** Nếu đã có yêu cầu PENDING, hệ thống chặn và báo lỗi `"There is already a pending change request for this tournament"` (Mã lỗi 400). |
| **Priority** | High (Must Have) |
| **Frequency of Use** | Thấp (Chỉ khi trọng tài có lý do bất khả kháng). |
| **Business Rules** | • Mỗi giải đấu tại một thời điểm chỉ được phép có tối đa 1 yêu cầu thay đổi trọng tài ở trạng thái `PENDING`.<br>• Lý do thay đổi không được để trống và giới hạn tối đa 1000 ký tự. |
| **Other Information** | **Endpoint API:** `POST /api/change-request`<br>**Request Body (JSON):** `RefereeChangeRequestDto`<br>```json\n{\n  "tournamentId": 1,\n  "reason": "Lý do xin thay đổi..."\n}\n```<br>**Response Body (JSON):** `RefereeChangeResponseDto`<br>```json\n{\n  "id": 1,\n  "refereeId": 11,\n  "refereeName": "Trọng tài 1",\n  "tournamentId": 1,\n  "tournamentName": "Spring Championship 2026",\n  "reason": "Lý do xin thay đổi...",\n  "status": "PENDING",\n  "createdAt": "2026-07-17T13:10:00"\n}\n``` |
| **Assumptions** | Giải đấu và tài khoản trọng tài đã được thiết lập sẵn trong hệ thống. |

---

## 2. UC-02: Phê duyệt/Từ chối yêu cầu thay đổi Trọng tài (Process Change Request)

### a. Functionalities (Chức năng)
Cho phép Admin xem danh sách các yêu cầu xin thay đổi trọng tài và thực hiện duyệt (chỉ định trọng tài mới thay thế) hoặc từ chối yêu cầu đó.

### b. Bản mô tả Use Case (Functional Description)

| Thành phần mô tả | Nội dung chi tiết |
| :--- | :--- |
| **UC ID and Name** | **UC-02: Phê duyệt/Từ chối yêu cầu thay đổi Trọng tài (Process Change Request)** |
| **Created By** | Antigravity AI |
| **Date Created** | 2026-07-17 |
| **Primary Actor** | Quản trị viên (ADMIN) |
| **Secondary Actors** | Trọng tài gửi yêu cầu (nhận thông báo kết quả), Trọng tài mới được chỉ định |
| **Trigger** | Admin truy cập bảng điều khiển quản trị (Dashboard) để duyệt các yêu cầu thay thế trọng tài. |
| **Description** | Admin duyệt qua danh sách các yêu cầu đang ở trạng thái `PENDING`. Admin có thể chọn phê duyệt và gán trọng tài mới cho giải đấu, hoặc từ chối yêu cầu để giữ nguyên trọng tài hiện tại. |
| **Preconditions** | 1. Admin đã đăng nhập thành công vào hệ thống.<br>2. Yêu cầu thay đổi trọng tài được chọn phải đang ở trạng thái `PENDING`. |
| **Postconditions** | • **Nếu Phê duyệt:** Trạng thái yêu cầu chuyển thành `APPROVED`, thông tin trọng tài (`referee_id`) của giải đấu (`tournaments`) được cập nhật sang trọng tài mới được chỉ định.<br>• **Nếu Từ chối:** Trạng thái yêu cầu chuyển thành `REJECTED`, thông tin trọng tài của giải đấu được giữ nguyên. |
| **Normal Flow (Duyệt)** | 1. Admin gọi danh sách các yêu cầu thay đổi trọng tài.<br>2. Hệ thống hiển thị danh sách các yêu cầu.<br>3. Admin chọn một yêu cầu cụ thể có trạng thái `PENDING`.<br>4. Admin chọn trọng tài mới thay thế (truyền vào `newRefereeId`).<br>5. Admin nhấn nút "Phê duyệt" (Approve).<br>6. Hệ thống kiểm tra tính hợp lệ của yêu cầu (phải ở trạng thái `PENDING`).<br>7. Hệ thống kiểm tra xem trọng tài mới được chỉ định có tồn tại và đúng vai trò `RACE_REFEREE` hay không.<br>8. Hệ thống cập nhật trọng tài mới vào giải đấu (`tournament.setReferee(newReferee)`).<br>9. Hệ thống cập nhật trạng thái yêu cầu thành `APPROVED`.<br>10. Hệ thống lưu thay đổi vào DB và trả về thông tin yêu cầu sau cập nhật (`RefereeChangeResponseDto`). |
| **Alternative Flows (Từ chối)** | **Nhánh Từ chối yêu cầu:**<br>1. Admin chọn yêu cầu cụ thể đang `PENDING`.<br>2. Admin nhấn nút "Từ chối" (Reject).<br>3. Hệ thống kiểm tra trạng thái yêu cầu.<br>4. Hệ thống cập nhật trạng thái yêu cầu thành `REJECTED`.<br>5. Hệ thống lưu thay đổi vào DB, giữ nguyên trọng tài cũ của giải đấu và trả về thông tin yêu cầu. |
| **Exceptions** | **Ngoại lệ 1 (Không tìm thấy yêu cầu):** Hệ thống báo lỗi `"Request not found"` (Mã lỗi 400).<br>**Ngoại lệ 2 (Yêu cầu đã được xử lý):** Nếu yêu cầu không ở trạng thái `PENDING`, hệ thống chặn và báo lỗi `"Request is not in PENDING status"` (Mã lỗi 400).<br>**Ngoại lệ 3 (Không tìm thấy trọng tài mới):** Hệ thống báo lỗi `"New referee not found"` (Mã lỗi 400).<br>**Ngoại lệ 4 (Người thay thế không phải trọng tài):** Nếu user được chỉ định mới không có role `RACE_REFEREE`, hệ thống chặn và báo lỗi `"Assigned user must be a referee"` (Mã lỗi 400). |
| **Priority** | High (Must Have) |
| **Frequency of Use** | Thấp. |
| **Business Rules** | • Chỉ Admin mới có quyền thực hiện phê duyệt/từ chối.<br>• Khi phê duyệt bắt buộc phải cung cấp `newRefereeId` hợp lệ và tài khoản đó phải mang vai trò `RACE_REFEREE`. |
| **Other Information** | **Các Endpoint API:**<br>• Lấy danh sách: `GET /api/referee-requests` (Admin)<br>• Phê duyệt: `PUT /api/referee-requests/{id}/approve` (Admin)<br>  *Request Body:* `{"newRefereeId": 12}`<br>• Từ chối: `PUT /api/referee-requests/{id}/reject` (Admin) |
| **Assumptions** | Hệ thống có sẵn danh sách các trọng tài khác để Admin lựa chọn thay thế. |

---

## 3. Bản thiết kế Cơ sở dữ liệu (Database Schema)

Cơ sở dữ liệu lưu trữ các yêu cầu này trong bảng `referee_change_requests` với cấu trúc như sau:

### Bảng `referee_change_requests`
* **id**: `int` (Primary Key, IDENTITY) - ID tự tăng của yêu cầu.
* **referee_id**: `int` (Foreign Key referencing `users(id)`) - ID của trọng tài gửi yêu cầu.
* **tournament_id**: `int` (Foreign Key referencing `tournaments(id)`) - ID của giải đấu cần đổi trọng tài.
* **reason**: `nvarchar(1000)` - Lý do xin đổi trọng tài.
* **status**: `nvarchar(50)` (Mặc định: `'PENDING'`) - Trạng thái của yêu cầu (`PENDING`, `APPROVED`, `REJECTED`).
* **created_at**: `datetime` (Mặc định: `getdate()`) - Thời gian tạo yêu cầu.
* **updated_at**: `datetime` (Mặc định: `getdate()`) - Thời gian cập nhật yêu cầu cuối cùng.

---

## 4. UC-03: Trọng tài tự huỷ phân công trước khi đóng đăng ký (Referee Self-cancels Assignment)

### a. Functionalities (Chức năng)
Cho phép Trọng tài chủ động huỷ việc được phân công vào một Giải đấu mà không cần Admin phê duyệt, miễn là thời gian giải đấu vẫn chưa đóng đăng ký (trước `registration_deadline`).

### b. Bản mô tả Use Case (Functional Description)

| Thành phần mô tả | Nội dung chi tiết |
| :--- | :--- |
| **UC ID and Name** | **UC-03: Trọng tài tự huỷ phân công trước khi đóng đăng ký** |
| **Created By** | Antigravity AI |
| **Date Created** | 2026-07-21 |
| **Primary Actor** | Trọng tài cuộc đua (RACE_REFEREE) |
| **Secondary Actors** | Hệ thống |
| **Trigger** | Trọng tài chọn tính năng huỷ phân công trên màn hình quản lý Giải đấu (Dashboard). |
| **Description** | Trọng tài có thể tự huỷ việc tham gia quản lý giải đấu nếu giải đấu vẫn đang trong thời hạn mở đăng ký (chưa chốt danh sách người tham gia). Việc huỷ sẽ có hiệu lực ngay lập tức, gỡ tên Trọng tài khỏi Giải đấu và toàn bộ các Vòng đua (Races) liên quan. |
| **Preconditions** | 1. Trọng tài đã đăng nhập và đang được phân công quản lý giải đấu này.<br>2. Thời điểm hiện tại phải trước thời gian `registration_deadline` của giải đấu. |
| **Postconditions** | Trọng tài được gỡ khỏi giải đấu (cột `referee_id` trong bảng `tournaments` và bảng `races` đều được cập nhật thành NULL). Giải đấu sẽ trở về trạng thái trống trọng tài để Admin phân công người mới. |
| **Normal Flow** | 1. Trọng tài xem thông tin giải đấu mà mình đang được phân công.<br>2. Trọng tài nhấn nút "Huỷ tham gia" (Cancel Assignment).<br>3. Hệ thống hiển thị hộp thoại xác nhận.<br>4. Trọng tài xác nhận huỷ.<br>5. Hệ thống kiểm tra thời gian hiện tại so với `registration_deadline`.<br>6. Hệ thống thực hiện cập nhật DB (xoá `referee_id` của `tournaments` và các `races` liên quan).<br>7. Hệ thống thông báo thành công và chuyển trọng tài về trang chủ. |
| **Alternative Flows** | Không có. |
| **Exceptions** | **Ngoại lệ 1 (Quá hạn huỷ):** Nếu thời điểm hiện tại đã vượt qua `registration_deadline`, hệ thống chặn và báo lỗi `"Cannot cancel assignment after registration has closed"`.<br>**Ngoại lệ 2 (Sai người):** Nếu user đang đăng nhập không phải là trọng tài của giải đấu này, hệ thống chặn và báo lỗi `"You are not the assigned referee for this tournament"`. |
| **Priority** | Medium (Should Have) |
| **Frequency of Use** | Rất thấp. |
| **Business Rules** | • Việc huỷ phân công chỉ được thực hiện HỢP LỆ khi thời điểm hiện tại < `registration_deadline`.<br>• Không cần quy trình duyệt (PENDING) như UC-01, việc huỷ có tác dụng tức thì. |
| **Other Information** | **Endpoint API:** `PUT /api/referee/tournaments/{tournamentId}/cancel-assignment`<br>**Request Body:** Không có.<br>**Response Body:** `{"message": "Successfully cancelled assignment for the tournament."}` |
| **Assumptions** | Admin sẽ có một cơ chế cảnh báo riêng khi một giải đấu bị trống trọng tài (referee_id = null) sát ngày đóng đăng ký. |
