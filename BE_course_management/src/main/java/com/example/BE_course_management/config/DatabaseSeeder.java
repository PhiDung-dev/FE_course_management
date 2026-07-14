package com.example.BE_course_management.config;

import com.example.BE_course_management.entity.Account;
import com.example.BE_course_management.entity.AccountStatus;
import com.example.BE_course_management.entity.Role;
import com.example.BE_course_management.entity.Roles;
import com.example.BE_course_management.entity.User;
import com.example.BE_course_management.repository.AccountRepository;
import com.example.BE_course_management.repository.RoleRepository;
import com.example.BE_course_management.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (roleRepository.findByRoleName(Roles.ADMIN.name()).isEmpty()) {
            roleRepository.save(Role.builder().id("role-admin").roleName(Roles.ADMIN.name()).build());
        }
        if (roleRepository.findByRoleName(Roles.TEACHER.name()).isEmpty()) {
            roleRepository.save(Role.builder().id("role-teacher").roleName(Roles.TEACHER.name()).build());
        }
        if (roleRepository.findByRoleName(Roles.STUDENT.name()).isEmpty()) {
            roleRepository.save(Role.builder().id("role-student").roleName(Roles.STUDENT.name()).build());
        }
        if (accountRepository.findByUsername("admin@gmail.com").isEmpty()) {
            Role adminRole = roleRepository.findByRoleName(Roles.ADMIN.name()).orElseThrow();
            Account adminAccount = Account.builder()
                    .username("admin@gmail.com")
                    .password(passwordEncoder.encode("admin123"))
                    .status(AccountStatus.ACTIVE)
                    .role(adminRole)
                    .build();
            accountRepository.save(adminAccount);

            if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
                User adminUser = User.builder()
                        .fullName("Admin")
                        .email("admin@gmail.com")
                        .phoneNumber("0900000000")
                        .account(adminAccount)
                        .build();
                userRepository.save(adminUser);
            }
            log.info("Admin account created: username=admin@gmail.com, password=admin123");
        } else {
            log.info("Admin account already exists");
        }
    }
}
