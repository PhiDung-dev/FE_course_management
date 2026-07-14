package com.example.BE_course_management.service;

import com.example.BE_course_management.dto.request.UserCreateRequest;
import com.example.BE_course_management.dto.request.UserUpdateRequest;
import com.example.BE_course_management.dto.response.UserResponse;
import com.example.BE_course_management.entity.Account;
import com.example.BE_course_management.entity.Schedule;
import com.example.BE_course_management.entity.User;
import com.example.BE_course_management.exception.AppException;
import com.example.BE_course_management.exception.ErrorCode;
import com.example.BE_course_management.mapper.UserMapper;
import com.example.BE_course_management.repository.AccountRepository;
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
public class UserService {

    UserRepository userRepository;
    AccountRepository accountRepository;
    ScheduleRepository scheduleRepository;
    com.example.BE_course_management.repository.CourseRepository courseRepository;
    UserMapper userMapper;

    public UserResponse createUser(UserCreateRequest request) {
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        User user = userMapper.toUser(request);
        if (account.getUser() != null) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        user.setAccount(account);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public List<UserResponse> readUsers() {
        return userMapper.toUserResponseList(userRepository.findAll());
    }

    public UserResponse readUser(String id) {
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    public UserResponse updateUser(String id, UserUpdateRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        userMapper.updateUser(user, request);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(String id) {
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        List<Schedule> schedules = scheduleRepository.findByTeacherId(id);
        for (Schedule s : schedules) {
            s.setTeacher(null);
        }
        scheduleRepository.saveAll(schedules);

        List<com.example.BE_course_management.entity.Course> courses = courseRepository.findByTeacherId(id);
        for (com.example.BE_course_management.entity.Course c : courses) {
            c.setTeacher(null);
        }
        courseRepository.saveAll(courses);
        Account account = user.getAccount();
        userRepository.delete(user);
        if (account != null) {
            accountRepository.delete(account);
        }
    }

}
