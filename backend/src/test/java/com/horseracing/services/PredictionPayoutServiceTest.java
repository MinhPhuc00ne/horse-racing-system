package com.horseracing.services;

import com.horseracing.entities.*;
import com.horseracing.entities.enums.NotificationType;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PredictionPayoutServiceTest {

    @Mock private BetRepository betRepository;
    @Mock private WalletRepository walletRepository;
    @Mock private WalletTransactionRepository walletTransactionRepository;
    @Mock private NotificationService notificationService;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private PredictionPayoutService predictionPayoutService;

    private User spectator1;
    private User spectator2;
    private User admin;
    private Race race;
    private RaceParticipant participant1;
    private RaceParticipant participant2;
    private RaceParticipant participant3;

    @BeforeEach
    public void setUp() {
        spectator1 = User.builder()
                .id(11)
                .fullName("Spectator One")
                .email("spec1@test.com")
                .role(Role.SPECTATOR)
                .build();

        spectator2 = User.builder()
                .id(12)
                .fullName("Spectator Two")
                .email("spec2@test.com")
                .role(Role.SPECTATOR)
                .build();

        admin = User.builder()
                .id(1)
                .fullName("System Admin")
                .email("admin@test.com")
                .role(Role.ADMIN)
                .build();

        race = Race.builder()
                .id(101)
                .raceName("Golden Cup Race")
                .build();

        participant1 = RaceParticipant.builder()
                .id(201)
                .race(race)
                .horse(Horse.builder().id(301).name("Fast Wind").build())
                .finalRank(1)
                .build();

        participant2 = RaceParticipant.builder()
                .id(202)
                .race(race)
                .horse(Horse.builder().id(302).name("Thunder").build())
                .finalRank(2)
                .build();

        participant3 = RaceParticipant.builder()
                .id(203)
                .race(race)
                .horse(Horse.builder().id(303).name("Silver").build())
                .finalRank(3)
                .build();
    }

    @Test
    public void testProcessPayouts_WinBetSuccess() {
        Bet bet1 = Bet.builder()
                .id(1001)
                .user(spectator1)
                .race(race)
                .participant(participant1) // WIN, rank 1
                .amount(BigDecimal.valueOf(100.0))
                .betType("WIN")
                .status("PENDING")
                .build();

        Bet bet2 = Bet.builder()
                .id(1002)
                .user(spectator2)
                .race(race)
                .participant(participant2) // WIN, rank 2 (LOST)
                .amount(BigDecimal.valueOf(200.0))
                .betType("WIN")
                .status("PENDING")
                .build();

        Wallet wallet1 = Wallet.builder().id(501).user(spectator1).balance(BigDecimal.ZERO).build();

        when(betRepository.findByRaceId(101)).thenReturn(List.of(bet1, bet2));
        when(walletRepository.findByUserId(11)).thenReturn(Optional.of(wallet1));
        when(userRepository.findByRole(Role.ADMIN)).thenReturn(List.of(admin));
        when(walletRepository.findByUserId(1)).thenReturn(Optional.of(Wallet.builder().id(99).user(admin).balance(BigDecimal.ZERO).build()));

        predictionPayoutService.processPayouts(101, List.of(participant1, participant2, participant3), race);

        // Verify winner status changed and payout calculated
        assertEquals("WON", bet1.getStatus());
        // Total WIN pool = 300. Net WIN pool (90%) = 270. Only bet1 won on participant1. Odds = 270 / 100 = 2.70
        assertEquals(0, BigDecimal.valueOf(2.70).compareTo(bet1.getOdds()));
        assertEquals(0, BigDecimal.valueOf(270.0).compareTo(bet1.getPayoutAmount()));

        // Verify loser status changed
        assertEquals("LOST", bet2.getStatus());
        assertEquals(0, BigDecimal.ZERO.compareTo(bet2.getPayoutAmount()));

        // Verify wallets & transactions saved
        verify(walletRepository, atLeastOnce()).save(any(Wallet.class));
        verify(walletTransactionRepository, atLeastOnce()).save(any(WalletTransaction.class));
        verify(notificationService, times(2)).sendNotification(any(User.class), anyString(), anyString(), any(NotificationType.class));
    }

    @Test
    public void testProcessPayouts_PlaceBetSuccess() {
        Bet bet1 = Bet.builder()
                .id(1001)
                .user(spectator1)
                .race(race)
                .participant(participant1) // PLACE on Rank 1 (WON)
                .amount(BigDecimal.valueOf(100.0))
                .betType("PLACE")
                .status("PENDING")
                .build();

        Bet bet2 = Bet.builder()
                .id(1002)
                .user(spectator2)
                .race(race)
                .participant(participant2) // PLACE on Rank 2 (WON)
                .amount(BigDecimal.valueOf(100.0))
                .betType("PLACE")
                .status("PENDING")
                .build();

        Wallet wallet1 = Wallet.builder().id(501).user(spectator1).balance(BigDecimal.ZERO).build();
        Wallet wallet2 = Wallet.builder().id(502).user(spectator2).balance(BigDecimal.ZERO).build();

        when(betRepository.findByRaceId(101)).thenReturn(List.of(bet1, bet2));
        when(walletRepository.findByUserId(11)).thenReturn(Optional.of(wallet1));
        when(walletRepository.findByUserId(12)).thenReturn(Optional.of(wallet2));
        lenient().when(userRepository.findByRole(Role.ADMIN)).thenReturn(List.of(admin));
        lenient().when(walletRepository.findByUserId(1)).thenReturn(Optional.of(Wallet.builder().id(99).user(admin).balance(BigDecimal.ZERO).build()));

        predictionPayoutService.processPayouts(101, List.of(participant1, participant2, participant3), race);

        // Net PLACE pool = 200 * 0.9 = 180. Shared half-pool = 90 each.
        // Odds for H1 (bet1) = 90 / 100 = 0.90 -> Floor limit is 1.05.
        // Odds for H2 (bet2) = 90 / 100 = 0.90 -> Floor limit is 1.05.
        assertEquals("WON", bet1.getStatus());
        assertEquals("WON", bet2.getStatus());
        assertEquals(0, BigDecimal.valueOf(1.05).compareTo(bet1.getOdds()));
        assertEquals(0, BigDecimal.valueOf(1.05).compareTo(bet2.getOdds()));
    }

    @Test
    public void testRefundBetsForParticipant() {
        Bet bet = Bet.builder()
                .id(1005)
                .user(spectator1)
                .race(race)
                .participant(participant1)
                .amount(BigDecimal.valueOf(150.0))
                .status("PENDING")
                .build();

        Wallet wallet = Wallet.builder().id(501).user(spectator1).balance(BigDecimal.valueOf(20.0)).build();

        when(betRepository.findByParticipantIdAndStatus(201, "PENDING")).thenReturn(List.of(bet));
        when(walletRepository.findByUserId(11)).thenReturn(Optional.of(wallet));

        predictionPayoutService.refundBetsForParticipant(participant1, "REJECTED", "Ngựa bị loại. Hoàn trả cược {amount} VNĐ.");

        assertEquals("REFUNDED", bet.getStatus());
        assertEquals(0, BigDecimal.valueOf(170.0).compareTo(wallet.getBalance())); // 20 + 150 = 170

        verify(walletRepository, times(1)).save(wallet);
        verify(walletTransactionRepository, times(1)).save(any(WalletTransaction.class));
        verify(notificationService, times(1)).sendNotification(eq(spectator1), anyString(), eq("Ngựa bị loại. Hoàn trả cược 150.0 VNĐ."), eq(NotificationType.WALLET));
    }

    @Test
    public void testRefundBetsForRace() {
        Bet bet1 = Bet.builder()
                .id(1006)
                .user(spectator1)
                .race(race)
                .amount(BigDecimal.valueOf(50.0))
                .status("PENDING")
                .build();

        Bet bet2 = Bet.builder()
                .id(1007)
                .user(spectator2)
                .race(race)
                .amount(BigDecimal.valueOf(100.0))
                .status("PENDING")
                .build();

        Wallet wallet1 = Wallet.builder().id(501).user(spectator1).balance(BigDecimal.ZERO).build();
        Wallet wallet2 = Wallet.builder().id(502).user(spectator2).balance(BigDecimal.ZERO).build();

        when(betRepository.findByRaceId(101)).thenReturn(List.of(bet1, bet2));
        when(walletRepository.findByUserId(11)).thenReturn(Optional.of(wallet1));
        when(walletRepository.findByUserId(12)).thenReturn(Optional.of(wallet2));

        predictionPayoutService.refundBetsForRace(race);

        assertEquals("REFUNDED", bet1.getStatus());
        assertEquals("REFUNDED", bet2.getStatus());
        assertEquals(0, BigDecimal.valueOf(50.0).compareTo(wallet1.getBalance()));
        assertEquals(0, BigDecimal.valueOf(100.0).compareTo(wallet2.getBalance()));

        verify(walletRepository, times(2)).save(any(Wallet.class));
        verify(walletTransactionRepository, times(2)).save(any(WalletTransaction.class));
        verify(notificationService, times(2)).sendNotification(any(User.class), anyString(), anyString(), eq(NotificationType.WALLET));
    }
}
