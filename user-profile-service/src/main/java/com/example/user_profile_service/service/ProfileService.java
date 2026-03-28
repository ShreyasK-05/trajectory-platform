package com.example.user_profile_service.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.user_profile_service.dto.ProfileRequest;
import com.example.user_profile_service.entity.Profile;
import com.example.user_profile_service.repository.ProfileRepository;
import com.example.user_profile_service.util.JwtExtractor;
import com.example.user_profile_service.util.PdfExtractor;

import lombok.RequiredArgsConstructor;

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

        if (profileRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("Profile already exists for this user!");
        }

        Profile newProfile = Profile.builder()
                .userId(userId)
                .bio(request.getBio())
                .isAiReady(false) 
                .build();

        profileRepository.save(newProfile);

        return "Profile created successfully for User ID: " + userId;
    }

    public String uploadResume(String authHeader, MultipartFile file) {
        Long userId = jwtExtractor.getUserId(authHeader);

        // If the profile doesn't exist, build a brand new one!
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

    public Profile getMyProfile(String authHeader) {
        // 1. Extract the User ID from the token exactly like the other methods!
        Long userId = jwtExtractor.getUserId(authHeader);
        
        // 2. Fetch the profile from the database
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found for user ID: " + userId));
    }
}