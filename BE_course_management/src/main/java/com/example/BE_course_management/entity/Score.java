package com.example.BE_course_management.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    BigDecimal attendanceScore;
    BigDecimal midtermScore;
    BigDecimal finalScore;
    BigDecimal averageScore;
    @Enumerated(EnumType.STRING)
    Classification classification;

    @OneToOne
    @JoinColumn(name = "payment_id")
    Payment payment;

}
