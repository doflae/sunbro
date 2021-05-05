package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.BoardDetail;
import com.humorpage.sunbro.respository.BoardDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BasicRankingService implements RankingService {

    @Autowired
    private BoardDetailRepository boardDetailRepository;

    @Autowired
    private RedisTemplate redisTemplate;

    @Override
    public List<BoardDetail> getRanking(RankingType type){
        LocalDateTime now = LocalDateTime.now();
        List<BoardDetail> boards;
        switch (type){
            case ALL:
                boards = boardDetailRepository.findAll();
                break;
            case WEEK:
                boards = boardDetailRepository.findByCreatedGreaterThan(now.minusDays(7));
                break;
            case MONTH:
                boards =  boardDetailRepository.findByCreatedGreaterThan(now.minusMonths(1));
                break;
            case DAILY:
                boards = boardDetailRepository.findByCreatedGreaterThan(now.minusDays(1));
                break;
            default:
                throw new IllegalStateException("Unexpected value: " + type);
        }
        return boards.stream()
                .sorted(Comparator.comparing(BoardDetail::getLikes).reversed())
                .collect(Collectors.toList());
    }
}
