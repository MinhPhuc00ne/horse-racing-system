package com.horseracing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResolveFeedbackRequest {

    @NotBlank(message = "Admin note cannot be blank")
    @Size(max = 2000, message = "Admin note cannot exceed 2000 characters")
    private String adminNote;
}
