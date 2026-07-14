package com.example.BE_course_management.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseUpdateRequest {

    String title;
    String description;
    Integer slot;
    BigDecimal price;
    Integer duration;
    String level;
    String category;
    String teacherId;
    List<String> images;
    List<CourseDocumentRequest> documents;

}
