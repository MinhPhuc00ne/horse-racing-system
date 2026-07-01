package com.horseracing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefereeChangeRequestDto {

    @NotNull(message = "Tournament ID is required")
    private Integer tournamentId;

    @NotBlank(message = "Reason is required")
    private String reason;
}
