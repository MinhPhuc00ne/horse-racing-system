package com.horseracing.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "races")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Race {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "race_name", nullable = false, length = 255)
    private String raceName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "race_track_id", nullable = false)
    private RaceTrack raceTrack;

    @Column(name = "race_date", nullable = false)
    private LocalDate raceDate;

    @Column(name = "race_time", nullable = false)
    private LocalTime startTime;

    // Added to check timing overlaps
    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "race_round", nullable = false)
    private Integer raceRound;

    @Column(name = "max_horses", nullable = false)
    private Integer maxHorses;

    @Column(nullable = false)
    private Double distance;

    @Column(name = "surface_type", length = 50)
    private String surfaceType;

    @Column(length = 50)
    private String weather;

    @Column(length = 50)
    private String status; // e.g. OPEN_FOR_REGISTER, CLOSED_FOR_REGISTER, RUNNING, FINISHED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referee_id")
    private User referee;
}
