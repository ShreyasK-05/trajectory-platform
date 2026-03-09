package com.example.career_graph_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient // This tells the service to register with Eureka!
public class CareerGraphServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CareerGraphServiceApplication.class, args);
    }
}