package com.example.BE_course_management.controller;

import com.example.BE_course_management.dto.ApiResponse;
import com.example.BE_course_management.dto.request.PaymentCreateRequest;
import com.example.BE_course_management.dto.request.PaymentUpdateRequest;
import com.example.BE_course_management.dto.response.PaymentResponse;
import com.example.BE_course_management.service.PaymentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {

    PaymentService paymentService;

    @PostMapping
    public ApiResponse<PaymentResponse> createPayment(@RequestBody PaymentCreateRequest request) {
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.createPayment(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<PaymentResponse>> readPayments() {
        return ApiResponse.<List<PaymentResponse>>builder()
                .result(paymentService.readPayments())
                .build();
    }

    @GetMapping("/booking/{bookingId}")
    public ApiResponse<PaymentResponse> readPaymentByBookingId(@PathVariable("bookingId") String bookingId){
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.readPaymentByBookingId(bookingId))
                .build();
    }

    @GetMapping("/status/{status}")
    public ApiResponse<List<PaymentResponse>> readPaymentsByStatus(@PathVariable("status") String status) {
        return ApiResponse.<List<PaymentResponse>>builder()
                .result(paymentService.readPaymentsByStatus(status))
                .build();
    }

    @GetMapping("/{paymentId}")
    public ApiResponse<PaymentResponse> readPayment(@PathVariable("paymentId") String id) {
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.readPayment(id))
                .build();
    }

    @PutMapping("/{paymentId}")
    public ApiResponse<PaymentResponse> updatePayment(@PathVariable("paymentId") String id, @RequestBody PaymentUpdateRequest request) {
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.updatePayment(id, request))
                .build();
    }

    @DeleteMapping("/{paymentId}")
    public ApiResponse<Void> deletePayment(@PathVariable("paymentId") String id) {
        paymentService.deletePayment(id);
        return ApiResponse.<Void>builder().build();
    }

}
