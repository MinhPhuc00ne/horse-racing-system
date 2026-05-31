package com.horseracing.services;

import com.horseracing.dto.response.JockeyAgreementResponse;
import com.horseracing.entities.HorseOwnerProfile;
import com.horseracing.entities.JockeyAgreement;
import com.horseracing.entities.JockeyProfile;
import com.horseracing.repositories.HorseOwnerProfileRepository;
import com.horseracing.repositories.JockeyAgreementRepository;
import com.horseracing.repositories.JockeyProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JockeyAgreementService {

    private final JockeyAgreementRepository jockeyAgreementRepository;
    private final HorseOwnerProfileRepository horseOwnerProfileRepository;
    private final JockeyProfileRepository jockeyProfileRepository;

    @Transactional
    public JockeyAgreementResponse sendInvitation(String ownerEmail, Integer jockeyId, String message) {
        HorseOwnerProfile owner = horseOwnerProfileRepository.findByUserEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        JockeyProfile jockey = jockeyProfileRepository.findById(jockeyId)
                .orElseThrow(() -> new RuntimeException("Jockey profile not found"));

        // Check if agreement already exists
        jockeyAgreementRepository.findByOwnerIdAndJockeyId(owner.getId(), jockey.getId())
                .ifPresent(existing -> {
                    if ("Pending".equals(existing.getStatus()) || "Approved".equals(existing.getStatus())) {
                        throw new RuntimeException("An agreement is already pending or approved between you two");
                    }
                });

        JockeyAgreement agreement = JockeyAgreement.builder()
                .owner(owner)
                .jockey(jockey)
                .message(message)
                .status("Pending")
                .build();

        agreement = jockeyAgreementRepository.save(agreement);
        return JockeyAgreementResponse.fromEntity(agreement);
    }

    @Transactional(readOnly = true)
    public List<JockeyAgreementResponse> getMyReceivedInvitations(String jockeyEmail) {
        return jockeyAgreementRepository.findByJockeyUserEmail(jockeyEmail).stream()
                .map(JockeyAgreementResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JockeyAgreementResponse> getMySentInvitations(String ownerEmail) {
        return jockeyAgreementRepository.findByOwnerUserEmail(ownerEmail).stream()
                .map(JockeyAgreementResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public JockeyAgreementResponse acceptInvitation(String jockeyEmail, Integer agreementId) {
        JockeyAgreement agreement = jockeyAgreementRepository.findById(agreementId)
                .orElseThrow(() -> new RuntimeException("Agreement not found"));

        if (!agreement.getJockey().getUser().getEmail().equals(jockeyEmail)) {
            throw new RuntimeException("You are not authorized to accept this invitation");
        }

        if (!"Pending".equals(agreement.getStatus())) {
            throw new RuntimeException("Invitation is not in Pending status");
        }

        agreement.setStatus("Approved");
        agreement.setRespondedAt(LocalDateTime.now());
        agreement = jockeyAgreementRepository.save(agreement);
        return JockeyAgreementResponse.fromEntity(agreement);
    }

    @Transactional
    public JockeyAgreementResponse rejectInvitation(String jockeyEmail, Integer agreementId) {
        JockeyAgreement agreement = jockeyAgreementRepository.findById(agreementId)
                .orElseThrow(() -> new RuntimeException("Agreement not found"));

        if (!agreement.getJockey().getUser().getEmail().equals(jockeyEmail)) {
            throw new RuntimeException("You are not authorized to reject this invitation");
        }

        if (!"Pending".equals(agreement.getStatus())) {
            throw new RuntimeException("Invitation is not in Pending status");
        }

        agreement.setStatus("Rejected");
        agreement.setRespondedAt(LocalDateTime.now());
        agreement = jockeyAgreementRepository.save(agreement);
        return JockeyAgreementResponse.fromEntity(agreement);
    }
}
