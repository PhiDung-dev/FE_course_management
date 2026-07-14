package com.example.BE_course_management.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String name;
    Integer capacity;
    String location;
    String equipment;
    @Enumerated(EnumType.STRING)
    ClassRoomStatus status;

    @OneToMany(mappedBy = "classRoom")
    List<Schedule> schedules;

}
