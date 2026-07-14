package com.example.BE_course_management.repository;

import com.example.BE_course_management.entity.Cart;
import com.example.BE_course_management.entity.Course;
import com.example.BE_course_management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart,String> {

    boolean existsByUserAndCourse(User user, Course course);

    List<Cart> findByUserId(String userId);

}
