package com.horseracing.controllers;

import com.horseracing.dto.request.AddBlacklistRequest;
import com.horseracing.dto.request.UnbanRequest;
import com.horseracing.dto.response.BlacklistResponse;
import com.horseracing.dto.response.ErrorResponse;
import com.horseracing.services.AdminBlacklistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/blacklist")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminBlacklistController {

    private final AdminBlacklistService adminBlacklistService;

    @GetMapping
    public ResponseEntity<List<BlacklistResponse>> getAllBlacklists(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String targetType) {
        return ResponseEntity.ok(adminBlacklistService.getAllBlacklists(status, targetType));
    }

    @PostMapping
    public ResponseEntity<?> addBlacklist(@Valid @RequestBody AddBlacklistRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            BlacklistResponse response =
                    adminBlacklistService.addBlacklist(request, userDetails.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @PutMapping("/{id}/unban")
    public ResponseEntity<?> unbanBlacklist(@PathVariable Integer id,
            @RequestBody(required = false) UnbanRequest unbanRequest,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            BlacklistResponse response = adminBlacklistService.unbanBlacklist(id,
                    userDetails.getUsername(), unbanRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }
}
