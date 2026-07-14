package com.example.BE_course_management.mapper;

import com.example.BE_course_management.dto.request.ClassRoomCreateRequest;
import com.example.BE_course_management.dto.request.ClassRoomUpdateRequest;
import com.example.BE_course_management.dto.response.ClassRoomResponse;
import com.example.BE_course_management.entity.ClassRoom;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ClassRoomMapper {

    ClassRoom toClassRoom(ClassRoomCreateRequest request);

    ClassRoomResponse toClassRoomResponse(ClassRoom classRoom);

    List<ClassRoomResponse> toClassRoomResponseList(List<ClassRoom> classRooms);

    void updateClassRoom(@MappingTarget ClassRoom classRoom, ClassRoomUpdateRequest request);

}
