package com.horseracing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportRequest {

    @NotNull(message = "Reported user ID is required")
    private Integer reportedUserId;

    @NotBlank(message = "Reason is required")
    @Size(min = 3, max = 100, message = "Reason must be between 3 and 100 characters")
    private String reason;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
}
