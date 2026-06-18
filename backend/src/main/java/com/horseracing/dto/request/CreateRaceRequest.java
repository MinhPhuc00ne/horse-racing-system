package com.horseracing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRaceRequest {

    @NotBlank(message = "Race name is required")
    private String raceName;

    @NotNull(message = "Tournament ID is required")
    private Integer tournamentId;

    @NotNull(message = "Race track ID is required")
    private Integer raceTrackId;

    @NotNull(message = "Race date is required")
    private LocalDate raceDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotNull(message = "Race round is required")
    @Positive(message = "Race round must be positive")
    private Integer raceRound;

    @NotNull(message = "Max horses is required")
    private Integer maxHorses; // Validated in service to be 7, 8, 12

    @NotNull(message = "Distance is required")
    @Positive(message = "Distance must be positive")
    private Double distance;

    private String surfaceType;
    private String weather;

    private Integer refereeId;
}
