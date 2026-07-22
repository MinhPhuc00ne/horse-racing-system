package com.horseracing.repositories;

import com.horseracing.entities.Horse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HorseRepository extends JpaRepository<Horse, Integer> {
    List<Horse> findByOwnerId(Integer ownerId);
    List<Horse> findByOwnerUserEmail(String email);

    List<Horse> findAllByOrderBySpeedRatingDesc(Pageable pageable);

    @Query("SELECT COUNT(h) FROM Horse h WHERE h.status IS NULL OR UPPER(h.status) <> UPPER(:status)")
    long countByStatusNotIgnoreCase(@Param("status") String status);
}
