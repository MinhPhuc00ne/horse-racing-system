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

    @NotBlank(message = "Ghi chú xử lý không được để trống")
    @Size(max = 2000, message = "Ghi chú xử lý không được quá 2000 ký tự")
    private String adminNote;
}
