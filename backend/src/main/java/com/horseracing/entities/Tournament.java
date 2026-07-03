package com.horseracing.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tournaments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tournament_name", nullable = false, length = 255)
    private String tournamentName;

    @Column(length = 255)
    private String location;

    @Column(length = 1000)
    private String description;

    @Column(name = "registration_deadline")
    private LocalDateTime registrationDeadline;

    @Column(name = "max_slots")
    private Integer maxSlots;


    @Column(name = "total_prize", precision = 18, scale = 2)
    private BigDecimal totalPrize;

    @Builder.Default
    @Column(name = "tournament_status", length = 50)
    private String tournamentStatus = "Upcoming";

    // New Fields requested by user:
    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referee_id")
    private User referee;

    @Column(name = "entry_fee", precision = 38, scale = 2)
    private BigDecimal entryFee;

    @Column(name = "min_slots")
    private Integer minSlots;

    @Column(name = "allowed_classes", length = 255)
    private String allowedClasses;

    @Column(name = "allowed_ages", length = 255)
    private String allowedAges;

    @Column(name = "allowed_genders", length = 255)
    private String allowedGenders;

    @Column(name = "registration_opening_time")
    private LocalDateTime registrationOpeningTime;

    @Column(name = "official_race_time")
    private LocalDateTime officialRaceTime;

    @Column(name = "surface_type", length = 50)
    private String surfaceType;

    @Column(name = "prize_first", precision = 38, scale = 2)
    private BigDecimal prizeFirst;

    @Column(name = "prize_second", precision = 38, scale = 2)
    private BigDecimal prizeSecond;

    @Column(name = "prize_third", precision = 38, scale = 2)
    private BigDecimal prizeThird;

    @Column(name = "min_bet_amount", precision = 38, scale = 2)
    private BigDecimal minBetAmount;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
