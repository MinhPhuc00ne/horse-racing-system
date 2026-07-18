package com.horseracing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawalResponse {
    private Integer id;
    private Integer walletId;
    private String userFullName;
    private String userEmail;
    private BigDecimal amount;
    private String status;
    private LocalDateTime createdAt;
    private String bankAccount; // Deprecated but kept for backward compatibility
    private String bankName;
    private String bankBin;
    private String bankAccountNumber;
    private String bankAccountHolderName;
}
