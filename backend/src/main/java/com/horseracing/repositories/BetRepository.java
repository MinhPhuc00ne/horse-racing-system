package com.horseracing.repositories;

import com.horseracing.entities.Bet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BetRepository extends JpaRepository<Bet, Integer> {
    List<Bet> findByRaceId(Integer raceId);
    List<Bet> findByParticipantId(Integer participantId);
    List<Bet> findByUserId(Integer userId);
    List<Bet> findByRaceIdAndStatus(Integer raceId, String status);
    List<Bet> findByParticipantIdAndStatus(Integer participantId, String status);
}
