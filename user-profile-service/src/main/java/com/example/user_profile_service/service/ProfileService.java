package com.example.user_profile_service.service;

import com.example.user_profile_service.dto.ProfileRequest;
import com.example.user_profile_service.entity.Profile;
import com.example.user_profile_service.repository.ProfileRepository;
import com.example.user_profile_service.util.JwtExtractor;
import com.example.user_profile_service.util.PdfExtractor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final JwtExtractor jwtExtractor;
    private final PdfExtractor pdfExtractor;
    private final FileStorageService fileStorageService;
    private final KafkaEventPublisher kafkaEventPublisher;

    public String onboardUser(String authHeader, ProfileRequest request) {
        Long userId = jwtExtractor.getUserId(authHeader);

        // THE FIX: Find the existing profile, or create a brand new one if it doesn't exist!
        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> Profile.builder()
                        .userId(userId)
                        .isAiReady(false) 
                        .build());

        // Update the bio with whatever came from the React form
        profile.setBio(request.getBio());

        // Save to PostgreSQL (this will execute an UPDATE if it existed, or INSERT if it was new)
        profileRepository.save(profile);

        return "Profile saved successfully for User ID: " + userId;
    }

    public Profile getMyProfile(String authHeader) {
        Long userId = jwtExtractor.getUserId(authHeader);
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found for this user"));
    }

    public String uploadResume(String authHeader, MultipartFile file) {
        Long userId = jwtExtractor.getUserId(authHeader);

        // THE FIX: If the profile doesn't exist, build a brand new one!
        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> Profile.builder()
                        .userId(userId)
                        .isAiReady(false)
                        .build());

        // 1. Extract the text 
        String extractedText = pdfExtractor.extractTextFromPdf(file);
        profile.setResumeText(extractedText);

        // 2. Upload the physical file to MinIO
        String minioUrl = fileStorageService.uploadFile(file, userId);
        profile.setResumeUrl(minioUrl); 

        // 3. Save to PostgreSQL
        profileRepository.save(profile);
        
        // 4. Ping the AI Worker
        kafkaEventPublisher.publishResumeUploaded(userId, extractedText);
        
        return "Success! Text extracted and file saved at: " + minioUrl;
    }
}