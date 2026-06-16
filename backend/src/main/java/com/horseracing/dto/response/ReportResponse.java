package com.horseracing.dto.response;

import com.horseracing.entities.Report;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponse {
    private Integer id;
    private Integer reporterId;
    private String reporterName;
    private Integer reportedUserId;
    private String reportedUserName;
    private String reason;
    private String description;
    private String status;
    private LocalDateTime createdAt;

    public static ReportResponse fromEntity(Report report) {
        if (report == null) return null;
        return ReportResponse.builder()
                .id(report.getId())
                .reporterId(report.getReporter().getId())
                .reporterName(report.getReporter().getFullName())
                .reportedUserId(report.getReportedUser().getId())
                .reportedUserName(report.getReportedUser().getFullName())
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
