package com.example.BE_course_management.mapper;

import com.example.BE_course_management.dto.request.RatingCreateRequest;
import com.example.BE_course_management.dto.response.RatingResponse;
import com.example.BE_course_management.entity.Rating;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PaymentMapper.class})
public interface RatingMapper {

    @Mapping(target = "payment", ignore = true)
    Rating toRating(RatingCreateRequest request);

    RatingResponse toRatingResponse(Rating rating);

    List<RatingResponse> toRatingResponseList(List<Rating> ratings);

    @org.mapstruct.Mapping(target = "payment", ignore = true)
    @org.mapstruct.Mapping(target = "id", ignore = true)
    void updateRating(@org.mapstruct.MappingTarget Rating rating, com.example.BE_course_management.dto.request.RatingUpdateRequest request);

}
