package com.horseracing.controllers;

import com.horseracing.entities.*;
import com.horseracing.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Profile("!prod")
public class TestController {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final RaceRepository raceRepository;
    private final RaceParticipantRepository raceParticipantRepository;
    private final BetRepository betRepository;

    @PostMapping("/users/enable")
    @Transactional
    public ResponseEntity<?> enableUser(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        user.setEnabled(true);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User enabled successfully", "email", email));
    }

    @PostMapping("/wallets/deposit")
    @Transactional
    public ResponseEntity<?> depositWallet(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        BigDecimal amount = new BigDecimal(body.get("amount").toString());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseGet(() -> Wallet.builder()
                        .user(user)
                        .balance(BigDecimal.ZERO)
                        .build());

        wallet.setBalance(wallet.getBalance().add(amount));
        wallet = walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .transactionType("DEPOSIT")
                .amount(amount)
                .status("SUCCESS")
                .referenceType("PAYOS")
                .build();
        walletTransactionRepository.save(tx);

        return ResponseEntity.ok(Map.of(
                "message", "Deposit successful",
                "email", email,
                "newBalance", wallet.getBalance()
        ));
    }

    @PostMapping("/bets/place")
    @Transactional
    public ResponseEntity<?> placeBet(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        Integer raceId = Integer.parseInt(body.get("raceId").toString());
        BigDecimal amount = new BigDecimal(body.get("amount").toString());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found: " + raceId));

        RaceParticipant participant = raceParticipantRepository.findByRaceId(raceId).stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No participants registered in this race yet. Please approve a registration first."));

        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found for user: " + email));

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient wallet balance. Please deposit first.");
        }

        // Deduct wallet balance
        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        Bet bet = Bet.builder()
                .user(user)
                .race(race)
                .participant(participant)
                .amount(amount)
                .odds(BigDecimal.valueOf(2.0))
                .status("PENDING")
                .build();
        bet = betRepository.save(bet);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .transactionType("BET")
                .amount(amount)
                .status("SUCCESS")
                .referenceType("BET")
                .referenceId(bet.getId())
                .build();
        walletTransactionRepository.save(tx);

        return ResponseEntity.ok(Map.of(
                "message", "Bet placed successfully",
                "betId", bet.getId(),
                "amount", bet.getAmount(),
                "participantId", participant.getId(),
                "remainingBalance", wallet.getBalance()
        ));
    }

    @GetMapping("/public")
    public ResponseEntity<?> getPublic() {
        return ResponseEntity.ok(Map.of("message", "Public content - accessible by anyone"));
    }

    @GetMapping("/spectator")
    @PreAuthorize("hasRole('SPECTATOR')")
    public ResponseEntity<?> getSpectator() {
        return ResponseEntity
                .ok(Map.of("message", "Spectator content - accessible by SPECTATOR role"));
    }

    @GetMapping("/owner")
    @PreAuthorize("hasRole('HORSE_OWNER')")
    public ResponseEntity<?> getOwner() {
        return ResponseEntity
                .ok(Map.of("message", "Horse Owner content - accessible by HORSE_OWNER role"));
    }

    @GetMapping("/jockey")
    @PreAuthorize("hasRole('JOCKEY')")
    public ResponseEntity<?> getJockey() {
        return ResponseEntity.ok(Map.of("message", "Jockey content - accessible by JOCKEY role"));
    }

    @GetMapping("/referee")
    @PreAuthorize("hasRole('RACE_REFEREE')")
    public ResponseEntity<?> getReferee() {
        return ResponseEntity
                .ok(Map.of("message", "Race Referee content - accessible by RACE_REFEREE role"));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdmin() {
        return ResponseEntity.ok(Map.of("message", "Admin content - accessible by ADMIN role"));
    }

    @GetMapping("/any-role")
    @PreAuthorize("hasAnyRole('SPECTATOR', 'HORSE_OWNER', 'JOCKEY', 'RACE_REFEREE', 'ADMIN')")
    public ResponseEntity<?> getAnyRole() {
        return ResponseEntity.ok(Map.of("message", "Any authenticated role content"));
    }
}
