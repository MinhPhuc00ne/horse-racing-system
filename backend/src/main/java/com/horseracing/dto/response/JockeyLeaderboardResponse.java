package com.horseracing.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JockeyLeaderboardResponse {
    private Integer jockeyId;
    private String jockeyName;
    private Integer rankingScore;
    private Double winRate;
    private Integer experienceYear;
    private String avatarUrl; // if User has avatar
}
