package com.example.user_profile_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // This acts as the "Master Key" linking back to the Auth Service
    @Column(unique = true, nullable = false)
    private Long userId;

    @Column(columnDefinition = "TEXT")
    private String bio;

    // We use columnDefinition="TEXT" because a resume can be thousands of words long!
    @Column(columnDefinition = "TEXT")
    private String resumeText;

    private String resumeUrl; // The link from MinIO

    // Flag for the frontend to know when the AI worker is done
    private Boolean isAiReady = false;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "company_name")
    private String companyName;
}
