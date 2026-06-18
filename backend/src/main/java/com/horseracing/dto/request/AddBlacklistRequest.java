package com.horseracing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddBlacklistRequest {

    @NotBlank(message = "Target type is required (USER or HORSE)")
    private String targetType;

    @NotNull(message = "Target ID is required")
    private Integer targetId;

    @NotBlank(message = "Reason is required")
    private String reason;

    @Builder.Default
    private Boolean isPermanent = false;

    private LocalDate endDate;
}
