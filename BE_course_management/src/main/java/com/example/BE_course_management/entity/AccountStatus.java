package com.example.BE_course_management.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AccountStatus {

    ACTIVE("ACTIVE"),
    BLOCKED("BLOCKED");

    private final String status;

}
