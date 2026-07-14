package com.example.BE_course_management.repository;

import com.example.BE_course_management.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment,String> {

    Optional<Payment> findByBookingId(String bookingId);

    List<Payment> findByStatus(String status);

    boolean existsByBookingId(String bookingId);

}
