package com.horseracing.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "horses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Horse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private HorseOwnerProfile owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "breed_id", nullable = false)
    private HorseBreed breed;

    @Column(nullable = false, length = 100)
    private String name;

    private Integer age;

    @Column(length = 20)
    private String gender;

    @Column(name = "training_status", length = 50)
    private String trainingStatus;

    @Column(name = "health_status", length = 50)
    private String healthStatus;

    @Column(length = 20)
    private String status; // E.g., ACTIVE, INACTIVE, INJURED

    @Column(name = "speed_rating")
    private Double speedRating;

    @Column(name = "stamina_rating")
    private Integer staminaRating;

    @Column(name = "gate_performance_rating")
    private Integer gatePerformanceRating;

    @Column(length = 50)
    private String color;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;
}
