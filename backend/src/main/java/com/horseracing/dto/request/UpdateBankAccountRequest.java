package com.horseracing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateBankAccountRequest {

    @NotBlank(message = "Bank name is required")
    private String bankName;

    private String bankBin;

    @NotBlank(message = "Bank account number is required")
    @Pattern(regexp = "^[0-9]{6,20}$", message = "Bank account number must contain 6 to 20 digits")
    private String bankAccountNumber;

    private String bankAccountHolderName;
}
