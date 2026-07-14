package com.example.BE_course_management.service;

import com.example.BE_course_management.dto.request.CourseCreateRequest;
import com.example.BE_course_management.dto.request.CourseUpdateRequest;
import com.example.BE_course_management.dto.response.CourseResponse;
import com.example.BE_course_management.entity.Course;
import com.example.BE_course_management.entity.CourseDocument;
import com.example.BE_course_management.entity.CourseImage;
import com.example.BE_course_management.entity.User;
import com.example.BE_course_management.exception.AppException;
import com.example.BE_course_management.exception.ErrorCode;
import com.example.BE_course_management.mapper.CourseMapper;
import com.example.BE_course_management.repository.CourseRepository;
import com.example.BE_course_management.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseService {

    CourseRepository courseRepository;
    CourseMapper courseMapper;
    UserRepository userRepository;

     @Transactional
     public CourseResponse createCourse(CourseCreateRequest request) {
         if(courseRepository.existsByTitle(request.getTitle().trim())) {
             throw new AppException(ErrorCode.COURSE_EXISTED);
         }
         Course course = courseMapper.toCourse(request);
         if (request.getTeacherId() != null && !request.getTeacherId().isBlank()) {
             User teacher = userRepository.findById(request.getTeacherId())
                 .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
             course.setTeacher(teacher);
         }
         List<CourseImage> courseImages = request.getImages() != null
             ? request.getImages().stream().map(img -> CourseImage.builder().url(img).course(course).build()).toList()
             : Collections.emptyList();
         List<CourseDocument> courseDocuments = request.getDocuments() != null
             ? request.getDocuments().stream().map(doc -> CourseDocument.builder().title(doc.getTitle()).url(doc.getUrl()).course(course).build()).toList()
             : Collections.emptyList();
         course.setCourseImages(courseImages);
         course.setCourseDocuments(courseDocuments);
         return courseMapper.toCourseResponse(courseRepository.save(course));
     }

    public CourseResponse readCourse(String id) {
        Course course = courseRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.COURSE_NOT_FOUND));
        return courseMapper.toCourseResponse(course);
    }

    public List<CourseResponse> readCourses() {
        return courseMapper.toCourseResponseList(courseRepository.findAll());
    }

     @Transactional
     public CourseResponse updateCourse(String id, CourseUpdateRequest request) {
         Course course = courseRepository.findById(id).orElseThrow(()-> new AppException(ErrorCode.COURSE_NOT_FOUND));
         courseMapper.updateCourse(course,request);
         if (request.getTeacherId() != null && !request.getTeacherId().isBlank()) {
             User teacher = userRepository.findById(request.getTeacherId())
                 .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
             course.setTeacher(teacher);
         } else {
             course.setTeacher(null);
         }
         if (request.getImages() != null) {
             course.getCourseImages().clear();
             request.getImages().forEach(img -> course.getCourseImages().add(
                 CourseImage.builder().url(img).course(course).build()));
         }
         if (request.getDocuments() != null) {
             course.getCourseDocuments().clear();
             request.getDocuments().forEach(doc -> course.getCourseDocuments().add(
                 CourseDocument.builder().title(doc.getTitle()).url(doc.getUrl()).course(course).build()));
         }
         return courseMapper.toCourseResponse(courseRepository.save(course));
     }

     @Transactional
     public void deleteCourse(String id) {
         if(!courseRepository.existsById(id)) {
             throw new AppException(ErrorCode.COURSE_NOT_FOUND);
         }
         courseRepository.deleteById(id);
     }

}
