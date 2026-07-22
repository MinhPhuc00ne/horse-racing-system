package com.horseracing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HorseLeaderboardDto {
    private Integer rank;
    private String horseName;
    private String breedName;
    private Double rating;
}
