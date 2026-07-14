package com.example.BE_course_management.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String fullName;
    @Column(unique = true)
    String email;
    @Column(unique = true)
    String phoneNumber;
    String address;
    LocalDate dateOfBirth;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    String avatar;

    @OneToOne
    @JoinColumn(name = "account_id", unique = true)
    Account account;

    @OneToMany(mappedBy = "teacher")
    List<Schedule> schedules;

    @OneToMany(mappedBy = "teacher")
    List<Course> courses;

    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE)
    List<Cart> carts;

    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE)
    List<Booking> bookings;
    
}
