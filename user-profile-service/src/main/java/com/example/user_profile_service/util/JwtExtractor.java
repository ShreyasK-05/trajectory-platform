package com.example.user_profile_service.util;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtExtractor {

    @org.springframework.beans.factory.annotation.Value("${SECRET_KEY:2410ea629073c9148011e924ba4f4cd6a7f9be4793df24d352e3f5faa4495fd1}")
    private String secretKey;

    private Claims extractAllClaims(String authHeader) {
        // Strip out the "Bearer " prefix to get just the token string
        String token = authHeader.substring(7);
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());

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
