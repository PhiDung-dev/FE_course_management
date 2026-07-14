package com.example.BE_course_management.mapper;

import com.example.BE_course_management.dto.response.RoleResponse;
import com.example.BE_course_management.entity.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    RoleResponse toRoleResponse(Role role);

}
