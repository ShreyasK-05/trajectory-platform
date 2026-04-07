package com.example.career_graph_service.repository;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import com.example.career_graph_service.entity.User;

@Repository
public interface UserRepository extends Neo4jRepository<User, Long> {
}