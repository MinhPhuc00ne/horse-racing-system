package com.horseracing.repositories;

import com.horseracing.entities.Bet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface BetRepository extends JpaRepository<Bet, Integer> {
    List<Bet> findByRaceId(Integer raceId);
    List<Bet> findByParticipantId(Integer participantId);
    List<Bet> findByUserId(Integer userId);
    List<Bet> findByRaceIdAndStatus(Integer raceId, String status);
    List<Bet> findByParticipantIdAndStatus(Integer participantId, String status);

    @Query("SELECT DISTINCT b.race.tournament.id FROM Bet b WHERE b.user.id = :userId")
    Set<Integer> findTournamentIdsByUserId(@Param("userId") Integer userId);
}

