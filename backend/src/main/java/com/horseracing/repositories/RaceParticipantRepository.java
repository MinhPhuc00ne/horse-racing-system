package com.horseracing.repositories;

import com.horseracing.entities.RaceParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RaceParticipantRepository extends JpaRepository<RaceParticipant, Integer> {
    List<RaceParticipant> findByRaceId(Integer raceId);
    List<RaceParticipant> findByHorseId(Integer horseId);
    long countByRaceId(Integer raceId);
}
