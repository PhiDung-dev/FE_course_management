package com.example.BE_course_management.service;

import com.example.BE_course_management.dto.request.CartCreateRequest;
import com.example.BE_course_management.dto.response.CartResponse;
import com.example.BE_course_management.entity.Account;
import com.example.BE_course_management.entity.Cart;
import com.example.BE_course_management.entity.Course;
import com.example.BE_course_management.entity.User;
import com.example.BE_course_management.exception.AppException;
import com.example.BE_course_management.exception.ErrorCode;
import com.example.BE_course_management.mapper.CartMapper;
import com.example.BE_course_management.repository.AccountRepository;
import com.example.BE_course_management.repository.CartRepository;
import com.example.BE_course_management.repository.CourseRepository;
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
public class CartService {

    CartRepository cartRepository;
    CartMapper cartMapper;
    UserRepository userRepository;
    CourseRepository courseRepository;
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
    public CartResponse createCart(CartCreateRequest request) {
        User user = resolveUser(request.getUserId());
        Course course = courseRepository.findById(request.getCourseId()).orElseThrow(()->new AppException(ErrorCode.COURSE_NOT_FOUND));
        if(cartRepository.existsByUserAndCourse(user, course)) {
            throw new AppException(ErrorCode.COURSE_ALREADY_IN_CART);
        }
        Cart cart = Cart.builder()
                .user(user)
                .course(course)
                .build();
        return cartMapper.toCartResponse(cartRepository.save(cart));
    }

    public List<CartResponse> readCarts(String userId) {
        User user = resolveUser(userId);
        List<Cart> carts = cartRepository.findByUserId(user.getId());
        return cartMapper.toCartResponseList(carts);
    }

    @Transactional
    public void deleteCart(String id) {
        if(!cartRepository.existsById(id)) {
            throw new AppException(ErrorCode.COURSE_NOT_FOUND_IN_CART);
        }
        cartRepository.deleteById(id);
    }

}
