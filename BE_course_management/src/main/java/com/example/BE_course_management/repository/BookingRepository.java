package com.example.BE_course_management.repository;

import com.example.BE_course_management.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking,String> {

    List<Booking> findByUserId(String userId);
    List<Booking> findByStatus(String status);
    boolean existsByUserIdAndScheduleId(String userId, String scheduleId);

}
