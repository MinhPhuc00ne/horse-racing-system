package com.horseracing.repositories;

import com.horseracing.entities.RefereeChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefereeChangeRequestRepository extends JpaRepository<RefereeChangeRequest, Integer> {
    List<RefereeChangeRequest> findByRefereeId(Integer refereeId);
    List<RefereeChangeRequest> findByTournamentId(Integer tournamentId);
}
