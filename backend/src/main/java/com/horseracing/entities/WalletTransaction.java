package com.horseracing.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @Column(name = "transaction_type", nullable = false, length = 50)
    private String transactionType; // DEPOSIT, WITHDRAW, BET, PRIZE

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(length = 20)
    private String status; // PENDING, SUCCESS, FAILED

    @Column(name = "reference_type", length = 50)
    private String referenceType; // PAYOS, SYSTEM

    @Column(name = "reference_id")
    private Integer referenceId;

    // Added to store PayOS Order Code explicitly as it's a BigInt
    @Column(name = "payos_order_code")
    private Long payosOrderCode;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
