package com.example.BE_course_management.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingResponse {

    String id;
    String description;
    String status;
    BigDecimal totalPrice;
    ScheduleResponse schedule;
    UserResponse user;
    java.time.LocalDate createdAt;

}
