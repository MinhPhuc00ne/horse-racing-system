package com.horseracing.controllers;

import com.horseracing.dto.response.AdminDashboardStatsResponse;
import com.horseracing.entities.Bet;
import com.horseracing.entities.Horse;
import com.horseracing.entities.Race;
import com.horseracing.entities.Tournament;
import com.horseracing.entities.WalletTransaction;
import com.horseracing.entities.enums.RequestStatus;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final TournamentRepository tournamentRepository;
    private final RaceRepository raceRepository;
    private final UpgradeRequestRepository upgradeRequestRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final BetRepository betRepository;
    private final HorseRepository horseRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStatsResponse> getDashboardStats() {
        // 1. Core Metrics
        long usersCount = userRepository.count();
        long tournamentsCount = tournamentRepository.count();
        long racesCount = raceRepository.count();
        long pendingUpgradesCount = upgradeRequestRepository.countByStatus(RequestStatus.PENDING);
        long pendingWithdrawalsCount = walletTransactionRepository.countByTransactionTypeAndStatus("WITHDRAW", "PENDING");

        // 2. User Role Distribution
        Map<String, Long> roleDistribution = new LinkedHashMap<>();
        roleDistribution.put("Spectators", userRepository.countByRole(Role.SPECTATOR));
        roleDistribution.put("Owners", userRepository.countByRole(Role.HORSE_OWNER));
        roleDistribution.put("Jockeys", userRepository.countByRole(Role.JOCKEY));
        roleDistribution.put("Referees", userRepository.countByRole(Role.RACE_REFEREE));
        roleDistribution.put("Admins", userRepository.countByRole(Role.ADMIN));

        // 3. Platform Revenue (10% commission on bets placed, aggregated by Month)
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        Map<String, BigDecimal> monthlyRevenueMap = new LinkedHashMap<>();
        for (String m : months) {
            monthlyRevenueMap.put(m, BigDecimal.ZERO);
        }

        List<Bet> allBets = betRepository.findAll();
        for (Bet bet : allBets) {
            if (bet.getCreatedAt() != null && bet.getAmount() != null) {
                String mName = bet.getCreatedAt().getMonth().name();
                String mLabel = mName.substring(0, 1).toUpperCase() + mName.substring(1, 3).toLowerCase();
                if (monthlyRevenueMap.containsKey(mLabel)) {
                    BigDecimal commission = bet.getAmount().multiply(new BigDecimal("0.1"));
                    monthlyRevenueMap.put(mLabel, monthlyRevenueMap.get(mLabel).add(commission));
                }
            }
        }

        List<AdminDashboardStatsResponse.RevenueDataPoint> revenueDataList = new ArrayList<>();
        for (String m : months) {
            revenueDataList.add(new AdminDashboardStatsResponse.RevenueDataPoint(m, monthlyRevenueMap.get(m)));
        }

        // 4. Bet Volume per Tournament
        Map<String, Long> tournamentBetCountMap = new HashMap<>();
        for (Bet bet : allBets) {
            if (bet.getRace() != null && bet.getRace().getTournament() != null) {
                String tName = bet.getRace().getTournament().getTournamentName();
                tournamentBetCountMap.put(tName, tournamentBetCountMap.getOrDefault(tName, 0L) + 1);
            }
        }

        List<AdminDashboardStatsResponse.BetVolumeDataPoint> betVolumeList = new ArrayList<>();
        for (Map.Entry<String, Long> entry : tournamentBetCountMap.entrySet()) {
            betVolumeList.add(new AdminDashboardStatsResponse.BetVolumeDataPoint(entry.getKey(), entry.getValue()));
        }
        if (betVolumeList.isEmpty()) {
            betVolumeList.add(new AdminDashboardStatsResponse.BetVolumeDataPoint("No Data Available", 0L));
        }

        // --- NEW METRIC 1: Horse Breeds Distribution ---
        Map<String, Long> breedDistribution = new LinkedHashMap<>();
        List<Horse> horses = horseRepository.findAll();
        for (Horse h : horses) {
            String bName = (h.getBreed() != null && h.getBreed().getBreedName() != null) ? h.getBreed().getBreedName() : "Khác";
            breedDistribution.put(bName, breedDistribution.getOrDefault(bName, 0L) + 1);
        }

        // --- NEW METRIC 2: Race Status Breakdown ---
        Map<String, Long> raceStatusDistribution = new LinkedHashMap<>();
        List<Race> races = raceRepository.findAll();
        for (Race r : races) {
            String statusName = r.getStatus() != null ? r.getStatus() : "UNKNOWN";
            raceStatusDistribution.put(statusName, raceStatusDistribution.getOrDefault(statusName, 0L) + 1);
        }

        // --- NEW METRIC 3: Monthly Wallet Transactions Trend (Deposit vs Withdraw) ---
        Map<String, BigDecimal> monthlyDepositMap = new LinkedHashMap<>();
        Map<String, BigDecimal> monthlyWithdrawMap = new LinkedHashMap<>();
        for (String m : months) {
            monthlyDepositMap.put(m, BigDecimal.ZERO);
            monthlyWithdrawMap.put(m, BigDecimal.ZERO);
        }

        List<WalletTransaction> txs = walletTransactionRepository.findAll();
        for (WalletTransaction tx : txs) {
            if (tx.getCreatedAt() != null && tx.getAmount() != null) {
                String mName = tx.getCreatedAt().getMonth().name();
                String mLabel = mName.substring(0, 1).toUpperCase() + mName.substring(1, 3).toLowerCase();
                if (monthlyDepositMap.containsKey(mLabel)) {
                    if ("TOPUP".equalsIgnoreCase(tx.getTransactionType()) || "DEPOSIT".equalsIgnoreCase(tx.getTransactionType())) {
                        monthlyDepositMap.put(mLabel, monthlyDepositMap.get(mLabel).add(tx.getAmount()));
                    } else if ("WITHDRAW".equalsIgnoreCase(tx.getTransactionType())) {
                        monthlyWithdrawMap.put(mLabel, monthlyWithdrawMap.get(mLabel).add(tx.getAmount()));
                    }
                }
            }
        }

        List<AdminDashboardStatsResponse.TransactionTrendDataPoint> transactionTrendList = new ArrayList<>();
        for (String m : months) {
            transactionTrendList.add(new AdminDashboardStatsResponse.TransactionTrendDataPoint(
                    m, monthlyDepositMap.get(m), monthlyWithdrawMap.get(m)
            ));
        }

        // --- NEW METRIC 4: Top Tournaments by Prize Pool ---
        List<Tournament> tournaments = tournamentRepository.findAll();
        tournaments.sort((t1, t2) -> {
            BigDecimal p1 = t1.getTotalPrize() != null ? t1.getTotalPrize() : BigDecimal.ZERO;
            BigDecimal p2 = t2.getTotalPrize() != null ? t2.getTotalPrize() : BigDecimal.ZERO;
            return p2.compareTo(p1);
        });

        List<AdminDashboardStatsResponse.TournamentPrizeDataPoint> tournamentPrizesList = new ArrayList<>();
        for (int i = 0; i < Math.min(5, tournaments.size()); i++) {
            Tournament t = tournaments.get(i);
            BigDecimal pool = t.getTotalPrize() != null ? t.getTotalPrize() : BigDecimal.ZERO;
            tournamentPrizesList.add(new AdminDashboardStatsResponse.TournamentPrizeDataPoint(t.getTournamentName(), pool));
        }

        // Build Response
        AdminDashboardStatsResponse response = AdminDashboardStatsResponse.builder()
                .usersCount(usersCount)
                .tournamentsCount(tournamentsCount)
                .racesCount(racesCount)
                .pendingUpgradesCount(pendingUpgradesCount)
                .pendingWithdrawalsCount(pendingWithdrawalsCount)
                .roleDistribution(roleDistribution)
                .revenueData(revenueDataList)
                .betVolumeData(betVolumeList)
                .breedDistribution(breedDistribution)
                .raceStatusDistribution(raceStatusDistribution)
                .transactionTrendData(transactionTrendList)
                .tournamentPrizesData(tournamentPrizesList)
                .build();

        return ResponseEntity.ok(response);
    }
}
