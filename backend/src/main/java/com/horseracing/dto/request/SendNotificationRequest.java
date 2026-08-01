package com.horseracing.dto.request;

import com.horseracing.entities.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendNotificationRequest {

    @NotNull(message = "Recipient ID is required")
    private Integer recipientId;

    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 150, message = "Title must be between 2 and 150 characters")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(min = 2, max = 1000, message = "Content must be between 2 and 1000 characters")
    private String content;

    @NotNull(message = "Notification type is required")
    private NotificationType type;
}
