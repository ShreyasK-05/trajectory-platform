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

    public String onboardUser(String authHeader, ProfileRequest request) {
        // 1. EXTRACT THE MASTER KEY (userId) FROM THE JWT!
        Long userId = jwtExtractor.getUserId(authHeader);

        // 2. Check if a profile already exists for this user
        if (profileRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("Profile already exists for this user!");
        }

        // 3. Create the new Profile linking it to the userId
        Profile newProfile = Profile.builder()
                .userId(userId)
                .bio(request.getBio())
                .isAiReady(false) // Will become true later when AI processes the resume
                .build();

        // 4. Save to PostgreSQL
        profileRepository.save(newProfile);

        return "Profile created successfully for User ID: " + userId;
    }

    public String uploadResume(String authHeader, MultipartFile file) {
        Long userId = jwtExtractor.getUserId(authHeader);

        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found! Please onboard first."));

        // 1. Extract the text (We already know this works!)
        String extractedText = pdfExtractor.extractTextFromPdf(file);
        profile.setResumeText(extractedText);

        // 2. UPLOAD THE PHYSICAL FILE TO MINIO!
        String minioUrl = fileStorageService.uploadFile(file, userId);
        profile.setResumeUrl(minioUrl); // Save the generated URL to the database

        // 3. Save to PostgreSQL
        profileRepository.save(profile);

        return "Success! Text extracted and file saved at: " + minioUrl;
    }
}
