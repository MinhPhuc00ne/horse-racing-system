package com.horseracing.repositories;

import com.horseracing.entities.RaceRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RaceRegistrationRepository extends JpaRepository<RaceRegistration, Integer> {
    List<RaceRegistration> findByRaceId(Integer raceId);

    List<RaceRegistration> findByOwnerUserEmail(String email);

    boolean existsByRaceIdAndHorseIdAndStatusNotIn(Integer raceId, Integer horseId, java.util.Collection<String> statuses);

    boolean existsByRaceIdAndJockeyIdAndStatusNotIn(Integer raceId, Integer jockeyId, java.util.Collection<String> statuses);

    java.util.Optional<RaceRegistration> findFirstByRaceIdAndHorseId(Integer raceId,
            Integer horseId);

    List<RaceRegistration> findByJockeyUserEmailAndStatus(String email, String status);
}
