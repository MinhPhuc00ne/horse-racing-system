package com.horseracing.repositories;

import com.horseracing.entities.JockeyProfile;
import com.horseracing.entities.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JockeyProfileRepository extends JpaRepository<JockeyProfile, Integer> {
    Optional<JockeyProfile> findByUser(User user);

    Optional<JockeyProfile> findByUserEmail(String email);

    Optional<JockeyProfile> findByUserId(Integer userId);

    List<JockeyProfile> findAllByOrderByRankingScoreDescWinRateDesc();

    List<JockeyProfile> findAllByOrderByRankingScoreDescWinRateDesc(Pageable pageable);
}
