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
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    Integer score;
    @Lob
    String comment;

    @OneToOne
    @JoinColumn(name = "payment_id", unique = true)
    Payment payment;

}
