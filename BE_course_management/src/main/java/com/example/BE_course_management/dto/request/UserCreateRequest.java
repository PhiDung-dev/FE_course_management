package com.example.BE_course_management.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreateRequest {

    String fullName;
    String email;
    String phoneNumber;
    String address;
    LocalDate dateOfBirth;
    String accountId;
    String avatar;

}
