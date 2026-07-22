package com.horseracing.repositories;

import com.horseracing.entities.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface TournamentRepository extends JpaRepository<Tournament, Integer> {
    List<Tournament> findByRefereeId(Integer refereeId);

    long countByTournamentStatusIgnoreCase(String status);

    @Query("SELECT COUNT(t) FROM Tournament t WHERE UPPER(t.tournamentStatus) IN ('ACTIVE', 'UPCOMING', 'ONGOING')")
    long countActiveOrUpcomingTournaments();

    @Query("SELECT COALESCE(SUM(t.totalPrize), 0) FROM Tournament t")
    BigDecimal sumTotalPrize();
}

