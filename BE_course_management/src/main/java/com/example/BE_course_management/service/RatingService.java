package com.example.BE_course_management.service;

import com.example.BE_course_management.dto.request.RatingCreateRequest;
import com.example.BE_course_management.dto.response.RatingResponse;
import com.example.BE_course_management.entity.Payment;
import com.example.BE_course_management.entity.PaymentStatus;
import com.example.BE_course_management.entity.Rating;
import com.example.BE_course_management.exception.AppException;
import com.example.BE_course_management.exception.ErrorCode;
import com.example.BE_course_management.mapper.RatingMapper;
import com.example.BE_course_management.repository.PaymentRepository;
import com.example.BE_course_management.repository.RatingRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RatingService {

    RatingRepository ratingRepository;
    RatingMapper ratingMapper;
    PaymentRepository paymentRepository;

    @Transactional
    public RatingResponse createRating(RatingCreateRequest request) {
        if(ratingRepository.existsByPaymentId(request.getPaymentId())) {
            throw new AppException(ErrorCode.RATING_EXISTED);
        }
        Payment payment = paymentRepository.findById(request.getPaymentId()).orElseThrow(()->new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        if(payment.getStatus()!= PaymentStatus.SUCCESS){
            throw new AppException(ErrorCode.UNPAID);
        }
        Rating rating = ratingMapper.toRating(request);
        rating.setPayment(payment);
        return ratingMapper.toRatingResponse(ratingRepository.save(rating));
    }

    public List<RatingResponse> readRatings() {
        return ratingMapper.toRatingResponseList(ratingRepository.findAll());
    }

    public RatingResponse readRating(String id) {
        Rating rating = ratingRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.RATING_NOT_FOUND));
        return ratingMapper.toRatingResponse(rating);
    }

    @Transactional
    public void deleteRating(String id) {
        Rating rating = ratingRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.RATING_NOT_FOUND));
        if (rating.getPayment() != null) {
            rating.getPayment().setRating(null);
        }
        ratingRepository.delete(rating);
    }

    @Transactional
    public RatingResponse updateRating(String id, com.example.BE_course_management.dto.request.RatingUpdateRequest request) {
        Rating rating = ratingRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.RATING_NOT_FOUND));
        ratingMapper.updateRating(rating, request);
        return ratingMapper.toRatingResponse(ratingRepository.save(rating));
    }

}
