package com.horseracing.services;

import com.horseracing.dto.request.CreateBreedRequest;
import com.horseracing.dto.response.BreedResponse;
import com.horseracing.entities.HorseBreed;
import com.horseracing.repositories.HorseBreedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BreedService {

    private final HorseBreedRepository horseBreedRepository;

    @Transactional(readOnly = true)
    public List<BreedResponse> getAllBreeds() {
        return horseBreedRepository.findAll().stream()
                .map(BreedResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BreedResponse> getOfficialBreeds() {
        return horseBreedRepository.findByIsOfficial(true).stream()
                .map(BreedResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public BreedResponse createBreed(CreateBreedRequest request, boolean isOfficial) {
        if (request.getBreedName() == null || request.getBreedName().trim().isEmpty()) {
            throw new RuntimeException("Breed name is required");
        }
        
        String cleanName = request.getBreedName().trim();
        
        HorseBreed existing = horseBreedRepository.findByBreedName(cleanName).orElse(null);
        if (existing != null) {
            // If it already exists and admin is trying to make it official, update it
            if (isOfficial && !existing.getIsOfficial()) {
                existing.setIsOfficial(true);
                existing = horseBreedRepository.save(existing);
            }
            return BreedResponse.fromEntity(existing);
        }

        HorseBreed breed = HorseBreed.builder()
                .breedName(cleanName)
                .isOfficial(isOfficial)
                .build();
                
        breed = horseBreedRepository.save(breed);
        return BreedResponse.fromEntity(breed);
    }
    
    @Transactional
    public void deleteBreed(Integer id) {
        HorseBreed breed = horseBreedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Breed not found"));
        // Additional checks could be added here if the breed is currently assigned to horses
        horseBreedRepository.delete(breed);
    }
}
