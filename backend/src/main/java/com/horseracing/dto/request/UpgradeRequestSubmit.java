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
    @jakarta.validation.constraints.Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Invalid Vietnamese phone number format")
    private String phoneNumber;

    @jakarta.validation.constraints.Pattern(regexp = "^[0-9]{12}$", message = "Identity number must be exactly 12 digits")
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
