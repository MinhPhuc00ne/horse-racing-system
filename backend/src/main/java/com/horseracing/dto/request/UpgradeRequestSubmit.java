package com.horseracing.dto.request;

import com.horseracing.entities.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class UpgradeRequestSubmit {
    @NotNull(message = "Requested role is required")
    private Role requestedRole;
    
    private String notes;

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
}

