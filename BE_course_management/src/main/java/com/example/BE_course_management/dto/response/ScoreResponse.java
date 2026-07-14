package com.example.BE_course_management.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScoreResponse {

    String id;
    BigDecimal attendanceScore;
    BigDecimal midtermScore;
    BigDecimal finalScore;
    BigDecimal averageScore;
    String classification;
    PaymentResponse payment;

}
