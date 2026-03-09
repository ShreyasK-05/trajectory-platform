package com.example.career_graph_service.entity;

import java.util.HashSet;
import java.util.Set;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

@Node("User")
public class User {

    @Id
    private Long id;

    @Relationship(type = "HAS_SKILL", direction = Relationship.Direction.OUTGOING)
    private Set<Skill> skills = new HashSet<>();

    public User() {}

    public User(Long id) {
        this.id = id;
    }
    public Set<Skill> getSkills() {
        return skills;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
}