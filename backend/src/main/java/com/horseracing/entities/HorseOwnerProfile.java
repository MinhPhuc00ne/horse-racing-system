package com.horseracing.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "horse_owner_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HorseOwnerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "stable_name", length = 100)
    private String stableName;

    @Column(name = "bank_account", length = 100)
    private String bankAccount;

    @Builder.Default
    @Column(name = "approval_status", length = 20)
    private String approvalStatus = "PENDING";
}
