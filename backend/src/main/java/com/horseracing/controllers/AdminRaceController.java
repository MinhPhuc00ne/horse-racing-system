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

import com.horseracing.dto.request.CreateRaceRequest;
import com.horseracing.dto.request.CreateTournamentRequest;
import com.horseracing.dto.request.UpdateTournamentRequest;
import com.horseracing.dto.response.ErrorResponse;
import com.horseracing.dto.response.MessageResponse;
import com.horseracing.dto.response.RaceRegistrationResponse;
import com.horseracing.dto.response.RaceResponse;
import com.horseracing.dto.response.TournamentResponse;
import com.horseracing.dto.response.TrackResponse;
import com.horseracing.dto.response.UserResponse;
import com.horseracing.entities.enums.Role;
import com.horseracing.entities.RaceTrack;
import com.horseracing.repositories.RaceTrackRepository;
import com.horseracing.repositories.UserRepository;
import com.horseracing.services.RaceRegistrationService;
import com.horseracing.services.RaceService;
import com.horseracing.services.TournamentService;
import com.horseracing.services.RefereeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminRaceController {

    private final RaceTrackRepository raceTrackRepository;
    private final TournamentService tournamentService;
    private final RaceService raceService;
    private final RaceRegistrationService raceRegistrationService;
    private final UserRepository userRepository;
    private final RefereeService refereeService;

    @GetMapping("/referees")
    public ResponseEntity<List<UserResponse>> getAllReferees() {
        List<UserResponse> referees = userRepository.findByRole(Role.RACE_REFEREE).stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(referees);
    }

    @GetMapping("/tracks")
    public ResponseEntity<List<TrackResponse>> getAllTracks(@org.springframework.web.bind.annotation.RequestParam(required = false) String location) {
        List<TrackResponse> tracks = raceTrackRepository.findAll().stream()
                .filter(track -> location == null || location.isBlank() || 
                        (track.getLocation() != null && track.getLocation().equalsIgnoreCase(location)))
                .map(TrackResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tracks);
    }

    @PostMapping("/tracks")
    public ResponseEntity<?> createTrack(@RequestBody RaceTrack track) {
        try {
            if (track.getName() == null || track.getName().isBlank()) {
                return ResponseEntity.badRequest().body(new ErrorResponse(400, "Tên sân đua là bắt buộc"));
            }
            if (track.getLocation() == null || track.getLocation().isBlank()) {
                return ResponseEntity.badRequest().body(new ErrorResponse(400, "Khu vực tổ chức là bắt buộc"));
            }
            if (track.getSurfaceCondition() == null || track.getSurfaceCondition().isBlank()) {
                track.setSurfaceCondition("Good");
            }
            RaceTrack saved = raceTrackRepository.save(track);
            return ResponseEntity.status(HttpStatus.CREATED).body(TrackResponse.fromEntity(saved));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
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

    @PutMapping("/tournaments/{id}")
    public ResponseEntity<?> updateTournament(@PathVariable Integer id, @Valid @RequestBody UpdateTournamentRequest request) {
        try {
            TournamentResponse response = tournamentService.updateTournament(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @PutMapping("/tournaments/{id}/status")
    public ResponseEntity<?> updateTournamentStatus(@PathVariable Integer id, @RequestBody java.util.Map<String, String> body) {
        try {
            String status = body.get("status");
            if (status == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse(400, "Status field is required"));
            }
            TournamentResponse response = tournamentService.updateTournamentStatus(id, status);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @DeleteMapping("/tournaments/{id}")
    public ResponseEntity<?> deleteTournament(@PathVariable Integer id) {
        try {
            tournamentService.deleteTournament(id);
            return ResponseEntity.ok().body(new MessageResponse("Tournament deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @PostMapping("/tournaments/{tournamentId}/confirm-registration")
    public ResponseEntity<?> confirmRegistration(@PathVariable Integer tournamentId) {
        try {
            raceRegistrationService.confirmRegistration(tournamentId);
            return ResponseEntity.ok().body(new MessageResponse("Registrations confirmed successfully. Waiting list cleared and refunded."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @PutMapping("/races/{id}/status")
    public ResponseEntity<?> updateRaceStatus(
            @PathVariable Integer id,
            @RequestBody java.util.Map<String, String> body) {
        try {
            String status = body.get("status");
            if (status == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse(400, "Status field is required"));
            }
            if ("FINISHED".equalsIgnoreCase(status)) {
                refereeService.confirmResults(id);
                return ResponseEntity.ok().body(new MessageResponse("Race results confirmed, prize distribution and bet payouts completed successfully."));
            } else if ("CANCELLED".equalsIgnoreCase(status)) {
                refereeService.cancelRace(id);
                return ResponseEntity.ok().body(new MessageResponse("Race cancelled successfully. Bets and registration entry fees have been refunded."));
            } else {
                return ResponseEntity.badRequest().body(new ErrorResponse(400, "Invalid status. Must be FINISHED or CANCELLED"));
            }
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @GetMapping("/races/{id}/prize-distributions")
    public ResponseEntity<?> getPrizeDistributions(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(refereeService.getPrizeDistributions(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }
}
