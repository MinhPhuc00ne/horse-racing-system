package com.horseracing.repositories;

import com.horseracing.entities.Blacklist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BlacklistRepository extends JpaRepository<Blacklist, Integer> {
    List<Blacklist> findByTargetTypeAndTargetId(String targetType, Integer targetId);
    Optional<Blacklist> findByTargetTypeAndTargetIdAndStatus(String targetType, Integer targetId, String status);
}
