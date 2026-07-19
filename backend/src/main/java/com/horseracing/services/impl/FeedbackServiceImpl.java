package com.horseracing.services.impl;

import com.horseracing.dto.request.CreateFeedbackRequest;
import com.horseracing.dto.request.ResolveFeedbackRequest;
import com.horseracing.dto.response.FeedbackResponse;
import com.horseracing.entities.Feedback;
import com.horseracing.entities.User;
import com.horseracing.repositories.FeedbackRepository;
import com.horseracing.repositories.UserRepository;
import com.horseracing.services.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import com.horseracing.entities.enums.NotificationType;
import com.horseracing.services.NotificationService;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private User findUserByIdentifier(String identifier) {
        return userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByUsername(identifier))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + identifier));
    }

    @Override
    @Transactional
    public FeedbackResponse createFeedback(String identifier, CreateFeedbackRequest request) {
        User user = findUserByIdentifier(identifier);

        Feedback feedback = Feedback.builder()
                .user(user)
                .subject(request.getSubject().trim())
                .content(request.getContent().trim())
                .status("PENDING")
                .build();

        Feedback saved = feedbackRepository.save(feedback);
        return FeedbackResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getAllFeedbacks(String status, String role, String search) {
        List<Feedback> list = feedbackRepository.findAllByOrderByCreatedAtDesc();

        return list.stream()
                .filter(fb -> {
                    if (status != null && !status.isBlank()) {
                        if (!fb.getStatus().equalsIgnoreCase(status.trim())) {
                            return false;
                        }
                    }
                    if (role != null && !role.isBlank()) {
                        if (fb.getUser() == null || fb.getUser().getRole() == null ||
                                !fb.getUser().getRole().name().equalsIgnoreCase(role.trim())) {
                            return false;
                        }
                    }
                    if (search != null && !search.isBlank()) {
                        String term = search.toLowerCase().trim();
                        boolean matchName = fb.getUser() != null && fb.getUser().getFullName() != null && fb.getUser().getFullName().toLowerCase().contains(term);
                        boolean matchEmail = fb.getUser() != null && fb.getUser().getEmail() != null && fb.getUser().getEmail().toLowerCase().contains(term);
                        boolean matchSubject = fb.getSubject() != null && fb.getSubject().toLowerCase().contains(term);
                        boolean matchContent = fb.getContent() != null && fb.getContent().toLowerCase().contains(term);
                        boolean matchId = String.valueOf(fb.getId()).contains(term);
                        if (!matchName && !matchEmail && !matchSubject && !matchContent && !matchId) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(FeedbackResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getUserFeedbacks(String identifier) {
        User user = findUserByIdentifier(identifier);

        return feedbackRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(FeedbackResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FeedbackResponse resolveFeedback(Integer feedbackId, ResolveFeedbackRequest request) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ý kiến đóng góp với ID: " + feedbackId));

        feedback.setStatus("RESOLVED");
        feedback.setAdminNote(request.getAdminNote().trim());

        Feedback updated = feedbackRepository.save(feedback);

        // Send notification to feedback submitter
        try {
            if (updated.getUser() != null) {
                notificationService.sendNotification(
                        updated.getUser(),
                        "Phản hồi ý kiến đóng góp #" + feedbackId,
                        "Ý kiến đóng góp của bạn (\"" + updated.getSubject() + "\") đã được Ban quản trị xử lý: " + updated.getAdminNote(),
                        NotificationType.GENERAL
                );
            }
        } catch (Exception e) {
            // Log & don't break main resolution flow
        }

        return FeedbackResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public FeedbackResponse rejectFeedback(Integer feedbackId, ResolveFeedbackRequest request) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ý kiến đóng góp với ID: " + feedbackId));

        feedback.setStatus("REJECTED");
        feedback.setAdminNote(request.getAdminNote().trim());

        Feedback updated = feedbackRepository.save(feedback);

        // Send notification to feedback submitter
        try {
            if (updated.getUser() != null) {
                notificationService.sendNotification(
                        updated.getUser(),
                        "Phản hồi ý kiến đóng góp #" + feedbackId,
                        "Ý kiến đóng góp của bạn (\"" + updated.getSubject() + "\") bị từ chối/không xử lý. Lý do: " + updated.getAdminNote(),
                        NotificationType.GENERAL
                );
            }
        } catch (Exception e) {
            // Log & don't break main rejection flow
        }

        return FeedbackResponse.fromEntity(updated);
    }
}
