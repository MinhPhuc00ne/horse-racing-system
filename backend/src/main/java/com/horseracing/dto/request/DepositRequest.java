package com.horseracing.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
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
public class DepositRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "10000.00", message = "Minimum deposit amount is 10,000 VND")
    @DecimalMax(value = "50000000.00", message = "Maximum deposit amount is 50,000,000 VND per transaction")
    private BigDecimal amount;

    private String returnUrl;
    private String cancelUrl;
}
