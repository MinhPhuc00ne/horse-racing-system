package com.horseracing.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JockeyHistoryResponse {
    private Integer participantId;
    private Integer raceId;
    private String raceName;
    private LocalDate raceDate;
    private Integer horseId;
    private String horseName;
    private Integer finalRank;
    private Integer finishTime; // in seconds or milliseconds as per DB
    private BigDecimal prizeMoney;
}
