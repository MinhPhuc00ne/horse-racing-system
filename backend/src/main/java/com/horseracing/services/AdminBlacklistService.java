package com.horseracing.services;

import com.horseracing.dto.request.AddBlacklistRequest;
import com.horseracing.dto.request.UnbanRequest;
import com.horseracing.dto.response.BlacklistResponse;
import com.horseracing.entities.BanHistory;
import com.horseracing.entities.Blacklist;
import com.horseracing.entities.Horse;
import com.horseracing.entities.User;
import com.horseracing.entities.enums.NotificationType;
import com.horseracing.repositories.BanHistoryRepository;
import com.horseracing.repositories.BlacklistRepository;
import com.horseracing.repositories.HorseRepository;
import com.horseracing.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminBlacklistService {

    private final BlacklistRepository blacklistRepository;
    private final BanHistoryRepository banHistoryRepository;
    private final UserRepository userRepository;
    private final HorseRepository horseRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<BlacklistResponse> getAllBlacklists(String statusFilter, String targetTypeFilter) {
        List<Blacklist> blacklists = blacklistRepository.findAll();
        List<BlacklistResponse> responses = new ArrayList<>();

        for (Blacklist bl : blacklists) {
            // Apply status filter if provided
            if (statusFilter != null && !statusFilter.isBlank() && !"ALL".equalsIgnoreCase(statusFilter)) {
                if (!statusFilter.equalsIgnoreCase(bl.getStatus())) {
                    continue;
                }
            }
            // Apply targetType filter if provided
            if (targetTypeFilter != null && !targetTypeFilter.isBlank() && !"ALL".equalsIgnoreCase(targetTypeFilter)) {
                if (!targetTypeFilter.equalsIgnoreCase(bl.getTargetType())) {
                    continue;
                }
            }

            String targetName = "N/A";
            String targetDetail = "N/A";

            if ("USER".equalsIgnoreCase(bl.getTargetType())) {
                Optional<User> userOpt = userRepository.findById(bl.getTargetId());
                if (userOpt.isPresent()) {
                    User u = userOpt.get();
                    targetName = u.getFullName();
                    targetDetail = u.getEmail() != null ? u.getEmail() : "No email";
                }
            } else if ("HORSE".equalsIgnoreCase(bl.getTargetType())) {
                Optional<Horse> horseOpt = horseRepository.findById(bl.getTargetId());
                if (horseOpt.isPresent()) {
                    Horse h = horseOpt.get();
                    targetName = h.getName();
                    if (h.getOwner() != null && h.getOwner().getUser() != null) {
                        targetDetail = "Owner: " + h.getOwner().getUser().getFullName();
                    } else {
                        targetDetail = "Horse ID: " + h.getId();
                    }
                }
            }

            // Get ban history actionBy details
            List<BanHistory> histories = banHistoryRepository.findByBlacklistId(bl.getId());
            String actionByEmail = "N/A";
            String actionByName = "N/A";

            if (!histories.isEmpty()) {
                BanHistory latestHistory = histories.get(histories.size() - 1);
                if (latestHistory.getActionBy() != null) {
                    actionByEmail = latestHistory.getActionBy().getEmail();
                    actionByName = latestHistory.getActionBy().getFullName();
                }
            }

            responses.add(BlacklistResponse.builder()
                    .id(bl.getId())
                    .targetType(bl.getTargetType())
                    .targetId(bl.getTargetId())
                    .targetName(targetName)
                    .targetDetail(targetDetail)
                    .reason(bl.getReason())
                    .startDate(bl.getStartDate())
                    .endDate(bl.getEndDate())
                    .isPermanent(bl.getIsPermanent())
                    .status(bl.getStatus())
                    .createdAt(bl.getCreatedAt())
                    .actionByEmail(actionByEmail)
                    .actionByName(actionByName)
                    .build());
        }

        // Sort by ID descending (newest first)
        responses.sort((b1, b2) -> b2.getId().compareTo(b1.getId()));
        return responses;
    }

    @Transactional
    public BlacklistResponse addBlacklist(AddBlacklistRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        Blacklist blacklist = Blacklist.builder()
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .reason(request.getReason())
                .startDate(LocalDate.now())
                .endDate(request.getEndDate())
                .isPermanent(request.getIsPermanent())
                .status("ACTIVE")
                .build();
        blacklist = blacklistRepository.save(blacklist);

        BanHistory history = BanHistory.builder()
                .blacklist(blacklist)
                .actionBy(admin)
                .actionNote(request.getReason())
                .build();
        banHistoryRepository.save(history);

        String targetName = "N/A";
        String targetDetail = "N/A";

        if ("USER".equalsIgnoreCase(request.getTargetType())) {
            User target = userRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new RuntimeException("Target user not found"));
            target.setEnabled(false);
            userRepository.save(target);

            targetName = target.getFullName();
            targetDetail = target.getEmail();

            notificationService.sendNotification(
                    target,
                    "Tài khoản bị tạm khóa / Đưa vào Blacklist",
                    "Tài khoản của bạn đã bị đưa vào Blacklist bởi Admin. Lý do: " + request.getReason() + ". Thời hạn cấm: " + (Boolean.TRUE.equals(request.getIsPermanent()) ? "Vĩnh viễn" : request.getEndDate()) + ".",
                    NotificationType.SYSTEM_ALERT
            );
        } else if ("HORSE".equalsIgnoreCase(request.getTargetType())) {
            Horse target = horseRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new RuntimeException("Target horse not found"));
            target.setStatus("INACTIVE");
            horseRepository.save(target);

            targetName = target.getName();
            if (target.getOwner() != null && target.getOwner().getUser() != null) {
                targetDetail = "Owner: " + target.getOwner().getUser().getFullName();
                notificationService.sendNotification(
                        target.getOwner().getUser(),
                        "Chiến mã bị đưa vào Blacklist",
                        "Ngựa " + target.getName() + " của bạn đã bị đưa vào Blacklist bởi Admin. Lý do: " + request.getReason() + ".",
                        NotificationType.SYSTEM_ALERT
                );
            }
        }

        return BlacklistResponse.builder()
                .id(blacklist.getId())
                .targetType(blacklist.getTargetType())
                .targetId(blacklist.getTargetId())
                .targetName(targetName)
                .targetDetail(targetDetail)
                .reason(blacklist.getReason())
                .startDate(blacklist.getStartDate())
                .endDate(blacklist.getEndDate())
                .isPermanent(blacklist.getIsPermanent())
                .status(blacklist.getStatus())
                .createdAt(blacklist.getCreatedAt())
                .actionByEmail(admin.getEmail())
                .actionByName(admin.getFullName())
                .build();
    }

    @Transactional
    public BlacklistResponse unbanBlacklist(Integer id, String adminEmail, UnbanRequest unbanRequest) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        Blacklist blacklist = blacklistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blacklist record not found with ID: " + id));

        blacklist.setStatus("INACTIVE"); // Change status to INACTIVE (gỡ cấm)
        blacklist = blacklistRepository.save(blacklist);

        String note = (unbanRequest != null && unbanRequest.getReason() != null && !unbanRequest.getReason().isBlank())
                ? "Gỡ cấm: " + unbanRequest.getReason()
                : "Gỡ cấm bởi Admin";

        BanHistory history = BanHistory.builder()
                .blacklist(blacklist)
                .actionBy(admin)
                .actionNote(note)
                .build();
        banHistoryRepository.save(history);

        String targetName = "N/A";
        String targetDetail = "N/A";

        if ("USER".equalsIgnoreCase(blacklist.getTargetType())) {
            Optional<User> userOpt = userRepository.findById(blacklist.getTargetId());
            if (userOpt.isPresent()) {
                User target = userOpt.get();
                target.setEnabled(true);
                userRepository.save(target);

                targetName = target.getFullName();
                targetDetail = target.getEmail();

                notificationService.sendNotification(
                        target,
                        "Mở khóa tài khoản / Gỡ khỏi Blacklist",
                        "Tài khoản của bạn đã được mở khóa và gỡ khỏi Blacklist bởi Admin. " + note,
                        NotificationType.SYSTEM_ALERT
                );
            }
        } else if ("HORSE".equalsIgnoreCase(blacklist.getTargetType())) {
            Optional<Horse> horseOpt = horseRepository.findById(blacklist.getTargetId());
            if (horseOpt.isPresent()) {
                Horse target = horseOpt.get();
                target.setStatus("ACTIVE");
                horseRepository.save(target);

                targetName = target.getName();
                if (target.getOwner() != null && target.getOwner().getUser() != null) {
                    targetDetail = "Owner: " + target.getOwner().getUser().getFullName();
                    notificationService.sendNotification(
                            target.getOwner().getUser(),
                            "Chiến mã được gỡ khỏi Blacklist",
                            "Ngựa " + target.getName() + " của bạn đã được Admin gỡ khỏi Blacklist. " + note,
                            NotificationType.SYSTEM_ALERT
                    );
                }
            }
        }

        return BlacklistResponse.builder()
                .id(blacklist.getId())
                .targetType(blacklist.getTargetType())
                .targetId(blacklist.getTargetId())
                .targetName(targetName)
                .targetDetail(targetDetail)
                .reason(blacklist.getReason())
                .startDate(blacklist.getStartDate())
                .endDate(blacklist.getEndDate())
                .isPermanent(blacklist.getIsPermanent())
                .status(blacklist.getStatus())
                .createdAt(blacklist.getCreatedAt())
                .actionByEmail(admin.getEmail())
                .actionByName(admin.getFullName())
                .build();
    }
}
