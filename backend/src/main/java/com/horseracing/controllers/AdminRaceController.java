package com.horseracing.controllers;

import com.horseracing.dto.request.CreateRaceRequest;
import com.horseracing.dto.request.CreateTournamentRequest;
import com.horseracing.dto.response.*;
import com.horseracing.repositories.RaceTrackRepository;
import com.horseracing.services.RaceRegistrationService;
import com.horseracing.services.RaceService;
import com.horseracing.services.TournamentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminRaceController {

    private final RaceTrackRepository raceTrackRepository;
    private final TournamentService tournamentService;
    private final RaceService raceService;
    private final RaceRegistrationService raceRegistrationService;

    @GetMapping("/tracks")
    public ResponseEntity<List<TrackResponse>> getAllTracks() {
        List<TrackResponse> tracks = raceTrackRepository.findAll().stream()
                .map(TrackResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tracks);
    }

    @PostMapping("/tournaments")
    public ResponseEntity<?> createTournament(@Valid @RequestBody CreateTournamentRequest request) {
        try {
            TournamentResponse response = tournamentService.createTournament(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @PostMapping("/races")
    public ResponseEntity<?> createRace(@Valid @RequestBody CreateRaceRequest request) {
        try {
            RaceResponse response = raceService.createRace(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @GetMapping("/race-registrations")
    public ResponseEntity<List<RaceRegistrationResponse>> getAllRegistrations() {
        return ResponseEntity.ok(raceRegistrationService.getAllRegistrations());
    }

    @PutMapping("/race-registrations/{id}/approve")
    public ResponseEntity<?> approveRegistration(@PathVariable Integer id) {
        try {
            RaceRegistrationResponse response = raceRegistrationService.approveRegistration(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @PutMapping("/race-registrations/{id}/reject")
    public ResponseEntity<?> rejectRegistration(@PathVariable Integer id) {
        try {
            RaceRegistrationResponse response = raceRegistrationService.rejectRegistration(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }
}
