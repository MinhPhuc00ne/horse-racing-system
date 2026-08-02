# 🏇 Horse Racing Management System (Hệ Thống Quản Lý Giải Đua Ngựa)

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-brightgreen?logo=springboot)
![React](https://img.shields.io/badge/React-19.0-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)
![MSSQL](https://img.shields.io/badge/MSSQL-2022-red?logo=microsoftsqlserver)
![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?logo=docker)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 📌 Giới Thiệu (About)

**Horse Racing Management System** là một hệ thống quản lý và tổ chức các giải đua ngựa hiện đại, hỗ trợ người dùng theo dõi lịch trình trận đấu, thông tin chiến mã & nài ngựa, thực hiện đặt cược/mua vé, quản lý ví điện tử tích hợp cổng thanh toán trực tuyến PayOS, hỗ trợ trợ lý AI tư vấn và bảng điều khiển quản trị (Admin Dashboard) toàn diện.

Dự án được xây dựng theo kiến trúc Micro-service ready với Backend Spring Boot RESTful API và Frontend React + Vite SPA tối ưu trải nghiệm người dùng.

---

## 🌟 Tính Năng Nổi Bật (Key Features)

### 🔐 1. Xác Thực & Bảo Mật (Authentication & Security)
- Đăng ký, đăng nhập hệ thống với phân quyền đa vai trò (Admin, Referee, Horse Owner, User).
- Hỗ trợ đăng nhập nhanh qua **Google OAuth2**.
- Xác thực tài khoản qua Email (Email Activation Token).
- Bảo mật API với **JWT (JSON Web Token)**, Mã hóa mật khẩu BCrypt.
- Giới hạn tần suất truy cập (Rate Limiting) chống Brute-force/DDoS bằng **Bucket4j & Caffeine**.

### 🏁 2. Quản Lý Giải Đua & Lịch Trình (Race Management)
- Xem thông tin danh sách giải đua, đường đua, danh sách ngựa tham gia và nài ngựa (Jockey).
- Cập nhật kết quả đua trực tiếp bởi Trọng tài (Referee) với cơ chế đối soát kết quả.
- Thống kê lịch sử đấu, xếp hạng chiến mã và phong độ nài ngựa.

### 💰 3. Ví Điện Tử & Nạp/Rút Tiền (Wallet & Payment Integration)
- Quản lý tài khoản ví cá nhân, xem chi tiết lịch sử giao dịch.
- Tích hợp cổng thanh toán trực tuyến **PayOS** (chuyển khoản ngân hàng QR Code tự động).
- Đặt cược / Mua vé trực tuyến an toàn và tự động cập nhật số dư.

### 🤖 4. Trợ Lý AI Tư Vấn (AI Chat Assistant)
- Tích hợp AI Chatbot hỗ trợ giải đáp thắc mắc, phân tích phong độ ngựa đua và gợi ý cho người dùng.

### 📊 5. Bảng Điều Khiển Quản Trị (Admin Dashboard)
- Quản lý danh sách người dùng, phân quyền và khóa tài khoản (Blacklist management).
- Phê duyệt yêu cầu nâng cấp tài khoản (Chủ ngựa, Trọng tài).
- Thống kê doanh thu, số lượng cược, báo cáo tài chính qua biểu đồ **Recharts**.
- Quản lý phản hồi (Feedback) và báo cáo lỗi (Report) từ người dùng.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Phân Mục | Công Nghệ |
| :--- | :--- |
| **Backend** | Java 17, Spring Boot 3.3.13, Spring Security, Spring Data JPA, JWT, OAuth2 Client |
| **Frontend** | React 19, Vite 8, React Router DOM v7, TanStack React Query, React-Bootstrap, Recharts |
| **Database** | Microsoft SQL Server 2022 (MSSQL) |
| **Payment Gateway** | PayOS SDK (payos-java) |
| **Security & Rate Limit** | Bucket4j, Caffeine Cache |
| **Container & DevOps** | Docker, Docker Compose, Railway / Nixpacks configuration |

---

## 📂 Cấu Trúc Thư Mục (Project Structure)

```text
horse-racing-system/
├── backend/                   # Spring Boot Source Code
│   ├── src/main/java/com/horseracing/
│   │   ├── configs/           # Cấu hình CORS, Security, Swagger, PayOS, Mail
│   │   ├── controllers/       # REST API Endpoints (Admin, User, Race, Wallet...)
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── entities/          # JPA Entities (Database Mapping)
│   │   ├── repositories/      # JPA Data Repositories
│   │   ├── security/          # JWT Filters, UserDetails Service
│   │   └── services/          # Business Logic Services
│   └── Dockerfile             # Docker container definition for Backend
├── frontend/                  # React + Vite Source Code
│   ├── src/
│   │   ├── components/        # UI Components
│   │   ├── pages/             # App Pages (Dashboard, Race, Wallet, Login...)
│   │   ├── services/          # Axios API Services
│   │   └── context/           # React Context (Auth State, Theme)
│   └── Dockerfile             # Docker container definition for Frontend
├── database/
│   └── init/
│       └── HorseRacingDB.sql  # Script khởi tạo cơ sở dữ liệu MSSQL
├── docker-compose.yml         # Orchestration file cho full-stack local runner
├── CONTRIBUTING.md            # Quy chuẩn đặt tên branch & Conventional Commit
├── LICENSE                    # Giấy phép nguồn mở MIT
└── README.md                  # Tài liệu hướng dẫn dự án
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (Quick Start Guide)

### Yêu Cầu Tiền Đề (Prerequisites)
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) & Docker Compose (Khuyên dùng)
- *Nếu chạy thủ công không dùng Docker:*
  - Java JDK 17+
  - Node.js v18+ & npm
  - Microsoft SQL Server 2022

---

### Cách 1: Khởi chạy nhanh bằng Docker Compose (Khuyên Dùng) 🐳

1. **Clone repository về máy**:
   ```bash
   git clone https://github.com/MinhPhuc00ne/horse-racing-system.git
   cd horse-racing-system
   ```

2. **Cấu hình file môi trường**:
   Tạo file `.env` ở thư mục gốc (copy từ `.env.example` nếu có):
   ```bash
   cp .env.example .env
   ```

3. **Khởi chạy toàn bộ hệ thống (Database, Backend, Frontend)**:
   ```bash
   docker-compose up --build -d
   ```

4. **Truy cập ứng dụng**:
   - **Frontend App**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8080](http://localhost:8080)
   - **Database (MSSQL)**: Port `1433` (User: `sa`, Pass: `HorseRacing@123`)

---

### Cách 2: Khởi chạy thủ công (Manual Setup) 💻

#### 1. Cơ sở dữ liệu (MSSQL)
- Tạo cơ sở dữ liệu tên `HorseRacingDB` trên MSSQL Server.
- Chạy script SQL tại `database/init/HorseRacingDB.sql` để tạo bảng và dữ liệu mẫu.

#### 2. Khởi chạy Backend (Spring Boot)
```bash
cd backend
# Cấu hình kết nối DB trong application.yml hoặc biến môi trường
./mvnw spring-boot:run
```
Backend sẽ lắng nghe tại cổng `http://localhost:8080`.

#### 3. Khởi chạy Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend sẽ chạy tại cổng `http://localhost:5173`.

---

## 🤝 Đóng Góp (Contributing)

Dự án hoan nghênh mọi đóng góp! Vui lòng đọc kỹ tài liệu [CONTRIBUTING.md](file:///c:/Users/MSI%20VN/Documents/Raphael/SWP391-SU26/project/horse-racing-system/CONTRIBUTING.md) để biết chi tiết về:
- Quy tắc đặt tên Branch (`feature/`, `fix/`, `docs/`...)
- Quy chuẩn viết Commit Message ([Conventional Commits](https://www.conventionalcommits.org/))
- Quy trình gửi Pull Request.

---

## 📄 Giấy Phép (License)

Dự án được phân phối dưới giấy phép **MIT License**. Xem chi tiết tại file [LICENSE](file:///c:/Users/MSI%20VN/Documents/Raphael/SWP391-SU26/project/horse-racing-system/LICENSE).

---

## 📞 Liên Hệ & Hỗ Trợ

- **Author**: MinhPhuc00ne
- **Project Repo**: [MinhPhuc00ne/horse-racing-system](https://github.com/MinhPhuc00ne/horse-racing-system)
