package com.example.career_graph_service.controller;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.career_graph_service.repository.SkillRepository;

@RestController
@RequestMapping("/graph")
public class GraphController {

    private final SkillRepository skillRepository;
    private final Neo4jClient neo4jClient;

    public GraphController(SkillRepository skillRepository, Neo4jClient neo4jClient) {
        this.skillRepository = skillRepository;
        this.neo4jClient = neo4jClient;
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

    @GetMapping("/student-visual")
    public ResponseEntity<Map<String, Object>> getStudentVisual(@RequestParam("userId") Long userId) {
        
        // 1. BULLETPROOF CYPHER: We use CASE WHEN to prevent the nodes(null) crash!
        // 1. Define the raw Cypher query
        String cypher = 
            "MATCH (u:User {id: $userId}) " +
            "MATCH (j:Job) WITH u, j LIMIT 3 " + 
            "OPTIONAL MATCH (u)-[:HAS_SKILL]->(mySkill:Skill) " +
            "OPTIONAL MATCH (j)-[:WANTS_SKILL]->(jobSkill:Skill) " +
            "WITH u, mySkill, j, jobSkill " +
            
            // 🔥 THE FIX: Only calculate paths if you DO NOT already own the target jobSkill
            "OPTIONAL MATCH path = shortestPath((mySkill)-[:LEADS_TO*1..3]->(jobSkill)) " +
            "WHERE mySkill IS NOT NULL " +
            "  AND jobSkill IS NOT NULL " +
            "  AND NOT exists((u)-[:HAS_SKILL]->(jobSkill)) " +
            "  AND mySkill <> jobSkill " +
            
            "RETURN u.id AS userId, " +
            "       mySkill.name AS userSkill, " +
            "       j.id AS jobId, " +
            "       j.title AS jobTitle, " +
            "       jobSkill.name AS jobRequirement, " +
            "       CASE WHEN path IS NOT NULL THEN [n IN nodes(path) | n.name] ELSE [] END AS roadmapNodes";

        Collection<Map<String, Object>> rawData = neo4jClient.query(cypher)
                .bind(userId).to("userId")
                .fetch().all();

        List<Map<String, Object>> nodes = new ArrayList<>();
        List<Map<String, Object>> links = new ArrayList<>();
        Set<String> seenNodes = new HashSet<>();
        
        // 🔥 PASS 1: Pre-calculate all skills the user actually owns to prevent color bugs
        Set<String> ownedSkills = new HashSet<>();
        for (Map<String, Object> row : rawData) {
            String userSkill = (String) row.get("userSkill");
            if (userSkill != null) ownedSkills.add(userSkill);
        }

        String userNodeId = "user-" + userId;

        if (!rawData.isEmpty() && seenNodes.add(userNodeId)) {
            Map<String, Object> userNode = new HashMap<>();
            userNode.put("id", userNodeId);
            userNode.put("name", "You");
            userNode.put("group", "user");
            nodes.add(userNode);
        }

        // 🔥 PASS 2: Build the Graph safely
        for (Map<String, Object> row : rawData) {
            
            // --- 1. User Skills ---
            String userSkill = (String) row.get("userSkill");
            if (userSkill != null) {
                if (seenNodes.add(userSkill)) {
                    Map<String, Object> node = new HashMap<>();
                    node.put("id", userSkill);
                    node.put("name", userSkill);
                    node.put("group", "skill_owned");
                    nodes.add(node);
                }
                
                Map<String, Object> link = new HashMap<>();
                link.put("source", userNodeId);
                link.put("target", userSkill);
                link.put("type", "HAS_SKILL");
                links.add(link);
            }

            // --- 2. Jobs and Requirements ---
            String jobTitle = (String) row.get("jobTitle");
            Object jobIdRaw = row.get("jobId");
            String jobReq = (String) row.get("jobRequirement");

            if (jobTitle != null && jobIdRaw != null) {
                String jobIdStr = "job-" + jobIdRaw.toString();
                
                if (seenNodes.add(jobIdStr)) {
                    Map<String, Object> node = new HashMap<>();
                    node.put("id", jobIdStr);
                    node.put("name", jobTitle);
                    node.put("group", "job");
                    nodes.add(node);
                }

                if (jobReq != null) {
                    if (seenNodes.add(jobReq)) {
                        Map<String, Object> node = new HashMap<>();
                        node.put("id", jobReq);
                        node.put("name", jobReq);
                        // Safe check: Is this required skill in our Pass 1 set?
                        node.put("group", ownedSkills.contains(jobReq) ? "skill_owned" : "skill_missing");
                        nodes.add(node);
                    }
                    
                    Map<String, Object> link = new HashMap<>();
                    link.put("source", jobIdStr);
                    link.put("target", jobReq);
                    link.put("type", "WANTS_SKILL");
                    links.add(link);
                }
            }

            // --- 3. Roadmap Path ---
            Object roadmapRaw = row.get("roadmapNodes");
            if (roadmapRaw instanceof List) {
                List<?> roadmapNodes = (List<?>) roadmapRaw;
                if (roadmapNodes.size() > 1) {
                    for (int i = 0; i < roadmapNodes.size() - 1; i++) {
                        String sourceSkill = String.valueOf(roadmapNodes.get(i));
                        String targetSkill = String.valueOf(roadmapNodes.get(i + 1));

                        if (seenNodes.add(targetSkill)) {
                            Map<String, Object> node = new HashMap<>();
                            node.put("id", targetSkill);
                            node.put("name", targetSkill);
                            node.put("group", ownedSkills.contains(targetSkill) ? "skill_owned" : "skill_roadmap");
                            nodes.add(node);
                        }

                        Map<String, Object> link = new HashMap<>();
                        link.put("source", sourceSkill);
                        link.put("target", targetSkill);
                        link.put("type", "LEADS_TO");
                        links.add(link);
                    }
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("nodes", nodes);
        response.put("links", links);

        return ResponseEntity.ok(response);
    }
}