package com.horseracing.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.horseracing.dto.request.CreateTournamentRequest;
import com.horseracing.dto.request.UpdateTournamentRequest;
import com.horseracing.dto.response.TournamentResponse;
import com.horseracing.entities.Tournament;
import com.horseracing.entities.User;
import com.horseracing.entities.enums.Role;
import com.horseracing.entities.Race;
import com.horseracing.entities.RaceTrack;
import com.horseracing.repositories.RaceParticipantRepository;
import com.horseracing.repositories.RaceRegistrationRepository;
import com.horseracing.repositories.RaceRepository;
import com.horseracing.repositories.RaceTrackRepository;
import com.horseracing.repositories.TournamentRepository;
import com.horseracing.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;
    private final RaceRepository raceRepository;
    private final RaceTrackRepository raceTrackRepository;
    private final RaceRegistrationRepository raceRegistrationRepository;
    private final RaceParticipantRepository raceParticipantRepository;

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
        if (request.getMaxSlots() == null || request.getMaxSlots() < 2 || request.getMaxSlots() > 12) {
            throw new RuntimeException("Maximum slots must be between 2 and 12");
        }
        if (request.getMinSlots() != null && (request.getMinSlots() < 2 || request.getMinSlots() > 12)) {
            throw new RuntimeException("Minimum slots must be between 2 and 12");
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

        if (request.getRegistrationDeadline() != null && request.getRegistrationDeadline().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Registration deadline cannot be in the past");
        }

        if (request.getRefereeId() == null) {
            throw new RuntimeException("Referee ID is required");
        }
        User referee = userRepository.findById(request.getRefereeId())
                .orElseThrow(() -> new RuntimeException("Referee not found"));
        if (referee.getRole() != Role.RACE_REFEREE) {
            throw new RuntimeException("User must have RACE_REFEREE role");
        }

        if (request.getLocation() == null || request.getLocation().isBlank()) {
            throw new RuntimeException("Location (venue name or region) is required");
        }
        RaceTrack track = raceTrackRepository.findByName(request.getLocation()).orElse(null);
        if (track == null) {
            track = raceTrackRepository.findAll().stream()
                    .filter(t -> request.getLocation().equalsIgnoreCase(t.getLocation()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Race track not found: " + request.getLocation()));
        }

        java.time.LocalDate raceDate = request.getStartDate() != null ? request.getStartDate() : java.time.LocalDate.now();
        java.time.LocalTime startTime = request.getOfficialRaceTime() != null ? request.getOfficialRaceTime().toLocalTime() : java.time.LocalTime.of(9, 0);
        java.time.LocalTime endTime = startTime.plusHours(1);

        // Check for timing overlaps on the same track on the same date
        List<Race> existingRaces = raceRepository.findByRaceTrackIdAndRaceDate(track.getId(), raceDate);
        for (Race existing : existingRaces) {
            if (startTime.isBefore(existing.getEndTime()) && endTime.isAfter(existing.getStartTime())) {
                throw new RuntimeException("Race timing overlaps with another race on the same track");
            }
        }

        BigDecimal totalPrize = request.getPrizeFirst()
                .add(request.getPrizeSecond())
                .add(request.getPrizeThird());

        Tournament tournament = Tournament.builder()
                .tournamentName(request.getTournamentName())
                .location(track.getName())
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

        Race race = Race.builder()
                .raceName(tournament.getTournamentName())
                .tournament(tournament)
                .raceTrack(track)
                .raceDate(raceDate)
                .startTime(startTime)
                .endTime(endTime)
                .raceRound(1)
                .maxHorses(Optional.ofNullable(tournament.getMaxSlots()).orElse(8))
                .distance(1200.0)
                .surfaceType(request.getSurfaceType() != null ? request.getSurfaceType() : "Grass")
                .weather("Sunny")
                .status("OPEN_FOR_REGISTER")
                .referee(referee)
                .build();
        raceRepository.save(race);

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
        if (request.getMaxSlots() == null || request.getMaxSlots() < 2 || request.getMaxSlots() > 12) {
            throw new RuntimeException("Maximum slots must be between 2 and 12");
        }
        if (request.getMinSlots() != null && (request.getMinSlots() < 2 || request.getMinSlots() > 12)) {
            throw new RuntimeException("Minimum slots must be between 2 and 12");
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

        if (request.getRegistrationDeadline() != null && !request.getRegistrationDeadline().equals(tournament.getRegistrationDeadline())
                && request.getRegistrationDeadline().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Registration deadline cannot be in the past");
        }

        if (request.getRefereeId() == null) {
            throw new RuntimeException("Referee ID is required");
        }
        User referee = userRepository.findById(request.getRefereeId())
                .orElseThrow(() -> new RuntimeException("Referee not found"));
        if (referee.getRole() != Role.RACE_REFEREE) {
            throw new RuntimeException("User must have RACE_REFEREE role");
        }

        if (request.getLocation() == null || request.getLocation().isBlank()) {
            throw new RuntimeException("Location (venue name or region) is required");
        }
        RaceTrack track = raceTrackRepository.findByName(request.getLocation()).orElse(null);
        if (track == null) {
            track = raceTrackRepository.findAll().stream()
                    .filter(t -> request.getLocation().equalsIgnoreCase(t.getLocation()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Race track not found: " + request.getLocation()));
        }

        java.time.LocalDate raceDate = request.getStartDate() != null ? request.getStartDate() : java.time.LocalDate.now();
        java.time.LocalTime startTime = request.getOfficialRaceTime() != null ? request.getOfficialRaceTime().toLocalTime() : java.time.LocalTime.of(9, 0);
        java.time.LocalTime endTime = startTime.plusHours(1);

        // Check for timing overlaps on the same track on the same date
        List<Race> existingRaces = raceRepository.findByRaceTrackIdAndRaceDate(track.getId(), raceDate);
        for (Race existing : existingRaces) {
            if (!existing.getTournament().getId().equals(tournament.getId())) {
                if (startTime.isBefore(existing.getEndTime()) && endTime.isAfter(existing.getStartTime())) {
                    throw new RuntimeException("Race timing overlaps with another race on the same track");
                }
            }
        }

        BigDecimal totalPrize = request.getPrizeFirst()
                .add(request.getPrizeSecond())
                .add(request.getPrizeThird());

        tournament.setTournamentName(request.getTournamentName());
        tournament.setLocation(track.getName());
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

        // Auto-update associated default race
        List<Race> races = raceRepository.findByTournamentId(tournament.getId());
        if (!races.isEmpty()) {
            Race race = races.get(0);
            race.setRaceName(tournament.getTournamentName());
            race.setRaceDate(raceDate);
            race.setStartTime(startTime);
            race.setEndTime(endTime);
            race.setMaxHorses(Optional.ofNullable(tournament.getMaxSlots()).orElse(8));
            race.setReferee(referee);
            race.setRaceTrack(track);
            race.setSurfaceType(request.getSurfaceType() != null ? request.getSurfaceType() : "Grass");
            raceRepository.save(race);
        }

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

        List<Race> races = raceRepository.findByTournamentId(id);
        for (Race race : races) {
            boolean hasRegistrations = !raceRegistrationRepository.findByRaceId(race.getId()).isEmpty();
            boolean hasParticipants = raceParticipantRepository.countByRaceId(race.getId()) > 0;
            if (hasRegistrations || hasParticipants) {
                throw new RuntimeException("Cannot delete tournament because it already has registered participants. Please cancel it instead.");
            }
        }

        // Safe to delete, delete default races first
        for (Race race : races) {
            raceRepository.delete(race);
        }

        tournamentRepository.delete(tournament);
    }
}
