package com.horseracing.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.horseracing.dto.request.CreateTournamentRequest;
import com.horseracing.dto.request.UpdateTournamentRequest;
import com.horseracing.dto.response.TournamentResponse;
import com.horseracing.entities.Tournament;
import com.horseracing.entities.User;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.RaceRepository;
import com.horseracing.repositories.TournamentRepository;
import com.horseracing.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;
    private final RaceRepository raceRepository;

    @Transactional
    public TournamentResponse createTournament(CreateTournamentRequest request) {
        if (request.getPrizeFirst().compareTo(BigDecimal.ZERO) < 0 ||
            request.getPrizeSecond().compareTo(BigDecimal.ZERO) < 0 ||
            request.getPrizeThird().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Prize money must be positive or zero");
        }
        if (request.getMinBetAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Minimum bet amount must be positive or zero");
        }
        if (request.getMaxSlots() == null || request.getMaxSlots() <= 0) {
            throw new RuntimeException("Maximum slots must be a positive number");
        }
        if (request.getMinSlots() != null && request.getMinSlots() <= 0) {
            throw new RuntimeException("Minimum slots must be a positive number");
        }
        if (request.getMinSlots() != null && request.getMaxSlots() != null && request.getMinSlots() > request.getMaxSlots()) {
            throw new RuntimeException("Minimum slots cannot be greater than maximum slots");
        }
        if (request.getEntryFee() != null && request.getEntryFee().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Entry fee must be positive or zero");
        }
        if (request.getStartDate() != null && request.getEndDate() != null
                && request.getStartDate().isAfter(request.getEndDate())) {
            throw new RuntimeException("Start date must be before end date");
        }
        if (request.getStartDate() != null && request.getStartDate().isBefore(java.time.LocalDate.now())) {
            throw new RuntimeException("Start date cannot be in the past");
        }
        if (request.getEndDate() != null && request.getEndDate().isBefore(java.time.LocalDate.now())) {
            throw new RuntimeException("End date cannot be in the past");
        }
        if (request.getRegistrationDeadline() != null && request.getStartDate() != null
                && request.getRegistrationDeadline().toLocalDate().isAfter(request.getStartDate())) {
            throw new RuntimeException("Registration deadline must be before start date");
        }
        if (request.getRegistrationOpeningTime() != null && request.getRegistrationDeadline() != null
                && request.getRegistrationOpeningTime().isAfter(request.getRegistrationDeadline())) {
            throw new RuntimeException("Registration opening time must be before registration deadline");
        }
        if (request.getRegistrationDeadline() != null && request.getOfficialRaceTime() != null
                && request.getRegistrationDeadline().isAfter(request.getOfficialRaceTime())) {
            throw new RuntimeException("Registration deadline must be before official race time");
        }
        if (request.getOfficialRaceTime() != null && request.getStartDate() != null
                && request.getOfficialRaceTime().toLocalDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("Official race time cannot be before tournament start date");
        }

        User referee = null;
        if (request.getRefereeId() != null) {
            referee = userRepository.findById(request.getRefereeId()).orElse(null);
        }
        if (referee == null || referee.getRole() != Role.RACE_REFEREE) {
            referee = userRepository.findByRole(Role.RACE_REFEREE).stream().findFirst().orElse(null);
        }

        BigDecimal totalPrize = request.getPrizeFirst()
                .add(request.getPrizeSecond())
                .add(request.getPrizeThird());

        Tournament tournament = Tournament.builder()
                .tournamentName(request.getTournamentName())
                .location(request.getLocation())
                .description(request.getDescription())
                .registrationDeadline(request.getRegistrationDeadline())
                .maxSlots(request.getMaxSlots())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalPrize(totalPrize)
                .tournamentStatus("Upcoming")
                .prizeFirst(request.getPrizeFirst())
                .prizeSecond(request.getPrizeSecond())
                .prizeThird(request.getPrizeThird())
                .minBetAmount(request.getMinBetAmount())
                .imageUrl(request.getImageUrl())
                .referee(referee)
                .entryFee(request.getEntryFee())
                .minSlots(request.getMinSlots())
                .allowedClasses(request.getAllowedClasses())
                .allowedAges(request.getAllowedAges())
                .allowedGenders(request.getAllowedGenders())
                .registrationOpeningTime(request.getRegistrationOpeningTime())
                .officialRaceTime(request.getOfficialRaceTime())
                .build();

        tournament = tournamentRepository.save(tournament);
        return TournamentResponse.fromEntity(tournament);
    }

    @Transactional(readOnly = true)
    public List<TournamentResponse> getAllTournaments() {
        return tournamentRepository.findAll().stream()
                .map(TournamentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TournamentResponse getTournamentById(Integer id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
        return TournamentResponse.fromEntity(tournament);
    }

    @Transactional
    public TournamentResponse updateTournament(Integer id, UpdateTournamentRequest request) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        if (!"Upcoming".equalsIgnoreCase(tournament.getTournamentStatus())) {
            throw new RuntimeException("Cannot update a tournament unless it is in Upcoming status");
        }

        // Validate values
        if (request.getPrizeFirst().compareTo(BigDecimal.ZERO) < 0 ||
            request.getPrizeSecond().compareTo(BigDecimal.ZERO) < 0 ||
            request.getPrizeThird().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Prize money must be positive or zero");
        }
        if (request.getMinBetAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Minimum bet amount must be positive or zero");
        }
        if (request.getMaxSlots() == null || request.getMaxSlots() <= 0) {
            throw new RuntimeException("Maximum slots must be a positive number");
        }
        if (request.getMinSlots() != null && request.getMinSlots() <= 0) {
            throw new RuntimeException("Minimum slots must be a positive number");
        }
        if (request.getMinSlots() != null && request.getMaxSlots() != null && request.getMinSlots() > request.getMaxSlots()) {
            throw new RuntimeException("Minimum slots cannot be greater than maximum slots");
        }
        if (request.getEntryFee() != null && request.getEntryFee().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Entry fee must be positive or zero");
        }
        if (request.getStartDate() != null && request.getEndDate() != null
                && request.getStartDate().isAfter(request.getEndDate())) {
            throw new RuntimeException("Start date must be before end date");
        }
        // Only enforce start date not in the past if it is being changed
        if (request.getStartDate() != null && !request.getStartDate().equals(tournament.getStartDate())
                && request.getStartDate().isBefore(java.time.LocalDate.now())) {
            throw new RuntimeException("Start date cannot be in the past");
        }
        // Only enforce end date not in the past if it is being changed
        if (request.getEndDate() != null && !request.getEndDate().equals(tournament.getEndDate())
                && request.getEndDate().isBefore(java.time.LocalDate.now())) {
            throw new RuntimeException("End date cannot be in the past");
        }
        if (request.getRegistrationDeadline() != null && request.getStartDate() != null
                && request.getRegistrationDeadline().toLocalDate().isAfter(request.getStartDate())) {
            throw new RuntimeException("Registration deadline must be before start date");
        }
        if (request.getRegistrationOpeningTime() != null && request.getRegistrationDeadline() != null
                && request.getRegistrationOpeningTime().isAfter(request.getRegistrationDeadline())) {
            throw new RuntimeException("Registration opening time must be before registration deadline");
        }
        if (request.getRegistrationDeadline() != null && request.getOfficialRaceTime() != null
                && request.getRegistrationDeadline().isAfter(request.getOfficialRaceTime())) {
            throw new RuntimeException("Registration deadline must be before official race time");
        }
        if (request.getOfficialRaceTime() != null && request.getStartDate() != null
                && request.getOfficialRaceTime().toLocalDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("Official race time cannot be before tournament start date");
        }

        User referee = null;
        if (request.getRefereeId() != null) {
            referee = userRepository.findById(request.getRefereeId()).orElse(null);
        }
        if (referee == null || referee.getRole() != Role.RACE_REFEREE) {
            referee = userRepository.findByRole(Role.RACE_REFEREE).stream().findFirst().orElse(null);
        }

        BigDecimal totalPrize = request.getPrizeFirst()
                .add(request.getPrizeSecond())
                .add(request.getPrizeThird());

        tournament.setTournamentName(request.getTournamentName());
        tournament.setLocation(request.getLocation());
        tournament.setDescription(request.getDescription());
        tournament.setRegistrationDeadline(request.getRegistrationDeadline());
        tournament.setMaxSlots(request.getMaxSlots());
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        tournament.setTotalPrize(totalPrize);
        tournament.setPrizeFirst(request.getPrizeFirst());
        tournament.setPrizeSecond(request.getPrizeSecond());
        tournament.setPrizeThird(request.getPrizeThird());
        tournament.setMinBetAmount(request.getMinBetAmount());
        tournament.setImageUrl(request.getImageUrl());
        tournament.setReferee(referee);
        tournament.setEntryFee(request.getEntryFee());
        tournament.setMinSlots(request.getMinSlots());
        tournament.setAllowedClasses(request.getAllowedClasses());
        tournament.setAllowedAges(request.getAllowedAges());
        tournament.setAllowedGenders(request.getAllowedGenders());
        tournament.setRegistrationOpeningTime(request.getRegistrationOpeningTime());
        tournament.setOfficialRaceTime(request.getOfficialRaceTime());

        tournament = tournamentRepository.save(tournament);
        return TournamentResponse.fromEntity(tournament);
    }

    @Transactional
    public TournamentResponse updateTournamentStatus(Integer id, String status) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        // Validate status value
        if (!"Upcoming".equalsIgnoreCase(status) &&
            !"Active".equalsIgnoreCase(status) &&
            !"Finished".equalsIgnoreCase(status) &&
            !"Cancelled".equalsIgnoreCase(status)) {
            throw new RuntimeException("Invalid tournament status. Must be Upcoming, Active, Finished, or Cancelled");
        }

        tournament.setTournamentStatus(status);
        tournament = tournamentRepository.save(tournament);
        return TournamentResponse.fromEntity(tournament);
    }

    @Transactional
    public void deleteTournament(Integer id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        if (!raceRepository.findByTournamentId(id).isEmpty()) {
            throw new RuntimeException("Cannot delete a tournament that already has races. Please cancel it instead");
        }

        tournamentRepository.delete(tournament);
    }
}
