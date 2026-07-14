package com.example.BE_course_management.repository;

import com.example.BE_course_management.entity.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScoreRepository extends JpaRepository<Score,String> {

    Optional<Score> findByPaymentId(String paymentId);

}
