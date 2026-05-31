package com.horseracing.repositories;

import com.horseracing.entities.Race;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RaceRepository extends JpaRepository<Race, Integer> {
    List<Race> findByRaceTrackIdAndRaceDate(Integer raceTrackId, LocalDate raceDate);
    List<Race> findByTournamentId(Integer tournamentId);
}
