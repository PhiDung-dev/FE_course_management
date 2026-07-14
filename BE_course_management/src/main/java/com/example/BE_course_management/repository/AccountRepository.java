package com.example.BE_course_management.repository;

import com.example.BE_course_management.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account,String> {

    Optional<Account> findByUsername(String username);

    boolean existsByUsername(String username);

}
