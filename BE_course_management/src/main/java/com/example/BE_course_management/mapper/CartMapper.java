package com.example.BE_course_management.mapper;

import com.example.BE_course_management.dto.request.CartCreateRequest;
import com.example.BE_course_management.dto.response.CartResponse;
import com.example.BE_course_management.entity.Cart;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {CourseMapper.class, UserMapper.class})
public interface CartMapper {

  @Mapping(target="course", ignore=true)
  @Mapping(target="user", ignore=true)
  Cart toCart(CartCreateRequest request);

  CartResponse toCartResponse(Cart cart);

  List<CartResponse> toCartResponseList(List<Cart> carts);

}
