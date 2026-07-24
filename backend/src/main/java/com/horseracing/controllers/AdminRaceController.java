package com.horseracing.controllers;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.horseracing.dto.request.AssignRefereeRequest;
import com.horseracing.dto.request.CreateRaceRequest;
import com.horseracing.dto.request.CreateTournamentRequest;
import com.horseracing.dto.request.UpdateTournamentRequest;
import com.horseracing.dto.request.TrackRequest;
import com.horseracing.dto.response.MessageResponse;
import com.horseracing.dto.response.RaceRegistrationResponse;
import com.horseracing.dto.response.RaceResponse;
import com.horseracing.dto.response.TournamentResponse;
import com.horseracing.dto.response.TrackResponse;
import com.horseracing.dto.response.UserResponse;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.RaceTrackRepository;
import com.horseracing.repositories.UserRepository;
import com.horseracing.services.RaceRegistrationService;
import com.horseracing.services.RaceService;
import com.horseracing.services.TournamentService;
import com.horseracing.services.RefereeService;
import com.horseracing.services.TrackService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class AdminRaceController {

    private final RaceTrackRepository raceTrackRepository;
    private final TournamentService tournamentService;
    private final RaceService raceService;
    private final RaceRegistrationService raceRegistrationService;
    private final UserRepository userRepository;
    private final RefereeService refereeService;
    private final TrackService trackService;

    @GetMapping("/referees")
    public ResponseEntity<List<UserResponse>> getAllReferees() {
        List<UserResponse> referees = userRepository.findByRole(Role.RACE_REFEREE).stream()
                .map(UserResponse::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(referees);
    }

    @GetMapping("/tracks")
    public ResponseEntity<List<TrackResponse>> getAllTracks(
            @org.springframework.web.bind.annotation.RequestParam(
                    required = false) String location) {
        List<TrackResponse> tracks = raceTrackRepository.findAll().stream()
                .filter(track -> location == null || location.isBlank()
                        || (track.getLocation() != null
                                && track.getLocation().equalsIgnoreCase(location)))
                .map(TrackResponse::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(tracks);
    }

    @PostMapping("/tracks")
    public ResponseEntity<TrackResponse> createTrack(@Valid @RequestBody TrackRequest request) {
        TrackResponse response = trackService.createTrack(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/tracks/{id}")
    public ResponseEntity<TrackResponse> updateTrack(@PathVariable Integer id,
            @Valid @RequestBody TrackRequest request) {
        TrackResponse response = trackService.updateTrack(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/tracks/{id}")
    public ResponseEntity<MessageResponse> deleteTrack(@PathVariable Integer id) {
        trackService.deleteTrack(id);
        return ResponseEntity.ok().body(new MessageResponse("Track deleted successfully"));
    }

    @PostMapping("/tournaments")
    public ResponseEntity<TournamentResponse> createTournament(
            @Valid @RequestBody CreateTournamentRequest request) {
        TournamentResponse response = tournamentService.createTournament(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/races")
    public ResponseEntity<RaceResponse> createRace(@Valid @RequestBody CreateRaceRequest request) {
        RaceResponse response = raceService.createRace(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/race-registrations")
    public ResponseEntity<List<RaceRegistrationResponse>> getAllRegistrations() {
        return ResponseEntity.ok(raceRegistrationService.getAllRegistrations());
    }

    @PutMapping("/race-registrations/{id}/approve")
    public ResponseEntity<RaceRegistrationResponse> approveRegistration(@PathVariable Integer id) {
        RaceRegistrationResponse response = raceRegistrationService.approveRegistration(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/race-registrations/{id}/reject")
    public ResponseEntity<RaceRegistrationResponse> rejectRegistration(@PathVariable Integer id) {
        RaceRegistrationResponse response = raceRegistrationService.rejectRegistration(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/tournaments/{id}")
    public ResponseEntity<TournamentResponse> updateTournament(@PathVariable Integer id,
            @Valid @RequestBody UpdateTournamentRequest request) {
        TournamentResponse response = tournamentService.updateTournament(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/tournaments/{id}/assign-referee")
    public ResponseEntity<TournamentResponse> assignReferee(@PathVariable Integer id,
            @Valid @RequestBody AssignRefereeRequest request) {
        TournamentResponse response = tournamentService.assignReferee(id, request.getRefereeId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/tournaments/{id}/status")
    public ResponseEntity<TournamentResponse> updateTournamentStatus(@PathVariable Integer id,
            @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        if (status == null) {
            throw new RuntimeException("Status field is required");
        }
        TournamentResponse response = tournamentService.updateTournamentStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/tournaments/{id}")
    public ResponseEntity<MessageResponse> deleteTournament(@PathVariable Integer id) {
        tournamentService.deleteTournament(id);
        return ResponseEntity.ok().body(new MessageResponse("Tournament deleted successfully"));
    }

    @PostMapping("/tournaments/{tournamentId}/confirm-registration")
    public ResponseEntity<MessageResponse> confirmRegistration(@PathVariable Integer tournamentId) {
        raceRegistrationService.confirmRegistration(tournamentId);
        return ResponseEntity.ok().body(new MessageResponse(
                "Registrations confirmed successfully. Waiting list cleared and refunded."));
    }

    @PutMapping("/races/{id}/status")
    public ResponseEntity<MessageResponse> updateRaceStatus(@PathVariable Integer id,
            @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        if (status == null) {
            throw new RuntimeException("Status field is required");
        }
        if ("FINISHED".equalsIgnoreCase(status)) {
            refereeService.confirmResults(id);
            return ResponseEntity.ok().body(new MessageResponse(
                    "Race results confirmed, prize distribution and bet payouts completed successfully."));
        } else if ("CANCELLED".equalsIgnoreCase(status)) {
            refereeService.cancelRace(id);
            return ResponseEntity.ok().body(new MessageResponse(
                    "Race cancelled successfully. Bets and registration entry fees have been refunded."));
        } else {
            throw new RuntimeException("Invalid status. Must be FINISHED or CANCELLED");
        }
    }

    @GetMapping("/races/{id}/prize-distributions")
    public ResponseEntity<?> getPrizeDistributions(@PathVariable Integer id) {
        return ResponseEntity.ok(refereeService.getPrizeDistributions(id));
    }
}
