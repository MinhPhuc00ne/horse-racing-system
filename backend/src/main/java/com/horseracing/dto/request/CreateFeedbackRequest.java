package com.horseracing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateFeedbackRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 255, message = "Tiêu đề không được quá 255 ký tự")
    private String subject;

    @NotBlank(message = "Nội dung đóng góp không được để trống")
    @Size(max = 2000, message = "Nội dung không được quá 2000 ký tự")
    private String content;
}
