package com.example.BE_course_management.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RequiredArgsConstructor
@Getter
@FieldDefaults(makeFinal = true)
public enum Roles {

    STUDENT,
    TEACHER,
    ADMIN

}
