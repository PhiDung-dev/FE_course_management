package com.example.BE_course_management.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    LocalTime startTime;
    LocalTime endTime;
    @Enumerated(EnumType.STRING)
    DayOfWeek dayOfWeek;
    LocalDate startDate;
    LocalDate endDate;
    Integer slot;
    @ManyToOne
    @JoinColumn(name = "class_room_id")
    ClassRoom classRoom;

    @ManyToOne
    @JoinColumn(name = "course_id")
    Course course;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    User teacher;

    @OneToMany(mappedBy = "schedule")
    List<Booking> booking;

}
