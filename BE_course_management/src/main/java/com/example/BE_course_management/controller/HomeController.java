package com.example.BE_course_management.controller;

import com.example.BE_course_management.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ApiResponse<Map<String, String>> home() {
        return ApiResponse.<Map<String, String>>builder()
                .message("Course Management API is running")
                .result(Map.of(
                        "status", "ok",
                        "frontend", "http://localhost:5173",
                        "docs", "Use /schedules, /courses, /classRooms, /users, /authentication/login"
                ))
                .build();
    }
}
