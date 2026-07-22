package com.horseracing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JockeyLeaderboardDto {
    private Integer rank;
    private String fullName;
    private Double winRate;
    private Integer rankingScore;
}
