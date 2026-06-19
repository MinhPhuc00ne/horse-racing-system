package com.horseracing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTournamentRequest {

    @NotBlank(message = "Tournament name is required")
    private String tournamentName;

    private String location;
    private String description;

    @NotNull(message = "Registration deadline is required")
    private LocalDateTime registrationDeadline;

    private Integer maxSlots;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "First prize reward is required")
    @PositiveOrZero(message = "Prize money must be positive or zero")
    private BigDecimal prizeFirst;

    @NotNull(message = "Second prize reward is required")
    @PositiveOrZero(message = "Prize money must be positive or zero")
    private BigDecimal prizeSecond;

    @NotNull(message = "Third prize reward is required")
    @PositiveOrZero(message = "Prize money must be positive or zero")
    private BigDecimal prizeThird;

    @NotNull(message = "Minimum bet amount is required")
    @PositiveOrZero(message = "Minimum bet amount must be positive or zero")
    private BigDecimal minBetAmount;

    private String imageUrl;

    private Integer refereeId;

    @PositiveOrZero(message = "Entry fee must be positive or zero")
    private BigDecimal entryFee;

    private Integer minSlots;

    private String allowedClasses;

    private String allowedAges;

    private String allowedGenders;

    private LocalDateTime registrationOpeningTime;

    private LocalDateTime officialRaceTime;

    private String surfaceType;
}
