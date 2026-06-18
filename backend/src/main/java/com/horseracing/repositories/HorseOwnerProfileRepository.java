package com.horseracing.repositories;

import com.horseracing.entities.HorseOwnerProfile;
import com.horseracing.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HorseOwnerProfileRepository extends JpaRepository<HorseOwnerProfile, Integer> {
    Optional<HorseOwnerProfile> findByUser(User user);
    Optional<HorseOwnerProfile> findByUserEmail(String email);
}
