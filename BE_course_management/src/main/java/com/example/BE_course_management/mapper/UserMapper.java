package com.example.BE_course_management.mapper;

import com.example.BE_course_management.dto.request.UserCreateRequest;
import com.example.BE_course_management.dto.request.UserUpdateRequest;
import com.example.BE_course_management.dto.response.UserResponse;
import com.example.BE_course_management.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {AccountMapper.class})
public interface UserMapper {

    @Mapping(target = "account", ignore = true)
    User toUser(UserCreateRequest request);

    UserResponse toUserResponse(User user);

    List<UserResponse> toUserResponseList(List<User> users);

    void updateUser(@MappingTarget User user, UserUpdateRequest request);

}
