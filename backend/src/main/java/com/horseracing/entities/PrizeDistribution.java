package com.horseracing.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "prize_distributions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrizeDistribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private RaceParticipant participant;

    @Column(name = "total_prize", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalPrize;

    @Column(name = "owner_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal ownerAmount;

    @Column(name = "jockey_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal jockeyAmount;

    @Builder.Default
    @Column(name = "platform_fee", nullable = false, precision = 18, scale = 2)
    private BigDecimal platformFee = BigDecimal.ZERO;

    @Builder.Default
    @Column(length = 20)
    private String status = "PENDING"; // PENDING, DISTRIBUTED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "distributed_at")
    private LocalDateTime distributedAt;
}
