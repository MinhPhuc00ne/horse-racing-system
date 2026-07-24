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

        // 0. Initialize Roles in DB
        ensureRoles();

        // 1. Initialize Horse Breeds
        ensureHorseBreeds();

        // 2. Initialize Race Tracks
        ensureRaceTracks();

        // 3. Ensure Admin & Default Referee
        ensureAdminAndReferee();

        // 4. Ensure Upgrade Test Accounts (2 PENDING, 2 REJECTED)
        ensureUpgradeTestAccounts();

        // 5. Ensure Tensura Test Accounts, Profiles, and Horses exist
        ensureTensuraTestDataset();

        // 6. Ensure 4 Tournaments (2 Finished with complete race results & bets, 2 Open)
        ensureTournamentsAndRaces();

        // 7. Ensure Rich Wallet Transactions History
        ensureRichWalletTransactions();
    }

    private void ensureRoles() {
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM roles", Integer.class);
            if (count == null || count == 0) {
                jdbcTemplate.update("INSERT INTO roles (role_name, description) VALUES " +
                        "('ADMIN', 'System Administrator'), " +
                        "('SPECTATOR', 'Normal User'), " +
                        "('HORSE_OWNER', 'Horse Owner'), " +
                        "('JOCKEY', 'Jockey'), " +
                        "('RACE_REFEREE', 'Race Referee')");
                log.info("Initialized default roles in DB.");
            }
        } catch (org.springframework.dao.DataAccessException e) {
            log.warn("Roles table check skipped or failed: {}", e.getMessage());
        }
    }

    private void ensureHorseBreeds() {
        if (horseBreedRepository.count() == 0) {
            List<HorseBreed> breeds = List.of(
                    HorseBreed.builder().breedName("Thoroughbred").build(),
                    HorseBreed.builder().breedName("Arabian").build(),
                    HorseBreed.builder().breedName("Quarter Horse").build(),
                    HorseBreed.builder().breedName("Appaloosa").build()
            );
            horseBreedRepository.saveAll(breeds);
            log.info("Initialized default horse breeds.");
        }
    }

    private void ensureRaceTracks() {
        if (raceTrackRepository.count() == 0) {
            List<RaceTrack> tracks = List.of(
                    RaceTrack.builder().name("Tempest Straight Track").location("Tempest City").shape("STRAIGHT").build(),
                    RaceTrack.builder().name("Jura Circular Track").location("Jura Great Forest").shape("OVAL").build()
            );
            raceTrackRepository.saveAll(tracks);
            log.info("Initialized default race tracks.");
        }
    }

    private void ensureAdminAndReferee() {
        if (!userRepository.existsByEmail("admin@gmail.com")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@gmail.com")
                    .password(passwordEncoder.encode("Admin@12345"))
                    .fullName("System Administrator")
                    .phone("0901000001")
                    .role(Role.ADMIN)
                    .provider(AuthProvider.LOCAL)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Created default administrator account: admin@gmail.com / Admin@12345");
        }

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
    }

    private void ensureTensuraTestDataset() {
        log.info("Checking Tensura test dataset for local DB environment...");
        try {
            String commonPassword = passwordEncoder.encode("SlimeTempest@2026");

            // 1. Spectators
            String[] spectators = {
                    "shuna", "shuna@tempest.com", "Shuna Princess", "0901000002",
                    "shion", "shion@tempest.com", "Shion Greatmaster", "0901000003",
                    "milim", "milim.nava@tempest.com", "Milim Nava", "0901000004",
                    "ramiris", "ramiris@tempest.com", "Ramiris Fairy", "0901000005",
                    "treyni", "treyni@tempest.com", "Treyni Dryad", "0901000006",
                    "trya", "trya@tempest.com", "Trya Dryad", "0901000007",
                    "dreyfus", "dreyfus@tempest.com", "Dreyfus Knight", "0901000008",
                    "myourmiles", "myourmiles@tempest.com", "Myourmiles Merchant", "0901000009"
            };
            for (int i = 0; i < spectators.length; i += 4) {
                if (!userRepository.existsByEmail(spectators[i + 1])) {
                    jdbcTemplate.update(
                            "INSERT INTO users (username, email, password, full_name, phone, provider, role, enabled) VALUES (?, ?, ?, ?, ?, 'LOCAL', 'SPECTATOR', 1)",
                            spectators[i], spectators[i + 1], commonPassword, spectators[i + 2], spectators[i + 3]
                    );
                }
            }

            // 2. Horse Owners & Detailed Profiles
            String[] owners = {
                    "benimaru", "benimaru@tempest.com", "Benimaru Commander", "0901000010", "Benimaru Stables", "East District, Tempest City", "Top racing stables in Tempest Federation",
                    "souei", "souei@tempest.com", "Souei Shadow", "0901000011", "Souei Stables", "West District, Tempest City", "High-speed racing horse training experts",
                    "hakuro", "hakuro@tempest.com", "Hakuro Swordsman", "0901000012", "Hakuro Stables", "South District, Tempest City", "Prestigious ranch with legendary thoroughbreds",
                    "geld", "geld@tempest.com", "Geld Orc King", "0901000013", "Geld Stables", "North District, Tempest City", "Endurance horse racing specialists",
                    "gabil", "gabil@tempest.com", "Gabil Dragonewt", "0901000014", "Gabil Stables", "Dragon Shrine Lake District, Tempest", "Unique Dragonewt style racing stables",
                    "rigurd", "rigurd@tempest.com", "Rigurd Goblin Prime", "0901000015", "Rigurd Stables", "City Center, Tempest", "The oldest established ranch in Tempest",
                    "gobta", "gobta@tempest.com", "Gobta Rider", "0901000016", "Gobta Stables", "Outskirts, Tempest City", "Promising young horse stables",
                    "kaijin", "kaijin@tempest.com", "Kaijin Craftsman", "0901000017", "Kaijin Stables", "Craftsman District, Tempest", "Ranch combining modern tech and craftsmanship"
            };
            for (int i = 0; i < owners.length; i += 7) {
                if (!userRepository.existsByEmail(owners[i + 1])) {
                    jdbcTemplate.update(
                            "INSERT INTO users (username, email, password, full_name, phone, provider, role, enabled, bank_name, bank_bin, bank_account_number, bank_account_holder_name) VALUES (?, ?, ?, ?, ?, 'LOCAL', 'HORSE_OWNER', 1, 'MBBank', '970422', ?, ?)",
                            owners[i], owners[i + 1], commonPassword, owners[i + 2], owners[i + 3], "9704123456" + owners[i + 3].substring(6), owners[i + 2].toUpperCase()
                    );
                }
                Integer uId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?", Integer.class, owners[i + 1]);
                if (uId != null) {
                    Integer profileCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM horse_owner_profiles WHERE user_id = ?", Integer.class, uId);
                    if (profileCount == null || profileCount == 0) {
                        jdbcTemplate.update(
                                "INSERT INTO horse_owner_profiles (user_id, stable_name, stable_address, phone, identity_number, date_of_birth, bank_account, description, reputation_stars, approval_status) VALUES (?, ?, ?, ?, ?, '1990-01-01', ?, ?, 5.0, 'APPROVED')",
                                uId, owners[i + 4], owners[i + 5], owners[i + 3], "038090" + owners[i + 3], "9704123456" + owners[i + 3].substring(6), owners[i + 6]
                        );
                    }
                }
            }

            // 3. Jockeys & Detailed Profiles
            Object[][] jockeys = {
                    {"ranga", "ranga@tempest.com", "Ranga Star Wolf", "0901000018", 168.0, 52.0, 45.5, 5, 1350, "JCK-TEMPEST-01"},
                    {"beretta", "beretta@tempest.com", "Beretta Golem", "0901000019", 170.0, 54.0, 52.0, 6, 1420, "JCK-TEMPEST-02"},
                    {"diablo", "diablo@tempest.com", "Diablo Black Primordial", "0901000020", 175.0, 55.0, 68.0, 8, 1600, "JCK-TEMPEST-03"},
                    {"carrion", "carrion@tempest.com", "Carrion Beast King", "0901000021", 172.0, 53.0, 38.0, 4, 1180, "JCK-TEMPEST-04"},
                    {"phobio", "phobio@tempest.com", "Phobio Panther", "0901000022", 166.0, 51.0, 42.0, 3, 1220, "JCK-TEMPEST-05"},
                    {"suphia", "suphia@tempest.com", "Suphia Tiger", "0901000023", 167.0, 50.0, 50.0, 5, 1380, "JCK-TEMPEST-06"},
                    {"albis", "albis@tempest.com", "Albis Serpent", "0901000024", 169.0, 52.0, 60.0, 7, 1500, "JCK-TEMPEST-07"},
                    {"grucius", "grucius@tempest.com", "Grucius Werewolf", "0901000025", 171.0, 53.0, 35.0, 3, 1100, "JCK-TEMPEST-08"}
            };
            for (Object[] jck : jockeys) {
                String email = (String) jck[1];
                if (!userRepository.existsByEmail(email)) {
                    jdbcTemplate.update(
                            "INSERT INTO users (username, email, password, full_name, phone, provider, role, enabled, bank_name, bank_bin, bank_account_number, bank_account_holder_name) VALUES (?, ?, ?, ?, ?, 'LOCAL', 'JOCKEY', 1, 'Vietcombank', '970436', ?, ?)",
                            jck[0], email, commonPassword, jck[2], jck[3], "97048888" + jck[3].toString().substring(6), jck[2].toString().toUpperCase()
                    );
                }
                Integer uId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?", Integer.class, email);
                if (uId != null) {
                    Integer profileCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM jockey_profiles WHERE user_id = ?", Integer.class, uId);
                    if (profileCount == null || profileCount == 0) {
                        jdbcTemplate.update(
                                "INSERT INTO jockey_profiles (user_id, height, weight, win_rate, experience_year, ranking_score, license_number, bank_account, approval_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', GETDATE())",
                                uId, jck[4], jck[5], jck[6], jck[7], jck[8], jck[9], "97048888" + jck[3].toString().substring(6)
                        );
                    }
                }
            }

            // 4. Referees & Full Profile Details
            String[] referees = {
                    "guy_crimson", "guy.crimson@tempest.com", "Guy Crimson", "0901000026",
                    "velgrynd", "velgrynd@tempest.com", "Velgrynd Dragon", "0901000027",
                    "velzard", "velzard@tempest.com", "Velzard Dragon", "0901000028",
                    "luminous", "luminous@tempest.com", "Luminous Valentine", "0901000029",
                    "dagruel", "dagruel@tempest.com", "Dagruel Giant", "0901000030",
                    "dino", "dino@tempest.com", "Dino Fallen Angel", "0901000031",
                    "leon_cromwell", "leon.cromwell@tempest.com", "Leon Cromwell", "0901000032",
                    "elmesia", "elmesia@tempest.com", "Elmesia El-Ru Thaliad", "0901000033"
            };
            for (int i = 0; i < referees.length; i += 4) {
                if (!userRepository.existsByEmail(referees[i + 1])) {
                    jdbcTemplate.update(
                            "INSERT INTO users (username, email, password, full_name, phone, provider, role, enabled, bank_name, bank_bin, bank_account_number, bank_account_holder_name) VALUES (?, ?, ?, ?, ?, 'LOCAL', 'RACE_REFEREE', 1, 'ACB', '970416', ?, ?)",
                            referees[i], referees[i + 1], commonPassword, referees[i + 2], referees[i + 3], "97049999" + referees[i + 3].substring(6), referees[i + 2].toUpperCase()
                    );
                } else {
                    jdbcTemplate.update(
                            "UPDATE users SET bank_name = 'ACB', bank_bin = '970416', bank_account_number = ?, bank_account_holder_name = ? WHERE email = ?",
                            "97049999" + referees[i + 3].substring(6), referees[i + 2].toUpperCase(), referees[i + 1]
                    );
                }
            }

            // 5. Blacklisted Accounts
            String[] blacklisted = {
                    "clayman", "clayman@tempest.com", "Clayman Marionette", "0901000034", "Violation of terms of service and fraudulent activity at Tempest",
                    "footman", "footman@tempest.com", "Footman Clown", "0901000035", "Disrupting racetrack order and intentional misconduct",
                    "laplace", "laplace@tempest.com", "Laplace Clown", "0901000036", "Illegal betting manipulation"
            };
            for (int i = 0; i < blacklisted.length; i += 5) {
                if (!userRepository.existsByEmail(blacklisted[i + 1])) {
                    jdbcTemplate.update(
                            "INSERT INTO users (username, email, password, full_name, phone, provider, role, enabled) VALUES (?, ?, ?, ?, ?, 'LOCAL', 'SPECTATOR', 1)",
                            blacklisted[i], blacklisted[i + 1], commonPassword, blacklisted[i + 2], blacklisted[i + 3]
                    );
                }
                Integer uId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?", Integer.class, blacklisted[i + 1]);
                if (uId != null) {
                    Integer blCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM blacklist WHERE target_id = ?", Integer.class, uId);
                    if (blCount == null || blCount == 0) {
                        jdbcTemplate.update(
                                "INSERT INTO blacklist (target_type, target_id, reason, start_date, is_permanent, status, created_at) VALUES ('USER', ?, ?, GETDATE(), 1, 'ACTIVE', GETDATE())",
                                uId, blacklisted[i + 4]
                        );
                    } else {
                        jdbcTemplate.update(
                                "UPDATE blacklist SET reason = ? WHERE target_id = ?",
                                blacklisted[i + 4], uId
                        );
                    }
                }
            }

            // 6. Seed Horses
            seedHorsesIfMissing();

            // 7. User Connections (Owner <-> Jockey)
            ensureUserConnections();

            // 8. Ensure Wallets for all users
            jdbcTemplate.update(
                    "INSERT INTO wallets (user_id, balance, created_at) " +
                            "SELECT u.id, 50000.00, GETDATE() FROM users u " +
                            "LEFT JOIN wallets w ON u.id = w.user_id WHERE w.id IS NULL"
            );

            log.info("Successfully validated Tensura test dataset for local DB environment.");
        } catch (org.springframework.dao.DataAccessException e) {
            log.error("Failed to seed Tensura test dataset: {}", e.getMessage(), e);
        }
    }

    private void seedHorsesIfMissing() {
        try {
            Integer breedId = jdbcTemplate.queryForObject("SELECT TOP 1 id FROM horse_breeds", Integer.class);
            if (breedId == null) return;

            String[] ownerUsernames = {"benimaru", "souei", "hakuro", "geld", "gabil", "rigurd", "gobta", "kaijin"};

            // 10 Jujutsu Kaisen English named horses per owner with distinct Performance Metrics
            String[][][] ownerHorseTemplates = {
                    // benimaru (Owner 1)
                    {
                            {"Gojo Satoru", "4", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "98.5", "95", "92", "Bay"},
                            {"Limitless Void", "5", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "96.0", "92", "90", "Black"},
                            {"Hollow Purple", "3", "FEMALE", "IN_PROGRESS", "EXCELLENT", "ACTIVE", "94.2", "89", "88", "Chestnut"},
                            {"Six Eyes", "6", "MALE", "COMPLETED", "GOOD", "ACTIVE", "92.0", "90", "86", "White"},
                            {"Infinity Shield", "4", "FEMALE", "COMPLETED", "GOOD", "ACTIVE", "89.5", "86", "84", "Gray"},
                            {"Blue Sphere", "3", "MALE", "NOT_STARTED", "FAIR", "RESTING", "87.0", "84", "82", "Palomino"},
                            {"Red Attraction", "5", "MALE", "IN_PROGRESS", "GOOD", "ACTIVE", "85.5", "82", "80", "Roan"},
                            {"Unbound Void", "4", "FEMALE", "NOT_STARTED", "GOOD", "ACTIVE", "83.0", "80", "78", "Brown"},
                            {"Falling Snow", "7", "FEMALE", "COMPLETED", "INJURED", "INJURED", "79.5", "76", "74", "White"},
                            {"Limitless Flash", "3", "MALE", "IN_PROGRESS", "EXCELLENT", "ACTIVE", "91.0", "88", "85", "Dark Bay"}
                    },
                    // souei (Owner 2)
                    {
                            {"Ryomen Sukuna", "5", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "99.0", "96", "94", "Dark Chestnut"},
                            {"Malevolent Shrine", "6", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "97.5", "94", "91", "Black"},
                            {"Dismantle", "4", "FEMALE", "IN_PROGRESS", "EXCELLENT", "ACTIVE", "93.0", "88", "87", "Bay"},
                            {"Cleave", "3", "MALE", "IN_PROGRESS", "GOOD", "ACTIVE", "91.5", "87", "89", "Gray"},
                            {"Divine Flame", "5", "MALE", "COMPLETED", "GOOD", "ACTIVE", "90.0", "85", "83", "Chestnut"},
                            {"King of Curses", "6", "MALE", "COMPLETED", "GOOD", "ACTIVE", "88.5", "83", "81", "Roan"},
                            {"Furnace Open", "4", "FEMALE", "NOT_STARTED", "FAIR", "RESTING", "86.0", "81", "79", "Palomino"},
                            {"Spiderweb Slash", "3", "FEMALE", "NOT_STARTED", "GOOD", "ACTIVE", "84.0", "79", "77", "Brown"},
                            {"Binding Vow", "7", "MALE", "COMPLETED", "INJURED", "INJURED", "81.0", "78", "75", "Black"},
                            {"Slicing Demon", "4", "MALE", "IN_PROGRESS", "EXCELLENT", "ACTIVE", "92.5", "89", "86", "Dun"}
                    },
                    // hakuro (Owner 3)
                    {
                            {"Yuji Itadori", "3", "MALE", "IN_PROGRESS", "EXCELLENT", "ACTIVE", "93.5", "94", "88", "Chestnut"},
                            {"Black Flash", "4", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "95.0", "91", "90", "Black"},
                            {"Divergent Fist", "3", "MALE", "IN_PROGRESS", "GOOD", "ACTIVE", "88.0", "86", "84", "Bay"},
                            {"Tiger of West", "5", "FEMALE", "COMPLETED", "GOOD", "ACTIVE", "86.5", "85", "82", "Palomino"},
                            {"Soul Striker", "4", "FEMALE", "IN_PROGRESS", "GOOD", "ACTIVE", "84.5", "83", "80", "Gray"},
                            {"Vessel Spirit", "6", "MALE", "COMPLETED", "FAIR", "RESTING", "82.0", "81", "78", "Brown"},
                            {"Spatial Impact", "3", "FEMALE", "NOT_STARTED", "GOOD", "ACTIVE", "80.5", "79", "76", "Roan"},
                            {"Unbreakable Will", "4", "MALE", "NOT_STARTED", "FAIR", "ACTIVE", "78.0", "77", "74", "Dark Bay"},
                            {"Iron Fortress", "7", "MALE", "COMPLETED", "INJURED", "INJURED", "76.5", "74", "71", "White"},
                            {"Cursed Spark", "3", "FEMALE", "IN_PROGRESS", "EXCELLENT", "ACTIVE", "90.0", "88", "86", "Chestnut"}
                    },
                    // geld (Owner 4)
                    {
                            {"Megumi Fushiguro", "4", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "94.0", "90", "91", "Black"},
                            {"Divine Mahoraga", "6", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "98.0", "97", "93", "White"},
                            {"Ten Shadows", "5", "MALE", "COMPLETED", "GOOD", "ACTIVE", "92.0", "89", "87", "Dark Bay"},
                            {"Chimera Garden", "4", "FEMALE", "IN_PROGRESS", "GOOD", "ACTIVE", "89.0", "87", "85", "Gray"},
                            {"Divine Dog", "3", "MALE", "IN_PROGRESS", "EXCELLENT", "ACTIVE", "87.5", "84", "83", "Black"},
                            {"Nue Lightning", "3", "FEMALE", "NOT_STARTED", "GOOD", "ACTIVE", "85.0", "82", "81", "Palomino"},
                            {"Great Serpent", "5", "MALE", "COMPLETED", "FAIR", "RESTING", "83.5", "80", "79", "Roan"},
                            {"Max Elephant", "6", "MALE", "COMPLETED", "GOOD", "ACTIVE", "81.5", "86", "76", "Gray"},
                            {"Rabbit Escape", "3", "FEMALE", "NOT_STARTED", "GOOD", "ACTIVE", "79.0", "75", "77", "White"},
                            {"Shadow Step", "4", "FEMALE", "IN_PROGRESS", "EXCELLENT", "ACTIVE", "88.5", "86", "84", "Chestnut"}
                    },
                    // gabil (Owner 5)
                    {
                            {"Nobara Kugisaki", "3", "FEMALE", "IN_PROGRESS", "EXCELLENT", "ACTIVE", "91.0", "87", "89", "Chestnut"},
                            {"Straw Doll", "4", "FEMALE", "COMPLETED", "GOOD", "ACTIVE", "89.5", "85", "86", "Bay"},
                            {"Resonance", "5", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "93.0", "89", "88", "Black"},
                            {"Hairpin Strike", "3", "FEMALE", "IN_PROGRESS", "GOOD", "ACTIVE", "87.0", "83", "84", "Roan"},
                            {"Nail Barrage", "4", "MALE", "IN_PROGRESS", "FAIR", "RESTING", "85.5", "81", "82", "Gray"},
                            {"Steel Hammer", "6", "MALE", "COMPLETED", "GOOD", "ACTIVE", "83.0", "80", "78", "Dark Bay"},
                            {"Voodoo Charm", "3", "FEMALE", "NOT_STARTED", "GOOD", "ACTIVE", "81.0", "78", "76", "Palomino"},
                            {"Curse Needle", "5", "FEMALE", "COMPLETED", "INJURED", "INJURED", "79.5", "76", "75", "Brown"},
                            {"Iron Rose", "4", "FEMALE", "NOT_STARTED", "GOOD", "ACTIVE", "84.0", "82", "80", "Chestnut"},
                            {"Soul Piercer", "3", "MALE", "IN_PROGRESS", "EXCELLENT", "ACTIVE", "88.0", "86", "85", "Black"}
                    },
                    // rigurd (Owner 6)
                    {
                            {"Yuta Okkotsu", "4", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "97.0", "95", "92", "Dark Bay"},
                            {"Queen of Curses", "5", "FEMALE", "COMPLETED", "EXCELLENT", "ACTIVE", "96.0", "93", "91", "Black"},
                            {"Rika Orimoto", "4", "FEMALE", "COMPLETED", "EXCELLENT", "ACTIVE", "94.5", "91", "89", "White"},
                            {"Pure Love", "3", "MALE", "IN_PROGRESS", "GOOD", "ACTIVE", "92.5", "88", "87", "Chestnut"},
                            {"Copy Technique", "5", "MALE", "COMPLETED", "GOOD", "ACTIVE", "90.5", "87", "85", "Bay"},
                            {"Mutual Love", "6", "FEMALE", "COMPLETED", "FAIR", "RESTING", "88.0", "85", "83", "Gray"},
                            {"Ring of Vow", "3", "FEMALE", "NOT_STARTED", "GOOD", "ACTIVE", "86.0", "83", "81", "Palomino"},
                            {"Katana Slash", "4", "MALE", "IN_PROGRESS", "GOOD", "ACTIVE", "84.0", "81", "79", "Roan"},
                            {"Special Grade", "7", "MALE", "COMPLETED", "INJURED", "INJURED", "82.5", "80", "77", "Dark Chestnut"},
                            {"Boundless Energy", "3", "MALE", "IN_PROGRESS", "EXCELLENT", "ACTIVE", "93.5", "92", "88", "Black"}
                    },
                    // gobta (Owner 7)
                    {
                            {"Toji Fushiguro", "6", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "98.0", "94", "95", "Black"},
                            {"Sorcerer Killer", "7", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "96.5", "92", "93", "Dark Bay"},
                            {"Heavenly Restriction", "5", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "95.0", "93", "91", "Gray"},
                            {"Inverted Spear", "4", "MALE", "IN_PROGRESS", "GOOD", "ACTIVE", "93.0", "89", "88", "Bay"},
                            {"Playful Cloud", "5", "FEMALE", "COMPLETED", "GOOD", "ACTIVE", "91.0", "87", "86", "Chestnut"},
                            {"Split Soul Katana", "4", "FEMALE", "IN_PROGRESS", "GOOD", "ACTIVE", "89.0", "85", "84", "Palomino"},
                            {"Chain of Thousand", "3", "MALE", "NOT_STARTED", "FAIR", "RESTING", "87.0", "83", "82", "Roan"},
                            {"Inventory Curse", "6", "MALE", "COMPLETED", "GOOD", "ACTIVE", "85.0", "81", "80", "Black"},
                            {"Apex Predator", "3", "MALE", "NOT_STARTED", "GOOD", "ACTIVE", "83.5", "79", "78", "Brown"},
                            {"Zero Cursed Power", "4", "FEMALE", "IN_PROGRESS", "EXCELLENT", "ACTIVE", "90.0", "88", "87", "Dark Chestnut"}
                    },
                    // kaijin (Owner 8)
                    {
                            {"Kento Nanami", "5", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "92.5", "91", "90", "Chestnut"},
                            {"Ratio Technique", "4", "MALE", "COMPLETED", "GOOD", "ACTIVE", "90.5", "88", "88", "Bay"},
                            {"Seven Three", "3", "MALE", "IN_PROGRESS", "GOOD", "ACTIVE", "88.5", "86", "86", "Dark Bay"},
                            {"Overtime Unleashed", "6", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "94.0", "93", "89", "Gray"},
                            {"Blunt Blade", "4", "FEMALE", "IN_PROGRESS", "GOOD", "ACTIVE", "86.5", "84", "83", "Black"},
                            {"Suguru Geto", "6", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "95.5", "92", "91", "Dark Chestnut"},
                            {"Cursed Manipulation", "5", "MALE", "COMPLETED", "EXCELLENT", "ACTIVE", "93.5", "90", "89", "Black"},
                            {"Uzumaki Spiral", "4", "FEMALE", "IN_PROGRESS", "GOOD", "ACTIVE", "91.5", "88", "87", "Gray"},
                            {"Night Parade", "3", "FEMALE", "NOT_STARTED", "FAIR", "RESTING", "87.5", "85", "83", "Palomino"},
                            {"Aoi Todo", "4", "MALE", "IN_PROGRESS", "EXCELLENT", "ACTIVE", "89.5", "90", "85", "Bay"}
                    }
            };

            for (int oIdx = 0; oIdx < ownerUsernames.length; oIdx++) {
                String username = ownerUsernames[oIdx];
                Integer uId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE username = ?", Integer.class, username);
                if (uId == null) continue;
                Integer ownerId = jdbcTemplate.queryForObject("SELECT id FROM horse_owner_profiles WHERE user_id = ?", Integer.class, uId);
                if (ownerId == null) continue;

                Integer horseCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM horses WHERE owner_id = ?", Integer.class, ownerId);
                if (horseCount != null && horseCount >= 10) continue;

                // Clear existing horses for clean re-seeding if incomplete or old dataset
                if (horseCount != null && horseCount > 0) {
                    jdbcTemplate.update("DELETE FROM bets WHERE participant_id IN (SELECT id FROM race_participants WHERE horse_id IN (SELECT id FROM horses WHERE owner_id = ?))", ownerId);
                    jdbcTemplate.update("DELETE FROM race_participants WHERE horse_id IN (SELECT id FROM horses WHERE owner_id = ?)", ownerId);
                    jdbcTemplate.update("DELETE FROM horses WHERE owner_id = ?", ownerId);
                }

                String[][] horseTemplates = ownerHorseTemplates[oIdx];
                for (String[] ht : horseTemplates) {
                    Double spd = ht[6] != null ? Double.valueOf(ht[6]) : null;
                    Integer stm = ht[7] != null ? Integer.valueOf(ht[7]) : null;
                    Integer gate = ht[8] != null ? Integer.valueOf(ht[8]) : null;

                    jdbcTemplate.update(
                            "INSERT INTO horses (owner_id, breed_id, name, age, gender, training_status, health_status, status, speed_rating, stamina_rating, gate_performance_rating, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            ownerId, breedId, ht[0], Integer.parseInt(ht[1]), ht[2], ht[3], ht[4], ht[5], spd, stm, gate, ht[9]
                    );
                }
            }
        } catch (org.springframework.dao.DataAccessException e) {
            log.warn("Seed horses check warning: {}", e.getMessage());
        }
    }

    private void ensureUserConnections() {
        try {
            String[][] connections = {
                    {"benimaru", "ranga"}, {"benimaru", "beretta"}, {"benimaru", "diablo"},
                    {"souei", "beretta"}, {"souei", "diablo"}, {"souei", "carrion"},
                    {"hakuro", "diablo"}, {"hakuro", "carrion"}, {"hakuro", "phobio"},
                    {"geld", "carrion"}, {"geld", "phobio"}, {"geld", "suphia"},
                    {"gabil", "phobio"}, {"gabil", "suphia"}, {"gabil", "albis"},
                    {"rigurd", "suphia"}, {"rigurd", "albis"}, {"rigurd", "grucius"},
                    {"gobta", "albis"}, {"gobta", "grucius"}, {"gobta", "ranga"},
                    {"kaijin", "grucius"}, {"kaijin", "ranga"}, {"kaijin", "beretta"}
            };
            for (String[] conn : connections) {
                Integer rId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE username = ?", Integer.class, conn[0]);
                Integer cId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE username = ?", Integer.class, conn[1]);
                if (rId != null && cId != null) {
                    Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM user_connections WHERE requester_id = ? AND recipient_id = ?", Integer.class, rId, cId);
                    if (count == null || count == 0) {
                        jdbcTemplate.update("INSERT INTO user_connections (requester_id, recipient_id, status, created_at) VALUES (?, ?, 'ACCEPTED', GETDATE())", rId, cId);
                    }
                }
            }
        } catch (org.springframework.dao.DataAccessException e) {
            log.warn("User connections seed check: {}", e.getMessage());
        }
    }

    private void ensureUpgradeTestAccounts() {
        String commonPassword = passwordEncoder.encode("SlimeTempest@2026");

        // 1. Kurobe (Owner - PENDING)
        if (!userRepository.existsByEmail("kurobe@tempest.com")) {
            User kurobe = userRepository.save(User.builder()
                    .username("kurobe")
                    .email("kurobe@tempest.com")
                    .password(commonPassword)
                    .fullName("Kurobe Smith")
                    .phone("0901000037")
                    .role(Role.SPECTATOR)
                    .provider(AuthProvider.LOCAL)
                    .enabled(true)
                    .build());

            upgradeRequestRepository.save(UpgradeRequest.builder()
                    .user(kurobe)
                    .requestedRole(Role.HORSE_OWNER)
                    .status(RequestStatus.PENDING)
                    .fullName("Kurobe Smith")
                    .stableName("Kurobe Stables")
                    .stableAddress("Forge District, Tempest")
                    .phoneNumber("0901000037")
                    .identityNumber("038090100037")
                    .experienceYears(5)
                    .notes("Request account upgrade to Horse Owner for Kurobe ranch")
                    .build());
        }

        // 2. Sooka (Jockey - PENDING)
        if (!userRepository.existsByEmail("sooka@tempest.com")) {
            User sooka = userRepository.save(User.builder()
                    .username("sooka")
                    .email("sooka@tempest.com")
                    .password(commonPassword)
                    .fullName("Sooka Dragonewt")
                    .phone("0901000038")
                    .role(Role.SPECTATOR)
                    .provider(AuthProvider.LOCAL)
                    .enabled(true)
                    .build());

            upgradeRequestRepository.save(UpgradeRequest.builder()
                    .user(sooka)
                    .requestedRole(Role.JOCKEY)
                    .status(RequestStatus.PENDING)
                    .fullName("Sooka Dragonewt")
                    .licenseNumber("JCK-TEMPEST-09")
                    .height(168.0)
                    .weight(51.0)
                    .phoneNumber("0901000038")
                    .identityNumber("038090100038")
                    .experienceYears(3)
                    .notes("Request account upgrade to professional Jockey")
                    .build());
        }

        // 3. Yamato (Owner - REJECTED)
        if (!userRepository.existsByEmail("yamato@tempest.com")) {
            User yamato = userRepository.save(User.builder()
                    .username("yamato")
                    .email("yamato@tempest.com")
                    .password(commonPassword)
                    .fullName("Yamato General")
                    .phone("0901000039")
                    .role(Role.SPECTATOR)
                    .provider(AuthProvider.LOCAL)
                    .enabled(true)
                    .build());

            upgradeRequestRepository.save(UpgradeRequest.builder()
                    .user(yamato)
                    .requestedRole(Role.HORSE_OWNER)
                    .status(RequestStatus.REJECTED)
                    .fullName("Yamato General")
                    .stableName("Yamato Stables")
                    .stableAddress("Military District, Tempest")
                    .phoneNumber("0901000039")
                    .identityNumber("038090100039")
                    .experienceYears(2)
                    .rejectionReason("Invalid profile: License information and ranch address incomplete.")
                    .notes("Request account upgrade to Horse Owner")
                    .build());
        }

        // 4. Takuya (Jockey - REJECTED)
        if (!userRepository.existsByEmail("takuya@tempest.com")) {
            User takuya = userRepository.save(User.builder()
                    .username("takuya")
                    .email("takuya@tempest.com")
                    .password(commonPassword)
                    .fullName("Takuya Ninja")
                    .phone("0901000040")
                    .role(Role.SPECTATOR)
                    .provider(AuthProvider.LOCAL)
                    .enabled(true)
                    .build());

            upgradeRequestRepository.save(UpgradeRequest.builder()
                    .user(takuya)
                    .requestedRole(Role.JOCKEY)
                    .status(RequestStatus.REJECTED)
                    .fullName("Takuya Ninja")
                    .licenseNumber("JCK-TEMPEST-10")
                    .height(172.0)
                    .weight(58.0)
                    .phoneNumber("0901000040")
                    .identityNumber("038090100040")
                    .experienceYears(1)
                    .rejectionReason("Did not meet requirements: Weight and height do not match Tempest Jockey standards.")
                    .notes("Request account upgrade to Jockey")
                    .build());
        }
    }

    private void ensureTournamentsAndRaces() {
        try {
            // Sanitize race_tracks locations to English
            jdbcTemplate.update("UPDATE race_tracks SET name = 'Tempest Straight Track', location = 'Tempest City' WHERE id = 1 OR location LIKE '%SÃ¢n%' OR location LIKE '%Sân%'");
            jdbcTemplate.update("UPDATE race_tracks SET name = 'Jura Circular Track', location = 'Jura Great Forest' WHERE id = 2 OR location LIKE '%SÃ¢n%' OR location LIKE '%Sân%'");

            // Sanitize and update existing tournament names, locations, and descriptions to English
            jdbcTemplate.update("UPDATE tournaments SET tournament_name = 'Tempest Royal Tournament', location = 'Tempest Racetrack', description = 'Official speed tournament on the Tempest straight track - Completed Summer 2026' WHERE id = 1 OR tournament_name LIKE '%Tempest%' OR tournament_name LIKE '%Ho%ng Gia%' OR tournament_name LIKE '%HoÃ%'");
            jdbcTemplate.update("UPDATE tournaments SET tournament_name = 'Jura Championship Grand Prix', location = 'Jura Forest Racetrack', description = 'High-level circular track tournament in the Jura Forest - Completed Season 1' WHERE id = 2 OR tournament_name LIKE '%Jura%' OR tournament_name LIKE '%Ma Qu%c%' OR tournament_name LIKE '%CÃ°p%'");
            jdbcTemplate.update("UPDATE tournaments SET tournament_name = 'Rimuru Autumn Derby', location = 'Tempest City', description = 'Premier autumn speed race open for all qualified stables' WHERE id = 3 OR tournament_name LIKE '%Rimuru%'");
            jdbcTemplate.update("UPDATE tournaments SET tournament_name = 'Ingrassia Winter Cup', location = 'Ingrassia Racetrack', description = 'Grand winter tournament on synthetic turf' WHERE id = 4 OR tournament_name LIKE '%Ingrassia%'");
            jdbcTemplate.update("UPDATE tournaments SET location = 'Tempest Racetrack' WHERE location LIKE '%SÃ¢n%' OR location LIKE '%Sân%' OR location LIKE '%ThÃ³ng%' OR location LIKE '%Thắng%'");

            // Sanitize and update existing blacklist reasons to English
            jdbcTemplate.update("UPDATE blacklist SET reason = 'Violation of terms of service and fraudulent activity at Tempest' WHERE target_id = (SELECT id FROM users WHERE username = 'clayman') OR reason LIKE '%Vi ph%' OR reason LIKE '%Thao t%' OR reason LIKE '%mojibake%' OR reason LIKE '%c% c%c%'");
            jdbcTemplate.update("UPDATE blacklist SET reason = 'Disrupting racetrack order and intentional misconduct' WHERE target_id = (SELECT id FROM users WHERE username = 'footman') OR reason LIKE '%Qu%y r%i%'");
            jdbcTemplate.update("UPDATE blacklist SET reason = 'Illegal betting manipulation' WHERE target_id = (SELECT id FROM users WHERE username = 'laplace')");

            jdbcTemplate.update("UPDATE races SET race_name = 'Tempest Royal Sprint 1000m' WHERE id = 1 OR race_name LIKE '%Tempest%'");
            jdbcTemplate.update("UPDATE races SET race_name = 'Jura Championship 1600m' WHERE id = 2 OR race_name LIKE '%Jura%'");

            // Synchronize child race statuses for any active/open tournaments
            jdbcTemplate.update("UPDATE races SET status = 'OPEN_FOR_REGISTER' WHERE tournament_id IN (SELECT id FROM tournaments WHERE tournament_status IN ('ACTIVE', 'Active', 'OPEN_FOR_REGISTER')) AND status NOT IN ('FINISHED', 'CANCELLED')");

            Integer tCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM tournaments", Integer.class);
            if (tCount != null && tCount >= 4) {
                log.info("Tournaments already present (count={}) and updated to English. Skipping full seed.", tCount);
                return;
            }

            Integer guyId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE username = 'guy_crimson'", Integer.class);
            Integer velgryndId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE username = 'velgrynd'", Integer.class);
            Integer luminousId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE username = 'luminous'", Integer.class);
            Integer leonId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE username = 'leon_cromwell'", Integer.class);

            List<Integer> trackIds = jdbcTemplate.queryForList("SELECT id FROM race_tracks", Integer.class);
            Integer straightTrackId = (trackIds != null && !trackIds.isEmpty()) ? trackIds.get(0) : 1;
            Integer ovalTrackId = (trackIds != null && trackIds.size() > 1) ? trackIds.get(1) : straightTrackId;

            // Tournament 1: Tempest Royal Tournament (COMPLETED / FINISHED)
            jdbcTemplate.update(
                    "INSERT INTO tournaments (tournament_name, location, description, tournament_status, start_date, end_date, registration_deadline, referee_id, entry_fee, total_prize, prize_first, prize_second, prize_third, min_bet_amount, min_slots, max_slots, allowed_classes, allowed_ages, allowed_genders, registration_opening_time, official_race_time) " +
                            "VALUES ('Tempest Royal Tournament', 'Tempest City', 'Official speed tournament on the Tempest straight track - Completed Summer 2026', 'FINISHED', '2026-07-01', '2026-07-05', '2026-06-30 23:59:59', ?, 10000.00, 19000.00, 10000.00, 6000.00, 3000.00, 5000.00, 4, 12, 'All Classes', '3-8', 'MALE, FEMALE', '2026-06-20 08:00:00', '2026-07-01 14:00:00')",
                    guyId
            );
            Integer t1Id = jdbcTemplate.queryForObject("SELECT id FROM tournaments WHERE tournament_name = 'Tempest Royal Tournament'", Integer.class);

            // Tournament 2: Jura Championship Grand Prix (COMPLETED / FINISHED)
            jdbcTemplate.update(
                    "INSERT INTO tournaments (tournament_name, location, description, tournament_status, start_date, end_date, registration_deadline, referee_id, entry_fee, total_prize, prize_first, prize_second, prize_third, min_bet_amount, min_slots, max_slots, allowed_classes, allowed_ages, allowed_genders, registration_opening_time, official_race_time) " +
                            "VALUES ('Jura Championship Grand Prix', 'Jura Great Forest', 'High-level circular track tournament in the Jura Forest - Completed Season 1', 'FINISHED', '2026-07-10', '2026-07-15', '2026-07-09 23:59:59', ?, 15000.00, 25000.00, 12000.00, 8000.00, 5000.00, 5000.00, 4, 12, 'All Classes', '3-8', 'MALE, FEMALE', '2026-07-01 08:00:00', '2026-07-10 15:00:00')",
                    velgryndId
            );
            Integer t2Id = jdbcTemplate.queryForObject("SELECT id FROM tournaments WHERE tournament_name = 'Jura Championship Grand Prix'", Integer.class);

            // Tournament 3: Rimuru Autumn Derby (OPEN_FOR_REGISTER)
            jdbcTemplate.update(
                    "INSERT INTO tournaments (tournament_name, location, description, tournament_status, start_date, end_date, registration_deadline, referee_id, entry_fee, total_prize, prize_first, prize_second, prize_third, min_bet_amount, min_slots, max_slots, allowed_classes, allowed_ages, allowed_genders, registration_opening_time, official_race_time) " +
                            "VALUES ('Rimuru Autumn Derby', 'Tempest City', 'Premier autumn speed race open for all qualified stables', 'OPEN_FOR_REGISTER', '2026-08-15', '2026-08-20', '2026-08-14 23:59:59', ?, 10000.00, 30000.00, 15000.00, 10000.00, 5000.00, 5000.00, 4, 12, 'All Classes', '3-8', 'MALE, FEMALE', '2026-07-20 08:00:00', '2026-08-15 14:00:00')",
                    luminousId
            );

            // Tournament 4: Ingrassia Winter Cup (OPEN_FOR_REGISTER)
            jdbcTemplate.update(
                    "INSERT INTO tournaments (tournament_name, location, description, tournament_status, start_date, end_date, registration_deadline, referee_id, entry_fee, total_prize, prize_first, prize_second, prize_third, min_bet_amount, min_slots, max_slots, allowed_classes, allowed_ages, allowed_genders, registration_opening_time, official_race_time) " +
                            "VALUES ('Ingrassia Winter Cup', 'Ingrassia Racetrack', 'Grand winter tournament on synthetic turf', 'OPEN_FOR_REGISTER', '2026-09-01', '2026-09-05', '2026-08-31 23:59:59', ?, 12000.00, 20000.00, 10000.00, 6000.00, 4000.00, 5000.00, 4, 12, 'All Classes', '3-8', 'MALE, FEMALE', '2026-07-25 08:00:00', '2026-09-01 15:00:00')",
                    leonId
            );

            log.info("Successfully seeded 4 Tournaments.");

            // Seed Completed Races, Participants, Bets & Payouts for Tournament 1 & 2
            seedCompletedRacesAndBets(t1Id, straightTrackId, guyId, t2Id, ovalTrackId, velgryndId);

        } catch (org.springframework.dao.DataAccessException e) {
            log.error("Failed to seed tournaments and races: {}", e.getMessage(), e);
        }
    }

    private void seedCompletedRacesAndBets(Integer t1Id, Integer t1TrackId, Integer t1RefId, Integer t2Id, Integer t2TrackId, Integer t2RefId) {
        try {
            List<Integer> hIds = jdbcTemplate.queryForList("SELECT id FROM horses", Integer.class);
            List<Integer> jIds = jdbcTemplate.queryForList("SELECT id FROM jockey_profiles", Integer.class);
            if (hIds == null || hIds.size() < 4 || jIds == null || jIds.size() < 4) return;

            Integer hVeldora = hIds.get(0);
            Integer hShadow = hIds.get(1);
            Integer hSword = hIds.get(2);
            Integer hBold = hIds.get(3);

            Integer jRanga = jIds.get(0);
            Integer jBeretta = jIds.get(1);
            Integer jDiablo = jIds.get(2);
            Integer jCarrion = jIds.get(3);

            // Race 1 for Tournament 1 (Tempest Royal Sprint 1000m)
            jdbcTemplate.update(
                    "INSERT INTO races (race_name, tournament_id, race_track_id, race_date, race_time, race_round, max_horses, distance, surface_type, weather, status, end_time, referee_id) " +
                            "VALUES ('Tempest Royal Sprint 1000m', ?, ?, '2026-07-01', '14:00:00', 1, 4, 1000.0, 'Turf', 'Clear', 'FINISHED', '14:15:00', ?)",
                    t1Id, t1TrackId, t1RefId
            );
            Integer race1Id = jdbcTemplate.queryForObject("SELECT id FROM races WHERE race_name = 'Tempest Royal Sprint 1000m'", Integer.class);

            // Participants for Race 1
            jdbcTemplate.update("INSERT INTO race_participants (race_id, horse_id, jockey_id, gate_number, final_rank, finish_time, average_speed, status, created_at) VALUES (?, ?, ?, 1, 1, 62500, 16.0, 'FINISHED', GETDATE())", race1Id, hVeldora, jRanga);
            jdbcTemplate.update("INSERT INTO race_participants (race_id, horse_id, jockey_id, gate_number, final_rank, finish_time, average_speed, status, created_at) VALUES (?, ?, ?, 2, 2, 63800, 15.67, 'FINISHED', GETDATE())", race1Id, hShadow, jBeretta);
            jdbcTemplate.update("INSERT INTO race_participants (race_id, horse_id, jockey_id, gate_number, final_rank, finish_time, average_speed, status, created_at) VALUES (?, ?, ?, 3, 3, 65100, 15.36, 'FINISHED', GETDATE())", race1Id, hSword, jDiablo);
            jdbcTemplate.update("INSERT INTO race_participants (race_id, horse_id, jockey_id, gate_number, final_rank, finish_time, average_speed, status, created_at) VALUES (?, ?, ?, 4, 4, 67200, 14.88, 'FINISHED', GETDATE())", race1Id, hBold, jCarrion);

            Integer p1Win = jdbcTemplate.queryForObject("SELECT id FROM race_participants WHERE race_id = ? AND final_rank = 1", Integer.class, race1Id);
            Integer p2Loss = jdbcTemplate.queryForObject("SELECT id FROM race_participants WHERE race_id = ? AND final_rank = 2", Integer.class, race1Id);

            // Spectators placing bets on Race 1
            Integer shunaId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE username='shuna'", Integer.class);
            Integer shionId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE username='shion'", Integer.class);
            Integer milimId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE username='milim'", Integer.class);

            if (shunaId != null && p1Win != null) {
                // Shuna placed 10,000 VND on Veldora (Rank 1) -> WON payout 25,000 VND
                jdbcTemplate.update(
                        "INSERT INTO bets (user_id, race_id, participant_id, amount, odds, status, payout_amount, bet_type, created_at) VALUES (?, ?, ?, 10000.00, 2.50, 'WON', 25000.00, 'WINNER', GETDATE())",
                        shunaId, race1Id, p1Win
                );
            }

            if (shionId != null && p2Loss != null) {
                // Shion placed 5,000 VND on Shadow Demon (Rank 2) -> LOST
                jdbcTemplate.update(
                        "INSERT INTO bets (user_id, race_id, participant_id, amount, odds, status, payout_amount, bet_type, created_at) VALUES (?, ?, ?, 5000.00, 3.10, 'LOST', 0.00, 'WINNER', GETDATE())",
                        shionId, race1Id, p2Loss
                );
            }

            if (milimId != null && p1Win != null) {
                // Milim placed 20,000 VND on Veldora (Rank 1) -> WON payout 50,000 VND
                jdbcTemplate.update(
                        "INSERT INTO bets (user_id, race_id, participant_id, amount, odds, status, payout_amount, bet_type, created_at) VALUES (?, ?, ?, 20000.00, 2.50, 'WON', 50000.00, 'WINNER', GETDATE())",
                        milimId, race1Id, p1Win
                );
            }

            // Race 2 for Tournament 2 (Jura Championship 1600m)
            jdbcTemplate.update(
                    "INSERT INTO races (race_name, tournament_id, race_track_id, race_date, race_time, race_round, max_horses, distance, surface_type, weather, status, end_time, referee_id) " +
                            "VALUES ('Jura Championship 1600m', ?, ?, '2026-07-10', '15:00:00', 1, 4, 1600.0, 'Dirt', 'Cloudy', 'FINISHED', '15:20:00', ?)",
                    t2Id, t2TrackId, t2RefId
            );
            Integer race2Id = jdbcTemplate.queryForObject("SELECT id FROM races WHERE race_name = 'Jura Championship 1600m'", Integer.class);

            jdbcTemplate.update("INSERT INTO race_participants (race_id, horse_id, jockey_id, gate_number, final_rank, finish_time, average_speed, status, created_at) VALUES (?, ?, ?, 1, 1, 98200, 16.29, 'FINISHED', GETDATE())", race2Id, hSword, jDiablo);
            jdbcTemplate.update("INSERT INTO race_participants (race_id, horse_id, jockey_id, gate_number, final_rank, finish_time, average_speed, status, created_at) VALUES (?, ?, ?, 2, 2, 99500, 16.08, 'FINISHED', GETDATE())", race2Id, hVeldora, jRanga);
            jdbcTemplate.update("INSERT INTO race_participants (race_id, horse_id, jockey_id, gate_number, final_rank, finish_time, average_speed, status, created_at) VALUES (?, ?, ?, 3, 3, 101200, 15.81, 'FINISHED', GETDATE())", race2Id, hShadow, jBeretta);
            jdbcTemplate.update("INSERT INTO race_participants (race_id, horse_id, jockey_id, gate_number, final_rank, finish_time, average_speed, status, created_at) VALUES (?, ?, ?, 4, 4, 103400, 15.47, 'FINISHED', GETDATE())", race2Id, hBold, jCarrion);

            log.info("Successfully seeded completed races, participants, and betting tickets.");
        } catch (org.springframework.dao.DataAccessException e) {
            log.warn("Completed races seed check warning: {}", e.getMessage());
        }
    }

    private void ensureRichWalletTransactions() {
        try {
            Integer txCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM wallet_transactions", Integer.class);
            if (txCount != null && txCount >= 10) {
                log.info("Wallet transactions already populated (count={}). Skipping.", txCount);
                return;
            }

            log.info("Seeding comprehensive wallet transactions with various types & statuses...");

            String[] usernames = {"shuna", "shion", "milim", "benimaru", "souei", "guy_crimson", "ranga"};
            for (String uname : usernames) {
                Integer uId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE username = ?", Integer.class, uname);
                if (uId == null) continue;

                Integer wId = jdbcTemplate.queryForObject("SELECT id FROM wallets WHERE user_id = ?", Integer.class, uId);
                if (wId == null) continue;

                // 1. Successful Deposit
                jdbcTemplate.update(
                        "INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, status, reference_type, payos_order_code, created_at, bank_name, bank_bin, bank_account_number, bank_account_holder_name) " +
                                "VALUES (?, 'DEPOSIT', 500000.00, 'SUCCESS', 'PAYOS_DEPOSIT', 1002003001, GETDATE(), 'VietinBank', '970415', '101000112233', ?)",
                        wId, uname.toUpperCase()
                );

                // 2. Successful Withdrawal
                jdbcTemplate.update(
                        "INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, status, reference_type, created_at, bank_name, bank_bin, bank_account_number, bank_account_holder_name) " +
                                "VALUES (?, 'WITHDRAWAL', -100000.00, 'SUCCESS', 'BANK_WITHDRAWAL', GETDATE(), 'MBBank', '970422', '0901000099', ?)",
                        wId, uname.toUpperCase()
                );

                // 3. Pending Deposit
                jdbcTemplate.update(
                        "INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, status, reference_type, payos_order_code, created_at, bank_name, bank_bin, bank_account_number, bank_account_holder_name) " +
                                "VALUES (?, 'DEPOSIT', 200000.00, 'PENDING', 'PAYOS_DEPOSIT', 1002003002, GETDATE(), 'Techcombank', '970407', '190300112233', ?)",
                        wId, uname.toUpperCase()
                );

                // 4. Rejected Withdrawal
                jdbcTemplate.update(
                        "INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, status, reference_type, created_at, bank_name, bank_bin, bank_account_number, bank_account_holder_name) " +
                                "VALUES (?, 'WITHDRAWAL', -300000.00, 'REJECTED', 'BANK_WITHDRAWAL', GETDATE(), 'BIDV', '970418', '21510001122', ?)",
                        wId, uname.toUpperCase()
                );

                // 5. Bet Payout / Win
                jdbcTemplate.update(
                        "INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, status, reference_type, created_at) " +
                                "VALUES (?, 'BET_PAYOUT', 150000.00, 'SUCCESS', 'RACE_BET_PAYOUT', GETDATE())",
                        wId
                );
            }

            log.info("Successfully seeded rich wallet transaction history across multiple users.");
        } catch (org.springframework.dao.DataAccessException e) {
            log.warn("Wallet transactions seed warning: {}", e.getMessage());
        }
    }
}
