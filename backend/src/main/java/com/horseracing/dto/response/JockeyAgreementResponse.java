package com.horseracing.dto.response;

import com.horseracing.entities.JockeyAgreement;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JockeyAgreementResponse {
    private Integer id;
    private Integer ownerId;
    private String ownerName;
    private Integer jockeyId;
    private String jockeyName;
    private String message;
    private String status;
    private LocalDateTime sentAt;
    private LocalDateTime respondedAt;

    public static JockeyAgreementResponse fromEntity(JockeyAgreement ja) {
        if (ja == null) return null;
        return JockeyAgreementResponse.builder()
                .id(ja.getId())
                .ownerId(ja.getOwner().getId())
                .ownerName(ja.getOwner().getUser().getFullName())
                .jockeyId(ja.getJockey().getId())
                .jockeyName(ja.getJockey().getUser().getFullName())
                .message(ja.getMessage())
                .status(ja.getStatus())
                .sentAt(ja.getSentAt())
                .respondedAt(ja.getRespondedAt())
                .build();
    }
}
