package com.example.BE_course_management.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScoreUpdateRequest {

    BigDecimal attendanceScore;
    BigDecimal midtermScore;
    BigDecimal finalScore;

}
