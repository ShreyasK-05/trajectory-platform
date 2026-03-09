package com.example.career_graph_service.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.career_graph_service.repository.SkillRepository;

@RestController
@RequestMapping("/api/graph")
public class GraphController {

    private final SkillRepository skillRepository;

    public GraphController(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    @GetMapping("/gap-analysis")
    public ResponseEntity<Map<String, Object>> getGapAnalysis(
            @RequestParam("userId") Long userId,
            @RequestParam("jobId") Long jobId) {

        List<String> missingSkills = skillRepository.findMissingSkills(userId, jobId);
        if (missingSkills == null) {
            missingSkills = new ArrayList<>();
        }

        Map<String, List<String>> trajectories = new HashMap<>();
        for (String skill : missingSkills) {
            List<String> path = skillRepository.getCareerPath(userId, skill);
            if (path != null && !path.isEmpty()) {
                trajectories.put(skill, path);
            } else {
                trajectories.put(skill, List.of("No path found yet"));
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("jobId", jobId);
        response.put("missingSkills", missingSkills);
        response.put("trajectories", trajectories);

        return ResponseEntity.ok(response);
    }
}