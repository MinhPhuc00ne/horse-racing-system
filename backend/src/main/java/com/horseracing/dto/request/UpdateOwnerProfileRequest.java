package com.horseracing.dto.request;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOwnerProfileRequest {
    private String fullName;
    private String phone;
    private String avatarUrl;
    private String stableName;
    private String stableAddress;
    private String description;
    private String bankAccount;
    private String identityNumber;
    private LocalDate dateOfBirth;
}
