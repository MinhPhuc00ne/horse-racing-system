package com.horseracing.repositories;

import com.horseracing.entities.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TournamentRepository extends JpaRepository<Tournament, Integer> {
    List<Tournament> findByRefereeId(Integer refereeId);
}

