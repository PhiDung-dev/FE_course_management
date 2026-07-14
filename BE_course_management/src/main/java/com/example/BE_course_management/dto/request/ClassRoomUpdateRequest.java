package com.example.BE_course_management.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassRoomUpdateRequest {

    String name;
    Integer capacity;
    String location;
    String equipment;
    String status;

}
