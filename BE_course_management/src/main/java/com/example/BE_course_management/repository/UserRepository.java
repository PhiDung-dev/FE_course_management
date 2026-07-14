package com.example.BE_course_management.repository;

import com.example.BE_course_management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User,String> {
    java.util.Optional<User> findByEmail(String email);
}
