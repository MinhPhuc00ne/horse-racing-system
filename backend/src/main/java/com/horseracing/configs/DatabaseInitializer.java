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
    private final JdbcTemplate jdbcTemplate;

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

        // 1. Initialize Horse Breeds
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

        // 2. Initialize Race Tracks
        if (raceTrackRepository.count() == 0) {
            List<RaceTrack> tracks = List.of(
                    RaceTrack.builder().name("Sân đua Thẳng Tempest").location("Thành phố Tempest").shape("STRAIGHT").build(),
                    RaceTrack.builder().name("Sân đua Tròn Jura").location("Đại ngàn Jura").shape("OVAL").build()
            );
            raceTrackRepository.saveAll(tracks);
            log.info("Initialized default race tracks.");
        }

        // 3. Ensure Admin exists
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

        // Ensure all users have 50,000 VND starting wallet balance if missing
        try {
            jdbcTemplate.update("INSERT INTO wallets (user_id, balance, created_at) " +
                    "SELECT u.id, 50000.00, GETDATE() FROM users u " +
                    "LEFT JOIN wallets w ON u.id = w.user_id WHERE w.id IS NULL");
        } catch (Exception e) {
            log.warn("Wallet verification check: {}", e.getMessage());
        }
    }
}
