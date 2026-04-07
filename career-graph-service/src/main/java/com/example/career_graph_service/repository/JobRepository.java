package com.example.career_graph_service.repository;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import com.example.career_graph_service.entity.Job;

@Repository
public interface JobRepository extends Neo4jRepository<Job, Long> {
}