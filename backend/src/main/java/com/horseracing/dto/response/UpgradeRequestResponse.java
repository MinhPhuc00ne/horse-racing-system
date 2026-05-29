package com.horseracing.dto.response;

import com.horseracing.entities.UpgradeRequest;
import com.horseracing.entities.enums.RequestStatus;
import com.horseracing.entities.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpgradeRequestResponse {
    private Integer id;
    private Integer userId;
    private String userEmail;
    private String userFullName;
    private Role requestedRole;
    private RequestStatus status;
    private String notes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Detailed User Info
    private String fullName;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String identityNumber;

    // Jockey fields
    private Double weight;
    private Double height;
    private String licenseNumber;

    // Horse Owner fields
    private String stableName;
    private String stableAddress;

    // Referee fields
    private String certificationNumber;
    private Integer experienceYears;

    // Documents
    private List<String> documentUrls;

    public static UpgradeRequestResponse fromEntity(UpgradeRequest request) {
        return UpgradeRequestResponse.builder()
                .id(request.getId())
                .userId(request.getUser().getId())
                .userEmail(request.getUser().getEmail())
                .userFullName(request.getUser().getFullName())
                .requestedRole(request.getRequestedRole())
                .status(request.getStatus())
                .notes(request.getNotes())
                .rejectionReason(request.getRejectionReason())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .fullName(request.getFullName())
                .dateOfBirth(request.getDateOfBirth())
                .phoneNumber(request.getPhoneNumber())
                .identityNumber(request.getIdentityNumber())
                .weight(request.getWeight())
                .height(request.getHeight())
                .licenseNumber(request.getLicenseNumber())
                .stableName(request.getStableName())
                .stableAddress(request.getStableAddress())
                .certificationNumber(request.getCertificationNumber())
                .experienceYears(request.getExperienceYears())
                .documentUrls(request.getDocumentUrls())
                .build();
    }
}

