package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.BoardDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.List;
import java.util.concurrent.TimeUnit;

import static java.lang.String.format;

@Service
public class CacheRankingService implements RankingService{
    @Autowired
    private BasicRankingService rankingService;

    @Autowired
    private RedisTemplate redisTemplate;

    @Override
    public List<BoardDetail> getRanking(RankingType type){
        ValueOperations<String, List<BoardDetail>> operations = redisTemplate.opsForValue();
        final String key = format("%s:%s", RANKING_GETTING_KEY, type.name().toLowerCase());
        final List<BoardDetail> cachedRankingList = operations.get(key);

        if(CollectionUtils.isEmpty(cachedRankingList)){
            final List<BoardDetail> rankingList = rankingService.getRanking(type);
            operations.set(key, rankingList, 30L, TimeUnit.SECONDS);
            return rankingList;
        }else{
            return cachedRankingList;
        }
    }
}
