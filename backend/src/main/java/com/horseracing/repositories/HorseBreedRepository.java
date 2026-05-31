package com.horseracing.repositories;

import com.horseracing.entities.HorseBreed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HorseBreedRepository extends JpaRepository<HorseBreed, Integer> {
    Optional<HorseBreed> findByBreedName(String breedName);
}
