package com.example.BE_course_management.mapper;

import com.example.BE_course_management.dto.request.ScoreUpdateRequest;
import com.example.BE_course_management.dto.response.ScoreResponse;
import com.example.BE_course_management.entity.Score;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PaymentMapper.class})
public interface ScoreMapper {

    ScoreResponse toScoreResponse(Score score);

    List<ScoreResponse> toScoreResponseList(List<Score> scores);

    void updateScore(@MappingTarget Score score, ScoreUpdateRequest request);

}
