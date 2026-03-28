package com.example.career_graph_service.entity;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

@Node("Skill")
public class Skill {

    @Id
    private String name;
    public Skill() {}
    public Skill(String name) {
        this.name = name;
    }

    // Explicit Getter/Setter
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}