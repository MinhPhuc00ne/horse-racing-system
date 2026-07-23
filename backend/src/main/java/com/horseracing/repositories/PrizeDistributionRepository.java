package com.horseracing.repositories;

import com.horseracing.entities.PrizeDistribution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrizeDistributionRepository extends JpaRepository<PrizeDistribution, Integer> {
    List<PrizeDistribution> findByParticipantId(Integer participantId);

    List<PrizeDistribution> findByParticipantRaceId(Integer raceId);
}
