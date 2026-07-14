package com.example.BE_course_management.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ClassRoomStatus {

    AVAILABLE("AVAILABLE"),
    OCCUPIED("OCCUPIED"),
    MAINTENANCE("MAINTENANCE");

    private final String status;

}
