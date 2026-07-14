package com.example.BE_course_management.controller;

import com.example.BE_course_management.dto.ApiResponse;
import com.example.BE_course_management.dto.request.ScheduleCreateRequest;
import com.example.BE_course_management.dto.request.ScheduleUpdateRequest;
import com.example.BE_course_management.dto.response.ScheduleResponse;
import com.example.BE_course_management.service.ScheduleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ScheduleController {

    ScheduleService scheduleService;

    @PostMapping
    public ApiResponse<ScheduleResponse> createSchedule(@RequestBody ScheduleCreateRequest request) {
        return ApiResponse.<ScheduleResponse>builder()
                .result(scheduleService.createSchedule(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<ScheduleResponse>> readSchedules(){
        return ApiResponse.<List<ScheduleResponse>>builder()
                .result(scheduleService.readSchedules())
                .build();
    }

    @GetMapping("/{scheduleId}")
    public ApiResponse<ScheduleResponse> readSchedule(@PathVariable("scheduleId") String scheduleId) {
        return ApiResponse.<ScheduleResponse>builder()
                .result(scheduleService.readSchedule(scheduleId))
                .build();
    }

    @PutMapping("/{scheduleId}")
    public ApiResponse<ScheduleResponse> updateSchedule(@PathVariable("scheduleId") String id, @RequestBody ScheduleUpdateRequest request) {
        return ApiResponse.<ScheduleResponse>builder()
                .result(scheduleService.updateSchedule(id,request))
                .build();
    }

    @DeleteMapping("/{scheduleId}")
    public ApiResponse<String> deleteSchedule(@PathVariable("scheduleId") String scheduleId) {
        scheduleService.deleteSchedule(scheduleId);
        return ApiResponse.<String>builder()
                .message("Schedule has id = "+ scheduleId +" deleted successfully")
                .build();
    }

}
