package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.BoardThumbnail;
import com.humorpage.sunbro.respository.BoardThumbnailRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BasicRankingService implements RankingService {
    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired
    private BoardThumbnailRepository boardThumbnailRepository;

    @Autowired
    private RedisTemplate redisTemplate;

    @Override
    public List<BoardThumbnail> getRanking(RankingType type){
        LocalDateTime now = LocalDateTime.now();
        List<BoardThumbnail> boards;
        switch (type){
            case ALL:
                boards = boardThumbnailRepository.findAll();
                break;
            case WEEK:
                boards = boardThumbnailRepository.findByCreatedGreaterThan(now.minusDays(7));
                break;
            case MONTH:
                boards =  boardThumbnailRepository.findByCreatedGreaterThan(now.minusMonths(1));
                break;
            case DAILY:
                boards = boardThumbnailRepository.findByCreatedGreaterThan(now.minusDays(1));
                break;
            default:
                throw new IllegalStateException("Unexpected value: " + type);
        }
        return boards.stream()
                .sorted(Comparator.comparing(BoardThumbnail::GetBoardlikesNum).reversed())
                .collect(Collectors.toList());
    }
}
