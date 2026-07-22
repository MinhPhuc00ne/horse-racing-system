package com.horseracing.configs;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Rate limiting filter for sensitive auth endpoints to prevent brute-force attacks. Uses IP-based
 * rate limiting with Bucket4j token bucket algorithm and Caffeine Cache bounded eviction (10-minute
 * access TTL, max 10,000 IPs).
 *
 * Limits: - Login: 10 attempts per minute - OTP verification: 5 attempts per minute - Forgot
 * password: 3 attempts per minute
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Cache<String, Bucket> loginBuckets = Caffeine.newBuilder()
            .expireAfterAccess(10, TimeUnit.MINUTES).maximumSize(10000).build();

    private final Cache<String, Bucket> otpBuckets = Caffeine.newBuilder()
            .expireAfterAccess(10, TimeUnit.MINUTES).maximumSize(10000).build();

    private final Cache<String, Bucket> forgotPasswordBuckets = Caffeine.newBuilder()
            .expireAfterAccess(10, TimeUnit.MINUTES).maximumSize(10000).build();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Only rate-limit POST requests to sensitive endpoints
        if (!"POST".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        Bucket bucket = null;

        switch (path) {
            case "/api/auth/login", "/api/auth/google" -> bucket =
                    loginBuckets.get(clientIp, k -> createBucket(10, 1));
            case "/api/auth/verify-reset-otp", "/api/auth/reset-password" -> bucket =
                    otpBuckets.get(clientIp, k -> createBucket(5, 1));
            case "/api/auth/forgot-password" -> bucket =
                    forgotPasswordBuckets.get(clientIp, k -> createBucket(3, 1));
            default -> {
            }
        }

        if (bucket != null && !bucket.tryConsume(1)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"status\":429,\"message\":\"Too many requests. Please try again later.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Create a rate-limiting bucket.
     *
     * @param tokens number of tokens allowed per period
     * @param minutes refill period in minutes
     */
    private Bucket createBucket(int tokens, int minutes) {
        return Bucket.builder().addLimit(
                limit -> limit.capacity(tokens).refillGreedy(tokens, Duration.ofMinutes(minutes)))
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String remoteAddr = request.getRemoteAddr();
        // Only parse X-Forwarded-For if connection originates from local loopback or private
        // network proxy
        if (isTrustedProxy(remoteAddr)) {
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isBlank()) {
                return xForwardedFor.split(",")[0].trim();
            }
        }
        return remoteAddr != null ? remoteAddr : "0.0.0.0";
    }

    private boolean isTrustedProxy(String ip) {
        if (ip == null)
            return false;
        return ip.equals("127.0.0.1") || ip.equals("0:0:0:0:0:0:0:1") || ip.startsWith("10.")
                || ip.startsWith("192.168.") || ip.startsWith("172.");
    }
}
