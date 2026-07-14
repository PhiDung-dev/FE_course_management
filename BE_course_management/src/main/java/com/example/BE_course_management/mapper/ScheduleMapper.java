package com.example.BE_course_management.mapper;

import com.example.BE_course_management.dto.request.ScheduleCreateRequest;
import com.example.BE_course_management.dto.request.ScheduleUpdateRequest;
import com.example.BE_course_management.dto.response.ScheduleResponse;
import com.example.BE_course_management.entity.Schedule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ClassRoomMapper.class, CourseMapper.class, UserMapper.class})
public interface ScheduleMapper {

    @Mapping(target = "teacher", ignore = true)
    @Mapping(target = "course", ignore = true)
    @Mapping(target = "classRoom", ignore = true)
    Schedule toSchedule(ScheduleCreateRequest request);

    ScheduleResponse toScheduleResponse(Schedule schedule);

    List<ScheduleResponse> toScheduleResponseList(List<Schedule> schedules);

    @Mapping(target = "teacher", ignore = true)
    @Mapping(target = "course", ignore = true)
    @Mapping(target = "classRoom", ignore = true)
    void updateSchedule(@MappingTarget Schedule schedule, ScheduleUpdateRequest request);

}
