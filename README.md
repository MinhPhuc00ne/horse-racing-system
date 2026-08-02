# 🏇 Horse Racing Management System

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-brightgreen?logo=springboot)
![React](https://img.shields.io/badge/React-19.0-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)
![MSSQL](https://img.shields.io/badge/MSSQL-2022-red?logo=microsoftsqlserver)
![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?logo=docker)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 📌 About

**Horse Racing Management System** is a modern management and event organization system for horse racing. It enables users to track race schedules, view racehorse and jockey information, place bets / purchase tickets, manage digital wallets with integrated online PayOS payment gateway, access an AI assistant for advice, and utilize a comprehensive Admin Dashboard.

The project is built with a microservices-ready architecture featuring a Backend Spring Boot RESTful API and a Frontend React + Vite SPA for an optimal user experience.

---

## 🌟 Key Features

### 🔐 1. Authentication & Security
- Registration and login system with multi-role access control (Admin, Referee, Horse Owner, User).
- Quick login support via **Google OAuth2**.
- Account verification via Email (Email Activation Token).
- Secure API endpoints using **JWT (JSON Web Token)** and BCrypt password hashing.
- Access rate limiting to protect against Brute-force/DDoS attacks using **Bucket4j & Caffeine**.

### 🏁 2. Race Management & Scheduling
- View information about race lists, racetracks, participating racehorses, and jockeys.
- Real-time race results updates by Referees with a result verification mechanism.
- Race history statistics, horse rankings, and jockey performance tracking.

### 💰 3. Digital Wallet & Payment Integration
- Personal wallet management and detailed transaction history logs.
- Integrated **PayOS** online payment gateway (automated bank transfer QR Code).
- Secure online betting / ticket purchasing with automated balance updates.

### 🤖 4. AI Advisory Assistant
- Integrated AI Chatbot to answer inquiries, analyze horse performance, and provide personalized suggestions to users.

### 📊 5. Admin Dashboard
- User management, role assignment, and account status controls (Blacklist management).
- Account upgrade request approvals (Horse Owners, Referees).
- Revenue statistics, betting volume metrics, and financial reporting powered by **Recharts**.
- User feedback and bug report management.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Backend** | Java 17, Spring Boot 3.3.13, Spring Security, Spring Data JPA, JWT, OAuth2 Client |
| **Frontend** | React 19, Vite 8, React Router DOM v7, TanStack React Query, React-Bootstrap, Recharts |
| **Database** | Microsoft SQL Server 2022 (MSSQL) |
| **Payment Gateway** | PayOS SDK (payos-java) |
| **Security & Rate Limit** | Bucket4j, Caffeine Cache |
| **Container & DevOps** | Docker, Docker Compose, Railway / Nixpacks configuration |

---

## 📂 Project Structure

```text
horse-racing-system/
├── backend/                   # Spring Boot Source Code
│   ├── src/main/java/com/horseracing/
│   │   ├── configs/           # CORS, Security, Swagger, PayOS, Mail configurations
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
│       └── HorseRacingDB.sql  # Database initialization script for MSSQL
├── docker-compose.yml         # Orchestration file for full-stack local runner
├── CONTRIBUTING.md            # Branch naming & Conventional Commit guidelines
├── LICENSE                    # MIT Open Source License
└── README.md                  # Project documentation guide
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) & Docker Compose (Recommended)
- *If running manually without Docker:*
  - Java JDK 17+
  - Node.js v18+ & npm
  - Microsoft SQL Server 2022

---

### Option 1: Quick Run with Docker Compose (Recommended) 🐳

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MinhPhuc00ne/horse-racing-system.git
   cd horse-racing-system
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory (copy from `.env.example` if available):
   ```bash
   cp .env.example .env
   ```

3. **Start the Entire System (Database, Backend, Frontend)**:
   ```bash
   docker-compose up --build -d
   ```

4. **Access the Applications**:
   - **Frontend App**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8080](http://localhost:8080)
   - **Database (MSSQL)**: Port `1433` (User: `sa`, Pass: `HorseRacing@123`)

---

### Option 2: Manual Setup 💻

#### 1. Database (MSSQL)
- Create a database named `HorseRacingDB` in MSSQL Server.
- Run the SQL script located at `database/init/HorseRacingDB.sql` to initialize tables and sample data.

#### 2. Run Backend (Spring Boot)
```bash
cd backend
# Configure DB connection in application.yml or environment variables
./mvnw spring-boot:run
```
The Backend will listen on `http://localhost:8080`.

#### 3. Run Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
The Frontend will run on `http://localhost:5173`.

---

## 🤝 Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](file:///c:/Users/MSI%20VN/Documents/Raphael/SWP391-SU26/project/horse-racing-system/CONTRIBUTING.md) document for details on:
- Branch naming rules (`feature/`, `fix/`, `docs/`...)
- Commit message standards ([Conventional Commits](https://www.conventionalcommits.org/))
- Pull Request submission process.

---

## 📄 License

This project is distributed under the **MIT License**. See the [LICENSE](file:///c:/Users/MSI%20VN/Documents/Raphael/SWP391-SU26/project/horse-racing-system/LICENSE) file for details.

---

## 📞 Contact & Support

- **Author**: MinhPhuc00ne
- **Project Repo**: [MinhPhuc00ne/horse-racing-system](https://github.com/MinhPhuc00ne/horse-racing-system)
