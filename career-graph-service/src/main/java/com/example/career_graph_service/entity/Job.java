package com.example.career_graph_service.entity;

import java.util.HashSet;
import java.util.Set;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

@Node("Job")
public class Job {

    @Id
    private Long id;
    private String title;

    @Relationship(type = "WANTS_SKILL", direction = Relationship.Direction.OUTGOING)
    private Set<Skill> requiredSkills = new HashSet<>();

    public Job() {}

    public Job(Long id, String title) {
        this.id = id;
        this.title = title;
    }
    public Set<Skill> getRequiredSkills() {
        return requiredSkills;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}