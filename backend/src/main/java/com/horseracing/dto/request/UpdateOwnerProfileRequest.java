package com.horseracing.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOwnerProfileRequest {

    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Invalid Vietnamese phone number format")
    private String phone;

    private String avatarUrl;

    @Size(max = 100, message = "Stable name cannot exceed 100 characters")
    private String stableName;

    @Size(max = 255, message = "Stable address cannot exceed 255 characters")
    private String stableAddress;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @Pattern(regexp = "^[0-9]{6,20}$", message = "Bank account number must contain 6 to 20 digits")
    private String bankAccount;

    @Pattern(regexp = "^[0-9]{12}$", message = "Identity number must be exactly 12 digits")
    private String identityNumber;

    private LocalDate dateOfBirth;
}
