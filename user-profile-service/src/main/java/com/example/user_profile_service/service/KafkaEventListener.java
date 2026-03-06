package com.example.user_profile_service.service;

import com.example.user_profile_service.entity.Profile;
import com.example.user_profile_service.repository.ProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaEventListener {

    private final ProfileRepository profileRepository;
    private final ObjectMapper objectMapper;

    // This method will automatically trigger the microsecond a message hits this topic!
    @KafkaListener(topics = "trajectory.ai.vectorized", groupId = "profile-service-group")
    public void handleAiReadyCallback(String message) {
        try {
            System.out.println("<<-- KAFKA RECEIVED: AI Worker finished processing!");

            // 1. Convert the incoming JSON string back into a readable object
            JsonNode payload = objectMapper.readTree(message);
            Long userId = payload.get("entityId").asLong();
            String status = payload.get("status").asText();

            // 2. If the AI was successful, update the database flag!
            if ("SUCCESS".equals(status)) {
                Profile profile = profileRepository.findByUserId(userId)
                        .orElseThrow(() -> new RuntimeException("Profile not found for ID: " + userId));

                profile.setIsAiReady(true);
                profileRepository.save(profile);

                System.out.println("--> DATABASE UPDATED: User " + userId + " isAiReady flipped to TRUE!");
            }

        } catch (Exception e) {
            System.err.println("Error processing Kafka message: " + e.getMessage());
        }
    }
}
