package com.horseracing.repositories;

import com.horseracing.entities.RefereeChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RefereeChangeRequestRepository extends JpaRepository<RefereeChangeRequest, Integer> {
    List<RefereeChangeRequest> findByRefereeId(Integer refereeId);
    List<RefereeChangeRequest> findByTournamentId(Integer tournamentId);
}
