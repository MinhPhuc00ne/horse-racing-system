# BÁO CÁO THAY ĐỔI HỆ THỐNG
*Tóm tắt chỉnh sửa, thêm bớt từ khi đồng bộ từ GitHub*

---

## I. Tổng quan
Báo cáo này tóm tắt toàn bộ các thay đổi bao gồm cập nhật logic nghiệp vụ, sửa các cảnh báo về kiểu dữ liệu (null type safety), loại bỏ các thư viện/chú thích không tối ưu, cập nhật mã nguồn kiểm thử và các tài liệu đặc tả được tạo mới hoặc thay đổi kể từ lần đồng bộ gần nhất từ GitHub.

---

## II. Các tệp thêm mới (Added Files)
* **[doc/luong_dat_cuoc_va_xem_live_dua.md](file:///Users/minhvu2201/Documents/horse-racing-system/doc/luong_dat_cuoc_va_xem_live_dua.md)**: Tài liệu đặc tả chi tiết luồng đặt cược của Spectator (sử dụng công thức chia quỹ Pari-Mutuel) và luồng xem trực tiếp cuộc đua.
* **[spectator_betting_test.postman_collection.json](file:///Users/minhvu2201/Documents/horse-racing-system/spectator_betting_test.postman_collection.json)**: Bộ sưu tập Postman dùng để gọi API kiểm thử tự động các luồng đặt cược và mô phỏng đua.
* **[doc/api_changes.md](file:///Users/minhvu2201/Documents/horse-racing-system/doc/api_changes.md)**: Tài liệu đặc tả các thay đổi về hành vi của API, điều kiện ràng buộc đặt cược và bắt đầu/kết thúc đua.
* **[doc/Bao_cao_thay_doi_he_thong.md](file:///Users/minhvu2201/Documents/horse-racing-system/doc/Bao_cao_thay_doi_he_thong.md)**: Tài liệu tóm tắt này (phiên bản Markdown để xem trực tiếp trên IDE).

---

## III. Chi tiết chỉnh sửa và cập nhật (Modified Files)

| Tệp tin (File) | Loại thay đổi | Chi tiết nội dung đã sửa đổi |
| :--- | :--- | :--- |
| **[BetService.java](file:///Users/minhvu2201/Documents/horse-racing-system/backend/src/main/java/com/horseracing/services/BetService.java)** | Logic nghiệp vụ | • Giới hạn chỉ có vai trò `SPECTATOR` mới được phép đặt cược.<br>• Thay đổi trạng thái cuộc đua hợp lệ để đặt cược thành `LOCKED_LIST`.<br>• Chặn đặt cược nếu quá trình mô phỏng cuộc đua đã kết thúc. |
| **[RefereeService.java](file:///Users/minhvu2201/Documents/horse-racing-system/backend/src/main/java/com/horseracing/services/RefereeService.java)** | Logic nghiệp vụ | • Ràng buộc trạng thái bắt đầu cuộc đua phải là `LOCKED_LIST`.<br>• Kiểm tra toàn bộ ngựa đã hoàn thành kiểm định (không còn trạng thái `PENDING_INSPECTION`).<br>• Ràng buộc phải có tối thiểu 1 ngựa được phê duyệt (`APPROVED`) mới cho phép bắt đầu.<br>• Chỉ cập nhật trạng thái các ngựa `APPROVED` sang `RACING` (loại bỏ ngựa `DISQUALIFIED` khỏi đường đua).<br>• Chặn xác nhận kết quả nếu mô phỏng đua chưa kết thúc.<br>• Hỗ trợ lọc trạng thái `LOCKED_LIST` trên dashboard trọng tài. |
| **[RaceRegistrationService.java](file:///Users/minhvu2201/Documents/horse-racing-system/backend/src/main/java/com/horseracing/services/RaceRegistrationService.java)** | Logic & Sửa cảnh báo | • Chuyển trạng thái cuộc đua sang `LOCKED_LIST` khi chốt đăng ký.<br>• Thay thế tham chiếu phương thức `String::trim` bằng lambda `s -> s.trim()` để tránh cảnh báo Null type safety. |
| **[HorseService.java](file:///Users/minhvu2201/Documents/horse-racing-system/backend/src/main/java/com/horseracing/services/HorseService.java)** | Sửa cảnh báo | • Thay thế `UpgradeRequest::getDocumentUrls` bằng lambda `req -> req.getDocumentUrls()` để sửa cảnh báo Null type safety.<br>• Thay thế chuỗi câu lệnh `if-else` bằng `switch` statement trong `toHorseResponse`. |
| **[JockeyService.java](file:///Users/minhvu2201/Documents/horse-racing-system/backend/src/main/java/com/horseracing/services/JockeyService.java)** | Sửa cảnh báo | • Thay thế `UpgradeRequest::getDocumentUrls` bằng lambda để sửa cảnh báo Null type safety.<br>• Loại bỏ import không sử dụng `UpgradeRequest`. |
| **[ErrorResponse.java](file:///Users/minhvu2201/Documents/horse-racing-system/backend/src/main/java/com/horseracing/dto/response/ErrorResponse.java)** | Tối ưu mã nguồn | • Loại bỏ các chú thích Lombok (`@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`) và thay thế bằng mã nguồn tường minh (getters/setters, constructors) để cải thiện độ tương thích. |
| **Các file kiểm thử (`*Test.java`)** | Unit Tests | • Cập nhật [BetServiceTest.java](file:///Users/minhvu2201/Documents/horse-racing-system/backend/src/test/java/com/horseracing/services/BetServiceTest.java), [RefereeServiceTest.java](file:///Users/minhvu2201/Documents/horse-racing-system/backend/src/test/java/com/horseracing/services/RefereeServiceTest.java), [TournamentServiceTest.java](file:///Users/minhvu2201/Documents/horse-racing-system/backend/src/test/java/com/horseracing/services/TournamentServiceTest.java), [RaceServiceTest.java](file:///Users/minhvu2201/Documents/horse-racing-system/backend/src/test/java/com/horseracing/services/RaceServiceTest.java) để tương thích với logic `LOCKED_LIST` và các ràng buộc kiểm tra mới. |

---

## IV. Kết luận
Mã nguồn hiện tại đã được dọn sạch toàn bộ các cảnh báo Null type safety của IDE, logic nghiệp vụ về luồng đặt cược và tổ chức đua của trọng tài đã hoạt động đồng bộ với quy trình chốt danh sách (`LOCKED_LIST`) và kiểm định kỹ lưỡng. Dự án biên dịch thành công 100% không gặp lỗi.
