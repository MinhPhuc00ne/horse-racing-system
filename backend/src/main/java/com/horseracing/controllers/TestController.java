package com.horseracing.controllers;

import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
@Profile("dev")
public class TestController {

    @GetMapping("/public")
    public ResponseEntity<?> getPublic() {
        return ResponseEntity.ok(Map.of("message", "Public content - accessible by anyone"));
    }

    @GetMapping("/spectator")
    @PreAuthorize("hasRole('SPECTATOR')")
    public ResponseEntity<?> getSpectator() {
        return ResponseEntity
                .ok(Map.of("message", "Spectator content - accessible by SPECTATOR role"));
    }

    @GetMapping("/owner")
    @PreAuthorize("hasRole('HORSE_OWNER')")
    public ResponseEntity<?> getOwner() {
        return ResponseEntity
                .ok(Map.of("message", "Horse Owner content - accessible by HORSE_OWNER role"));
    }

    @GetMapping("/jockey")
    @PreAuthorize("hasRole('JOCKEY')")
    public ResponseEntity<?> getJockey() {
        return ResponseEntity.ok(Map.of("message", "Jockey content - accessible by JOCKEY role"));
    }

    @GetMapping("/referee")
    @PreAuthorize("hasRole('RACE_REFEREE')")
    public ResponseEntity<?> getReferee() {
        return ResponseEntity
                .ok(Map.of("message", "Race Referee content - accessible by RACE_REFEREE role"));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdmin() {
        return ResponseEntity.ok(Map.of("message", "Admin content - accessible by ADMIN role"));
    }

    @GetMapping("/any-role")
    @PreAuthorize("hasAnyRole('SPECTATOR', 'HORSE_OWNER', 'JOCKEY', 'RACE_REFEREE', 'ADMIN')")
    public ResponseEntity<?> getAnyRole() {
        return ResponseEntity.ok(Map.of("message", "Any authenticated role content"));
    }

    @GetMapping("/force-finish-race/{raceId}")
    public ResponseEntity<?> forceFinishRace(
            @org.springframework.web.bind.annotation.PathVariable Integer raceId,
            @org.springframework.beans.factory.annotation.Autowired com.horseracing.repositories.RaceRepository raceRepository,
            @org.springframework.beans.factory.annotation.Autowired com.horseracing.repositories.RaceSimulationRepository raceSimulationRepository,
            @org.springframework.beans.factory.annotation.Autowired com.horseracing.repositories.RaceParticipantRepository raceParticipantRepository,
            @org.springframework.beans.factory.annotation.Autowired com.horseracing.services.RefereeService refereeService) {
        
        try {
            com.horseracing.entities.Race race = raceRepository.findById(raceId).orElseThrow();
            race.setStatus("RUNNING");
            raceRepository.save(race);

            com.horseracing.entities.RaceSimulation sim = new com.horseracing.entities.RaceSimulation();
            sim.setRace(race);
            sim.setStatus("FINISHED");
            sim.setStartTime(java.time.LocalDateTime.now().minusMinutes(5));
            sim.setEndTime(java.time.LocalDateTime.now());
            raceSimulationRepository.save(sim);

            java.util.List<com.horseracing.entities.RaceParticipant> participants = raceParticipantRepository.findByRaceId(raceId);
            for (int i = 0; i < participants.size(); i++) {
                participants.get(i).setFinalRank(i + 1);
                participants.get(i).setStatus("FINISHED");
                raceParticipantRepository.save(participants.get(i));
            }

            refereeService.confirmResults(raceId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Race " + raceId + " forcefully finished and payouts distributed!"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
