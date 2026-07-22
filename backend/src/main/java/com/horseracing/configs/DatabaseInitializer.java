package com.horseracing.configs;

import com.horseracing.entities.HorseBreed;
import com.horseracing.entities.RaceTrack;
import com.horseracing.entities.User;
import com.horseracing.entities.enums.AuthProvider;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.HorseBreedRepository;
import com.horseracing.repositories.RaceTrackRepository;
import com.horseracing.repositories.UserRepository;
import com.horseracing.entities.UpgradeRequest;
import com.horseracing.entities.enums.RequestStatus;
import com.horseracing.repositories.UpgradeRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
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
    private final UpgradeRequestRepository upgradeRequestRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        String dbName = "Unknown";
        try {
            dbName = jdbcTemplate.queryForObject("SELECT DB_NAME()", String.class);
        } catch (org.springframework.dao.DataAccessException e) {
            javax.sql.DataSource dataSource = jdbcTemplate.getDataSource();
            if (dataSource != null) {
                try (java.sql.Connection conn = dataSource.getConnection()) {
                    dbName = conn.getCatalog();
                } catch (java.sql.SQLException ex) {
                    // Ignore fallback failure
                }
            }
        }
        log.info("=== BACKEND IS CONNECTED TO DATABASE: {} ===", dbName);

        // 1. Initialize Horse Breeds
        if (horseBreedRepository.count() == 0) {
            List<HorseBreed> breeds =
                    List.of(HorseBreed.builder().breedName("Thoroughbred").build(),
                            HorseBreed.builder().breedName("Arabian").build(),
                            HorseBreed.builder().breedName("Quarter Horse").build(),
                            HorseBreed.builder().breedName("Appaloosa").build());
            horseBreedRepository.saveAll(breeds);
            log.info("Initialized default horse breeds.");
        }

        // 2. Initialize Race Tracks
        if (raceTrackRepository.count() == 0) {
            List<RaceTrack> tracks = List.of(
                    RaceTrack.builder().name("Tempest Straight Track").location("Tempest City")
                            .shape("STRAIGHT").build(),
                    RaceTrack.builder().name("Jura Oval Track").location("Jura Great Forest")
                            .shape("OVAL").build());
            raceTrackRepository.saveAll(tracks);
            log.info("Initialized default race tracks.");
        }

        // 3. Ensure Admin exists
        if (!userRepository.existsByEmail("admin@gmail.com")) {
            User admin = User.builder().username("admin").email("admin@gmail.com")
                    .password(passwordEncoder.encode("Admin@12345"))
                    .fullName("System Administrator").phone("0901000001").role(Role.ADMIN)
                    .provider(AuthProvider.LOCAL).enabled(true).build();
            userRepository.save(admin);
            log.info("Created default administrator account: admin@gmail.com / Admin@12345");
        }

        // Create an initial referee user if not exists
        if (!userRepository.existsByEmail("referee@gmail.com")) {
            User referee = User.builder().username("referee").email("referee@gmail.com")
                    .password(passwordEncoder.encode("Referee@12345")).fullName("Default Referee")
                    .role(Role.RACE_REFEREE).provider(AuthProvider.LOCAL).enabled(true).build();
            userRepository.save(referee);
            log.info("Created default referee account: referee@gmail.com / Referee@12345");
        }

        // 4. Ensure Upgrade Test Accounts (2 PENDING, 2 REJECTED)
        ensureUpgradeTestAccounts();

        // 5. Ensure Tensura Test Accounts and Horses exist for Local DB
        ensureTensuraTestDataset();

        // Ensure all users have 50,000 VND starting wallet balance if missing
        try {
            jdbcTemplate.update("INSERT INTO wallets (user_id, balance, created_at) "
                    + "SELECT u.id, 50000.00, GETDATE() FROM users u "
                    + "LEFT JOIN wallets w ON u.id = w.user_id WHERE w.id IS NULL");
        } catch (org.springframework.dao.DataAccessException e) {
            log.warn("Wallet verification check: {}", e.getMessage());
        }
    }

    private void ensureTensuraTestDataset() {
        if (userRepository.existsByEmail("souei@tempest.com")) {
            return;
        }
        log.info("Seeding Tensura test dataset for local DB environment...");
        try {
            String commonPassword = passwordEncoder.encode("SlimeTempest@2026");

            // 1. Spectators
            String[] spectators = {"shuna", "shuna@tempest.com", "Shuna Princess", "0901000002",
                    "shion", "shion@tempest.com", "Shion Greatmaster", "0901000003", "milim",
                    "milim.nava@tempest.com", "Milim Nava", "0901000004", "ramiris",
                    "ramiris@tempest.com", "Ramiris Fairy", "0901000005", "treyni",
                    "treyni@tempest.com", "Treyni Dryad", "0901000006", "trya", "trya@tempest.com",
                    "Trya Dryad", "0901000007", "dreyfus", "dreyfus@tempest.com", "Dreyfus Knight",
                    "0901000008", "myourmiles", "myourmiles@tempest.com", "Myourmiles Merchant",
                    "0901000009"};
            for (int i = 0; i < spectators.length; i += 4) {
                if (!userRepository.existsByEmail(spectators[i + 1])) {
                    jdbcTemplate.update(
                            "INSERT INTO users (username, email, password, full_name, phone, provider, role, enabled) VALUES (?, ?, ?, ?, ?, 'LOCAL', 'SPECTATOR', 1)",
                            spectators[i], spectators[i + 1], commonPassword, spectators[i + 2],
                            spectators[i + 3]);
                }
            }

            // 2. Horse Owners & Profiles
            String[] owners = {"benimaru", "benimaru@tempest.com", "Benimaru Commander",
                    "0901000010", "Benimaru Stables", "East District, Tempest City", "souei",
                    "souei@tempest.com", "Souei Shadow", "0901000011", "Souei Stables",
                    "West District, Tempest City", "hakuro", "hakuro@tempest.com",
                    "Hakuro Swordsman", "0901000012", "Hakuro Stables",
                    "South District, Tempest City", "geld", "geld@tempest.com", "Geld Orc King",
                    "0901000013", "Geld Stables", "North District, Tempest City", "gabil",
                    "gabil@tempest.com", "Gabil Dragonewt", "0901000014", "Gabil Stables",
                    "Dragon Shrine Lake District, Tempest", "rigurd", "rigurd@tempest.com",
                    "Rigurd Goblin Prime", "0901000015", "Rigurd Stables", "City Center, Tempest",
                    "gobta", "gobta@tempest.com", "Gobta Rider", "0901000016", "Gobta Stables",
                    "Outskirts, Tempest City", "kaijin", "kaijin@tempest.com", "Kaijin Craftsman",
                    "0901000017", "Kaijin Stables", "Craftsman District, Tempest"};
            for (int i = 0; i < owners.length; i += 6) {
                if (!userRepository.existsByEmail(owners[i + 1])) {
                    jdbcTemplate.update(
                            "INSERT INTO users (username, email, password, full_name, phone, provider, role, enabled) VALUES (?, ?, ?, ?, ?, 'LOCAL', 'HORSE_OWNER', 1)",
                            owners[i], owners[i + 1], commonPassword, owners[i + 2], owners[i + 3]);
                    Integer uId = jdbcTemplate.queryForObject(
                            "SELECT id FROM users WHERE email = ?", Integer.class, owners[i + 1]);
                    jdbcTemplate.update(
                            "INSERT INTO horse_owner_profiles (user_id, stable_name, stable_address, phone, identity_number, date_of_birth, bank_account, description, reputation_stars, approval_status) VALUES (?, ?, ?, ?, ?, '1990-01-01', ?, 'Tempest Federation Ranch', 5.0, 'APPROVED')",
                            uId, owners[i + 4], owners[i + 5], owners[i + 3],
                            "03809" + owners[i + 3], "9704" + owners[i + 3]);
                }
            }

            // 3. Jockeys & Profiles (with win_rates & ranking_scores)
            Object[][] jockeys = {
                    {"ranga", "ranga@tempest.com", "Ranga Star Wolf", "0901000018", 168.0, 52.0,
                            45.5, 5, 1350, "JCK-TEMPEST-01"},
                    {"beretta", "beretta@tempest.com", "Beretta Golem", "0901000019", 170.0, 54.0,
                            52.0, 6, 1420, "JCK-TEMPEST-02"},
                    {"diablo", "diablo@tempest.com", "Diablo Black Primordial", "0901000020", 175.0,
                            55.0, 68.0, 8, 1600, "JCK-TEMPEST-03"},
                    {"carrion", "carrion@tempest.com", "Carrion Beast King", "0901000021", 172.0,
                            53.0, 38.0, 4, 1180, "JCK-TEMPEST-04"},
                    {"phobio", "phobio@tempest.com", "Phobio Panther", "0901000022", 166.0, 51.0,
                            42.0, 3, 1220, "JCK-TEMPEST-05"},
                    {"suphia", "suphia@tempest.com", "Suphia Tiger", "0901000023", 167.0, 50.0,
                            50.0, 5, 1380, "JCK-TEMPEST-06"},
                    {"albis", "albis@tempest.com", "Albis Serpent", "0901000024", 169.0, 52.0, 60.0,
                            7, 1500, "JCK-TEMPEST-07"},
                    {"grucius", "grucius@tempest.com", "Grucius Werewolf", "0901000025", 171.0,
                            53.0, 35.0, 3, 1100, "JCK-TEMPEST-08"}};
            for (Object[] jck : jockeys) {
                String email = (String) jck[1];
                if (!userRepository.existsByEmail(email)) {
                    jdbcTemplate.update(
                            "INSERT INTO users (username, email, password, full_name, phone, provider, role, enabled) VALUES (?, ?, ?, ?, ?, 'LOCAL', 'JOCKEY', 1)",
                            jck[0], email, commonPassword, jck[2], jck[3]);
                    Integer uId = jdbcTemplate.queryForObject(
                            "SELECT id FROM users WHERE email = ?", Integer.class, email);
                    jdbcTemplate.update(
                            "INSERT INTO jockey_profiles (user_id, height, weight, win_rate, experience_year, ranking_score, license_number, bank_account, approval_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED')",
                            uId, jck[4], jck[5], jck[6], jck[7], jck[8], jck[9],
                            "97048888" + jck[3].toString().substring(6));
                }
            }

            // 4. Referees
            String[] referees = {"guy_crimson", "guy.crimson@tempest.com", "Guy Crimson",
                    "0901000026", "velgrynd", "velgrynd@tempest.com", "Velgrynd Dragon",
                    "0901000027", "velzard", "velzard@tempest.com", "Velzard Dragon", "0901000028",
                    "luminous", "luminous@tempest.com", "Luminous Valentine", "0901000029",
                    "dagruel", "dagruel@tempest.com", "Dagruel Giant", "0901000030", "dino",
                    "dino@tempest.com", "Dino Fallen Angel", "0901000031", "leon_cromwell",
                    "leon.cromwell@tempest.com", "Leon Cromwell", "0901000032", "elmesia",
                    "elmesia@tempest.com", "Elmesia El-Ru Thaliad", "0901000033"};
            for (int i = 0; i < referees.length; i += 4) {
                if (!userRepository.existsByEmail(referees[i + 1])) {
                    jdbcTemplate.update(
                            "INSERT INTO users (username, email, password, full_name, phone, provider, role, enabled) VALUES (?, ?, ?, ?, ?, 'LOCAL', 'RACE_REFEREE', 1)",
                            referees[i], referees[i + 1], commonPassword, referees[i + 2],
                            referees[i + 3]);
                }
            }

            // 5. Blacklisted
            String[] blacklisted =
                    {"clayman", "clayman@tempest.com", "Clayman Marionette", "0901000034",
                            "Violation of terms of service and fraudulent activity at Tempest",
                            "footman", "footman@tempest.com", "Footman Clown", "0901000035",
                            "Disrupting racetrack order and intentional misconduct", "laplace",
                            "laplace@tempest.com", "Laplace Clown", "0901000036",
                            "Illegal betting manipulation"};
            for (int i = 0; i < blacklisted.length; i += 5) {
                if (!userRepository.existsByEmail(blacklisted[i + 1])) {
                    jdbcTemplate.update(
                            "INSERT INTO users (username, email, password, full_name, phone, provider, role, enabled) VALUES (?, ?, ?, ?, ?, 'LOCAL', 'SPECTATOR', 1)",
                            blacklisted[i], blacklisted[i + 1], commonPassword, blacklisted[i + 2],
                            blacklisted[i + 3]);
                    Integer uId =
                            jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?",
                                    Integer.class, blacklisted[i + 1]);
                    jdbcTemplate.update(
                            "INSERT INTO blacklist (target_type, target_id, reason, start_date, is_permanent, status, created_at) VALUES ('USER', ?, ?, GETDATE(), 1, 'ACTIVE', GETDATE())",
                            uId, blacklisted[i + 4]);
                }
            }

            // 6. Seed Horses for Owners
            seedHorsesIfMissing();

            log.info("Successfully seeded Tensura test dataset for local DB environment.");
        } catch (org.springframework.dao.DataAccessException e) {
            log.error("Failed to seed Tensura test dataset: {}", e.getMessage(), e);
        }
    }

    private void seedHorsesIfMissing() {
        try {
            Integer breedId =
                    jdbcTemplate.queryForObject("SELECT TOP 1 id FROM horse_breeds", Integer.class);
            if (breedId == null)
                return;

            String[] ownerUsernames =
                    {"benimaru", "souei", "hakuro", "geld", "gabil", "rigurd", "gobta", "kaijin"};
            String[][] horseTemplates = {
                    {"Veldora", "4", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "95.0", "90", "88",
                            "Bay"},
                    {"Red Flame", "5", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "88.0", "85",
                            "82", "Chestnut"},
                    {"Red Lotus", "3", "FEMALE", "IN_PROGRESS", "GOOD", "ACTIVE", "75.0", "70",
                            "75", "Black"},
                    {"White Flame", "6", "MALE", "COMPLETED", "FAIR", "RESTING", "82.0", "80", "78",
                            "White"},
                    {"Fire Dragon", "4", "FEMALE", "COMPLETED", "EXCELLENT", "ACTIVE", "90.0", "88",
                            "85", "Palomino"},
                    {"Nova Flame", "3", "MALE", "NOT_STARTED", "EXCELLENT", "ACTIVE", null, null,
                            null, "Gray"},
                    {"Fire Shadow", "7", "FEMALE", "COMPLETED", "INJURED", "INJURED", "70.0", "65",
                            "60", "Roan"},
                    {"Fire Ginseng", "3", "FEMALE", "NOT_STARTED", "GOOD", "ACTIVE", null, null,
                            null, "Brown"}};

            for (String username : ownerUsernames) {
                Integer uId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE username = ?",
                        Integer.class, username);
                if (uId == null)
                    continue;
                Integer ownerId = jdbcTemplate.queryForObject(
                        "SELECT id FROM horse_owner_profiles WHERE user_id = ?", Integer.class,
                        uId);
                if (ownerId == null)
                    continue;

                Integer horseCount = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM horses WHERE owner_id = ?", Integer.class, ownerId);
                if (horseCount != null && horseCount > 0)
                    continue;

                for (String[] ht : horseTemplates) {
                    Double spd = ht[6] != null ? Double.valueOf(ht[6]) : null;
                    Integer stm = ht[7] != null ? Integer.valueOf(ht[7]) : null;
                    Integer gate = ht[8] != null ? Integer.valueOf(ht[8]) : null;

                    jdbcTemplate.update(
                            "INSERT INTO horses (owner_id, breed_id, name, age, gender, training_status, health_status, status, speed_rating, stamina_rating, gate_performance_rating, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            ownerId, breedId, ht[0], Integer.parseInt(ht[1]), ht[2], ht[3], ht[4],
                            ht[5], spd, stm, gate, ht[9]);
                }
            }
        } catch (org.springframework.dao.DataAccessException e) {
            log.warn("Seed horses check warning: {}", e.getMessage());
        }
    }

    private void ensureUpgradeTestAccounts() {
        String commonPassword = passwordEncoder.encode("SlimeTempest@2026");

        // 1. Kurobe (Owner - PENDING)
        if (!userRepository.existsByEmail("kurobe@tempest.com")) {
            User kurobe = userRepository.save(User.builder().username("kurobe")
                    .email("kurobe@tempest.com").password(commonPassword).fullName("Kurobe Smith")
                    .phone("0901000037").role(Role.SPECTATOR).provider(AuthProvider.LOCAL)
                    .enabled(true).build());

            upgradeRequestRepository.save(UpgradeRequest.builder().user(kurobe)
                    .requestedRole(Role.HORSE_OWNER).status(RequestStatus.PENDING)
                    .fullName("Kurobe Smith").stableName("Kurobe Stables")
                    .stableAddress("Forge District, Tempest").phoneNumber("0901000037")
                    .identityNumber("038090100037").experienceYears(5)
                    .notes("Request account upgrade to Horse Owner for Kurobe ranch").build());
            log.info("Created upgrade test account: kurobe@tempest.com (PENDING Owner)");
        }

        // 2. Sooka (Jockey - PENDING)
        if (!userRepository.existsByEmail("sooka@tempest.com")) {
            User sooka = userRepository.save(User.builder().username("sooka")
                    .email("sooka@tempest.com").password(commonPassword).fullName("Sooka Dragonewt")
                    .phone("0901000038").role(Role.SPECTATOR).provider(AuthProvider.LOCAL)
                    .enabled(true).build());

            upgradeRequestRepository.save(UpgradeRequest.builder().user(sooka)
                    .requestedRole(Role.JOCKEY).status(RequestStatus.PENDING)
                    .fullName("Sooka Dragonewt").licenseNumber("JCK-TEMPEST-09").height(168.0)
                    .weight(51.0).phoneNumber("0901000038").identityNumber("038090100038")
                    .experienceYears(3).notes("Request account upgrade to professional Jockey")
                    .build());
            log.info("Created upgrade test account: sooka@tempest.com (PENDING Jockey)");
        }

        // 3. Yamato (Owner - REJECTED)
        if (!userRepository.existsByEmail("yamato@tempest.com")) {
            User yamato = userRepository.save(User.builder().username("yamato")
                    .email("yamato@tempest.com").password(commonPassword).fullName("Yamato General")
                    .phone("0901000039").role(Role.SPECTATOR).provider(AuthProvider.LOCAL)
                    .enabled(true).build());

            upgradeRequestRepository.save(UpgradeRequest.builder().user(yamato)
                    .requestedRole(Role.HORSE_OWNER).status(RequestStatus.REJECTED)
                    .fullName("Yamato General").stableName("Yamato Stables")
                    .stableAddress("Military District, Tempest").phoneNumber("0901000039")
                    .identityNumber("038090100039").experienceYears(2)
                    .rejectionReason(
                            "Invalid profile: License information and ranch address incomplete.")
                    .notes("Request account upgrade to Horse Owner").build());
            log.info("Created upgrade test account: yamato@tempest.com (REJECTED Owner)");
        }

        // 4. Takuya (Jockey - REJECTED)
        if (!userRepository.existsByEmail("takuya@tempest.com")) {
            User takuya = userRepository.save(User.builder().username("takuya")
                    .email("takuya@tempest.com").password(commonPassword).fullName("Takuya Ninja")
                    .phone("0901000040").role(Role.SPECTATOR).provider(AuthProvider.LOCAL)
                    .enabled(true).build());

            upgradeRequestRepository.save(UpgradeRequest.builder().user(takuya)
                    .requestedRole(Role.JOCKEY).status(RequestStatus.REJECTED)
                    .fullName("Takuya Ninja").licenseNumber("JCK-TEMPEST-10").height(172.0)
                    .weight(58.0).phoneNumber("0901000040").identityNumber("038090100040")
                    .experienceYears(1)
                    .rejectionReason(
                            "Did not meet requirements: Weight and height do not match Tempest Jockey standards.")
                    .notes("Request account upgrade to Jockey").build());
            log.info("Created upgrade test account: takuya@tempest.com (REJECTED Jockey)");
        }
    }

    // // --- ENSURE DEMO SIMULATION RACE EXISTS ---
    // try {
    // Integer demoRaceCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Race WHERE
    // Race_Name = '4-Horse Simulation Race (Demo)'", Integer.class);
    // if (demoRaceCount == 0) {
    // log.info("Creating default '4-Horse Simulation Race (Demo)' race...");
    //
    // // Ensure users exist
    // jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'owner1@gmail.com') " +
    // "INSERT INTO Users (Email, Username, Password, Role, FullName, Enabled) " +
    // "VALUES ('owner1@gmail.com', 'owner1', ?, 'HORSE_OWNER', 'Mock Owner', 1)",
    // passwordEncoder.encode("123"));
    //
    // for (int i = 1; i <= 4; i++) {
    // jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'jockey" + i +
    // "@gmail.com') " +
    // "INSERT INTO Users (Email, Username, Password, Role, FullName, Enabled) " +
    // "VALUES ('jockey" + i + "@gmail.com', 'jockey" + i + "', ?, 'JOCKEY', 'Mock Jockey " + i +
    // "', 1)", passwordEncoder.encode("123"));
    // }
    //
    // Integer ownerUserId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Users WHERE Email =
    // 'owner1@gmail.com'", Integer.class);
    //
    // // Create owner profile
    // jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Horse_Owner_Profiles WHERE User_ID = ?) " +
    // "INSERT INTO Horse_Owner_Profiles (User_ID, Experience_Years) VALUES (?, 5)", ownerUserId,
    // ownerUserId);
    // Integer ownerId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Horse_Owner_Profiles
    // WHERE User_ID = ?", Integer.class, ownerUserId);
    //
    // // Create jockey profiles & horses
    // Integer breedId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Horse_Breeds",
    // Integer.class);
    // String[] horseNames = {"Red Hare", "Dragon Head", "Black Beauty", "White Dragon"};
    //
    // for (int i = 1; i <= 4; i++) {
    // Integer jUserId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Users WHERE Email =
    // 'jockey" + i + "@gmail.com'", Integer.class);
    // jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Jockey_Profiles WHERE User_ID = ?) " +
    // "INSERT INTO Jockey_Profiles (User_ID, Weight, Experience_Years) VALUES (?, 60.0, 3)",
    // jUserId, jUserId);
    //
    // String hName = horseNames[i - 1];
    // jdbcTemplate.update("IF NOT EXISTS (SELECT 1 FROM Horses WHERE Horse_Name = ?) " +
    // "INSERT INTO Horses (Owner_ID, Breed_ID, Horse_Name, Age, Weight, Health_Status, Win_Rate)
    // VALUES (?, ?, ?, 4, 480, 'Excellent', 0)", ownerId, breedId, hName);
    // }
    //
    // // Create Tournament
    // Integer demoTExists = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Tournaments WHERE
    // Tournament_Name = 'Horse Racing Simulation Tournament (Demo)'", Integer.class);
    // if (demoTExists == 0) {
    // jdbcTemplate.update("INSERT INTO Tournaments (Tournament_Name, Location, Official_Race_Time,
    // Tournament_Status, Prize_Pool) " +
    // "VALUES ('Horse Racing Simulation Tournament (Demo)', 'My Dinh Racetrack (Demo)', '16:00:00',
    // 'OPEN_FOR_REGISTER', 5000)");
    // }
    // Integer tournamentId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Tournaments WHERE
    // Tournament_Name = 'Horse Racing Simulation Tournament (Demo)'", Integer.class);
    //
    // // Create Race
    // Integer trackId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Race_Track WHERE Shape =
    // 'OVAL'", Integer.class);
    // Integer refereeId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Users WHERE Email =
    // 'referee@gmail.com'", Integer.class);
    //
    // jdbcTemplate.update("INSERT INTO Race (Race_Name, Tournament_ID, Race_Track_ID, Referee_ID,
    // Race_Date, Start_Time, End_Time, Race_Round, Weather, Race_Status, Race_Distance) " +
    // "VALUES ('4-Horse Simulation Race (Demo)', ?, ?, ?, GETDATE(), '16:00:00', '17:00:00', 1,
    // 'Clear', 'LOCKED_LIST', 1000)", tournamentId, trackId, refereeId);
    // Integer raceId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Race WHERE Race_Name =
    // '4-Horse Simulation Race (Demo)'", Integer.class);
    //
    // // Create Participants
    // for (int i = 1; i <= 4; i++) {
    // Integer jUserId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Users WHERE Email =
    // 'jockey" + i + "@gmail.com'", Integer.class);
    // Integer jockeyId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Jockey_Profiles WHERE
    // User_ID = ?", Integer.class, jUserId);
    //
    // String hName = horseNames[i - 1];
    // Integer horseId = jdbcTemplate.queryForObject("SELECT TOP 1 ID FROM Horses WHERE Horse_Name =
    // ?", Integer.class, hName);
    //
    // jdbcTemplate.update("INSERT INTO Race_Participants (Race_ID, Horse_ID, Jockey_ID, Status,
    // Is_Disqualified, Distance_Covered, Current_Speed) " +
    // "VALUES (?, ?, ?, 'APPROVED', 0, 0, 0)", raceId, horseId, jockeyId);
    // }
    //
    // log.info("Successfully initialized default '4-Horse Simulation Race (Demo)'!");
    // }
    // } catch (Exception e) {
    // log.error("Failed to ensure demo race: " + e.getMessage(), e);
    // }
}
