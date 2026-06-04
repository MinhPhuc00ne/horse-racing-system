package com.horseracing.dto.response;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HorseRaceHistoryResponse {
    private Integer id;
    private String date;
    private String tournament;
    private String raceRound;
    private String horseName;
    private String jockeyName;
    private Integer placement;
    private Double prizeMoney;
    private String revenueShare;
}
