package com.example.user_profile_service.controller;

import com.example.user_profile_service.dto.ProfileRequest;
import com.example.user_profile_service.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    @GetMapping("/me")
    public ResponseEntity<String> getMyProfile() {
        return ResponseEntity.ok("Welcome to your secure profile! You bypassed the Gateway Bouncer using a valid JWT!");
    }

    @PostMapping("/onboard")
    public ResponseEntity<String> onboard(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader, // Grabs the token from the request
            @RequestBody ProfileRequest request) {

        String response = profileService.onboardUser(authHeader, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/resume", consumes = "multipart/form-data")
    public ResponseEntity<String> uploadResume(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestParam("file") MultipartFile file) {

        // Basic validation to ensure they actually sent a PDF
        if (!file.getContentType().equals("application/pdf")) {
            return ResponseEntity.badRequest().body("Only PDF files are allowed!");
        }

        String response = profileService.uploadResume(authHeader, file);
        return ResponseEntity.ok(response);
    }
}
