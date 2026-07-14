package com.example.BE_course_management.controller;

import com.example.BE_course_management.dto.ApiResponse;
import com.example.BE_course_management.dto.request.AccountCreateRequest;
import com.example.BE_course_management.dto.request.AccountUpdatePasswordRequest;
import com.example.BE_course_management.dto.request.AccountUpdateStatusRequest;
import com.example.BE_course_management.dto.response.AccountResponse;
import com.example.BE_course_management.service.AccountService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AccountController {

    AccountService accountService;

    @PostMapping
    public ApiResponse<AccountResponse> createStudentAccount(@RequestBody AccountCreateRequest request) {
        return ApiResponse.<AccountResponse>builder()
                .result(accountService.createStudentAccount(request))
                .build();
    }

    @PostMapping("/teachers")
    public ApiResponse<AccountResponse> createTeacherAccount(@RequestBody AccountCreateRequest request) {
        return ApiResponse.<AccountResponse>builder()
                .result(accountService.createTeacherAccount(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<AccountResponse>> readAccounts() {
        return ApiResponse.<List<AccountResponse>>builder()
                .result(accountService.readAccounts())
                .build();
    }

    @GetMapping("/{accountId}")
    public ApiResponse<AccountResponse> readAccount(@PathVariable("accountId") String id) {
        return ApiResponse.<AccountResponse>builder()
                .result(accountService.readAccount(id))
                .build();
    }

    @PutMapping("/password/{accountId}")
    public ApiResponse<AccountResponse> updateAccount(@PathVariable("accountId") String id, @RequestBody AccountUpdatePasswordRequest request) {
        return ApiResponse.<AccountResponse>builder()
                .result(accountService.updatePasswordAccount(id, request))
                .build();
    }

    @PutMapping("/status/{accountId}")
    public ApiResponse<AccountResponse> updateStatusAccount(@PathVariable("accountId") String id, @RequestBody AccountUpdateStatusRequest request) {
        return ApiResponse.<AccountResponse>builder()
                .result(accountService.updateStatusAccount(id, request))
                .build();
    }

}
