package com.horseracing.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRaceRequest {

    @NotNull(message = "Tournament ID is required")
    private Integer tournamentId;

    @NotNull(message = "Horse ID is required")
    private Integer horseId;

    @NotNull(message = "Jockey ID is required")
    private Integer jockeyId;

    @NotNull(message = "Owner share percentage is required")
    @PositiveOrZero(message = "Share percentage must be positive or zero")
    private Double ownerSharePercent;

    @NotNull(message = "Jockey share percentage is required")
    @PositiveOrZero(message = "Share percentage must be positive or zero")
    private Double jockeySharePercent;
}
