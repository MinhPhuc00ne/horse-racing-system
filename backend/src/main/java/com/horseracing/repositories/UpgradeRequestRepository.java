package com.horseracing.repositories;

import com.horseracing.entities.UpgradeRequest;
import com.horseracing.entities.User;
import com.horseracing.entities.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UpgradeRequestRepository extends JpaRepository<UpgradeRequest, Integer> {
    List<UpgradeRequest> findByUserOrderByCreatedAtDesc(User user);

    List<UpgradeRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status);

    boolean existsByUserAndStatus(User user, RequestStatus status);
}
