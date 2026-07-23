package com.horseracing.repositories;

import com.horseracing.entities.RaceTrack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RaceTrackRepository extends JpaRepository<RaceTrack, Integer> {
    Optional<RaceTrack> findByName(String name);

    boolean existsByName(String name);
}
