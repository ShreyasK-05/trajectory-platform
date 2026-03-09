package com.example.career_graph_service.repository;

import java.util.List;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.career_graph_service.entity.Skill;

@Repository
public interface SkillRepository extends Neo4jRepository<Skill, String> {

    // FIXED: Match both User and Job first, then check the missing relationship
    @Query("MATCH (u:User {id: $userId}), (j:Job {id: $jobId}) " +
           "MATCH (j)-[:WANTS_SKILL]->(s:Skill) " +
           "WHERE NOT (u)-[:HAS_SKILL]->(s) " +
           "RETURN s.name")
    List<String> findMissingSkills(@Param("userId") Long userId, @Param("jobId") Long jobId);

    // This query is fine, but ensure the shortestPath syntax matches your Neo4j version
    @Query("MATCH (u:User {id: $userId})-[:HAS_SKILL]->(known:Skill) " +
           "MATCH (target:Skill {name: $targetSkillName}) " +
           "MATCH p = shortestPath((known)-[:LEADS_TO*..5]->(target)) " +
           "WITH p ORDER BY length(p) ASC LIMIT 1 " +
           "UNWIND nodes(p) AS n " +
           "RETURN n.name")
    List<String> getCareerPath(@Param("userId") Long userId, @Param("targetSkillName") String targetSkillName);
}