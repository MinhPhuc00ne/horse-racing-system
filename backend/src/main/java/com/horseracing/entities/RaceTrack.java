package com.horseracing.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "race_tracks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RaceTrack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 255)
    private String location;

    @Column(name = "surface_condition", length = 100)
    private String surfaceCondition;
}
