# Danh sách API Backend (Horse Racing System)

Tài liệu này liệt kê toàn bộ các API hiện có dưới Backend để đội Frontend dễ dàng tham khảo và tích hợp. 
Tất cả các API đều có tiền tố chung là `/api` (hoặc cấu hình trong axios là `baseURL`).

---

## 1. Authentication & User Profile (`/api/auth`)
*Dùng để quản lý đăng nhập, đăng ký và lấy thông tin user hiện tại.*

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/auth/register` | Đăng ký tài khoản mới (Mặc định: SPECTATOR). |
| `POST` | `/auth/login` | Đăng nhập bằng Email và Password. Trả về Access/Refresh token. |
| `POST` | `/auth/google` | Đăng nhập/Đăng ký bằng Google OAuth2 (gửi lên `credential`). |
| `POST` | `/auth/refresh` | Cấp lại Access Token mới dựa vào Refresh Token. |
| `POST` | `/auth/logout` | Đăng xuất (Vô hiệu hóa Refresh Token). |
| `GET`  | `/auth/me` | Lấy thông tin user đang đăng nhập (kèm Role). Cần gửi Bearer Token. |
| `GET`  | `/auth/verify?token=...`| Xác thực tài khoản sau khi đăng ký bằng token gửi qua mail. |
| `POST` | `/auth/forgot-password`| Yêu cầu cấp mã OTP qua mail để lấy lại mật khẩu. |
| `POST` | `/auth/verify-reset-otp`| Xác thực mã OTP có hợp lệ hay không. |
| `POST` | `/auth/reset-password` | Đặt lại mật khẩu mới cùng mã OTP. |

---

## 2. Public Data (`/api`)
*Các API không yêu cầu đăng nhập cũng có thể xem được (hoặc quyền cơ bản).*

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET`  | `/tournaments` | Lấy danh sách các giải đấu. |
| `GET`  | `/tournaments/{id}` | Xem chi tiết 1 giải đấu. |
| `GET`  | `/tournaments/{id}/races`| Xem danh sách các vòng đua trong một giải đấu. |
| `GET`  | `/races/{id}` | Lấy chi tiết một vòng đua. |
| `GET`  | `/races/{id}/participants`| Lấy danh sách ngựa tham gia trong một vòng đua. |

---

## 3. Quản lý Chủ Ngựa - Owner (`/api/owner`)
*Dành riêng cho user có quyền `HORSE_OWNER`.*

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET`  | `/owner/profile` | Lấy profile chủ ngựa. |
| `PUT`  | `/owner/profile` | Cập nhật profile chủ ngựa. |
| `GET`  | `/owner/horses` | Lấy danh sách ngựa của chủ ngựa đang đăng nhập. |
| `POST` | `/owner/horses` | Thêm ngựa mới. |
| `GET`  | `/owner/agreements` | Lấy danh sách các thỏa thuận/hợp đồng thuê nài ngựa. |
| `POST` | `/owner/agreements/invite`| Gửi lời mời/hợp đồng cho một Jockey cưỡi ngựa của mình. |
| `POST` | `/owner/race-registrations`| Đăng ký ngựa vào một vòng đua. |

---

## 4. Quản lý Nài Ngựa - Jockey (`/api/jockey`)
*Dành riêng cho user có quyền `JOCKEY`.*

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET`  | `/jockey/agreements` | Lấy danh sách các lời mời (agreements) từ chủ ngựa. |
| `PUT`  | `/jockey/agreements/{id}/accept`| Chấp nhận lời mời cưỡi ngựa. |
| `PUT`  | `/jockey/agreements/{id}/reject`| Từ chối lời mời cưỡi ngựa. |

---

## 5. Kết nối Bạn bè - Connection (`/api/connections`)
*Cho phép users kết nối, gửi yêu cầu kết bạn với nhau.*

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET`  | `/connections/directory` | Duyệt danh sách users để kết bạn. |
| `GET`  | `/connections/friends` | Xem danh sách bạn bè hiện tại. |
| `POST` | `/connections/request` | Gửi yêu cầu kết bạn. |
| `PUT`  | `/connections/request/{id}/respond` | Đồng ý / Từ chối yêu cầu kết bạn. |
| `DELETE`| `/connections/{id}` | Hủy kết bạn. |

---

## 6. Upload Files (`/api/files`)
*Dùng để upload hình ảnh (Avatar, hình ảnh ngựa,...)*

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/files/upload` | Upload file lên server. Gửi lên qua form-data. |

---

## 7. Yêu cầu Nâng cấp Tài khoản (`/api/upgrade-requests`)
*Dùng cho user gửi yêu cầu lên Admin xin cấp quyền Owner hoặc Jockey.*

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/upgrade-requests` | Gửi một yêu cầu nâng cấp quyền mới. |
| `GET`  | `/upgrade-requests/me` | Lấy lịch sử/trạng thái các yêu cầu nâng cấp của bản thân. |

---

## 8. Quản trị viên - Admin (`/api/admin`)
*Dành riêng cho quyền `ADMIN`. Gồm các nghiệp vụ tạo giải đấu và duyệt đơn.*

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET`  | `/admin/tracks` | Lấy danh sách các trường đua. |
| `POST` | `/admin/tournaments` | Tạo giải đua mới. |
| `POST` | `/admin/races` | Tạo vòng đua mới (Race). |
| `GET`  | `/admin/race-registrations`| Lấy danh sách các đăng ký thi đấu đang chờ duyệt. |
| `PUT`  | `/admin/race-registrations/{id}/approve`| Duyệt cho phép ngựa tham gia vòng đua. |
| `PUT`  | `/admin/race-registrations/{id}/reject`| Từ chối đăng ký tham gia thi đấu. |
| `GET`  | `/admin/upgrade-requests` | Xem toàn bộ các yêu cầu nâng cấp tài khoản của user. |
| `PUT`  | `/admin/upgrade-requests/{id}/approve` | Duyệt yêu cầu nâng cấp (Cấp role cho user). |
| `PUT`  | `/admin/upgrade-requests/{id}/reject` | Từ chối yêu cầu nâng cấp tài khoản. |

---

*Lưu ý: Để gọi các API cần quyền truy cập (ngoại trừ /api/auth/login, /api/auth/register, và /api Public), FE cần thêm Header `Authorization: Bearer <access_token>` vào mỗi Request.*
