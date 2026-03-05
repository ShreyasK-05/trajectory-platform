package com.example.user_profile_service.controller;

import com.example.user_profile_service.dto.JobRequest;
import com.example.user_profile_service.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @PostMapping("/create")
    public ResponseEntity<String> createJob(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestBody JobRequest request) {

        String response = jobService.createJob(authHeader, request);
        return ResponseEntity.ok(response);
    }
}
