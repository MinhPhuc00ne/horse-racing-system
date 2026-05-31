package com.horseracing.repositories;

import com.horseracing.entities.RaceTrack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RaceTrackRepository extends JpaRepository<RaceTrack, Integer> {
    Optional<RaceTrack> findByName(String name);
    boolean existsByName(String name);
}
