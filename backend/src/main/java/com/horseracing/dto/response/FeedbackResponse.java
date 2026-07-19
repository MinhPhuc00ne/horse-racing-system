package com.horseracing.dto.response;

import com.horseracing.entities.Feedback;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackResponse {

    private Integer id;
    private Integer userId;
    private String userFullName;
    private String userEmail;
    private String userRole;
    private String subject;
    private String content;
    private String status;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FeedbackResponse fromEntity(Feedback feedback) {
        if (feedback == null) return null;
        return FeedbackResponse.builder()
                .id(feedback.getId())
                .userId(feedback.getUser() != null ? feedback.getUser().getId() : null)
                .userFullName(feedback.getUser() != null ? feedback.getUser().getFullName() : null)
                .userEmail(feedback.getUser() != null ? feedback.getUser().getEmail() : null)
                .userRole(feedback.getUser() != null && feedback.getUser().getRole() != null ? feedback.getUser().getRole().name() : null)
                .subject(feedback.getSubject())
                .content(feedback.getContent())
                .status(feedback.getStatus())
                .adminNote(feedback.getAdminNote())
                .createdAt(feedback.getCreatedAt())
                .updatedAt(feedback.getUpdatedAt())
                .build();
    }
}
