package com.horseracing.controllers;

import com.horseracing.dto.request.CreateFeedbackRequest;
import com.horseracing.dto.request.ResolveFeedbackRequest;
import com.horseracing.dto.response.ErrorResponse;
import com.horseracing.dto.response.FeedbackResponse;
import com.horseracing.services.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    /**
     * Submit feedback (Any authenticated user)
     */
    @PostMapping("/api/feedbacks")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createFeedback(@Valid @RequestBody CreateFeedbackRequest request,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            FeedbackResponse response =
                    feedbackService.createFeedback(userDetails.getUsername(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    /**
     * Get current user's submitted feedbacks
     */
    @GetMapping("/api/feedbacks/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyFeedbacks(Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            List<FeedbackResponse> response =
                    feedbackService.getUserFeedbacks(userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    /**
     * Get all feedbacks (Admin only)
     */
    @GetMapping("/api/admin/feedbacks")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllFeedbacks(@RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        try {
            List<FeedbackResponse> response = feedbackService.getAllFeedbacks(status, role, search);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    /**
     * Resolve a feedback with admin note (Admin only)
     */
    @PutMapping("/api/admin/feedbacks/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resolveFeedback(@PathVariable Integer id,
            @Valid @RequestBody ResolveFeedbackRequest request) {
        try {
            FeedbackResponse response = feedbackService.resolveFeedback(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }

    /**
     * Reject a feedback with admin note (Admin only)
     */
    @PutMapping("/api/admin/feedbacks/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectFeedback(@PathVariable Integer id,
            @Valid @RequestBody ResolveFeedbackRequest request) {
        try {
            FeedbackResponse response = feedbackService.rejectFeedback(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, e.getMessage()));
        }
    }
}
