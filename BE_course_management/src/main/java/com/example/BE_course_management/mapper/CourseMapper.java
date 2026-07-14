package com.example.BE_course_management.mapper;

import com.example.BE_course_management.dto.request.CourseCreateRequest;
import com.example.BE_course_management.dto.request.CourseUpdateRequest;
import com.example.BE_course_management.dto.response.CourseDocumentResponse;
import com.example.BE_course_management.dto.response.CourseResponse;
import com.example.BE_course_management.entity.Course;
import com.example.BE_course_management.entity.CourseDocument;
import com.example.BE_course_management.entity.CourseImage;
import com.example.BE_course_management.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CourseMapper {

    @Mapping(target = "teacher", ignore = true)
    @Mapping(target = "courseImages", ignore = true)
    @Mapping(target = "courseDocuments", ignore = true)
    Course toCourse(CourseCreateRequest request);

    @Mapping(target = "imgs", source = "courseImages")
    @Mapping(target = "documents", source = "courseDocuments")
    @Mapping(target = "teacherId", source = "teacher", qualifiedByName = "mapTeacherId")
    CourseResponse toCourseResponse(Course course);

    List<CourseResponse> toCourseResponseList(List<Course> courses);

    @Mapping(target = "teacher", ignore = true)
    @Mapping(target = "courseImages", ignore = true)
    @Mapping(target = "courseDocuments", ignore = true)
    void updateCourse(@MappingTarget Course course, CourseUpdateRequest request);

    default String map(CourseImage courseImage) {
        return courseImage.getUrl();
    }

    default CourseDocumentResponse map(CourseDocument document){
        return CourseDocumentResponse.builder()
                .title(document.getTitle())
                .url(document.getUrl())
                .build();
    }

    @Named("mapTeacherId")
    default String mapTeacherId(User teacher) {
        return teacher != null ? teacher.getId() : null;
    }

}
