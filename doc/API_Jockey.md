# API Tài Liệu: Jockey Flow & Report System

Tài liệu này cung cấp danh sách các API mới được thiết lập để hỗ trợ luồng hoạt động của Jockey và hệ thống Report (Tố cáo).
Lưu ý: Các API này yêu cầu Header `Authorization: Bearer <token>`.

---

## 1. Phân hệ Lời mời & Lịch thi đấu (Race Invitations & Schedule)

### 1.1 Lấy danh sách lời mời đua (Đang chờ xác nhận)
- **URL**: `GET /api/jockey/invitations`
- **Quyền**: `JOCKEY`
- **Mô tả**: Trả về danh sách các lời mời đua do chủ ngựa gửi mà Jockey cần xác nhận (status: `PENDING_JOCKEY`).
- **Response**:
```json
[
  {
    "id": 1,
    "raceId": 10,
    "raceName": "Giải Đua Mùa Xuân",
    "horseId": 5,
    "horseName": "Xích Thố",
    "jockeyId": 2,
    "jockeyName": "Nguyen Van A",
    "ownerId": 3,
    "ownerName": "Tran Van B",
    "status": "PENDING_JOCKEY",
    "ownerSharePercent": 70.0,
    "jockeySharePercent": 30.0,
    "createdAt": "2024-03-20T10:00:00"
  }
]
```

### 1.2 Phản hồi lời mời đua
- **URL**: `PUT /api/jockey/invitations/{id}/respond`
- **Query Parameter**: `?action=ACCEPT` hoặc `?action=REJECT`
- **Quyền**: `JOCKEY`
- **Mô tả**: Chấp nhận (sẽ chuyển trạng thái sang `PENDING` để Admin duyệt) hoặc Từ chối (chuyển sang `REJECTED_BY_JOCKEY`) lời mời.
- **Response**: Trả về object lời mời vừa cập nhật.

### 1.3 Lấy lịch trình thi đấu
- **URL**: `GET /api/jockey/schedule`
- **Quyền**: `JOCKEY`
- **Mô tả**: Trả về danh sách các trận đấu mà Jockey đã được Admin duyệt và đang chờ tham gia hoặc đang diễn ra (chưa kết thúc).
- **Response**:
```json
[
  {
    "participantId": 12,
    "raceId": 10,
    "raceName": "Giải Đua Mùa Xuân",
    "raceDate": "2024-03-25",
    "startTime": "14:00:00",
    "horseId": 5,
    "horseName": "Xích Thố",
    "gateNumber": 3,
    "participantStatus": "READY",
    "raceStatus": "UPCOMING"
  }
]
```

---

## 2. Phân hệ Thống kê & Thành tích (Dashboard Stats & History)

### 2.1 Lịch sử thi đấu
- **URL**: `GET /api/jockey/history`
- **Quyền**: `JOCKEY`
- **Mô tả**: Trả về danh sách các trận đấu đã kết thúc, bao gồm thứ hạng, thời gian hoàn thành và tiền thưởng (tính dựa trên % ăn chia).
- **Response**:
```json
[
  {
    "participantId": 8,
    "raceId": 2,
    "raceName": "Giải Mùa Đông",
    "raceDate": "2024-01-10",
    "horseId": 5,
    "horseName": "Xích Thố",
    "finalRank": 1,
    "finishTime": 120,
    "prizeMoney": 15000000.00
  }
]
```

### 2.2 Bảng xếp hạng Kỵ Sĩ
- **URL**: `GET /api/jockey/leaderboard`
- **Quyền**: Bất kỳ ai cũng có thể truy cập (Mặc định cần đăng nhập)
- **Mô tả**: Trả về danh sách Kỵ Sĩ được xếp hạng ưu tiên theo `rankingScore` giảm dần, rồi đến `winRate` giảm dần.
- **Response**:
```json
[
  {
    "jockeyId": 2,
    "jockeyName": "Nguyen Van A",
    "rankingScore": 1500,
    "winRate": 45.5,
    "experienceYear": 5,
    "avatarUrl": "https://..."
  }
]
```

---

## 3. Phân hệ Tố cáo (Report System)

### 3.1 Gửi Tố cáo
- **URL**: `POST /api/reports`
- **Quyền**: Mọi Role (JOCKEY, HORSE_OWNER, SPECTATOR)
- **Mô tả**: Gửi một báo cáo về hành vi của một User khác (VD: Jockey báo cáo Chủ ngựa hoặc Trọng tài).
- **Request Body**:
```json
{
  "reportedUserId": 5,
  "reason": "Thỏa thuận sai lệch",
  "description": "Chủ ngựa hứa chia 30% nhưng thực tế không tuân thủ."
}
```
- **Response**:
```json
{
  "id": 1,
  "reporterId": 2,
  "reporterName": "Nguyen Van A",
  "reportedUserId": 5,
  "reportedUserName": "Tran Van B",
  "reason": "Thỏa thuận sai lệch",
  "description": "Chủ ngựa hứa chia 30% nhưng thực tế không tuân thủ.",
  "status": "PENDING",
  "createdAt": "2024-03-20T11:00:00"
}
```
