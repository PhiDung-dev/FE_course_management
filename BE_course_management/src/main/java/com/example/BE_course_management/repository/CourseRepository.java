package com.example.BE_course_management.repository;

import com.example.BE_course_management.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {

    boolean existsByTitle(String title);

    List<Course> findByTeacherId(String teacherId);

}
