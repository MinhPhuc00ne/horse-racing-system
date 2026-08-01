package com.horseracing.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateJockeyProfileRequest {

    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Invalid Vietnamese phone number format")
    private String phone;

    private String avatarUrl;

    @DecimalMin(value = "140.0", message = "Height must be at least 140 cm")
    @DecimalMax(value = "210.0", message = "Height cannot exceed 210 cm")
    private Double height;

    @DecimalMin(value = "40.0", message = "Weight must be at least 40 kg")
    @DecimalMax(value = "90.0", message = "Weight cannot exceed 90 kg")
    private Double weight;

    @Min(value = 0, message = "Experience years cannot be negative")
    @Max(value = 60, message = "Experience years cannot exceed 60")
    private Integer experienceYear;

    @Size(max = 50, message = "License number cannot exceed 50 characters")
    private String licenseNumber;

    @Pattern(regexp = "^[0-9]{6,20}$", message = "Bank account number must contain 6 to 20 digits")
    private String bankAccount;
}
