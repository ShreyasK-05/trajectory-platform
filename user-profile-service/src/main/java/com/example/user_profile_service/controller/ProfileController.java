package com.example.user_profile_service.controller;

import com.example.user_profile_service.dto.ProfileRequest;
import com.example.user_profile_service.entity.Profile;
import com.example.user_profile_service.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity; // 1. Added the Profile Entity import
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;

import com.example.user_profile_service.dto.ProfileRequest;
import com.example.user_profile_service.entity.Profile;
import com.example.user_profile_service.service.ProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final KafkaTemplate<String, String> kafkaTemplate;
    

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            return ResponseEntity.ok(profileService.getMyProfile(authHeader));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
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
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader, 
            @RequestBody ProfileRequest request) {

        String response = profileService.onboardUser(authHeader, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/resume", consumes = "multipart/form-data")
    public ResponseEntity<String> uploadResume(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestParam("file") MultipartFile file) {

        if (!file.getContentType().equals("application/pdf")) {
            return ResponseEntity.badRequest().body("Only PDF files are allowed!");
        }

        String response = profileService.uploadResume(authHeader, file);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/simulate-ai-callback")
    public ResponseEntity<String> simulateAiCallback(@RequestParam Long userId) {
        String fakePythonMessage = "{\"entityId\": " + userId + ", \"entityType\": \"USER\", \"status\": \"SUCCESS\"}";
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
