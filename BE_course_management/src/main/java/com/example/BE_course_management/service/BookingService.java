package com.example.BE_course_management.service;

import com.example.BE_course_management.dto.request.BookingCreateRequest;
import com.example.BE_course_management.dto.request.BookingUpdateRequest;
import com.example.BE_course_management.dto.response.BookingResponse;
import com.example.BE_course_management.entity.*;
import com.example.BE_course_management.exception.AppException;
import com.example.BE_course_management.exception.ErrorCode;
import com.example.BE_course_management.mapper.BookingMapper;
import com.example.BE_course_management.repository.AccountRepository;
import com.example.BE_course_management.repository.BookingRepository;
import com.example.BE_course_management.repository.CourseRepository;
import com.example.BE_course_management.repository.ScheduleRepository;
import com.example.BE_course_management.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingService {

    BookingRepository bookingRepository;
    BookingMapper bookingMapper;
    ScheduleRepository scheduleRepository;
    UserRepository userRepository;
    AccountRepository accountRepository;

    private User resolveUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            return userOpt.get();
        }
        Optional<Account> accountOpt = accountRepository.findById(userId);
        if (accountOpt.isPresent()) {
            Account account = accountOpt.get();
            if (account.getUser() != null) {
                return account.getUser();
            }
            User newUser = User.builder()
                    .fullName(account.getUsername())
                    .email(account.getUsername())
                    .account(account)
                    .build();
            return userRepository.save(newUser);
        }
        throw new AppException(ErrorCode.USER_NOT_FOUND);
    }

    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request) {
        User user = resolveUser(request.getUserId());
        if(bookingRepository.existsByUserIdAndScheduleId(user.getId(), request.getScheduleId())) {
            throw new AppException(ErrorCode.BOOKING_EXISTED);
        }
        Schedule schedule = scheduleRepository.findById(request.getScheduleId()).orElseThrow(()->new AppException(ErrorCode.SCHEDULE_NOT_FOUND));
        Integer slot = schedule.getSlot();
        if(slot == null || slot <= 0) {
            throw new AppException(ErrorCode.SLOT_UNAVAILABLE);
        }
        schedule.setSlot(slot - 1);
        scheduleRepository.save(schedule);
        Booking booking = bookingMapper.toBooking(request);
        booking.setSchedule(schedule);
        booking.setUser(user);
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalPrice(schedule.getCourse().getPrice());
        booking.setCreatedAt(java.time.LocalDate.now());
        return bookingMapper.toBookingResponse(bookingRepository.save(booking));
    }

    public List<BookingResponse> readBookings() {
        return bookingMapper.toBookingResponseList(bookingRepository.findAll());
    }

    public List<BookingResponse> readBookingsByUserId(String userId) {
        User user = resolveUser(userId);
        List<Booking> bookings = bookingRepository.findByUserId(user.getId());
        return bookingMapper.toBookingResponseList(bookings);
    }

    public List<BookingResponse> readBookingsByStatus(String status) {
        List<Booking> bookings = bookingRepository.findByStatus(status);
        return bookingMapper.toBookingResponseList(bookings);
    }

    public BookingResponse readBooking(String id) {
        Booking booking = bookingRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.BOOKING_NOT_FOUND));
        return bookingMapper.toBookingResponse(booking);
    }

    @Transactional
    public BookingResponse updateBooking(String id, BookingUpdateRequest request) {
        Booking booking = bookingRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.BOOKING_NOT_FOUND));
        bookingMapper.updateBooking(booking, request);
        return bookingMapper.toBookingResponse(bookingRepository.save(booking));
    }

    @Transactional
    public void deleteBooking(String id) {
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        if (booking.getSchedule() != null && booking.getSchedule().getSlot() != null) {
            Schedule schedule = booking.getSchedule();
            schedule.setSlot(schedule.getSlot() + 1);
            scheduleRepository.save(schedule);
        }
        bookingRepository.delete(booking);
    }

}
