package com.horseracing.controllers;

import com.horseracing.dto.request.*;
import com.horseracing.dto.response.AuthResponse;
import com.horseracing.dto.response.MessageResponse;
import com.horseracing.dto.response.UserResponse;
import com.horseracing.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user account (default role: SPECTATOR).
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Login with email and password.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Login or register with Google OAuth2. Receives the Google ID token (credential) from the
     * frontend.
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request) {
        AuthResponse response = authService.googleLogin(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Complete profile for newly created Google account
     */
    @PostMapping("/google/complete-profile")
    public ResponseEntity<UserResponse> completeGoogleProfile(
            @Valid @RequestBody CompleteProfileRequest request, Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        UserResponse response =
                authService.completeGoogleProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    /**
     * Refresh access token using a valid refresh token.
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Logout by revoking the refresh token.
     */
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    /**
     * Get current authenticated user's info.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        UserResponse response = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Update current authenticated user's profile info.
     */
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestBody java.util.Map<String, String> request, Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        UserResponse response = authService.updateUserProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    /**
     * Verify and activate user account using verification token/OTP.
     */
    @GetMapping("/verify")
    public ResponseEntity<MessageResponse> verifyAccount(@RequestParam("token") String token) {
        authService.verifyAccount(token);
        return ResponseEntity
                .ok(new MessageResponse("Account activated successfully! You can now log in."));
    }

    /**
     * Request a password reset OTP code.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity
                .ok(new MessageResponse("Password reset OTP has been sent to your email."));
    }

    /**
     * Verify the password reset OTP code.
     */
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<MessageResponse> verifyResetOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyResetOtp(request);
        return ResponseEntity.ok(new MessageResponse(
                "OTP verified successfully. You can now set your new password."));
    }

    /**
     * Reset password using OTP and the new password.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(new MessageResponse("Password updated successfully."));
    }
}
