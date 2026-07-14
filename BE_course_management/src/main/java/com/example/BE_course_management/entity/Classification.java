package com.example.BE_course_management.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Getter
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true)
public enum Classification {

    NOT_GRADED("chua xep loai"),
    EXCELLENT("xuat sac"),
    GOOD("gioi"),
    FAIR("kha"),
    AVERAGE("trung binh"),
    WEAK("yeu")
    ;
    String grade;

}

