package com.example.BE_course_management.service;

import com.example.BE_course_management.dto.request.ClassRoomCreateRequest;
import com.example.BE_course_management.dto.request.ClassRoomUpdateRequest;
import com.example.BE_course_management.dto.response.ClassRoomResponse;
import com.example.BE_course_management.entity.ClassRoom;
import com.example.BE_course_management.exception.AppException;
import com.example.BE_course_management.exception.ErrorCode;
import com.example.BE_course_management.mapper.ClassRoomMapper;
import com.example.BE_course_management.repository.ClassRoomRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ClassRoomService {

    ClassRoomMapper classRoomMapper;
    ClassRoomRepository classRoomRepository;
    com.example.BE_course_management.repository.ScheduleRepository scheduleRepository;

    @Transactional
    public ClassRoomResponse createClassRoom(ClassRoomCreateRequest request) {
        if(classRoomRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.CLASSROOM_EXISTED);
        }
        ClassRoom classRoom = classRoomMapper.toClassRoom(request);
        return classRoomMapper.toClassRoomResponse(classRoomRepository.save(classRoom));
    }

    public List<ClassRoomResponse> readClassRooms() {
        return classRoomMapper.toClassRoomResponseList(classRoomRepository.findAll());
    }

    public ClassRoomResponse readClassRoom(String id) {
        ClassRoom classRoom = classRoomRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.CLASSROOM_NOT_FOUND));
        return classRoomMapper.toClassRoomResponse(classRoom);
    }

    @Transactional
    public ClassRoomResponse updateClassRoom(String id, ClassRoomUpdateRequest request) {
        ClassRoom classRoom = classRoomRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.CLASSROOM_NOT_FOUND));
        classRoomMapper.updateClassRoom(classRoom,request);
        return classRoomMapper.toClassRoomResponse(classRoomRepository.save(classRoom));
    }

    @Transactional
    public void deleteClassRoom(String id) {
        if(!classRoomRepository.existsById(id)) {
            throw new AppException(ErrorCode.CLASSROOM_NOT_FOUND);
        }
        List<com.example.BE_course_management.entity.Schedule> schedules = scheduleRepository.findByClassRoomId(id);
        for(com.example.BE_course_management.entity.Schedule s : schedules) {
            s.setClassRoom(null);
        }
        scheduleRepository.saveAll(schedules);
        classRoomRepository.deleteById(id);
    }

}
