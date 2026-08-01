package com.horseracing.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
    @Min(value = 3, message = "Max horses must be at least 3")
    @Max(value = 12, message = "Max horses cannot exceed 12")
    private Integer maxHorses;

    @NotNull(message = "Distance is required")
    @Positive(message = "Distance must be positive")
    private Double distance;

    private String surfaceType;
    private String weather;

    private Integer refereeId;
}
