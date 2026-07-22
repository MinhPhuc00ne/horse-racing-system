package com.horseracing.controllers;

import com.horseracing.dto.response.ConnectionUserResponse;
import com.horseracing.dto.response.ErrorResponse;
import com.horseracing.services.UserConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/connections")
@PreAuthorize("hasAnyRole('HORSE_OWNER', 'JOCKEY')")
@RequiredArgsConstructor
public class ConnectionController {

    private final UserConnectionService userConnectionService;

    @GetMapping("/directory")
    public ResponseEntity<?> getDirectory(
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(required = false, defaultValue = "ALL") String role,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            List<ConnectionUserResponse> directory = userConnectionService
                    .getConnectionsDirectory(userDetails.getUsername(), query, role);
            return ResponseEntity.ok(directory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @GetMapping("/friends")
    public ResponseEntity<?> getFriends(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            List<ConnectionUserResponse> friends =
                    userConnectionService.getFriends(userDetails.getUsername());
            return ResponseEntity.ok(friends);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @PostMapping("/request")
    public ResponseEntity<?> sendRequest(@RequestParam Integer recipientId,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            ConnectionUserResponse response =
                    userConnectionService.sendRequest(userDetails.getUsername(), recipientId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @PutMapping("/request/{id}/respond")
    public ResponseEntity<?> respondToRequest(@PathVariable Integer id, @RequestParam String action,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            ConnectionUserResponse response =
                    userConnectionService.respondToRequest(userDetails.getUsername(), id, action);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteConnection(@PathVariable Integer id,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            userConnectionService.deleteConnection(userDetails.getUsername(), id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }
}
