package com.horseracing.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "horse_breeds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HorseBreed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "breed_name", nullable = false, unique = true, length = 100)
    private String breedName;

    @Builder.Default
    @Column(name = "is_official", columnDefinition = "bit default 0 not null")
    private Boolean isOfficial = false;
}
