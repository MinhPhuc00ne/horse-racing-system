package com.horseracing.repositories;

import com.horseracing.entities.RaceParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RaceParticipantRepository extends JpaRepository<RaceParticipant, Integer> {
    List<RaceParticipant> findByRaceId(Integer raceId);
    List<RaceParticipant> findByHorseId(Integer horseId);
    long countByRaceId(Integer raceId);

    List<RaceParticipant> findByJockeyUserEmailAndStatusNot(String email, String status);
    List<RaceParticipant> findByJockeyUserEmailAndStatus(String email, String status);
    java.util.Optional<RaceParticipant> findByRaceIdAndHorseId(Integer raceId, Integer horseId);
}
