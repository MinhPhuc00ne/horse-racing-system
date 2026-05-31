package com.horseracing.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "jockey_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JockeyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private Double height;
    private Double weight;

    @Builder.Default
    @Column(name = "win_rate")
    private Double winRate = 0.0;

    @Builder.Default
    @Column(name = "experience_year")
    private Integer experienceYear = 0;

    @Builder.Default
    @Column(name = "ranking_score")
    private Integer rankingScore = 0;

    @Column(name = "license_number", length = 100)
    private String licenseNumber;

    @Column(name = "bank_account", length = 100)
    private String bankAccount;

    @Builder.Default
    @Column(name = "approval_status", length = 20)
    private String approvalStatus = "Pending";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
