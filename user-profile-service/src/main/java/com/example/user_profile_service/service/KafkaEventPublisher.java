package com.example.user_profile_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KafkaEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publishResumeUploaded(Long userId, String resumeText) {
        try {
            // 1. Package the data
            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", userId);
            payload.put("resumeText", resumeText);

            // 2. Convert to JSON String
            String jsonPayload = objectMapper.writeValueAsString(payload);

            // 3. Send to the specific Kafka Topic
            kafkaTemplate.send("trajectory.resume.uploaded", jsonPayload);
            System.out.println("--> KAFKA PUBLISHED: Resume for User " + userId);

        } catch (Exception e) {
            System.err.println("Failed to publish resume event: " + e.getMessage());
        }
    }

    public void publishJobCreated(Long jobId, String title, String description) {
        try {
            // 1. Package the data
            Map<String, Object> payload = new HashMap<>();
            payload.put("jobId", jobId);
            payload.put("title", title);
            payload.put("description", description);

            // 2. Convert to JSON String
            String jsonPayload = objectMapper.writeValueAsString(payload);

            // 3. Send to the specific Kafka Topic
            kafkaTemplate.send("trajectory.job.created", jsonPayload);
            System.out.println("--> KAFKA PUBLISHED: Job '" + title + "' (ID: " + jobId + ")");

        } catch (Exception e) {
            System.err.println("Failed to publish job event: " + e.getMessage());
        }
    }
}
