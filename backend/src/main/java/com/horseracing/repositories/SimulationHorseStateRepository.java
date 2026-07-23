package com.horseracing.repositories;

import com.horseracing.entities.SimulationHorseState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SimulationHorseStateRepository
        extends JpaRepository<SimulationHorseState, Integer> {
    List<SimulationHorseState> findBySimulationId(Integer simulationId);

    Optional<SimulationHorseState> findBySimulationIdAndHorseId(Integer simulationId,
            Integer horseId);
}
