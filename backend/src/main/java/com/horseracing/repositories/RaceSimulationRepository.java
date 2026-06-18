package com.horseracing.repositories;

import com.horseracing.entities.RaceSimulation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RaceSimulationRepository extends JpaRepository<RaceSimulation, Integer> {
    List<RaceSimulation> findByRaceId(Integer raceId);
    Optional<RaceSimulation> findFirstByRaceIdAndStatus(Integer raceId, String status);
}
