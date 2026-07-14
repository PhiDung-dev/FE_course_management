package com.example.BE_course_management.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {

    String id;
    String fullName;
    String email;
    String phoneNumber;
    String address;
    LocalDate dateOfBirth;
    String avatar;
    AccountResponse account;

}
