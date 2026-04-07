package com.example.user_profile_service.controller;

import com.example.user_profile_service.dto.ProfileRequest;
import com.example.user_profile_service.entity.Profile;
import com.example.user_profile_service.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @GetMapping("/me")
    public ResponseEntity<Profile> getMyProfile(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        // Now it actually fetches the Profile object from the database!
        return ResponseEntity.ok(profileService.getMyProfile(authHeader));
    }

    // 2. NEW endpoint specifically for saving Recruiter settings
    @PostMapping("/employer/onboard")
    public ResponseEntity<Profile> updateEmployerProfile(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestBody ProfileRequest request) {

        return ResponseEntity.ok(profileService.saveEmployerProfile(authHeader, request));
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

    @PostMapping("/simulate-ai-callback")
    public ResponseEntity<String> simulateAiCallback(@RequestParam Long userId) {
        String fakePythonMessage = "{\"entityId\": " + userId + ", \"entityType\": \"USER\", \"status\": \"SUCCESS\"}";

        // We publish it to the topic
        kafkaTemplate.send("trajectory.ai.vectorized", fakePythonMessage);

        return ResponseEntity.ok("Simulated AI callback sent to Kafka for User " + userId);
    }

    @GetMapping("/candidate/{userId}")
    public ResponseEntity<?> getCandidateProfile(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable Long userId) {

        try {
            Profile profile = profileService.getCandidateProfile(authHeader, userId);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
