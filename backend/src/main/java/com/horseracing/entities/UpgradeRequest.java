package com.horseracing.entities;

import com.horseracing.entities.enums.Role;
import com.horseracing.entities.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "upgrade_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpgradeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "requested_role", nullable = false, length = 20)
    private Role requestedRole;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    @Column(name = "rejection_reason", columnDefinition = "NVARCHAR(MAX)")
    private String rejectionReason;

    // Detailed User Info
    @Column(name = "full_name")
    private String fullName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "identity_number")
    private String identityNumber;

    // Jockey fields
    @Column(name = "weight")
    private Double weight;

    @Column(name = "height")
    private Double height;

    @Column(name = "license_number")
    private String licenseNumber;

    // Horse Owner fields
    @Column(name = "stable_name")
    private String stableName;

    @Column(name = "stable_address")
    private String stableAddress;

    // Referee & common experience fields
    @Column(name = "certification_number")
    private String certificationNumber;

    @Column(name = "experience_years")
    private Integer experienceYears;

    // Document URLs uploaded by the user
    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "upgrade_request_documents",
            joinColumns = @JoinColumn(name = "upgrade_request_id"))
    @Column(name = "document_url", columnDefinition = "NVARCHAR(1000)")
    private List<String> documentUrls = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
