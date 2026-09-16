package com.servicedesk.lite.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

/**
 * Issues and validates two distinct token types:
 *  - ACCESS tokens: short-lived, sent on every API request as "Authorization: Bearer ..."
 *  - REFRESH tokens: long-lived, sent only to POST /api/auth/refresh to obtain a new access token
 *
 * Both are JWTs signed with the same secret, but carry a "type" claim so one can never be
 * mistakenly (or maliciously) used in place of the other - JwtAuthFilter checks this claim
 * before accepting a token for a normal API request.
 */
@Service
public class JwtService {

    private static final String CLAIM_TYPE = "type";
    private static final String TYPE_ACCESS = "access";
    private static final String TYPE_REFRESH = "refresh";

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.access-expiration-ms}")
    private long accessExpirationMs;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String email) {
        return buildToken(email, TYPE_ACCESS, accessExpirationMs);
    }

    public String generateRefreshToken(String email) {
        return buildToken(email, TYPE_REFRESH, refreshExpirationMs);
    }

    public long getAccessExpirationMs() {
        return accessExpirationMs;
    }

    private String buildToken(String email, String type, long expirationMs) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .subject(email)
                .claim(CLAIM_TYPE, type)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key())
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    private String extractType(String token) {
        return extractClaim(token, claims -> claims.get(CLAIM_TYPE, String.class));
    }

    /** True if the token is genuine, unexpired, and specifically an ACCESS token. */
    public boolean isValidAccessToken(String token) {
        return isValidOfType(token, TYPE_ACCESS);
    }

    /** True if the token is genuine, unexpired, and specifically a REFRESH token. */
    public boolean isValidRefreshToken(String token) {
        return isValidOfType(token, TYPE_REFRESH);
    }

    private boolean isValidOfType(String token, String expectedType) {
        try {
            Date expiration = extractClaim(token, Claims::getExpiration);
            String type = extractType(token);
            return expiration.after(new Date()) && expectedType.equals(type);
        } catch (Exception e) {
            return false;
        }
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return resolver.apply(claims);
    }
}
