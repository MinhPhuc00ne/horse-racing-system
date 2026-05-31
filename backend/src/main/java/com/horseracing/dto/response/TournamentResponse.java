package com.horseracing.dto.response;

import com.horseracing.entities.Tournament;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TournamentResponse {
    private Integer id;
    private String tournamentName;
    private String location;
    private String description;
    private LocalDateTime registrationDeadline;
    private Integer maxSlots;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalPrize;
    private String tournamentStatus;
    private BigDecimal prizeFirst;
    private BigDecimal prizeSecond;
    private BigDecimal prizeThird;
    private BigDecimal minBetAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TournamentResponse fromEntity(Tournament t) {
        if (t == null) return null;
        return TournamentResponse.builder()
                .id(t.getId())
                .tournamentName(t.getTournamentName())
                .location(t.getLocation())
                .description(t.getDescription())
                .registrationDeadline(t.getRegistrationDeadline())
                .maxSlots(t.getMaxSlots())
                .startDate(t.getStartDate())
                .endDate(t.getEndDate())
                .totalPrize(t.getTotalPrize())
                .tournamentStatus(t.getTournamentStatus())
                .prizeFirst(t.getPrizeFirst())
                .prizeSecond(t.getPrizeSecond())
                .prizeThird(t.getPrizeThird())
                .minBetAmount(t.getMinBetAmount())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
