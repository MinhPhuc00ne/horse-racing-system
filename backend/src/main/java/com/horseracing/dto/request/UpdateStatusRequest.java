package com.horseracing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateStatusRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(?i)(UPCOMING|ACTIVE|OPEN_FOR_REGISTER|CLOSED_FOR_REGISTER|LOCKED_LIST|RUNNING|FINISHED|CANCELLED)$", message = "Invalid status value")
    private String status;
}
