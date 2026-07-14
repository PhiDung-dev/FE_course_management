package com.example.BE_course_management.controller;

import com.example.BE_course_management.dto.ApiResponse;
import com.example.BE_course_management.dto.request.CartCreateRequest;
import com.example.BE_course_management.dto.response.CartResponse;
import com.example.BE_course_management.service.CartService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/carts")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CartController {

    CartService cartService;

    @PostMapping
    public ApiResponse<CartResponse> createCart(@RequestBody CartCreateRequest request) {
        return ApiResponse.<CartResponse>builder()
                .result(cartService.createCart(request))
                .build();
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<CartResponse>> readCarts(@PathVariable("userId") String userId) {
        return ApiResponse.<List<CartResponse>>builder()
                .result(cartService.readCarts(userId))
                .build();
    }

    @DeleteMapping("/{cartId}")
    public ApiResponse<String> deleteCart(@PathVariable("cartId") String id) {
        cartService.deleteCart(id);
        return ApiResponse.<String>builder()
                .message("Cart has id = "+ id +" deleted successfully")
                .build();
    }

}
