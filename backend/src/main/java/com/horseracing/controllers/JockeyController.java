package com.horseracing.controllers;

import com.horseracing.dto.response.ErrorResponse;
import com.horseracing.dto.response.JockeyAgreementResponse;
import com.horseracing.services.JockeyAgreementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jockey")
@PreAuthorize("hasRole('JOCKEY')")
@RequiredArgsConstructor
public class JockeyController {

    private final JockeyAgreementService jockeyAgreementService;

    @GetMapping("/agreements")
    public ResponseEntity<?> getMyReceivedInvitations(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            List<JockeyAgreementResponse> response = jockeyAgreementService.getMyReceivedInvitations(userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @PutMapping("/agreements/{id}/accept")
    public ResponseEntity<?> acceptInvitation(@PathVariable Integer id, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            JockeyAgreementResponse response = jockeyAgreementService.acceptInvitation(userDetails.getUsername(), id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @PutMapping("/agreements/{id}/reject")
    public ResponseEntity<?> rejectInvitation(@PathVariable Integer id, Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            JockeyAgreementResponse response = jockeyAgreementService.rejectInvitation(userDetails.getUsername(), id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }
}
