package com.example.BE_course_management.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseResponse {

    String id;
    String title;
    String description;
    Integer slot;
    BigDecimal price;
    Integer duration;
    String level;
    String category;
    String teacherId;
    List<String> imgs;
    List<CourseDocumentResponse> documents;

}
