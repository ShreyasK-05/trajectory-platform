package com.example.user_profile_service.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

@Component
public class JwtExtractor {

    private static final String SECRET = "${SECRET_KEY}";

    private Claims extractAllClaims(String authHeader) {
        // Strip out the "Bearer " prefix to get just the token string
        String token = authHeader.substring(7);
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes());

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long getUserId(String authHeader) {
        return extractAllClaims(authHeader).get("userId", Long.class);
    }

    public String getRole(String authHeader) {
        return extractAllClaims(authHeader).get("role", String.class);
    }
}
