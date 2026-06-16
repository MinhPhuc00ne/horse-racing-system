package com.horseracing.repositories;

import com.horseracing.entities.RaceRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RaceRegistrationRepository extends JpaRepository<RaceRegistration, Integer> {
    List<RaceRegistration> findByRaceId(Integer raceId);
    List<RaceRegistration> findByOwnerUserEmail(String email);
    
    boolean existsByRaceIdAndHorseIdAndStatusNot(Integer raceId, Integer horseId, String status);
    boolean existsByRaceIdAndJockeyIdAndStatusNot(Integer raceId, Integer jockeyId, String status);
    java.util.Optional<RaceRegistration> findFirstByRaceIdAndHorseId(Integer raceId, Integer horseId);

    List<RaceRegistration> findByJockeyUserEmailAndStatus(String email, String status);
}
