package com.horseracing.repositories;

import com.horseracing.entities.Horse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HorseRepository extends JpaRepository<Horse, Integer> {
    List<Horse> findByOwnerId(Integer ownerId);
    List<Horse> findByOwnerUserEmail(String email);
}
