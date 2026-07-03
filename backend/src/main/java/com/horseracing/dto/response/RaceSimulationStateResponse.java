package com.horseracing.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RaceSimulationStateResponse {
    private Integer simulationId;
    private Integer raceId;
    private String status; // RUNNING, FINISHED
    private Integer currentTick;
    private Double distance;
    private List<HorseStateDto> horseStates;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HorseStateDto {
        private Integer horseId;
        private String horseName;
        private String jockeyName;
        private Double currentPosition;
        private Double speed;
        private Double stamina;
        private String status; // RACING, FINISHED, DISQUALIFIED
    }
}
