package com.horseracing.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignRefereeRequest {
    @NotNull(message = "Referee ID is required")
    private Integer refereeId;
}
