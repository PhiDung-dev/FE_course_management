package com.example.BE_course_management.service;

import com.example.BE_course_management.dto.request.ScoreUpdateRequest;
import com.example.BE_course_management.dto.response.ScoreResponse;
import com.example.BE_course_management.entity.Classification;
import com.example.BE_course_management.entity.Score;
import com.example.BE_course_management.exception.AppException;
import com.example.BE_course_management.exception.ErrorCode;
import com.example.BE_course_management.mapper.ScoreMapper;
import com.example.BE_course_management.repository.ScoreRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ScoreService {

    ScoreRepository scoreRepository;
    ScoreMapper scoreMapper;

    public List<ScoreResponse> readScores() {
        return scoreMapper.toScoreResponseList(scoreRepository.findAll());
    }

    public ScoreResponse readScoreByPaymentId(String paymentId) {
        Score score = scoreRepository.findByPaymentId(paymentId).orElseThrow(()->new AppException(ErrorCode.SCORE_NOT_FOUND));
        return scoreMapper.toScoreResponse(score);
    }

    public ScoreResponse readScore(String id) {
        Score score = scoreRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.SCORE_NOT_FOUND));
        return scoreMapper.toScoreResponse(score);
    }

    @Transactional
    public ScoreResponse updateScore(String id, ScoreUpdateRequest request) {
        Score score = scoreRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.SCORE_NOT_FOUND));
        scoreMapper.updateScore(score, request);
        score.setAverageScore(calculateScore(score.getAttendanceScore(), score.getMidtermScore(), score.getFinalScore()));
        score.setClassification(classification(score.getAverageScore()));
        return scoreMapper.toScoreResponse(scoreRepository.save(score));
    }

    @Transactional
    public ScoreResponse createScore(String paymentId, ScoreUpdateRequest request) {
        Score score = Score.builder()
                .attendanceScore(request.getAttendanceScore())
                .midtermScore(request.getMidtermScore())
                .finalScore(request.getFinalScore())
                .build();
        score.setAverageScore(calculateScore(score.getAttendanceScore(), score.getMidtermScore(), score.getFinalScore()));
        score.setClassification(classification(score.getAverageScore()));
        return scoreMapper.toScoreResponse(scoreRepository.save(score));
    }

    @Transactional
    public List<ScoreResponse> calculateScoreAndClassification() {
        List<Score> scores = scoreRepository.findAll();
        scores.forEach(score->{
            score.setAverageScore(calculateScore(score.getAttendanceScore(), score.getMidtermScore(), score.getFinalScore()));
            score.setClassification(classification(score.getAverageScore()));
            scoreRepository.save(score);
        });
        return scoreMapper.toScoreResponseList(scores);
    }

    private BigDecimal calculateScore(BigDecimal attendanceScore, BigDecimal midtermScore, BigDecimal finalScore) {
        BigDecimal att = attendanceScore != null ? attendanceScore : BigDecimal.ZERO;
        BigDecimal mid = midtermScore != null ? midtermScore : BigDecimal.ZERO;
        BigDecimal fin = finalScore != null ? finalScore : BigDecimal.ZERO;
        return att
                .multiply(BigDecimal.valueOf(20))
                .add(mid.multiply(BigDecimal.valueOf(30)))
                .add(fin.multiply(BigDecimal.valueOf(50)))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    private Classification classification(BigDecimal avgScore) {
        if (avgScore.compareTo(BigDecimal.valueOf(8.5)) >= 0) {
            return Classification.EXCELLENT;
        } else if (avgScore.compareTo(BigDecimal.valueOf(7.0)) >= 0) {
            return Classification.GOOD;
        } else if (avgScore.compareTo(BigDecimal.valueOf(6.5)) >= 0) {
            return Classification.FAIR;
        } else if (avgScore.compareTo(BigDecimal.valueOf(5.0)) >= 0) {
            return Classification.AVERAGE;
        } else {
            return Classification.WEAK;
        }
    }

}
