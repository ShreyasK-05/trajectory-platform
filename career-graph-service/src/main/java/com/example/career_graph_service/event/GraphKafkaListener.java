package com.example.career_graph_service.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.example.career_graph_service.entity.Job;
import com.example.career_graph_service.entity.Skill;
import com.example.career_graph_service.entity.User;
import com.example.career_graph_service.repository.JobRepository;
import com.example.career_graph_service.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GraphKafkaListener {

    private static final Logger log = LoggerFactory.getLogger(GraphKafkaListener.class);
    
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ObjectMapper objectMapper;

    public GraphKafkaListener(UserRepository userRepository, JobRepository jobRepository) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.objectMapper = new ObjectMapper();
        log.info("🎧 GraphKafkaListener initialized for CLEAN AI topics!");
    }

    @KafkaListener(
        topics = {"trajectory.ai.skills.extracted", "trajectory.ai.job_skills.extracted"}, 
        groupId = "trajectory-graph-group-v5", // Incremented version to ensure fresh consumption
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeCleanAiEvent(String message) {
        try {
            JsonNode payload = objectMapper.readTree(message);
            
            // Check status from AI Worker
            if (!"SUCCESS".equals(payload.get("status").asText())) return;

            String entityType = payload.get("entityType").asText();
            Long entityId = payload.get("entityId").asLong();
            JsonNode skillsNode = payload.get("extractedSkills");

            if ("USER".equals(entityType)) {
                handleUserUpdate(entityId, skillsNode);
            } else if ("JOB".equals(entityType)) {
                handleJobUpdate(entityId, skillsNode);
            }

        } catch (Exception e) {
            log.error("❌ Error processing clean AI event: {}", e.getMessage());
        }
    }

    private void handleUserUpdate(Long userId, JsonNode skillsNode) {
        User user = userRepository.findById(userId).orElse(new User(userId));
        user.getSkills().clear(); 

        if (skillsNode != null && skillsNode.isArray()) {
            skillsNode.forEach(skillNode -> {
                // Creates a separate node for each individual skill
                user.getSkills().add(new Skill(skillNode.asText().toLowerCase().trim()));
            });
        }

        userRepository.save(user);
        log.info("✅ Neo4j Sync: Updated User {} with {} individual skills", userId, user.getSkills().size());
    }

    private void handleJobUpdate(Long jobId, JsonNode skillsNode) {
        // Fetch or create a Job placeholder
        Job job = jobRepository.findById(jobId).orElse(new Job(jobId, "AI Processed Job"));
        job.getRequiredSkills().clear();

        if (skillsNode != null && skillsNode.isArray()) {
            skillsNode.forEach(skillNode -> {
                // Creates a separate node for each requirement
                job.getRequiredSkills().add(new Skill(skillNode.asText().toLowerCase().trim()));
            });
        }

        jobRepository.save(job);
        log.info("✅ Neo4j Sync: Updated Job {} with {} requirements", jobId, job.getRequiredSkills().size());
    }
}