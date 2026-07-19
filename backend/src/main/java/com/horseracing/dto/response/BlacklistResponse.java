package com.horseracing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlacklistResponse {
    private Integer id;
    private String targetType; // USER, HORSE
    private Integer targetId;
    private String targetName; // Full name of user OR Horse name
    private String targetDetail; // Email of user OR Owner name/email of horse
    private String reason;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isPermanent;
    private String status; // ACTIVE, INACTIVE, EXPIRED
    private LocalDateTime createdAt;
    private String actionByEmail;
    private String actionByName;
}
