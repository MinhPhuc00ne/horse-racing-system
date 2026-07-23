package com.horseracing.services;

import com.horseracing.entities.*;
import com.horseracing.entities.enums.NotificationType;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PredictionPayoutService {

    private final BetRepository betRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    /**
     * Calculates and distributes payouts for a race using the Pari-Mutuel Option 1: Split-Pools
     * system.
     *
     * @param raceId the ID of the race
     * @param participants the list of race participants containing their final rank
     * @param race the race entity
     */
    @Transactional
    public void processPayouts(Integer raceId, List<RaceParticipant> participants, Race race) {
        log.info("Starting Pari-Mutuel prediction payout processing for race ID: {}", raceId);
        List<Bet> bets = betRepository.findByRaceId(raceId);

        BigDecimal totalWinPool = BigDecimal.ZERO;
        BigDecimal totalPlacePool = BigDecimal.ZERO;
        BigDecimal totalShowPool = BigDecimal.ZERO;

        for (Bet bet : bets) {
            if ("PENDING".equals(bet.getStatus())) {
                String type = bet.getBetType() != null ? bet.getBetType() : "WIN";
                if ("WIN".equalsIgnoreCase(type)) {
                    totalWinPool = totalWinPool.add(bet.getAmount());
                } else if ("PLACE".equalsIgnoreCase(type)) {
                    totalPlacePool = totalPlacePool.add(bet.getAmount());
                } else if ("SHOW".equalsIgnoreCase(type)) {
                    totalShowPool = totalShowPool.add(bet.getAmount());
                }
            }
        }

        // Net pools after 10% House Edge (payback rate is 90%)
        BigDecimal netWinPool = totalWinPool.multiply(BigDecimal.valueOf(0.9));
        BigDecimal netPlacePool = totalPlacePool.multiply(BigDecimal.valueOf(0.9));
        BigDecimal netShowPool = totalShowPool.multiply(BigDecimal.valueOf(0.9));

        Integer rank1Id = null;
        Integer rank2Id = null;
        Integer rank3Id = null;

        for (RaceParticipant p : participants) {
            Integer rank = p.getFinalRank();
            if (rank != null) {
                switch (rank) {
                    case 1 -> rank1Id = p.getId();
                    case 2 -> rank2Id = p.getId();
                    case 3 -> rank3Id = p.getId();
                }
            }
        }

        BigDecimal totalWinOnWinner = BigDecimal.ZERO;
        BigDecimal totalPlaceOnH1 = BigDecimal.ZERO;
        BigDecimal totalPlaceOnH2 = BigDecimal.ZERO;
        BigDecimal totalShowOnH1 = BigDecimal.ZERO;
        BigDecimal totalShowOnH2 = BigDecimal.ZERO;
        BigDecimal totalShowOnH3 = BigDecimal.ZERO;

        for (Bet bet : bets) {
            if ("PENDING".equals(bet.getStatus())) {
                String type = bet.getBetType() != null ? bet.getBetType() : "WIN";
                Integer partId = bet.getParticipant().getId();

                if ("WIN".equalsIgnoreCase(type)) {
                    if (partId.equals(rank1Id)) {
                        totalWinOnWinner = totalWinOnWinner.add(bet.getAmount());
                    }
                } else if ("PLACE".equalsIgnoreCase(type)) {
                    if (partId.equals(rank1Id)) {
                        totalPlaceOnH1 = totalPlaceOnH1.add(bet.getAmount());
                    } else if (partId.equals(rank2Id)) {
                        totalPlaceOnH2 = totalPlaceOnH2.add(bet.getAmount());
                    }
                } else if ("SHOW".equalsIgnoreCase(type)) {
                    if (partId.equals(rank1Id)) {
                        totalShowOnH1 = totalShowOnH1.add(bet.getAmount());
                    } else if (partId.equals(rank2Id)) {
                        totalShowOnH2 = totalShowOnH2.add(bet.getAmount());
                    } else if (partId.equals(rank3Id)) {
                        totalShowOnH3 = totalShowOnH3.add(bet.getAmount());
                    }
                }
            }
        }

        // Calculate WIN odds (Floor limit: 1.00)
        BigDecimal oddsWin = BigDecimal.valueOf(1.00);
        if (totalWinOnWinner.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal computed = netWinPool.divide(totalWinOnWinner, 2, RoundingMode.HALF_UP);
            if (computed.compareTo(BigDecimal.valueOf(1.00)) > 0) {
                oddsWin = computed;
            }
        }

        // Calculate PLACE odds
        BigDecimal oddsPlaceH1 = BigDecimal.valueOf(1.00);
        BigDecimal oddsPlaceH2 = BigDecimal.valueOf(1.00);

        boolean hasPlaceH1 = totalPlaceOnH1.compareTo(BigDecimal.ZERO) > 0;
        boolean hasPlaceH2 = totalPlaceOnH2.compareTo(BigDecimal.ZERO) > 0;

        if (hasPlaceH1 && hasPlaceH2) {
            BigDecimal halfPool =
                    netPlacePool.divide(BigDecimal.valueOf(2), 4, RoundingMode.HALF_UP);
            BigDecimal computedH1 = halfPool.divide(totalPlaceOnH1, 2, RoundingMode.HALF_UP);
            BigDecimal computedH2 = halfPool.divide(totalPlaceOnH2, 2, RoundingMode.HALF_UP);
            if (computedH1.compareTo(BigDecimal.valueOf(1.00)) > 0) oddsPlaceH1 = computedH1;
            if (computedH2.compareTo(BigDecimal.valueOf(1.00)) > 0) oddsPlaceH2 = computedH2;
        } else if (hasPlaceH1) {
            BigDecimal computedH1 = netPlacePool.divide(totalPlaceOnH1, 2, RoundingMode.HALF_UP);
            if (computedH1.compareTo(BigDecimal.valueOf(1.00)) > 0) oddsPlaceH1 = computedH1;
        } else if (hasPlaceH2) {
            BigDecimal computedH2 = netPlacePool.divide(totalPlaceOnH2, 2, RoundingMode.HALF_UP);
            if (computedH2.compareTo(BigDecimal.valueOf(1.00)) > 0) oddsPlaceH2 = computedH2;
        }

        // Calculate SHOW odds
        BigDecimal oddsShowH1 = BigDecimal.valueOf(1.00);
        BigDecimal oddsShowH2 = BigDecimal.valueOf(1.00);
        BigDecimal oddsShowH3 = BigDecimal.valueOf(1.00);

        int activeShowCount = 0;
        if (totalShowOnH1.compareTo(BigDecimal.ZERO) > 0)
            activeShowCount++;
        if (totalShowOnH2.compareTo(BigDecimal.ZERO) > 0)
            activeShowCount++;
        if (totalShowOnH3.compareTo(BigDecimal.ZERO) > 0)
            activeShowCount++;

        if (activeShowCount > 0) {
            BigDecimal sharePool = netShowPool.divide(BigDecimal.valueOf(activeShowCount), 4,
                    RoundingMode.HALF_UP);
            if (totalShowOnH1.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal computed = sharePool.divide(totalShowOnH1, 2, RoundingMode.HALF_UP);
                if (computed.compareTo(BigDecimal.valueOf(1.00)) > 0) oddsShowH1 = computed;
            }
            if (totalShowOnH2.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal computed = sharePool.divide(totalShowOnH2, 2, RoundingMode.HALF_UP);
                if (computed.compareTo(BigDecimal.valueOf(1.00)) > 0) oddsShowH2 = computed;
            }
            if (totalShowOnH3.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal computed = sharePool.divide(totalShowOnH3, 2, RoundingMode.HALF_UP);
                if (computed.compareTo(BigDecimal.valueOf(1.00)) > 0) oddsShowH3 = computed;
            }
        }

        // Distribute payouts
        for (Bet bet : bets) {
            if ("PENDING".equals(bet.getStatus())) {
                String type = bet.getBetType() != null ? bet.getBetType() : "WIN";
                Integer partId = bet.getParticipant().getId();
                boolean isWon = false;
                BigDecimal odds = BigDecimal.valueOf(1.00);

                if ("WIN".equalsIgnoreCase(type)) {
                    if (partId.equals(rank1Id)) {
                        isWon = true;
                        odds = oddsWin;
                    }
                } else if ("PLACE".equalsIgnoreCase(type)) {
                    if (partId.equals(rank1Id)) {
                        isWon = true;
                        odds = oddsPlaceH1;
                    } else if (partId.equals(rank2Id)) {
                        isWon = true;
                        odds = oddsPlaceH2;
                    }
                } else if ("SHOW".equalsIgnoreCase(type)) {
                    if (partId.equals(rank1Id)) {
                        isWon = true;
                        odds = oddsShowH1;
                    } else if (partId.equals(rank2Id)) {
                        isWon = true;
                        odds = oddsShowH2;
                    } else if (partId.equals(rank3Id)) {
                        isWon = true;
                        odds = oddsShowH3;
                    }
                }

                if (isWon) {
                    bet.setStatus("WON");
                    bet.setOdds(odds);
                    BigDecimal payout = bet.getAmount().multiply(odds);
                    bet.setPayoutAmount(payout);
                    betRepository.save(bet);

                    Wallet wallet = walletRepository.findByUserIdWithLock(bet.getUser().getId())
                            .orElseGet(() -> {
                                Wallet w = Wallet.builder().user(bet.getUser())
                                        .balance(BigDecimal.ZERO).build();
                                return walletRepository.save(w);
                            });
                    wallet.setBalance(wallet.getBalance().add(payout));
                    walletRepository.save(wallet);

                    WalletTransaction transaction = WalletTransaction.builder().wallet(wallet)
                            .transactionType("PRIZE").amount(payout).status("SUCCESS")
                            .referenceType("BET").referenceId(bet.getId()).build();
                    walletTransactionRepository.save(transaction);

                    notificationService.sendNotification(bet.getUser(),
                            "Race Bet Won - Congratulations!",
                            "Congratulations! You won your bet (" + type + ") in race "
                                    + race.getRaceName() + " with payout amount " + payout
                                    + " VND (based on odds " + odds
                                    + "). The amount has been credited to your wallet.",
                            NotificationType.WALLET);
                } else {
                    bet.setStatus("LOST");
                    bet.setPayoutAmount(BigDecimal.ZERO);
                    betRepository.save(bet);

                    notificationService.sendNotification(bet.getUser(), "Race Bet Result",
                            "Race result for " + race.getRaceName()
                                    + " has been confirmed by the Referee. Unfortunately, your bet ("
                                    + type + ") on horse "
                                    + bet.getParticipant().getHorse().getName()
                                    + " did not win. Better luck next time!",
                            NotificationType.RACE_STATUS);
                }
            }
        }

        // Calculate and transfer betting revenue to Admin
        BigDecimal totalBetAmount = totalWinPool.add(totalPlacePool).add(totalShowPool);
        BigDecimal totalPayout = BigDecimal.ZERO;
        for (Bet bet : bets) {
            if ("WON".equals(bet.getStatus())) {
                totalPayout = totalPayout.add(
                        bet.getPayoutAmount() != null ? bet.getPayoutAmount() : BigDecimal.ZERO);
            }
        }

        BigDecimal adminBetRevenue = totalBetAmount.subtract(totalPayout);
        if (adminBetRevenue.compareTo(BigDecimal.ZERO) > 0) {
            User admin = userRepository.findByRole(Role.ADMIN).stream().findFirst().orElse(null);
            if (admin != null) {
                Wallet adminWallet =
                        walletRepository.findByUserIdWithLock(admin.getId()).orElseGet(() -> {
                            Wallet w =
                                    Wallet.builder().user(admin).balance(BigDecimal.ZERO).build();
                            return walletRepository.save(w);
                        });
                adminWallet.setBalance(adminWallet.getBalance().add(adminBetRevenue));
                walletRepository.save(adminWallet);

                WalletTransaction adminTx = WalletTransaction.builder().wallet(adminWallet)
                        .transactionType("ADMIN_REVENUE").amount(adminBetRevenue).status("SUCCESS")
                        .referenceType("RACE").referenceId(raceId).build();
                walletTransactionRepository.save(adminTx);
            }
        }
    }

    /**
     * Refunds all pending bets for a specific race participant (e.g. if rejected or disqualified
     * before race starts).
     *
     * @param participant the race participant to refund bets for
     * @param reason the reason for rejection/disqualification
     * @param notificationMessage custom notification message to display to the user
     */
    @Transactional
    public void refundBetsForParticipant(RaceParticipant participant, String reason,
            String notificationMessage) {
        log.info("Refunding pending bets for participant ID: {}, horse: {}", participant.getId(),
                participant.getHorse().getName());
        List<Bet> bets = betRepository.findByParticipantIdAndStatus(participant.getId(), "PENDING");
        for (Bet bet : bets) {
            bet.setStatus("REFUNDED");
            bet.setPayoutAmount(BigDecimal.ZERO);
            betRepository.save(bet);

            Wallet wallet =
                    walletRepository.findByUserIdWithLock(bet.getUser().getId()).orElseGet(() -> {
                        Wallet w = Wallet.builder().user(bet.getUser()).balance(BigDecimal.ZERO)
                                .build();
                        return walletRepository.save(w);
                    });

            wallet.setBalance(wallet.getBalance().add(bet.getAmount()));
            walletRepository.save(wallet);

            WalletTransaction transaction = WalletTransaction.builder().wallet(wallet)
                    .transactionType("REFUND").amount(bet.getAmount()).status("SUCCESS")
                    .referenceType("BET").referenceId(bet.getId()).build();
            walletTransactionRepository.save(transaction);

            notificationService.sendNotification(bet.getUser(), "Race Bet Refunded",
                    notificationMessage.replace("{amount}", bet.getAmount().toString()),
                    NotificationType.WALLET);
        }
    }

    /**
     * Refunds all pending bets for a cancelled race.
     *
     * @param race the cancelled race
     */
    @Transactional
    public void refundBetsForRace(Race race) {
        log.info("Refunding all pending bets for cancelled race ID: {}", race.getId());
        List<Bet> bets = betRepository.findByRaceId(race.getId());
        for (Bet bet : bets) {
            if ("PENDING".equals(bet.getStatus())) {
                bet.setStatus("REFUNDED");
                bet.setPayoutAmount(BigDecimal.ZERO);
                betRepository.save(bet);

                Wallet wallet = walletRepository.findByUserIdWithLock(bet.getUser().getId())
                        .orElseGet(() -> {
                            Wallet w = Wallet.builder().user(bet.getUser()).balance(BigDecimal.ZERO)
                                    .build();
                            return walletRepository.save(w);
                        });
                wallet.setBalance(wallet.getBalance().add(bet.getAmount()));
                walletRepository.save(wallet);

                WalletTransaction transaction = WalletTransaction.builder().wallet(wallet)
                        .transactionType("REFUND").amount(bet.getAmount()).status("SUCCESS")
                        .referenceType("BET").referenceId(bet.getId()).build();
                walletTransactionRepository.save(transaction);

                notificationService.sendNotification(bet.getUser(), "Race Bet Refunded",
                        "Race " + race.getRaceName()
                                + " was cancelled. The system refunded 100% of your bet ("
                                + bet.getAmount() + " VND) to your wallet.",
                        NotificationType.WALLET);
            }
        }
    }
}
