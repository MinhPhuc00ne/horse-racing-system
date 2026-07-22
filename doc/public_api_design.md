# Thiết kế API Công Cộng (Public APIs) cho Trang Chủ

Tài liệu này phác thảo các thiết kế kỹ thuật cần thiết để xây dựng các API công cộng không yêu cầu đăng nhập (Public) để cung cấp dữ liệu động cho Bảng xếp hạng (Rankings Board) và Số lượng chiến mã (Stats Section) trên HomePage.

---

## 🔐 1. Cấu hình Phân quyền (Security Bypass)

Để các API này có thể truy cập tự do mà không cần Token hoặc thông tin đăng nhập, ta cần cấu hình loại bỏ kiểm tra bảo mật của Spring Security:

* **File sửa đổi:** `SecurityConfig.java` (hoặc cấu hình WebSecurity của Spring Boot).
* **Cấu hình:**
  ```java
  .requestMatchers("/api/public/**").permitAll()
  ```
  Tất cả các API bắt đầu bằng tiền tố `/api/public/` sẽ bỏ qua bộ lọc JWT.

---

## 🏆 2. API Bảng Xếp Hạng: `GET /api/public/leaderboard`

### A. Dữ liệu Phản hồi (Response DTO)
API này sẽ trả về top 3 (hoặc top 5) nài ngựa và ngựa có điểm số cao nhất hệ thống:

```json
{
  "jockeys": [
    {
      "rank": 1,
      "fullName": "Clarissa Sterling",
      "winRate": 78.5,
      "rankingScore": 2450
    },
    {
      "rank": 2,
      "fullName": "Marcus Rhone",
      "winRate": 65.2,
      "rankingScore": 2310
    }
  ],
  "horses": [
    {
      "rank": 1,
      "horseName": "Stellar Majesty",
      "breedName": "Thoroughbred",
      "rating": 98.4
    },
    {
      "rank": 2,
      "horseName": "Golden Phantom",
      "breedName": "Arabian",
      "rating": 95.8
    }
  ]
}
```

### B. Các bước triển khai Backend
1. **Repository Queries:**
   * **Jockey:** Tạo query lấy top N: `jockeyProfileRepository.findAllByOrderByRankingScoreDescWinRateDesc(Pageable pageable)`.
   * **Horse:** Tạo query lấy top N theo chỉ số rating: `horseRepository.findAllByOrderByRatingDesc(Pageable pageable)`.
2. **PublicLeaderboardController:**
   * Định nghĩa `@GetMapping("/api/public/leaderboard")`.
   * Gọi service gom dữ liệu của Jockeys và Horses thành một object response chung để tối ưu hóa chỉ cần 1 request từ Front-end.

---

## 📊 3. API Thống Kê Tổng Quan: `GET /api/public/stats`

### A. Dữ liệu Phản hồi (Response DTO)
Trả về các con số thống kê cơ bản một cách ẩn danh (không lộ thông tin doanh thu hay số dư nhạy cảm):

```json
{
  "activeTournaments": 2,
  "totalPrizePoolVND": 38500000.00,
  "activeHorses": 842
}
```

### B. Các bước triển khai Backend
1. **Repository Counts:**
   * Lấy tổng số ngựa đang hoạt động (không bị blacklist): `horseRepository.countByStatusNot("BLACK_LISTED")`.
   * Lấy tổng số giải đấu có trạng thái `Active`: `tournamentRepository.countByTournamentStatus("Active")`.
   * Lấy tổng số tiền thưởng của các giải đấu trong hệ thống: `tournamentRepository.sumTotalPrize()`.
2. **PublicStatsController:**
   * Định nghĩa `@GetMapping("/api/public/stats")`.
   * Trả về kết quả tổng hợp nhanh chóng thông qua các câu lệnh đếm (`count`) tối ưu của JPA/SQL.
