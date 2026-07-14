package com.example.BE_course_management.controller;

import com.example.BE_course_management.dto.ApiResponse;
import com.example.BE_course_management.dto.request.ScoreUpdateRequest;
import com.example.BE_course_management.dto.response.ScoreResponse;
import com.example.BE_course_management.service.ScoreService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/scores")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ScoreController {

    ScoreService scoreService;

    @GetMapping
    public ApiResponse<List<ScoreResponse>> readScores() {
        return ApiResponse.<List<ScoreResponse>>builder()
                .result(scoreService.readScores())
                .build();
    }

    @GetMapping("/payment/{paymentId}")
    public ApiResponse<ScoreResponse> readScoreByPaymentId(@PathVariable("paymentId") String paymentId){
        return ApiResponse.<ScoreResponse>builder()
                .result(scoreService.readScoreByPaymentId(paymentId))
                .build();
    }

    @GetMapping("/{scoreId}")
    public ApiResponse<ScoreResponse> readScore(@PathVariable("scoreId") String id) {
        return ApiResponse.<ScoreResponse>builder()
                .result(scoreService.readScore(id))
                .build();
    }

    @PostMapping("/payment/{paymentId}")
    public ApiResponse<ScoreResponse> createScore(@PathVariable("paymentId") String paymentId, @RequestBody ScoreUpdateRequest request) {
        return ApiResponse.<ScoreResponse>builder()
                .result(scoreService.createScore(paymentId, request))
                .build();
    }

    @PutMapping("/{scoreId}")
    public ApiResponse<ScoreResponse> updateScore(@PathVariable("scoreId") String id, @RequestBody ScoreUpdateRequest request) {
        return ApiResponse.<ScoreResponse>builder()
                .result(scoreService.updateScore(id, request))
                .build();
    }

}
