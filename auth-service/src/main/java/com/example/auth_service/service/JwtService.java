package com.example.auth_service.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET = "2410ea629073c9148011e924ba4f4cd6a7f9be4793df24d352e3f5faa4495fd1";

    public String generateToken(String email, String role) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes());

        return Jwts.builder()
                .subject(email)
                .claim("role", role) // We embed the user's role directly into the token!
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // Token expires in 24 hours
                .signWith(key)
                .compact();
    }
}