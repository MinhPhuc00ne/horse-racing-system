# Backend Validation Rules - Horse Racing System

> Tài liệu này tổng hợp **toàn bộ các quy tắc validation** hiện có trong backend dự án.
> Bao gồm: Bean Validation (annotation), Business Logic Validation (trong Service), và Security Validation.
>
> **Cập nhật lần cuối:** 2026-05-30
> **Phạm vi:** `backend/src/main/java/com/horseracing/`

---

## Mục lục

1. [DTO Validation (Bean Validation Annotations)](#1-dto-validation-bean-validation-annotations)
   - [RegisterRequest](#11-registerrequest)
   - [LoginRequest](#12-loginrequest)
   - [GoogleLoginRequest](#13-googleloginrequest)
   - [LogoutRequest](#14-logoutrequest)
   - [RefreshTokenRequest](#15-refreshtokenrequest)
   - [UpgradeRequestSubmit](#16-upgraderequestsubmit)
   - [RejectUpgradeRequest](#17-rejectupgraderequest)
2. [Business Logic Validation (Service Layer)](#2-business-logic-validation-service-layer)
   - [AuthService](#21-authservice)
   - [UpgradeRequestService](#22-upgraderequestservice)
   - [RefreshTokenService](#23-refreshtokenservice)
   - [FileStorageService](#24-filestorageservice)
3. [Security & Authorization Validation](#3-security--authorization-validation)
   - [Endpoint Access Control](#31-endpoint-access-control)
   - [JWT Token Validation](#32-jwt-token-validation)
   - [Role-based Authorization](#33-role-based-authorization)
4. [Database-level Constraints](#4-database-level-constraints)
5. [Tổng hợp Error Messages](#5-tổng-hợp-error-messages)

---

## 1. DTO Validation (Bean Validation Annotations)

Các annotation validation được kích hoạt khi controller dùng `@Valid` trước `@RequestBody`.

### 1.1 RegisterRequest

**File:** `dto/request/RegisterRequest.java`
**Endpoint:** `POST /api/auth/register`

| Field      | Annotation                   | Rule                                              | Error Message                                                             |
|------------|------------------------------|---------------------------------------------------|---------------------------------------------------------------------------|
| `username` | `@NotBlank`                  | Không được null / rỗng / chỉ có khoảng trắng     | `"Username is required"`                                                  |
| `username` | `@Size(min=3, max=50)`       | Độ dài từ 3 đến 50 ký tự                         | `"Username must be between 3 and 50 characters"`                          |
| `fullName` | `@NotBlank`                  | Không được null / rỗng / chỉ có khoảng trắng     | `"Full name is required"`                                         ài từ 2 đến 100 ký tự                        | `"Full name must be between 2 and 100 characters"`                        |
| `email`    | `@NotBlank`                  | Không được null / rỗng / chỉ có khoảng trắng     | `"Email is required"`                                                     |
| `email`    | `@Email`                     | Phải đúng định dạng email                        | `"Invalid email format"`                                                  |
| `password` | `@NotBlank`                  | Không được null / rỗng / chỉ có khoảng trắng     | `"Password is         |
| `fullName` | `@Size(min=2, max=100)`      | Độ drequired"`                                                  |
| `password` | `@Size(min=8, max=100)`      | Độ dài từ 8 đến 100 ký tự                        | `"Password must be between 8 and 100 characters"`                         |
| `password` | `@Pattern`                   | Phải có ít nhất 1 chữ hoa VÀ 1 ký tự đặc biệt   | `"Password must contain at least one uppercase letter and one special character"` |
| `role`     | _(không có)_                 | Optional — mặc định là `SPECTATOR` nếu null      | _(không có message)_                                                      |

**Regex password:**
```
^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`|]).*$
```

---

### 1.2 LoginRequest

**File:** `dto/request/LoginRequest.java`
**Endpoint:** `POST /api/auth/login`

| Field      | Annotation  | Rule                                          | Error Message              |
|------------|-------------|-----------------------------------------------|----------------------------|
| `email`    | `@NotBlank` | Không được null / rỗng / chỉ có khoảng trắng | `"Email is required"`      |
| `email`    | `@Email`    | Phải đúng định dạng email                    | `"Invalid email format"`   |
| `password` | `@NotBlank` | Không được null / rỗng / chỉ có khoảng trắng | `"Password is required"`   |

---

### 1.3 GoogleLoginRequest

**File:** `dto/request/GoogleLoginRequest.java`
**Endpoint:** `POST /api/auth/google`

| Field        | Annotation  | Rule                                          | Error Message                        |
|--------------|-------------|-----------------------------------------------|--------------------------------------|
| `credential` | `@NotBlank` | Không được null / rỗng / chỉ có khoảng trắng | `"Google credential is required"`    |

---

### 1.4 LogoutRequest

**File:** `dto/request/LogoutRequest.java`
**Endpoint:** `POST /api/auth/logout`

| Field          | Annotation  | Rule                                          | Error Message                     |
|----------------|-------------|-----------------------------------------------|-----------------------------------|
| `refreshToken` | `@NotBlank` | Không được null / rỗng / chỉ có khoảng trắng | `"Refresh token is required"`     |

---

### 1.5 RefreshTokenRequest

**File:** `dto/request/RefreshTokenRequest.java`
**Endpoint:** `POST /api/auth/refresh`

| Field          | Annotation  | Rule                                          | Error Message                     |
|----------------|-------------|-----------------------------------------------|-----------------------------------|
| `refreshToken` | `@NotBlank` | Không được null / rỗng / chỉ có khoảng trắng | `"Refresh token is required"`     |

---

### 1.6 UpgradeRequestSubmit

**File:** `dto/request/UpgradeRequestSubmit.java`
**Endpoint:** `POST /api/upgrade-requests`

| Field                 | Annotation   | Rule                                                    | Error Message                       |
|-----------------------|--------------|---------------------------------------------------------|-------------------------------------|
| `requestedRole`       | `@NotNull`   | Không được null (nhưng có thể là bất kỳ giá trị Role nào) | `"Requested role is required"`   |
| `notes`               | _(không có)_ | Optional                                               | —                                   |
| `fullName`            | _(không có)_ | Optional ở DTO — bắt buộc ở Service (xem mục 2.2)     | —                                   |
| `dateOfBirth`         | _(không có)_ | Optional ở DTO — bắt buộc ở Service                   | —                                   |
| `phoneNumber`         | _(không có)_ | Optional ở DTO — bắt buộc ở Service                   | —                                   |
| `identityNumber`      | _(không có)_ | Optional ở DTO — bắt buộc ở Service                   | —                                   |
| `weight`              | _(không có)_ | Optional ở DTO — bắt buộc ở Service nếu role = JOCKEY | —                                   |
| `height`              | _(không có)_ | Optional ở DTO — bắt buộc ở Service nếu role = JOCKEY | —                                   |
| `licenseNumber`       | _(không có)_ | Optional ở DTO — bắt buộc ở Service nếu role = JOCKEY | —                                   |
| `stableName`          | _(không có)_ | Optional ở DTO — bắt buộc ở Service nếu role = HORSE_OWNER | —                              |
| `stableAddress`       | _(không có)_ | Optional ở DTO — bắt buộc ở Service nếu role = HORSE_OWNER | —                              |
| `certificationNumber` | _(không có)_ | Optional ở DTO — bắt buộc ở Service nếu role = RACE_REFEREE | —                           |
| `experienceYears`     | _(không có)_ | Optional ở DTO — bắt buộc ở Service nếu role = RACE_REFEREE | —                           |
| `documentUrls`        | _(không có)_ | Optional — mặc định là danh sách rỗng nếu null        | —                                   |

> ⚠️ **Lưu ý:** Hầu hết các trường trong `UpgradeRequestSubmit` **không có Bean Validation annotation**. Toàn bộ logic kiểm tra được thực hiện thủ công trong `UpgradeRequestService.submitRequest()`.

---

### 1.7 RejectUpgradeRequest

**File:** `dto/request/RejectUpgradeRequest.java`
**Endpoint:** `PUT /api/admin/upgrade-requests/{id}/reject`

| Field             | Annotation  | Rule                                          | Error Message                         |
|-------------------|-------------|-----------------------------------------------|---------------------------------------|
| `rejectionReason` | `@NotBlank` | Không được null / rỗng / chỉ có khoảng trắng | `"Rejection reason is required"`      |

---

## 2. Business Logic Validation (Service Layer)

Các validation này được thực thi thủ công bằng `if` + `throw new RuntimeException(...)` bên trong Service.

### 2.1 AuthService

**File:** `services/AuthService.java`

#### `register(RegisterRequest)`

| Điều kiện kiểm tra                          | Lỗi ném ra (RuntimeException)          |
|---------------------------------------------|----------------------------------------|
| Email đã tồn tại trong DB (`existsByEmail`) | `"Email is already registered"`        |
| Username đã tồn tại trong DB (`existsByUsername`) | `"Username is already taken"`    |

#### `login(LoginRequest)`

| Điều kiện kiểm tra                                    | Lỗi ném ra                                      |
|-------------------------------------------------------|-------------------------------------------------|
| Sai email / password (qua `AuthenticationManager`)   | Spring Security ném `BadCredentialsException` → Controller trả về `401 "Invalid email or password"` |
| Email không tồn tại trong DB                          | `"User not found"`                              |

#### `googleLogin(GoogleLoginRequest)`

| Điều kiện kiểm tra                                   | Lỗi ném ra (RuntimeException)                      |
|------------------------------------------------------|----------------------------------------------------|
| Google ID Token không hợp lệ (verify thất bại)      | `"Invalid Google token"`                           |
| Bất kỳ exception nào khác trong quá trình xử lý     | `"Google authentication failed: " + e.getMessage()` |

#### `refreshToken(RefreshTokenRequest)`

| Điều kiện kiểm tra                          | Lỗi ném ra (RuntimeException)       |
|---------------------------------------------|-------------------------------------|
| Refresh token không tồn tại trong DB        | `"Invalid refresh token"`           |
| Token đã bị revoked hoặc đã hết hạn         | Xem `RefreshTokenService` bên dưới  |

#### `getCurrentUser(String email)`

| Điều kiện kiểm tra                | Lỗi ném ra (RuntimeException) |
|-----------------------------------|-------------------------------|
| Email không tồn tại trong DB      | `"User not found"`            |

---

### 2.2 UpgradeRequestService

**File:** `services/UpgradeRequestService.java`

#### `submitRequest(String email, UpgradeRequestSubmit)`

**Bước 1 — Kiểm tra người dùng:**

| Điều kiện kiểm tra                                    | Lỗi ném ra (RuntimeException)                            |
|-------------------------------------------------------|----------------------------------------------------------|
| Email không tồn tại trong DB                          | `"User not found"`                                       |

**Bước 2 — Kiểm tra role được yêu cầu:**

| Điều kiện kiểm tra                                              | Lỗi ném ra (RuntimeException)                                          |
|-----------------------------------------------------------------|------------------------------------------------------------------------|
| `requestedRole` là `ADMIN` hoặc `SPECTATOR`                    | `"Cannot request upgrade to ADMIN or SPECTATOR role"`                  |
| User đã có role trùng với `requestedRole`                      | `"User already has the requested role"`                                |
| User đã có một yêu cầu đang `PENDING`                         | `"You already have a pending upgrade request"`                         |

**Bước 3 — Kiểm tra thông tin chung (bắt buộc cho mọi role):**

| Field            | Điều kiện kiểm tra                          | Lỗi ném ra (RuntimeException)                         |
|------------------|---------------------------------------------|-------------------------------------------------------|
| `fullName`       | null hoặc rỗng (sau trim)                   | `"Full name is required"`                             |
| `dateOfBirth`    | null                                        | `"Date of birth is required"`                         |
| `phoneNumber`    | null hoặc rỗng (sau trim)                   | `"Phone number is required"`                          |
| `identityNumber` | null hoặc rỗng (sau trim)                   | `"Identity card / Passport number is required"`       |

**Bước 4 — Kiểm tra theo role (role-specific):**

##### Role = `JOCKEY`

| Field           | Điều kiện kiểm tra                          | Lỗi ném ra (RuntimeException)                              |
|-----------------|---------------------------------------------|------------------------------------------------------------|
| `weight`        | null, hoặc `< 40`, hoặc `> 80`             | `"Jockey weight must be between 40 and 80 kg"`             |
| `height`        | null hoặc `<= 0`                            | `"Jockey height must be a positive number"`                |
| `licenseNumber` | null hoặc rỗng (sau trim)                   | `"Jockey license number is required"`                      |

##### Role = `HORSE_OWNER`

| Field           | Điều kiện kiểm tra          | Lỗi ném ra (RuntimeException)          |
|-----------------|-----------------------------|----------------------------------------|
| `stableName`    | null hoặc rỗng (sau trim)   | `"Stable name is required"`            |
| `stableAddress` | null hoặc rỗng (sau trim)   | `"Stable address is required"`         |

##### Role = `RACE_REFEREE`

| Field                 | Điều kiện kiểm tra                | Lỗi ném ra (RuntimeException)                            |
|-----------------------|-----------------------------------|----------------------------------------------------------|
| `certificationNumber` | null hoặc rỗng (sau trim)         | `"Referee certification number is required"`             |
| `experienceYears`     | null hoặc `< 0`                   | `"Referee experience years must be a positive number"`   |

---

#### `getUserRequests(String email)`

| Điều kiện kiểm tra          | Lỗi ném ra (RuntimeException) |
|-----------------------------|-------------------------------|
| Email không tồn tại trong DB | `"User not found"`           |

---

#### `approveRequest(Integer requestId)`

| Điều kiện kiểm tra                        | Lỗi ném ra (RuntimeException)               |
|-------------------------------------------|---------------------------------------------|
| Request ID không tồn tại trong DB         | `"Upgrade request not found"`               |
| Status của request không phải `PENDING`   | `"Only pending requests can be approved"`   |

---

#### `rejectRequest(Integer requestId, RejectUpgradeRequest)`

| Điều kiện kiểm tra                        | Lỗi ném ra (RuntimeException)               |
|-------------------------------------------|---------------------------------------------|
| Request ID không tồn tại trong DB         | `"Upgrade request not found"`               |
| Status của request không phải `PENDING`   | `"Only pending requests can be rejected"`   |

---

### 2.3 RefreshTokenService

**File:** `services/RefreshTokenService.java`

#### `verifyExpiration(RefreshToken)`

| Điều kiện kiểm tra             | Lỗi ném ra (RuntimeException)                               | Hành vi thêm                    |
|--------------------------------|-------------------------------------------------------------|---------------------------------|
| Token đã bị revoked (`revoked = true`) | `"Refresh token was revoked. Please login again."` | Xóa token khỏi DB               |
| Token đã hết hạn (`expiryDate < now`) | `"Refresh token has expired. Please login again."` | Xóa token khỏi DB               |

---

### 2.4 FileStorageService

**File:** `services/FileStorageService.java`

#### `storeFile(MultipartFile)`

| Điều kiện kiểm tra                             | Lỗi ném ra (RuntimeException)                                     |
|------------------------------------------------|-------------------------------------------------------------------|
| Tên file chứa `..` (path traversal attempt)    | `"Sorry! Filename contains invalid path sequence " + fileName`    |
| Không thể lưu file (IOException)               | `"Could not store file " + fileName + ". Please try again!"`      |

**Trong FileController:** File rỗng (`file.isEmpty()`) → bỏ qua (skip), không ném lỗi.

---

## 3. Security & Authorization Validation

### 3.1 Endpoint Access Control

**File:** `configs/SecurityConfig.java`

| URL Pattern                   | Quyền truy cập             |
|-------------------------------|----------------------------|
| `/api/auth/**`                | Public (không cần token)   |
| `/api/test/public`            | Public (không cần token)   |
| `/uploads/**`                 | Public (không cần token)   |
| `/error`                      | Public (không cần token)   |
| Tất cả các endpoint còn lại   | Phải có JWT token hợp lệ   |

---

### 3.2 JWT Token Validation

**File:** `security/JwtAuthenticationFilter.java` + `security/JwtUtils.java`

| Điều kiện kiểm tra                                  | Kết quả                                        |
|-----------------------------------------------------|------------------------------------------------|
| Header `Authorization` không có hoặc không bắt đầu bằng `Bearer ` | Request đi tiếp không có authentication |
| JWT token không hợp lệ (sai chữ ký / sai format)   | `jwtUtils.validateToken()` trả về `false` → bỏ qua token |
| JWT token hợp lệ                                    | Set authentication vào `SecurityContextHolder` |

**Các lỗi JWT được bắt (trong `JwtUtils.validateToken`):**
- `JwtException` (bao gồm `ExpiredJwtException`, `MalformedJwtException`, `SignatureException`)
- `IllegalArgumentException`

---

### 3.3 Role-based Authorization

**File:** `controllers/UpgradeRequestController.java`, `controllers/AdminUpgradeRequestController.java`

| Endpoint                                         | Annotation                  | Role được phép       |
|--------------------------------------------------|-----------------------------|----------------------|
| `POST /api/upgrade-requests`                     | `@PreAuthorize("hasRole('SPECTATOR')")` | Chỉ `SPECTATOR`      |
| `GET /api/upgrade-requests/me`                   | _(không có @PreAuthorize)_  | Mọi user đã đăng nhập |
| `GET /api/admin/upgrade-requests`                | `@PreAuthorize("hasRole('ADMIN')")` (class-level) | Chỉ `ADMIN` |
| `PUT /api/admin/upgrade-requests/{id}/approve`   | `@PreAuthorize("hasRole('ADMIN')")` (class-level) | Chỉ `ADMIN` |
| `PUT /api/admin/upgrade-requests/{id}/reject`    | `@PreAuthorize("hasRole('ADMIN')")` (class-level) | Chỉ `ADMIN` |
| `POST /api/files/upload`                         | _(không có @PreAuthorize)_  | Mọi user đã đăng nhập |

---

## 4. Database-level Constraints

**File:** `entities/User.java`

| Column         | Constraints DB                                               |
|----------------|--------------------------------------------------------------|
| `username`     | `NOT NULL`, `UNIQUE`, `VARCHAR(255)`                         |
| `email`        | `NOT NULL`, `UNIQUE`, `VARCHAR(255)`                         |
| `password`     | `VARCHAR(255)` (nullable — dùng cho Google OAuth user)       |
| `full_name`    | `NOT NULL`, `VARCHAR(255)`                                   |
| `role`         | `NOT NULL`, `VARCHAR(20)`, default `'SPECTATOR'`             |
| `provider`     | `NOT NULL`, `VARCHAR(20)`, default `'LOCAL'`                 |
| `enabled`      | `NOT NULL`, `BIT`, default `1`                               |

**File:** `entities/UpgradeRequest.java`

| Column            | Constraints DB                              |
|-------------------|---------------------------------------------|
| `user_id`         | `NOT NULL`, FK → `users.id`                 |
| `requested_role`  | `NOT NULL`, `VARCHAR(20)`                   |
| `status`          | `NOT NULL`, `VARCHAR(20)`, default `PENDING` |

---

## 5. Tổng hợp Error Messages

### Nhóm theo HTTP Status Code

#### 400 Bad Request

| Nguồn              | Error Message                                              |
|--------------------|------------------------------------------------------------|
| Bean Validation    | Các message từ annotation (xem Mục 1)                     |
| AuthService        | `"Email is already registered"`                            |
| AuthService        | `"Username is already taken"`                              |
| UpgradeRequestService | `"Cannot request upgrade to ADMIN or SPECTATOR role"`  |
| UpgradeRequestService | `"User already has the requested role"`                |
| UpgradeRequestService | `"You already have a pending upgrade request"`         |
| UpgradeRequestService | `"Full name is required"`                              |
| UpgradeRequestService | `"Date of birth is required"`                          |
| UpgradeRequestService | `"Phone number is required"`                           |
| UpgradeRequestService | `"Identity card / Passport number is required"`        |
| UpgradeRequestService | `"Jockey weight must be between 40 and 80 kg"`        |
| UpgradeRequestService | `"Jockey height must be a positive number"`           |
| UpgradeRequestService | `"Jockey license number is required"`                  |
| UpgradeRequestService | `"Stable name is required"`                            |
| UpgradeRequestService | `"Stable address is required"`                         |
| UpgradeRequestService | `"Referee certification number is required"`           |
| UpgradeRequestService | `"Referee experience years must be a positive number"` |
| UpgradeRequestService | `"Only pending requests can be approved"`              |
| UpgradeRequestService | `"Only pending requests can be rejected"`              |
| FileStorageService | `"Sorry! Filename contains invalid path sequence ..."`     |
| FileStorageService | `"Could not store file ... Please try again!"`             |

#### 401 Unauthorized

| Nguồn          | Error Message                                                       |
|----------------|---------------------------------------------------------------------|
| AuthController | `"Invalid email or password"`                                       |
| AuthController | `"Google authentication failed: ..."`                               |
| AuthService    | `"Invalid refresh token"`                                           |
| RefreshTokenService | `"Refresh token was revoked. Please login again."`             |
| RefreshTokenService | `"Refresh token has expired. Please login again."`             |
| AuthController | `"Not authenticated"` (khi gọi `/me` mà không có token)            |

#### 404 / Không tìm thấy (ném RuntimeException → 400 trong các controller hiện tại)

| Nguồn              | Error Message                    |
|--------------------|----------------------------------|
| AuthService        | `"User not found"`               |
| UpgradeRequestService | `"User not found"`            |
| UpgradeRequestService | `"Upgrade request not found"` |

---

## Ghi chú & Khuyến nghị

> [!NOTE]
> Hiện tại, các lỗi "không tìm thấy" (user not found, request not found) đang trả về HTTP **400** thay vì **404** do tất cả `RuntimeException` đều bị bắt và map sang 400 trong controller. Có thể cân nhắc tạo custom exception riêng (`NotFoundException`) để trả đúng HTTP status code.

> [!WARNING]
> **`UpgradeRequestSubmit`** thiếu Bean Validation trên hầu hết các trường. Toàn bộ validation nằm trong Service layer. Nếu Service bị bypass (unit test, mock, v.v.), validation sẽ không chạy. Nên bổ sung annotation để có validation ở cả hai lớp.

> [!TIP]
> Có thể xem xét tạo **Global Exception Handler** (`@ControllerAdvice`) để thống nhất cách xử lý lỗi thay vì dùng try-catch trong từng controller method.
