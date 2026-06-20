package com.horseracing.repositories;

import com.horseracing.entities.HorseBreed;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import java.util.List;

public interface HorseBreedRepository extends JpaRepository<HorseBreed, Integer> {
    Optional<HorseBreed> findByBreedName(String breedName);
    List<HorseBreed> findByIsOfficial(Boolean isOfficial);
}
