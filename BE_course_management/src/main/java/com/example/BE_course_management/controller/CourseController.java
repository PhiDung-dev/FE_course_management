package com.example.BE_course_management.controller;

import com.example.BE_course_management.dto.ApiResponse;
import com.example.BE_course_management.dto.request.CourseCreateRequest;
import com.example.BE_course_management.dto.request.CourseUpdateRequest;
import com.example.BE_course_management.dto.response.CourseResponse;
import com.example.BE_course_management.service.CourseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseController {

    CourseService courseService;

    @PostMapping
    public ApiResponse<CourseResponse> createCourse(@RequestBody CourseCreateRequest request) {
        return ApiResponse.<CourseResponse>builder()
                .result(courseService.createCourse(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<CourseResponse>> readCourses() {
        return ApiResponse.<List<CourseResponse>>builder()
                .result(courseService.readCourses())
                .build();
    }

    @GetMapping("/{courseId}")
    public ApiResponse<CourseResponse> readCourse(@PathVariable("courseId") String id) {
        return ApiResponse.<CourseResponse>builder()
                .result(courseService.readCourse(id))
                .build();
    }

    @PutMapping("/{courseId}")
    public ApiResponse<CourseResponse> updateCourse(@PathVariable("courseId") String id, @RequestBody CourseUpdateRequest request) {
        return ApiResponse.<CourseResponse>builder()
                .result(courseService.updateCourse(id,request))
                .build();
    }

    @DeleteMapping("/{courseId}")
    public ApiResponse<String> deleteCourse(@PathVariable("courseId") String id) {
        courseService.deleteCourse(id);
        return ApiResponse.<String>builder()
                .message("Course has id = "+ id + " deleted successfully")
                .build();
    }

}
