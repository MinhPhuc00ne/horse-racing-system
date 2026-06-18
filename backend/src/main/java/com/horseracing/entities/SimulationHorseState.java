package com.horseracing.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "simulation_horse_states")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationHorseState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "simulation_id", nullable = false)
    private RaceSimulation simulation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "horse_id", nullable = false)
    private Horse horse;

    @Builder.Default
    @Column(name = "current_position")
    private Double currentPosition = 0.0;

    @Builder.Default
    private Double speed = 0.0;

    @Builder.Default
    private Double acceleration = 0.0;

    @Builder.Default
    private Double stamina = 100.0;

    @Column(name = "rank_in_race")
    private Integer rankInRace;

    @Column(length = 50)
    private String status; // RACING, FINISHED, DISQUALIFIED

    @UpdateTimestamp
    @Column(name = "last_updated_at")
    private LocalDateTime lastUpdatedAt;
}
