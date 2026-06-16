package com.horseracing.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {
    private Integer reportedUserId;
    private String reason;
    private String description;
}
