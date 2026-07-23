package com.horseracing.services;

import com.horseracing.dto.request.CreateHorseRequest;
import com.horseracing.dto.request.UpdateOwnerProfileRequest;
import com.horseracing.dto.response.HorseResponse;
import com.horseracing.dto.response.OwnerProfileResponse;
import com.horseracing.entities.*;
import com.horseracing.repositories.*;
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
    private final UserRepository userRepository;
    private final UpgradeRequestRepository upgradeRequestRepository;
    private final RaceParticipantRepository raceParticipantRepository;

    @Transactional
    public HorseResponse createHorse(String ownerEmail, CreateHorseRequest request) {
        HorseOwnerProfile ownerProfile = horseOwnerProfileRepository.findByUserEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        HorseBreed breed =
                horseBreedRepository.findByBreedName(request.getBreedName()).orElseGet(() -> {
                    HorseBreed newBreed =
                            HorseBreed.builder().breedName(request.getBreedName()).build();
                    return horseBreedRepository.save(newBreed);
                });

        Horse horse = Horse.builder().owner(ownerProfile).breed(breed).name(request.getName())
                .age(request.getAge()).gender(request.getGender()).trainingStatus("READY")
                .healthStatus("EXCELLENT").status("READY").imageUrl(request.getImageUrl()).build();

        horse = horseRepository.save(horse);
        return toHorseResponse(horse);
    }

    @Transactional(readOnly = true)
    public List<HorseResponse> getMyHorses(String ownerEmail) {
        return horseRepository.findByOwnerUserEmail(ownerEmail).stream().map(this::toHorseResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public HorseResponse updateHorse(String ownerEmail, Integer horseId,
            com.horseracing.dto.request.UpdateHorseRequest request) {
        HorseOwnerProfile ownerProfile = horseOwnerProfileRepository.findByUserEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        Horse horse = horseRepository.findById(horseId)
                .orElseThrow(() -> new RuntimeException("Horse not found"));

        if (!horse.getOwner().getId().equals(ownerProfile.getId())) {
            throw new RuntimeException("You do not have permission to update this horse");
        }

        if (request.getBreedName() != null) {
            HorseBreed breed =
                    horseBreedRepository.findByBreedName(request.getBreedName()).orElseGet(() -> {
                        HorseBreed newBreed =
                                HorseBreed.builder().breedName(request.getBreedName()).build();
                        return horseBreedRepository.save(newBreed);
                    });
            horse.setBreed(breed);
        }

        if (request.getName() != null)
            horse.setName(request.getName());
        if (request.getAge() != null)
            horse.setAge(request.getAge());
        if (request.getGender() != null)
            horse.setGender(request.getGender());
        if (request.getImageUrl() != null)
            horse.setImageUrl(request.getImageUrl());
        if (request.getStatus() != null)
            horse.setStatus(request.getStatus());

        horse = horseRepository.save(horse);
        return toHorseResponse(horse);
    }

    @Transactional
    public void deleteHorse(String ownerEmail, Integer horseId) {
        HorseOwnerProfile ownerProfile = horseOwnerProfileRepository.findByUserEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        Horse horse = horseRepository.findById(horseId)
                .orElseThrow(() -> new RuntimeException("Horse not found"));

        if (!horse.getOwner().getId().equals(ownerProfile.getId())) {
            throw new RuntimeException("You do not have permission to delete this horse");
        }

        horseRepository.delete(horse);
    }

    private HorseResponse toHorseResponse(Horse horse) {
        List<RaceParticipant> participations =
                raceParticipantRepository.findByHorseId(horse.getId());
        int totalRaces = 0;
        int top1Count = 0;
        int top2Count = 0;
        int top3Count = 0;

        for (RaceParticipant rp : participations) {
            if (rp.getFinalRank() != null) {
                totalRaces++;
                switch (rp.getFinalRank()) {
                    case 1 -> top1Count++;
                    case 2 -> top2Count++;
                    case 3 -> top3Count++;
                }
            }
        }

        double top1Rate = 0.0;
        double top2Rate = 0.0;
        double top3Rate = 0.0;
        boolean isNewbie = false;

        if (totalRaces > 0) {
            top1Rate = ((double) top1Count / totalRaces) * 100.0;
            top2Rate = ((double) top2Count / totalRaces) * 100.0;
            top3Rate = ((double) top3Count / totalRaces) * 100.0;
        } else if (horse.getSpeedRating() != null && horse.getSpeedRating() > 0) {
            double[] metrics = calculateSyntheticPerformanceMetrics(horse);
            totalRaces = (int) metrics[0];
            top1Rate = metrics[1];
            top2Rate = metrics[2];
            top3Rate = metrics[3];
        } else {
            isNewbie = true;
        }

        HorseResponse response = HorseResponse.fromEntity(horse);
        response.setTotalRaces(totalRaces);
        response.setTop1Rate(top1Rate);
        response.setTop2Rate(top2Rate);
        response.setTop3Rate(top3Rate);
        response.setIsNewbie(isNewbie);
        return response;
    }

    private double[] calculateSyntheticPerformanceMetrics(Horse horse) {
        double spd = horse.getSpeedRating();
        double stm = horse.getStaminaRating() != null ? horse.getStaminaRating() : 80.0;
        double gate =
                horse.getGatePerformanceRating() != null ? horse.getGatePerformanceRating() : 80.0;

        double score = (spd * 0.5) + (stm * 0.3) + (gate * 0.2);
        int totalRaces = Math.max(1, (int) Math.round(score / 10.0));
        double top1Rate = Math.min(95.0, Math.max(5.0, (double) Math.round((score - 55.0) * 1.6)));
        double top2Rate = Math.min(98.0, Math.max(12.0, (double) Math.round(top1Rate + 18.0)));
        double top3Rate = Math.min(100.0, Math.max(20.0, (double) Math.round(top2Rate + 12.0)));
        return new double[] {totalRaces, top1Rate, top2Rate, top3Rate};
    }

    @Transactional(readOnly = true)
    public OwnerProfileResponse getOwnerProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        HorseOwnerProfile owner = horseOwnerProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        List<String> documentUrls = upgradeRequestRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .filter(req -> req
                        .getStatus() == com.horseracing.entities.enums.RequestStatus.APPROVED
                        && req.getRequestedRole() == com.horseracing.entities.enums.Role.HORSE_OWNER)
                .findFirst().map(req -> req.getDocumentUrls())
                .orElse(java.util.Collections.emptyList());

        return OwnerProfileResponse.builder().id(owner.getId()).fullName(user.getFullName())
                .email(user.getEmail()).phone(user.getPhone()).avatarUrl(user.getAvatarUrl())
                .stableName(owner.getStableName()).stableAddress(owner.getStableAddress())
                .description(owner.getDescription()).reputationStars(owner.getReputationStars())
                .bankAccount(owner.getBankAccount()).identityNumber(owner.getIdentityNumber())
                .dateOfBirth(owner.getDateOfBirth()).documentUrls(documentUrls).build();
    }

    @Transactional
    public OwnerProfileResponse updateOwnerProfile(String email,
            UpdateOwnerProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        HorseOwnerProfile owner = horseOwnerProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        if (request.getFullName() != null)
            user.setFullName(request.getFullName());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
            owner.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null)
            user.setAvatarUrl(request.getAvatarUrl());

        if (request.getStableName() != null)
            owner.setStableName(request.getStableName());
        if (request.getStableAddress() != null)
            owner.setStableAddress(request.getStableAddress());
        if (request.getDescription() != null)
            owner.setDescription(request.getDescription());
        if (request.getBankAccount() != null)
            owner.setBankAccount(request.getBankAccount());
        if (request.getIdentityNumber() != null)
            owner.setIdentityNumber(request.getIdentityNumber());
        if (request.getDateOfBirth() != null)
            owner.setDateOfBirth(request.getDateOfBirth());

        userRepository.save(user);
        owner = horseOwnerProfileRepository.save(owner);

        List<String> documentUrls = upgradeRequestRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .filter(req -> req
                        .getStatus() == com.horseracing.entities.enums.RequestStatus.APPROVED
                        && req.getRequestedRole() == com.horseracing.entities.enums.Role.HORSE_OWNER)
                .findFirst().map(req -> req.getDocumentUrls())
                .orElse(java.util.Collections.emptyList());

        return OwnerProfileResponse.builder().id(owner.getId()).fullName(user.getFullName())
                .email(user.getEmail()).phone(user.getPhone()).avatarUrl(user.getAvatarUrl())
                .stableName(owner.getStableName()).stableAddress(owner.getStableAddress())
                .description(owner.getDescription()).reputationStars(owner.getReputationStars())
                .bankAccount(owner.getBankAccount()).identityNumber(owner.getIdentityNumber())
                .dateOfBirth(owner.getDateOfBirth()).documentUrls(documentUrls).build();
    }
}
