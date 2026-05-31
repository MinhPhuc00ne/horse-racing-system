package com.horseracing.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "race_participants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RaceParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "race_id", nullable = false)
    private Race race;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "horse_id", nullable = false)
    private Horse horse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jockey_id", nullable = false)
    private JockeyProfile jockey;

    @Column(name = "gate_number")
    private Integer gateNumber;

    @Column(name = "final_rank")
    private Integer finalRank;

    @Column(name = "finish_time")
    private Integer finishTime;

    @Column(name = "average_speed")
    private Double averageSpeed;

    @Column(length = 50)
    private String status; // E.g., READY, RACING, FINISHED, DISQUALIFIED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
