package com.horseracing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnbanRequest {

    @NotBlank(message = "Unban reason is required")
    @Size(min = 3, max = 255, message = "Reason must be between 3 and 255 characters")
    private String reason;
}
