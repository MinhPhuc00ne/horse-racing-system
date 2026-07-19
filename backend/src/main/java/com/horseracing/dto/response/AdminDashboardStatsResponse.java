package com.horseracing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsResponse {
    private long usersCount;
    private long tournamentsCount;
    private long racesCount;
    private long pendingUpgradesCount;
    private long pendingWithdrawalsCount;

    private List<RevenueDataPoint> revenueData;
    private Map<String, Long> roleDistribution;
    private List<BetVolumeDataPoint> betVolumeData;

    // 4 NEW Metrics for rich charts
    private Map<String, Long> breedDistribution;
    private Map<String, Long> raceStatusDistribution;
    private List<TransactionTrendDataPoint> transactionTrendData;
    private List<TournamentPrizeDataPoint> tournamentPrizesData;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RevenueDataPoint {
        private String month;
        private BigDecimal val;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BetVolumeDataPoint {
        private String tournament;
        private long bets;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TransactionTrendDataPoint {
        private String month;
        private BigDecimal deposit;
        private BigDecimal withdraw;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TournamentPrizeDataPoint {
        private String name;
        private BigDecimal prizePool;
    }
}
