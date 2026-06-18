package com.horseracing.repositories;

import com.horseracing.entities.BanHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BanHistoryRepository extends JpaRepository<BanHistory, Integer> {
    List<BanHistory> findByBlacklistId(Integer blacklistId);
}
