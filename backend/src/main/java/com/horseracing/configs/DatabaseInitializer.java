package com.horseracing.configs;

import com.horseracing.entities.HorseBreed;
import com.horseracing.entities.RaceTrack;
import com.horseracing.entities.User;
import com.horseracing.entities.enums.AuthProvider;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.HorseBreedRepository;
import com.horseracing.repositories.RaceTrackRepository;
import com.horseracing.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RaceTrackRepository raceTrackRepository;
    private final HorseBreedRepository horseBreedRepository;
    private final com.horseracing.repositories.FeedbackRepository feedbackRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        String dbName = "Unknown";
        try {
            dbName = jdbcTemplate.queryForObject("SELECT DB_NAME()", String.class);
        } catch (Exception e) {
            try (java.sql.Connection conn = jdbcTemplate.getDataSource().getConnection()) {
                dbName = conn.getCatalog();
            } catch (Exception ex) {
                // Ignore fallback failure
            }
        }
        log.info("=== BACKEND IS CONNECTED TO DATABASE: {} ===", dbName);
        // Create an initial admin user if not exists
        if (!userRepository.existsByEmail("admin@gmail.com")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@gmail.com")
                    .password(passwordEncoder.encode("Admin@12345"))
                    .fullName("System Administrator")
                    .role(Role.ADMIN)
                    .provider(AuthProvider.LOCAL)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Created default administrator account: admin@gmail.com / Admin@12345");
        }

        // Create an initial referee user if not exists
        if (!userRepository.existsByEmail("referee@gmail.com")) {
            User referee = User.builder()
                    .username("referee")
                    .email("referee@gmail.com")
                    .password(passwordEncoder.encode("Referee@12345"))
                    .fullName("Default Referee")
                    .role(Role.RACE_REFEREE)
                    .provider(AuthProvider.LOCAL)
                    .enabled(true)
                    .build();
            userRepository.save(referee);
            log.info("Created default referee account: referee@gmail.com / Referee@12345");
        }

        // Initialize Race Tracks
        if (raceTrackRepository.count() == 0) {
            List<RaceTrack> tracks = List.of(
                    RaceTrack.builder().name("Sân Phú Thọ").location("Thành phố Hồ Chí Minh").shape("STRAIGHT").build(),
                    RaceTrack.builder().name("Sân Đại Nam").location("Bình Dương").shape("STRAIGHT").build(),
                    RaceTrack.builder().name("Sân Happy Land").location("Long An").shape("STRAIGHT").build(),
                    RaceTrack.builder().name("Sân đua Hà Nội").location("Hà Nội").shape("STRAIGHT").build(),
                    RaceTrack.builder().name("Sân đua Đà Nẵng").location("Đà Nẵng").shape("STRAIGHT").build(),
                    RaceTrack.builder().name("Sân đua Nha Trang").location("Khánh Hòa").shape("OVAL").build(),
                    RaceTrack.builder().name("Sân đua Vũng Tàu").location("Bà Rịa - Vũng Tàu").shape("STRAIGHT").build(),
                    RaceTrack.builder().name("Sân đua Cần Thơ").location("Cần Thơ").shape("STRAIGHT").build(),
                    RaceTrack.builder().name("Sân đua Hải Phòng").location("Hải Phòng").shape("STRAIGHT").build(),
                    RaceTrack.builder().name("Sân đua Đà Lạt").location("Lâm Đồng").shape("OVAL").build()
            );
            raceTrackRepository.saveAll(tracks);
            log.info("Initialized 10 default race tracks.");
        }

        // Initialize Horse Breeds
        if (horseBreedRepository.count() == 0) {
            List<HorseBreed> breeds = List.of(
                    HorseBreed.builder().breedName("Thoroughbred").build(),
                    HorseBreed.builder().breedName("Arabian").build(),
                    HorseBreed.builder().breedName("Quarter Horse").build()
            );
            horseBreedRepository.saveAll(breeds);
            log.info("Initialized 3 default horse breeds.");
        }

        // --- ENSURE DEMO SIMULATION RACE EXISTS ---
        try {
            Integer demoRaceCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Race WHERE Race_Name = 'Trận Giả Lập 4 Ngựa (Demo)'", Integer.class);
            if (demoRaceCount == 0) {
                log.info("Creating default 'Trận Giả Lập 4 Ngựa (Demo)' race...");

                // Ensure users exist
                jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'owner1@gmail.com') " +
                        "INSERT INTO Users (Email, Username, Password, Role, FullName, Enabled) " +
                        "VALUES ('owner1@gmail.com', 'owner1', ?, 'HORSE_OWNER', 'Mock Owner', 1)", passwordEncoder.encode("123"));

                for (int i = 1; i <= 4; i++) {
                    jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'jockey" + i + "@gmail.com') " +
                            "INSERT INTO Users (Email, Username, Password, Role, FullName, Enabled) " +
                            "VALUES ('jockey" + i + "@gmail.com', 'jockey" + i + "', ?, 'JOCKEY', 'Mock Jockey " + i + "', 1)", passwordEncoder.encode("123"));
                }

                Integer ownerUserId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Users WHERE Email = 'owner1@gmail.com'", Integer.class);

                // Create owner profile
                jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Horse_Owner_Profiles WHERE User_ID = ?) " +
                        "INSERT INTO Horse_Owner_Profiles (User_ID, Experience_Years) VALUES (?, 5)", ownerUserId, ownerUserId);
                Integer ownerId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Horse_Owner_Profiles WHERE User_ID = ?", Integer.class, ownerUserId);

                // Create jockey profiles & horses
                Integer breedId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Horse_Breeds", Integer.class);
                String[] horseNames = {"Xích Thố (Red Hare)", "Đầu Rồng (Dragon Head)", "Hắc Mã (Black Beauty)", "Bạch Long (White Dragon)"};

                for (int i = 1; i <= 4; i++) {
                    Integer jUserId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Users WHERE Email = 'jockey" + i + "@gmail.com'", Integer.class);
                    jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Jockey_Profiles WHERE User_ID = ?) " +
                            "INSERT INTO Jockey_Profiles (User_ID, Weight, Experience_Years) VALUES (?, 60.0, 3)", jUserId, jUserId);

                    String hName = horseNames[i - 1];
                    jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Horses WHERE Horse_Name = ?) " +
                            "INSERT INTO Horses (Owner_ID, Breed_ID, Horse_Name, Age, Weight, Health_Status, Win_Rate) VALUES (?, ?, ?, 4, 480, 'Excellent', 0)", ownerId, breedId, hName);
                }

                // Create Tournament
                Integer demoTExists = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Tournaments WHERE Tournament_Name = 'Giải Giả Lập Đua Ngựa (Demo)'", Integer.class);
                if (demoTExists == 0) {
                    jdbcTemplate.update("INSERT INTO Tournaments (Tournament_Name, Location, Official_Race_Time, Tournament_Status, Prize_Pool) " +
                            "VALUES ('Giải Giả Lập Đua Ngựa (Demo)', 'Trường đua Mỹ Đình (Demo)', '16:00:00', 'OPEN_FOR_REGISTER', 5000)");
                }
                Integer tournamentId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Tournaments WHERE Tournament_Name = 'Giải Giả Lập Đua Ngựa (Demo)'", Integer.class);

                // Create Race
                Integer trackId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Race_Track WHERE Shape = 'OVAL'", Integer.class);
                Integer refereeId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Users WHERE Email = 'referee@gmail.com'", Integer.class);

                jdbcTemplate.update("INSERT INTO Race (Race_Name, Tournament_ID, Race_Track_ID, Referee_ID, Race_Date, Start_Time, End_Time, Race_Round, Weather, Race_Status, Race_Distance) " +
                        "VALUES ('Trận Giả Lập 4 Ngựa (Demo)', ?, ?, ?, GETDATE(), '16:00:00', '17:00:00', 1, 'Clear', 'LOCKED_LIST', 1000)", tournamentId, trackId, refereeId);
                Integer raceId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Race WHERE Race_Name = 'Trận Giả Lập 4 Ngựa (Demo)'", Integer.class);

                // Create Participants
                for (int i = 1; i <= 4; i++) {
                    Integer jUserId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Users WHERE Email = 'jockey" + i + "@gmail.com'", Integer.class);
                    Integer jockeyId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Jockey_Profiles WHERE User_ID = ?", Integer.class, jUserId);

                    String hName = horseNames[i - 1];
                    Integer horseId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Horses WHERE Horse_Name = ?", Integer.class, hName);

                    jdbcTemplate.update("INSERT INTO Race_Participants (Race_ID, Horse_ID, Jockey_ID, Status, Is_Disqualified, Distance_Covered, Current_Speed) " +
                            "VALUES (?, ?, ?, 'APPROVED', 0, 0, 0)", raceId, horseId, jockeyId);
                }

                log.info("Successfully initialized default 'Trận Giả Lập 4 Ngựa (Demo)'!");
            }
        } catch (Exception e) {
            log.error("Failed to ensure demo race: " + e.getMessage(), e);
        }

        // Initialize sample feedbacks if empty
        if (feedbackRepository.count() == 0) {
            try {
                User jockeyUser = userRepository.findByEmail("tuan.ta@jockey.com").orElseGet(() -> userRepository.save(User.builder()
                        .username("tuanta").email("tuan.ta@jockey.com").password(passwordEncoder.encode("123456")).fullName("Trần Anh Tuấn").role(Role.JOCKEY).build()));

                User ownerUser = userRepository.findByEmail("vy.nm@owner.com").orElseGet(() -> userRepository.save(User.builder()
                        .username("vynm").email("vy.nm@owner.com").password(passwordEncoder.encode("123456")).fullName("Nguyễn Minh Vy").role(Role.HORSE_OWNER).build()));

                User refereeUser = userRepository.findByEmail("long.lh@referee.com").orElseGet(() -> userRepository.save(User.builder()
                        .username("longlh").email("long.lh@referee.com").password(passwordEncoder.encode("123456")).fullName("Lê Hoàng Long").role(Role.RACE_REFEREE).build()));

                User spectatorUser = userRepository.findByEmail("khanh.pv@spectator.com").orElseGet(() -> userRepository.save(User.builder()
                        .username("khanhpv").email("khanh.pv@spectator.com").password(passwordEncoder.encode("123456")).fullName("Phan Văn Khánh").role(Role.SPECTATOR).build()));

                com.horseracing.entities.Feedback fb1 = com.horseracing.entities.Feedback.builder()
                        .user(jockeyUser)
                        .subject("Lệ phí đăng ký thi đấu quá cao")
                        .content("Lệ phí hiện tại cho các giải đấu hạng mục Classic khá cao đối với các nài ngựa tự do. Đề nghị ban tổ chức xem xét hỗ trợ giảm 10% lệ phí hoặc tăng tỷ lệ chia thưởng cho Jockey lên 40%.")
                        .status("PENDING")
                        .build();

                com.horseracing.entities.Feedback fb2 = com.horseracing.entities.Feedback.builder()
                        .user(ownerUser)
                        .subject("Sân đua cỏ Mỹ Tho có mặt cỏ không đều")
                        .content("Tôi vừa cho ngựa thi đấu thử tại sân cỏ Mỹ Tho. Một số khu vực cua rẽ có cỏ mọc không đều và khá trơn khi trời mưa nhẹ. Đề xuất ban quản lý sân thực hiện bảo dưỡng và lu phẳng mặt cỏ để đảm bảo an toàn cho ngựa.")
                        .status("RESOLVED")
                        .adminNote("Đã chuyển tiếp ý kiến phản hồi tới ban quản trị sân đua Mỹ Tho. Họ đã xác nhận sẽ bảo dưỡng lại toàn bộ mặt cỏ và báo cáo tiến độ trước ngày 05/07/2026.")
                        .build();

                com.horseracing.entities.Feedback fb3 = com.horseracing.entities.Feedback.builder()
                        .user(refereeUser)
                        .subject("Hệ thống camera giám sát góc hẹp")
                        .content("Tại vạch đích của trường đua Đại Nam, camera giám sát góc hẹp đôi khi bị khuất bởi biển quảng cáo. Cần điều chỉnh vị trí camera cao lên 1.5 mét để hỗ trợ trọng tài xác định chính xác thứ hạng ngựa khi về đích sát nút.")
                        .status("PENDING")
                        .build();

                com.horseracing.entities.Feedback fb4 = com.horseracing.entities.Feedback.builder()
                        .user(spectatorUser)
                        .subject("Lỗi hiển thị tỷ lệ cược trực tiếp")
                        .content("Khi xem livestream giải đấu hôm qua, tỷ lệ cược hiển thị trên màn hình bị đứng hình khoảng 2 phút trước khi cuộc đua bắt đầu. Mong đội ngũ kỹ thuật tối ưu hóa luồng dữ liệu thời gian thực tốt hơn.")
                        .status("PENDING")
                        .build();

                feedbackRepository.saveAll(List.of(fb1, fb2, fb3, fb4));
                log.info("Initialized 4 sample feedbacks in database.");
            } catch (Exception e) {
                log.error("Failed to seed sample feedbacks: " + e.getMessage(), e);
            }
        }
    }
}
