package com.example.BE_course_management.repository;

import com.example.BE_course_management.entity.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassRoomRepository extends JpaRepository<ClassRoom,String> {

    boolean existsByName(String name);

}
