package com.horseracing.repositories;

import com.horseracing.entities.RefereeFlag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RefereeFlagRepository extends JpaRepository<RefereeFlag, Integer> {
    List<RefereeFlag> findBySimulationId(Integer simulationId);
    List<RefereeFlag> findBySimulationIdAndHorseId(Integer simulationId, Integer horseId);
    long countBySimulationIdAndHorseId(Integer simulationId, Integer horseId);
}
