package com.horseracing.services;

import com.horseracing.dto.request.CreateHorseRequest;
import com.horseracing.dto.response.HorseResponse;
import com.horseracing.entities.Horse;
import com.horseracing.entities.HorseBreed;
import com.horseracing.entities.HorseOwnerProfile;
import com.horseracing.repositories.HorseBreedRepository;
import com.horseracing.repositories.HorseOwnerProfileRepository;
import com.horseracing.repositories.HorseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HorseService {

    private final HorseRepository horseRepository;
    private final HorseBreedRepository horseBreedRepository;
    private final HorseOwnerProfileRepository horseOwnerProfileRepository;

    @Transactional
    public HorseResponse createHorse(String ownerEmail, CreateHorseRequest request) {
        HorseOwnerProfile ownerProfile = horseOwnerProfileRepository.findByUserEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        HorseBreed breed = horseBreedRepository.findById(request.getBreedId())
                .orElseThrow(() -> new RuntimeException("Horse breed not found"));

        Horse horse = Horse.builder()
                .owner(ownerProfile)
                .breed(breed)
                .name(request.getName())
                .age(request.getAge())
                .gender(request.getGender())
                .color(request.getColor())
                .trainingStatus("ACTIVE")
                .healthStatus("EXCELLENT")
                .speedRating(75.0)
                .status("ACTIVE")
                .build();

        horse = horseRepository.save(horse);
        return HorseResponse.fromEntity(horse);
    }

    @Transactional(readOnly = true)
    public List<HorseResponse> getMyHorses(String ownerEmail) {
        return horseRepository.findByOwnerUserEmail(ownerEmail).stream()
                .map(HorseResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
