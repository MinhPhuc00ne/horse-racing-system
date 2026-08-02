# Hướng Dẫn Đóng Góp (Contributing Guidelines)

Cảm ơn bạn đã quan tâm và muốn đóng góp cho dự án **Horse Racing Management System**! Để đảm bảo quy trình phát triển chuyên nghiệp, nhất quán và dễ quản lý, vui lòng tuân thủ các quy tắc đặt tên branch, viết commit message và quy trình làm việc bên dưới.

---

## 📋 Mục Lục

1. [Quy Tắc Đặt Tên Branch](#1-quy-tắc-đặt-tên-branch)
2. [Quy Chuẩn Commit Message (Conventional Commits)](#2-quy-chuẩn-commit-message-conventional-commits)
3. [Quy Trình Phát Triển & Pull Request (PR)](#3-quy-trình-phát-triển--pull-request-pr)
4. [Chuẩn Code & Best Practices](#4-chuẩn-code--best-practices)

---

## 1. 🌿 Quy Tắc Đặt Tên Branch

Tên branch cần phản ánh chính xác nội dung công việc đang được thực hiện. Sử dụng chữ thường (lowercase) và phân tách bằng dấu gạch ngang (`-`).

### Cấu trúc tên branch:
```text
<prefix>/<tên-tính-năng-hoặc-mã-task>
```

### Các Prefix hợp lệ:

| Prefix | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `feature/` | Phát triển tính năng mới | `feature/jwt-authentication`, `feature/payos-payment` |
| `fix/` | Sửa lỗi (bug fix) thông thường | `fix/login-validation-error`, `fix/wallet-balance-calc` |
| `hotfix/` | Sửa lỗi khẩn cấp trên môi trường Production | `hotfix/security-patch-cors` |
| `docs/` | Cập nhật tài liệu (README, API doc, swagger...) | `docs/update-contributing-guide` |
| `refactor/` | Tối ưu hóa code mà không làm thay đổi tính năng | `refactor/race-service-logic` |
| `test/` | Viết bổ sung unit test, integration test | `test/auth-controller-test` |
| `chore/` | Cập nhật cấu hình, dependency, docker compose | `chore/update-pom-dependencies` |

---

## 2. 📝 Quy Chuẩn Commit Message (Conventional Commits)

Dự án áp dụng chuẩn **Conventional Commits** để giúp lịch sử commit sạch đẹp, tự động hóa release note và hỗ trợ CI/CD.

### Cấu trúc Commit Message:
```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Các Type tiêu chuẩn:

- **`feat`**: Tính năng mới (new feature for the user/system).
- **`fix`**: Sửa lỗi (bug fix).
- **`docs`**: Thay đổi tài liệu (documentation only).
- **`style`**: Định dạng code (whitespace, formatting, missing semi-colons...) không thay đổi logic.
- **`refactor`**: Cấu trúc lại code mà không sửa bug cũng không thêm feat.
- **`perf`**: Thay đổi code nhằm tăng hiệu năng (performance improvement).
- **`test`**: Thêm testcase hoặc sửa các testcase hiện có.
- **`chore`**: Cập nhật tác vụ xây dựng (build system, dependencies, tool setup).
- **`ci`**: Thay đổi cấu hình CI/CD (GitHub Actions, Docker setup...).

### Ví dụ về Scope:
Scope có thể là tên module hoặc component liên quan, ví dụ: `auth`, `race`, `wallet`, `payment`, `ui`, `docker`, `db`.

### Ví dụ Commit hợp lệ:

```bash
# Thêm tính năng đăng nhập Google OAuth2
feat(auth): add Google OAuth2 login integration

# Sửa lỗi tính toán số dư ví sau khi đặt cược
fix(wallet): resolve race condition in balance deduction

# Cập nhật tài liệu Hướng dẫn đóng góp
docs(readme): add contributing guidelines and commit specs

# Re-structure service xử lý giải đua
refactor(race): simplify RaceScheduleService method calls

# Thêm unit test cho PaymentController
test(payment): add unit tests for PayOS webhook handling
```

---

## 3. 🔄 Quy Trình Phát Triển & Pull Request (PR)

1. **Fork / Checkout branch mới** từ branch `main` (hoặc `develop`):
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/user-profile-avatar
   ```
2. **Thực hiện thay đổi và commit** tuân thủ quy chuẩn Conventional Commits.
3. **Kiểm tra code & Test** trước khi push:
   - Đảm bảo ứng dụng chạy không lỗi compile.
   - Chạy linter / format code.
4. **Push branch lên GitHub**:
   ```bash
   git push origin feature/user-profile-avatar
   ```
5. **Tạo Pull Request (PR)**:
   - Đặt tiêu đề PR rõ ràng theo định dạng commit: `feat(user): add user profile avatar upload`.
   - Mô tả chi tiết những gì đã thay đổi và cách test.
   - Gắn tag cho reviewers (thành viên nhóm hoặc Maintainer).

---

## 4. 🛠️ Chuẩn Code & Best Practices

- **Backend (Spring Boot)**:
  - Tuân thủ chuẩn Naming Convention của Java (CamelCase cho variable/method, PascalCase cho Class).
  - Không hardcode các thông tin nhạy cảm (API Keys, Passwords, Secrets) vào source code. Sử dụng môi trường `.env` hoặc `application.yml`.
  - Viết code có xử lý Exception đầy đủ (sử dụng `@RestControllerAdvice` nếu cần).
- **Frontend (React + Vite)**:
  - Đặt tên Component theo chuẩn PascalCase (vd: `RaceCard.jsx`).
  - Giữ cho Component gọn gàng, tái sử dụng Hook và Service module (Axios).
  - Tuân thủ cấu hình ESLint và Prettier có sẵn trong project (`npm run lint`).
