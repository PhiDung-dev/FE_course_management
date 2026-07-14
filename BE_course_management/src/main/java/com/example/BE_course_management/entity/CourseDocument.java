package com.example.BE_course_management.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String title;
    String url;

    @ManyToOne
    @JoinColumn(name = "course_id")
    Course course;

}
