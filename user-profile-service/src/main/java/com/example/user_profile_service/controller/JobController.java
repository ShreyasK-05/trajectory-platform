package com.example.user_profile_service.controller;

import com.example.user_profile_service.dto.JobRequest;
import com.example.user_profile_service.entity.Job;
import com.example.user_profile_service.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @PostMapping("/create")
    // FIX: Notice the return type here is now 'ResponseEntity<Job>'!
    public ResponseEntity<Job> createJob(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestBody JobRequest request) {

        Job savedJob = jobService.createJob(authHeader, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedJob);
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<?> getJobById(@PathVariable Long jobId) {
        try {
            Job job = jobService.getJobById(jobId);
            return ResponseEntity.ok(job);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
