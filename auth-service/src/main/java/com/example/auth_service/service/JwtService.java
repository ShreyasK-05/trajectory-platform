package com.example.auth_service.service;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @org.springframework.beans.factory.annotation.Value("${SECRET_KEY:2410ea629073c9148011e924ba4f4cd6a7f9be4793df24d352e3f5faa4495fd1}")
    private String secretKey;

    public String generateToken(Long userId, String email, String role) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes());

        return Jwts.builder()
                .subject(email)
                .claim("role", role) // We embed the user's role directly into the token!
                .claim("userId", userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // Token expires in 24 hours
                .signWith(key)
                .compact();
    }
}