package com.horseracing.repositories;

import com.horseracing.entities.JockeyAgreement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JockeyAgreementRepository extends JpaRepository<JockeyAgreement, Integer> {
    Optional<JockeyAgreement> findByOwnerIdAndJockeyId(Integer ownerId, Integer jockeyId);
    List<JockeyAgreement> findByOwnerUserEmail(String email);
    List<JockeyAgreement> findByJockeyUserEmail(String email);
}
