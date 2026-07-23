package com.horseracing.controllers;

import com.horseracing.dto.response.PublicLeaderboardResponse;
import com.horseracing.dto.response.PublicStatsResponse;
import com.horseracing.services.PublicApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final PublicApiService publicApiService;

    @GetMapping("/leaderboard")
    public ResponseEntity<PublicLeaderboardResponse> getLeaderboard() {
        return ResponseEntity.ok(publicApiService.getLeaderboard());
    }

    @GetMapping("/stats")
    public ResponseEntity<PublicStatsResponse> getStats() {
        return ResponseEntity.ok(publicApiService.getStats());
    }
}
