package com.example.BE_course_management.repository;

import com.example.BE_course_management.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating,String> {

    boolean existsByPaymentId(String paymentId);

    Optional<Rating> findByPaymentId(String paymentId);

}
