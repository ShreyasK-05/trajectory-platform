package com.example.user_profile_service.repository;

import com.example.user_profile_service.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByRecruiterIdOrderByIdDesc(Long recruiterId);
}
