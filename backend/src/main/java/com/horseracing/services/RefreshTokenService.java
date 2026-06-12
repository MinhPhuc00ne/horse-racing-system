package com.horseracing.services;

import com.horseracing.entities.RefreshToken;
import com.horseracing.entities.User;
import com.horseracing.repositories.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    /**
     * Create a new refresh token for the user. Revokes any existing non-revoked tokens for the user
     * first to prevent token accumulation.
     */
    @Transactional
    public RefreshToken createRefreshToken(User user) {
        // Revoke all existing tokens for this user
        refreshTokenRepository.revokeAllByUser(user);

        RefreshToken refreshToken =
                RefreshToken.builder().user(user).token(UUID.randomUUID().toString())
                        .expiryDate(Instant.now().plusMillis(refreshTokenExpiration)).revoked(false)
                        .build();

        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Find a refresh token by its token string.
     */
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    /**
     * Verify that the refresh token has not expired or been revoked.
     */
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.isRevoked()) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token was revoked. Please login again.");
        }

        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token has expired. Please login again.");
        }

        return token;
    }

    /**
     * Revoke a specific refresh token.
     */
    @Transactional
    public void revokeToken(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    /**
     * Delete all refresh tokens for a user.
     */
    @Transactional
    public void deleteByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }

    /**
     * Scheduled cleanup job: runs every hour to remove expired and revoked refresh tokens.
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    @Transactional
    public void cleanupExpiredTokens() {
        int deleted = refreshTokenRepository.deleteExpiredAndRevokedTokens(Instant.now());
        if (deleted > 0) {
            log.info("Cleaned up {} expired/revoked refresh tokens", deleted);
        }
    }
}
