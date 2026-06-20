package com.horseracing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddFlagRequest {

    @NotNull(message = "Horse ID is required")
    private Integer horseId;

    private Integer simulationId;

    @NotBlank(message = "Violation type is required")
    private String violationType;

    private String description;
}
