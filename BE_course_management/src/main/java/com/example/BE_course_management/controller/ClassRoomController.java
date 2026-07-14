package com.example.BE_course_management.controller;

import com.example.BE_course_management.dto.ApiResponse;
import com.example.BE_course_management.dto.request.ClassRoomCreateRequest;
import com.example.BE_course_management.dto.request.ClassRoomUpdateRequest;
import com.example.BE_course_management.dto.response.ClassRoomResponse;
import com.example.BE_course_management.service.ClassRoomService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/classRooms")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ClassRoomController {

    ClassRoomService classRoomService;

    @PostMapping
    public ApiResponse<ClassRoomResponse> createClassRoom(@RequestBody ClassRoomCreateRequest request) {
        return ApiResponse.<ClassRoomResponse>builder()
                .result(classRoomService.createClassRoom(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<ClassRoomResponse>> readClassRooms() {
        return ApiResponse.<List<ClassRoomResponse>>builder()
                .result(classRoomService.readClassRooms())
                .build();
    }

    @GetMapping("/{classRoomId}")
    public ApiResponse<ClassRoomResponse> readClassRoom(@PathVariable("classRoomId") String id) {
        return ApiResponse.<ClassRoomResponse>builder()
                .result(classRoomService.readClassRoom(id))
                .build();
    }

    @PutMapping("/{classRoomId}")
    public ApiResponse<ClassRoomResponse> updateClassRoom(@PathVariable("classRoomId") String id, @RequestBody ClassRoomUpdateRequest request) {
        return ApiResponse.<ClassRoomResponse>builder()
                .result(classRoomService.updateClassRoom(id, request))
                .build();
    }

    @DeleteMapping("/{classRoomId}")
    public ApiResponse<String> deleteClassRooms(@PathVariable("classRoomId") String id) {
        classRoomService.deleteClassRoom(id);
        return ApiResponse.<String>builder()
                .message("Class room has id = "+ id +" deleted successfully")
                .build();
    }

}
