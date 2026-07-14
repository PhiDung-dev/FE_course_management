package com.example.BE_course_management.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @Column(unique=true)
    String title;
    @Lob
    String description;
    Integer slot;
    BigDecimal price;
    Integer duration;
    String level;
    String category;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    User teacher;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    List<CourseImage> courseImages;

    @OneToMany(mappedBy = "course")
    List<Schedule> schedules;

    @OneToMany(mappedBy = "course")
    List<Cart> carts;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    List<CourseDocument> courseDocuments;

}
