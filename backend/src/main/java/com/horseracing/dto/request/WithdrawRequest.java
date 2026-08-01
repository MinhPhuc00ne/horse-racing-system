package com.horseracing.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "10000.00", message = "Minimum withdrawal amount is 10,000 VND")
    private BigDecimal amount;

    private String bankName;
    private String bankBin;
    private String bankAccountNumber;
    private String bankAccountHolderName;
}
