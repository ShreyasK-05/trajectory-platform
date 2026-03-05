package com.example.user_profile_service.service;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Service
public class FileStorageService {

    private final MinioClient minioClient;
    private final String bucketName;

    public FileStorageService(MinioClient minioClient, @Value("${minio.bucket-name}") String bucketName) {
        this.minioClient = minioClient;
        this.bucketName = bucketName;
    }

    public String uploadFile(MultipartFile file, Long userId) {
        try {
            // 1. Check if the "resumes" bucket exists. If not, create it automatically!
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }

            // 2. Create a highly secure, unique file name (e.g., 1_a8b9c.pdf)
            // We do this so if two users upload "resume.pdf", they don't overwrite each other!
            String fileName = userId + "_" + UUID.randomUUID() + ".pdf";

            // 3. Upload the file to MinIO
            InputStream inputStream = file.getInputStream();
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            // 4. Return the permanent download URL
            return "http://localhost:9000/" + bucketName + "/" + fileName;

        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to MinIO: " + e.getMessage());
        }
    }
}
