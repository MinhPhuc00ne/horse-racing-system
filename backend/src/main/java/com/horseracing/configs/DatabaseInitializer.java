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

        // --- MOCK DATA FOR SIMULATION (OVAL TEST) ---
        // If there are no tournaments, create a mock tournament, race, and participants
        Integer tournamentCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Tournaments", Integer.class);
        if (tournamentCount == 0) {
            try {
                log.info("Mocking OVAL track data for testing...");
                
                // Ensure users exist
                jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'owner1@gmail.com') " +
                        "INSERT INTO Users (Email, Username, Password, Role, FullName, Enabled) " +
                        "VALUES ('owner1@gmail.com', 'owner1', ?, 'HORSE_OWNER', 'Mock Owner', 1)", passwordEncoder.encode("123"));
                
                jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'jockey1@gmail.com') " +
                        "INSERT INTO Users (Email, Username, Password, Role, FullName, Enabled) " +
                        "VALUES ('jockey1@gmail.com', 'jockey1', ?, 'JOCKEY', 'Mock Jockey 1', 1)", passwordEncoder.encode("123"));
                        
                jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'jockey2@gmail.com') " +
                        "INSERT INTO Users (Email, Username, Password, Role, FullName, Enabled) " +
                        "VALUES ('jockey2@gmail.com', 'jockey2', ?, 'JOCKEY', 'Mock Jockey 2', 1)", passwordEncoder.encode("123"));

                Integer ownerUserId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Users WHERE Email = 'owner1@gmail.com'", Integer.class);
                Integer jockey1UserId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Users WHERE Email = 'jockey1@gmail.com'", Integer.class);
                Integer jockey2UserId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Users WHERE Email = 'jockey2@gmail.com'", Integer.class);

                // Create profiles
                jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Horse_Owner_Profiles WHERE User_ID = ?) " +
                        "INSERT INTO Horse_Owner_Profiles (User_ID, Experience_Years) VALUES (?, 5)", ownerUserId, ownerUserId);
                
                jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Jockey_Profiles WHERE User_ID = ?) " +
                        "INSERT INTO Jockey_Profiles (User_ID, Weight, Experience_Years) VALUES (?, 60.5, 3)", jockey1UserId, jockey1UserId);
                jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Jockey_Profiles WHERE User_ID = ?) " +
                        "INSERT INTO Jockey_Profiles (User_ID, Weight, Experience_Years) VALUES (?, 58.0, 2)", jockey2UserId, jockey2UserId);

                Integer ownerId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Horse_Owner_Profiles WHERE User_ID = ?", Integer.class, ownerUserId);
                Integer jockey1Id = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Jockey_Profiles WHERE User_ID = ?", Integer.class, jockey1UserId);
                Integer jockey2Id = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Jockey_Profiles WHERE User_ID = ?", Integer.class, jockey2UserId);

                // Create Horses
                Integer breedId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Horse_Breeds", Integer.class);
                jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Horses WHERE Horse_Name = 'Mock Horse 1') " +
                        "INSERT INTO Horses (Owner_ID, Breed_ID, Horse_Name, Age, Weight, Health_Status, Win_Rate) VALUES (?, ?, 'Mock Horse 1', 4, 450, 'Excellent', 0)", ownerId, breedId);
                jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Horses WHERE Horse_Name = 'Mock Horse 2') " +
                        "INSERT INTO Horses (Owner_ID, Breed_ID, Horse_Name, Age, Weight, Health_Status, Win_Rate) VALUES (?, ?, 'Mock Horse 2', 5, 460, 'Excellent', 0)", ownerId, breedId);
                
                Integer horse1Id = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Horses WHERE Horse_Name = 'Mock Horse 1'", Integer.class);
                Integer horse2Id = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Horses WHERE Horse_Name = 'Mock Horse 2'", Integer.class);

                // Create Tournament
                jdbcTemplate.update("INSERT INTO Tournaments (Tournament_Name, Location, Official_Race_Time, Tournament_Status, Prize_Pool) " +
                        "VALUES ('OVAL Test Tournament', 'Nha Trang', '09:00:00', 'Upcoming', 5000)");
                Integer tournamentId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Tournaments ORDER BY ID DESC", Integer.class);

                // Create Race
                Integer trackId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Race_Track WHERE Shape = 'OVAL'", Integer.class);
                Integer refereeId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Users WHERE Email = 'referee@gmail.com'", Integer.class);
                
                jdbcTemplate.update("INSERT INTO Race (Race_Name, Tournament_ID, Race_Track_ID, Referee_ID, Race_Date, Start_Time, End_Time, Race_Round, Weather, Race_Status, Race_Distance) " +
                        "VALUES ('OVAL Test Race', ?, ?, ?, GETDATE(), '09:00:00', '10:00:00', 1, 'Clear', 'Upcoming', 1000)", tournamentId, trackId, refereeId);
                Integer raceId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Race ORDER BY ID DESC", Integer.class);

                // Create Participants
                jdbcTemplate.update("INSERT INTO Race_Participants (Race_ID, Horse_ID, Jockey_ID, Status, Is_Disqualified, Distance_Covered, Current_Speed) " +
                        "VALUES (?, ?, ?, 'APPROVED', 0, 0, 0)", raceId, horse1Id, jockey1Id);
                jdbcTemplate.update("INSERT INTO Race_Participants (Race_ID, Horse_ID, Jockey_ID, Status, Is_Disqualified, Distance_Covered, Current_Speed) " +
                        "VALUES (?, ?, ?, 'APPROVED', 0, 0, 0)", raceId, horse2Id, jockey2Id);
                
                log.info("Successfully mocked OVAL test data!");
            } catch (Exception e) {
                log.error("Failed to mock data: " + e.getMessage(), e);
            }
        }
    }
}
