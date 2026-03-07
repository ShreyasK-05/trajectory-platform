package com.example.user_profile_service.service;

import com.example.user_profile_service.dto.JobRequest;
import com.example.user_profile_service.entity.Job;
import com.example.user_profile_service.repository.JobRepository;
import com.example.user_profile_service.util.JwtExtractor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final JwtExtractor jwtExtractor;
    private final KafkaEventPublisher kafkaEventPublisher;

    public String createJob(String authHeader, JobRequest request) {
        // 1. Extract the user's ID and Role from the JWT
        Long userId = jwtExtractor.getUserId(authHeader);
        String role = jwtExtractor.getRole(authHeader);

        // 2. Security Check: Only Employers can post jobs!
        if (!"EMPLOYER".equalsIgnoreCase(role)) {
            throw new RuntimeException("Access Denied: Only Employers can post jobs.");
        }

        // 3. Create the Job entity
        Job newJob = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .company(request.getCompany())
                .location(request.getLocation())
                .recruiterId(userId) // Link the job to the Employer's ID!
                .build();

        // 4. Save to PostgreSQL
        jobRepository.save(newJob);
        kafkaEventPublisher.publishJobCreated(newJob.getId(), newJob.getTitle(), newJob.getDescription());
        return "Job '" + newJob.getTitle() + "' posted successfully by Recruiter ID: " + userId;
    }
}
