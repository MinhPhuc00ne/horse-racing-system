package com.horseracing.controllers;

import com.horseracing.dto.response.*;
import com.horseracing.repositories.RaceParticipantRepository;
import com.horseracing.services.LiveRaceService;
import com.horseracing.services.RaceService;
import com.horseracing.services.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PublicRaceController {

    private final TournamentService tournamentService;
    private final RaceService raceService;
    private final RaceParticipantRepository raceParticipantRepository;
    private final LiveRaceService liveRaceService;

    @GetMapping("/tournaments")
    public ResponseEntity<List<TournamentResponse>> getAllTournaments() {
        return ResponseEntity.ok(tournamentService.getAllTournaments());
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
                .map(ParticipantResponse::fromEntity)
                .collect(Collectors.toList());
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
