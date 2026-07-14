package com.example.BE_course_management.dto.response;

import com.example.BE_course_management.entity.AccountStatus;
import com.example.BE_course_management.entity.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AccountResponse {

    String id;
    String username;
    AccountStatus status;
    RoleResponse role;

}
