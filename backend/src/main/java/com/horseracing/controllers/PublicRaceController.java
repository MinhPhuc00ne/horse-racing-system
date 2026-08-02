package com.horseracing.controllers;

import com.horseracing.dto.response.*;
import com.horseracing.entities.User;
import com.horseracing.repositories.RaceParticipantRepository;
import com.horseracing.repositories.RaceRegistrationRepository;
import com.horseracing.repositories.UserRepository;
import com.horseracing.services.LiveRaceService;
import com.horseracing.services.RaceService;
import com.horseracing.services.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicRaceController {

    private final TournamentService tournamentService;
    private final RaceService raceService;
    private final RaceParticipantRepository raceParticipantRepository;
    private final LiveRaceService liveRaceService;
    private final UserRepository userRepository;

    private final RaceRegistrationRepository raceRegistrationRepository;

    @GetMapping("/tournaments")
    public ResponseEntity<List<TournamentResponse>> getAllTournaments(
            Authentication authentication) {
        User user = null;
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof UserDetails userDetails) {
            user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        }
        return ResponseEntity.ok(tournamentService.getAllTournaments(user));
    }

    @GetMapping("/tournaments/{id}")
    public ResponseEntity<?> getTournamentById(@PathVariable Integer id) {
        try {
            TournamentResponse response = tournamentService.getTournamentById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @GetMapping("/tournaments/{id}/races")
    public ResponseEntity<List<RaceResponse>> getRacesByTournamentId(@PathVariable Integer id) {
        return ResponseEntity.ok(raceService.getRacesByTournamentId(id));
    }

    @GetMapping("/races/{id}")
    public ResponseEntity<?> getRaceById(@PathVariable Integer id) {
        try {
            RaceResponse response = raceService.getRaceById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @GetMapping("/races/{id}/participants")
    public ResponseEntity<List<ParticipantResponse>> getRaceParticipants(@PathVariable Integer id) {
        List<ParticipantResponse> participants = raceParticipantRepository.findByRaceId(id).stream()
                .filter(p -> !"REJECTED".equalsIgnoreCase(p.getStatus()) && !"DISQUALIFIED".equalsIgnoreCase(p.getStatus()))
                .map(ParticipantResponse::fromEntity).collect(Collectors.toList());
        if (participants.isEmpty()) {
            List<com.horseracing.entities.RaceRegistration> regs = raceRegistrationRepository.findByRaceId(id);
            int gate = 1;
            for (com.horseracing.entities.RaceRegistration reg : regs) {
                if (!"REJECTED".equalsIgnoreCase(reg.getStatus()) && !"CANCELLED".equalsIgnoreCase(reg.getStatus())) {
                    participants.add(ParticipantResponse.builder()
                            .id(reg.getId())
                            .raceId(reg.getRace().getId())
                            .horseId(reg.getHorse().getId())
                            .horseName(reg.getHorse().getName())
                            .jockeyId(reg.getJockey() != null ? reg.getJockey().getId() : null)
                            .jockeyName(reg.getJockey() != null && reg.getJockey().getUser() != null ? reg.getJockey().getUser().getFullName() : "Pending Jockey")
                            .gateNumber(gate++)
                            .status(reg.getStatus())
                            .horseImageUrl(reg.getHorse() != null ? reg.getHorse().getImageUrl() : null)
                            .build());
                }
            }
        }
        return ResponseEntity.ok(participants);
    }

    @GetMapping(value = "/races/{id}/live-stream", produces = "text/event-stream")
    public SseEmitter streamLiveRace(@PathVariable Integer id) {
        return liveRaceService.subscribe(id);
    }

    @GetMapping("/races/active")
    public ResponseEntity<List<RaceResponse>> getActiveRaces() {
        return ResponseEntity.ok(raceService.getActiveRaces());
    }
}
