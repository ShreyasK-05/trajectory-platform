package com.example.api_gateway.filter;

import com.example.api_gateway.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class AuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // 1. Let the Auth Service traffic pass through without a token! (Login/Register)
        if (path.startsWith("/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. For all other routes, check for the Authorization header
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Missing or invalid Authorization header");
            return;
        }

        // 3. Extract the token and validate it
        String token = authHeader.substring(7); // Removes "Bearer "
        try {
            jwtUtil.validateToken(token);
        } catch (Exception e) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Invalid or expired token");
            return;
        }

        // 4. If everything is good, let the request pass through to the microservice!
        filterChain.doFilter(request, response);
    }
}
