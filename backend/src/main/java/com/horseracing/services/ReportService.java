package com.horseracing.services;

import com.horseracing.dto.request.ReportRequest;
import com.horseracing.dto.response.ReportResponse;
import com.horseracing.entities.Report;
import com.horseracing.entities.User;
import com.horseracing.repositories.ReportRepository;
import com.horseracing.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReportResponse createReport(String reporterEmail, ReportRequest request) {
        User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new RuntimeException("Reporter not found"));

        User reportedUser = userRepository.findById(request.getReportedUserId())
                .orElseThrow(() -> new RuntimeException("Reported user not found"));

        if (reporter.getId().equals(reportedUser.getId())) {
            throw new RuntimeException("You cannot report yourself");
        }

        Report report = Report.builder().reporter(reporter).reportedUser(reportedUser)
                .reason(request.getReason()).description(request.getDescription()).status("PENDING")
                .build();

        report = reportRepository.save(report);
        return ReportResponse.fromEntity(report);
    }
}
