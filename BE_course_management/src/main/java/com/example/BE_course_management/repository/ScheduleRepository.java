package com.example.BE_course_management.repository;

import com.example.BE_course_management.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule,String> {

    List<Schedule> findByTeacherId(String userId);

    List<Schedule> findByClassRoomId(String classRoomId);

}
