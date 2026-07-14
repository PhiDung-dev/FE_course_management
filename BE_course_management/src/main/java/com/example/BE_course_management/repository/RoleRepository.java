package com.example.BE_course_management.repository;

import com.example.BE_course_management.entity.Role;
import com.example.BE_course_management.entity.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {

    Optional<Role> findByRoleName(String roleName);

}
