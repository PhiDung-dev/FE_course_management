package com.example.BE_course_management.service;

import com.example.BE_course_management.dto.request.ScheduleCreateRequest;
import com.example.BE_course_management.dto.request.ScheduleUpdateRequest;
import com.example.BE_course_management.dto.response.ScheduleResponse;
import com.example.BE_course_management.entity.ClassRoom;
import com.example.BE_course_management.entity.Course;
import com.example.BE_course_management.entity.Schedule;
import com.example.BE_course_management.entity.User;
import com.example.BE_course_management.exception.AppException;
import com.example.BE_course_management.exception.ErrorCode;
import com.example.BE_course_management.mapper.ScheduleMapper;
import com.example.BE_course_management.repository.ClassRoomRepository;
import com.example.BE_course_management.repository.CourseRepository;
import com.example.BE_course_management.repository.ScheduleRepository;
import com.example.BE_course_management.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ScheduleService {

    ScheduleRepository scheduleRepository;
    ScheduleMapper scheduleMapper;
    ClassRoomRepository classRoomRepository;
    UserRepository userRepository;
    CourseRepository courseRepository;

    @Transactional
    public ScheduleResponse createSchedule(ScheduleCreateRequest request) {
        List<Schedule> teacherSchedules = scheduleRepository.findByTeacherId(request.getTeacherId());
        List<Schedule> roomSchedule = scheduleRepository.findByClassRoomId(request.getClassRoomId());
        teacherSchedules.forEach(schedule->{
            if(isConflict(schedule, request)){
                throw new AppException(ErrorCode.SCHEDULE_CONFLICT);
            }
        });
        roomSchedule.forEach(schedule -> {
            if(isConflict(schedule, request)){
                throw new AppException(ErrorCode.SCHEDULE_CONFLICT);
            }
        });
        Schedule schedule = scheduleMapper.toSchedule(request);
        User teacher = userRepository.findById(request.getTeacherId()).orElseThrow(()->new AppException(ErrorCode.USER_NOT_FOUND));
        ClassRoom classRoom = classRoomRepository.findById(request.getClassRoomId()).orElseThrow(()->new AppException(ErrorCode.CLASSROOM_NOT_FOUND));
        Course course = courseRepository.findById(request.getCourseId()).orElseThrow(()->new AppException(ErrorCode.COURSE_NOT_FOUND));
        schedule.setTeacher(teacher);
        schedule.setClassRoom(classRoom);
        schedule.setCourse(course);
        if (request.getSlot() != null) {
            schedule.setSlot(request.getSlot());
        } else {
            schedule.setSlot(course.getSlot() != null ? course.getSlot() : 30);
        }
        return scheduleMapper.toScheduleResponse(scheduleRepository.save(schedule));
    }

    public List<ScheduleResponse> readSchedules() {
        return scheduleMapper.toScheduleResponseList(scheduleRepository.findAll());
    }

    public ScheduleResponse readSchedule(String id) {
        Schedule schedule = scheduleRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));
        return scheduleMapper.toScheduleResponse(schedule);
    }

//    public ScheduleResponse updateSchedule(String id, ScheduleUpdateRequest request) {
//        Schedule schedule = scheduleRepository.findById(id).orElseThrow(()-> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));
//        List<Schedule> teacherSchedule =  scheduleRepository.findByTeacherId(request.getTeacherId());
//        List<Schedule> roomSchedule = scheduleRepository.findByClassRoomId(request.getClassRoomId());
//        teacherSchedule.forEach(s->{
//            if(isConflict(s, request)) {
//                throw new AppException(ErrorCode.SCHEDULE_CONFLICT);
//            }
//        });
//        roomSchedule.forEach(s->{
//            if(isConflict(s, request)) {
//                throw new AppException(ErrorCode.SCHEDULE_CONFLICT);
//            }
//        });
//        scheduleMapper.updateSchedule(schedule,request);
//        User teacher = userRepository.findById(request.getTeacherId()).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_FOUND));
//        ClassRoom classRoom = classRoomRepository.findById(request.getClassRoomId()).orElseThrow(()-> new AppException(ErrorCode.CLASSROOM_NOT_FOUND));
//        schedule.setTeacher(teacher);
//        schedule.setClassRoom(classRoom);
//        return scheduleMapper.toScheduleResponse(scheduleRepository.save(schedule));
//    }
    @Transactional
    public ScheduleResponse updateSchedule(String id, ScheduleUpdateRequest request) {
        Schedule schedule = scheduleRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));
        List<Schedule> teacherSchedules = scheduleRepository.findByTeacherId(request.getTeacherId());
        List<Schedule> roomSchedules = scheduleRepository.findByClassRoomId(request.getClassRoomId());
        teacherSchedules.forEach(s -> {
            if (!s.getId().equals(schedule.getId()) && isConflict(s, request)) {
                throw new AppException(ErrorCode.SCHEDULE_CONFLICT);
            }
        });
        roomSchedules.forEach(s -> {
            if (!s.getId().equals(schedule.getId()) && isConflict(s, request)) {
                throw new AppException(ErrorCode.SCHEDULE_CONFLICT);
            }
        });
        scheduleMapper.updateSchedule(schedule, request);
        User teacher = userRepository.findById(request.getTeacherId()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        ClassRoom classRoom = classRoomRepository.findById(request.getClassRoomId()).orElseThrow(() -> new AppException(ErrorCode.CLASSROOM_NOT_FOUND));
        schedule.setTeacher(teacher);
        schedule.setClassRoom(classRoom);
        if (request.getCourseId() != null && !request.getCourseId().isBlank()) {
            Course course = courseRepository.findById(request.getCourseId()).orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
            schedule.setCourse(course);
        }
        if (request.getSlot() != null) {
            schedule.setSlot(request.getSlot());
        }
        return scheduleMapper.toScheduleResponse(scheduleRepository.save(schedule));
    }

    @Transactional
    public void deleteSchedule(String id) {
        if(!scheduleRepository.existsById(id)) {
            throw new AppException(ErrorCode.SCHEDULE_NOT_FOUND);
        }
        scheduleRepository.deleteById(id);
    }

    private boolean isConflict(Schedule schedule, ScheduleCreateRequest request) {
        return schedule.getDayOfWeek()==request.getDayOfWeek()
                && (schedule.getStartTime().isBefore(request.getEndTime()) && schedule.getEndTime().isAfter(request.getStartTime()))
                && (!schedule.getStartDate().isAfter(request.getEndDate()) && !schedule.getEndDate().isBefore(request.getStartDate()));
    }

    private boolean isConflict(Schedule schedule, ScheduleUpdateRequest request) {
        return schedule.getDayOfWeek()==request.getDayOfWeek()
                && (schedule.getStartTime().isBefore(request.getEndTime()) && schedule.getEndTime().isAfter(request.getStartTime()))
                && (!schedule.getStartDate().isAfter(request.getEndDate()) && !schedule.getEndDate().isBefore(request.getStartDate()));
    }

}
