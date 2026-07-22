package com.horseracing.controllers;

import com.horseracing.dto.request.AddBlacklistRequest;
import com.horseracing.dto.request.AddFlagRequest;
import com.horseracing.dto.request.UpdateConditionsRequest;
import com.horseracing.dto.response.*;
import com.horseracing.services.RefereeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/referee")
@PreAuthorize("hasRole('RACE_REFEREE')")
@RequiredArgsConstructor
public class RefereeController {

    private final RefereeService refereeService;

    @GetMapping("/races")
    public ResponseEntity<List<RefereeRaceResponse>> getAssignedRaces(
            @RequestParam(required = false) String status,
            Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        List<RefereeRaceResponse> response = refereeService.getAssignedRaces(userDetails.getUsername(), status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tournaments")
    public ResponseEntity<List<TournamentResponse>> getAssignedTournaments(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        List<TournamentResponse> response = refereeService.getAssignedTournaments(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/tournaments/{tournamentId}/cancel-assignment")
    public ResponseEntity<?> cancelAssignment(
            @PathVariable Integer tournamentId,
            Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        try {
            refereeService.cancelAssignment(tournamentId, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Successfully cancelled assignment for the tournament."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }


    @GetMapping("/inspect/horses")
    public ResponseEntity<List<Map<String, Object>>> getHorsesToInspect(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(refereeService.getHorsesToInspect(userDetails.getUsername()));
    }

    @PutMapping("/inspect/horses/{participantId}")
    public ResponseEntity<?> updateInspectionStatus(
            @PathVariable Integer participantId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String status = body.get("status");
        String reason = body.getOrDefault("reason", "");
        refereeService.updateInspectionStatus(participantId, status, reason, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(refereeService.getDashboardStats(userDetails.getUsername()));
    }

    @GetMapping("/races/{raceId}/pre-check")
    public ResponseEntity<PreCheckResponse> getPreCheck(@PathVariable Integer raceId) {
        PreCheckResponse response = refereeService.getPreCheck(raceId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/races/{raceId}/conditions")
    public ResponseEntity<RefereeRaceResponse> updateConditions(
            @PathVariable Integer raceId,
            @RequestBody UpdateConditionsRequest request) {
        RefereeRaceResponse response = refereeService.updateConditions(raceId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/races/{raceId}/jockeys/{jockeyId}/weight")
    public ResponseEntity<MessageResponse> updateJockeyWeight(
            @PathVariable Integer raceId,
            @PathVariable Integer jockeyId,
            @RequestBody Map<String, Double> body) {
        Double actualWeight = body.get("actualWeight");
        if (actualWeight == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("actualWeight is required"));
        }
        refereeService.updateJockeyWeight(raceId, jockeyId, actualWeight);
        return ResponseEntity.ok(new MessageResponse("Jockey weight updated successfully."));
    }

    @PutMapping("/races/{raceId}/participants/{participantId}/disqualify")
    public ResponseEntity<MessageResponse> disqualifyParticipant(
            @PathVariable Integer raceId,
            @PathVariable Integer participantId,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "Disqualified by referee.");
        refereeService.disqualifyParticipant(raceId, participantId, reason);
        return ResponseEntity.ok(new MessageResponse("Participant has been disqualified. Betting orders for this horse have been refunded."));
    }

    @PostMapping("/races/{raceId}/start")
    public ResponseEntity<MessageResponse> startRace(@PathVariable Integer raceId) {
        refereeService.startRace(raceId);
        return ResponseEntity.ok(new MessageResponse("Race has started. Betting window closed."));
    }

    @PutMapping("/races/{raceId}/pov")
    public ResponseEntity<MessageResponse> updatePov(
            @PathVariable Integer raceId,
            @RequestBody Map<String, Integer> body) {
        Integer horseId = body.get("horseId");
        refereeService.updatePov(raceId, horseId);
        return ResponseEntity.ok(new MessageResponse("POV updated successfully."));
    }

    @PostMapping("/races/{raceId}/flags")
    public ResponseEntity<FlagResponse> addFlag(
            @PathVariable Integer raceId,
            @Valid @RequestBody AddFlagRequest request,
            Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        FlagResponse response = refereeService.addFlag(raceId, request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/blacklist")
    public ResponseEntity<MessageResponse> addBlacklist(
            @Valid @RequestBody AddBlacklistRequest request,
            Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        refereeService.addBlacklist(request, userDetails.getUsername());
        return ResponseEntity.ok(new MessageResponse("Target has been added to blacklist and banned successfully."));
    }

    @GetMapping("/races/{raceId}/results")
    public ResponseEntity<List<Map<String, Object>>> getRaceResults(@PathVariable Integer raceId) {
        return ResponseEntity.ok(refereeService.getRaceResults(raceId));
    }

    @PostMapping("/races/{raceId}/confirm-results")
    public ResponseEntity<?> confirmResults(@PathVariable Integer raceId) {
        try {
            refereeService.confirmResults(raceId);
            return ResponseEntity.ok(new MessageResponse("Results confirmed. Prize distribution and bet payouts completed successfully."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ErrorResponse(400, "Debug error: " + e.getMessage() + " | Cause: " + (e.getCause() != null ? e.getCause().getMessage() : "none")));
        }
    }



    @GetMapping("/violations")
    public ResponseEntity<List<ViolationResponse>> getViolations() {
        return ResponseEntity.ok(refereeService.getViolations());
    }
}
