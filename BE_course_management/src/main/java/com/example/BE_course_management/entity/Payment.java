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
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @Enumerated(EnumType.STRING)
    PaymentStatus status;
    BigDecimal amount;

    @OneToOne
    @JoinColumn(name = "booking_id", unique = true)
    Booking booking;

    @OneToOne(mappedBy = "payment", cascade = CascadeType.REMOVE)
    Rating rating;

    @OneToOne(mappedBy = "payment", cascade = CascadeType.REMOVE)
    Score score;

}
