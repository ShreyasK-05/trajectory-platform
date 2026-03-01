package com.example.api_gateway.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

@Component
public class JwtUtil {

    // THIS MUST MATCH THE EXACT SECRET IN YOUR AUTH SERVICE!
    private static final String SECRET = "2410ea629073c9148011e924ba4f4cd6a7f9be4793df24d352e3f5faa4495fd1";

    public void validateToken(final String token) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes());
        // This will automatically throw an exception if the token is tampered with or expired!
        Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
    }
}
