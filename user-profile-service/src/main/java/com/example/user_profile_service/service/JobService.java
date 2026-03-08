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

    // FIX: Notice the return type here is now 'Job', not 'String'!
    public Job createJob(String authHeader, JobRequest request) {
        Long userId = jwtExtractor.getUserId(authHeader);
        String role = jwtExtractor.getRole(authHeader);

        if (!"EMPLOYER".equalsIgnoreCase(role)) {
            throw new RuntimeException("Access Denied: Only Employers can post jobs.");
        }

        Job newJob = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .company(request.getCompany())
                .location(request.getLocation())
                .recruiterId(userId)
                .build();

        Job savedJob = jobRepository.save(newJob);
        kafkaEventPublisher.publishJobCreated(savedJob.getId(), savedJob.getTitle(), savedJob.getDescription());

        return savedJob;
    }
}