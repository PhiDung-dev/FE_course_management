package com.example.BE_course_management.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScheduleCreateRequest {

    LocalTime startTime;
    LocalTime endTime;
    DayOfWeek dayOfWeek;
    LocalDate startDate;
    LocalDate endDate;
    Integer slot;
    String classRoomId;
    String courseId;
    String teacherId;

}
