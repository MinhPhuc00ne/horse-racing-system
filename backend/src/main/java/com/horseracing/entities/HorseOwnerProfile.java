package com.horseracing.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

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

    @Column(name = "stable_address", length = 255)
    private String stableAddress;

    @Column(name = "description", length = 500)
    private String description;

    @Builder.Default
    @Column(name = "reputation_stars")
    private Double reputationStars = 5.0;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "identity_number", length = 50)
    private String identityNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "bank_account", length = 100)
    private String bankAccount;

    @Builder.Default
    @Column(name = "approval_status", length = 20)
    private String approvalStatus = "PENDING";
}
