package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.Board;
import com.humorpage.sunbro.model.BoardWithLikes;
import com.humorpage.sunbro.model.Comment;
import com.humorpage.sunbro.respository.BoardDetailRepository;
import com.humorpage.sunbro.respository.BoardWithLikesRepository;
import com.humorpage.sunbro.utils.ScriptLoader;
import io.lettuce.core.RedisClient;
import io.lettuce.core.ScriptOutputType;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.StringRedisConnection;
import org.springframework.data.redis.core.*;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
public class RedisRankingService{

    /**
     * 트랜잭션이 필요한 시점
     * 글이 지워짐과 글에 대한 좋아요를 동시 처리할 때
     * 주기적 랭킹 업데이트 시점에 좋아요를 동시 처리할 때
     * ZINCRBY 명령어는 없는 멤버에 대해서는 새로운 멤버를 추가하고 점수를 할당
     * 따라서, 멤버에 대한 존재여부 확인 후 삽입 필요
     * sorted set에서는 멤버의 존재여부 파악 불가
     * 따라서 set에서 따로 멤버 존재 관리
     * 레디스는 한 데이터의 크기가 매우 커지는 것을 추천하지 않으므로
     * boardKeySet, boardCommentKeySet 으로 나누어 관리
     * 랭킹 타입별로 저장할 필요 없다. -> 삽입 전 확인하기 때문
     */

    final static String RANKING_KEY = "ranking";
    final static String BOARD_SET_KEY = "board:set";
    static String BOARD_CMT_SET_KEY(Long boardId){
        return String.format("board%d:cmt:set",boardId);
    }

    final static String INCR_AFTER_CHECK_PATH = "classpath:luascripts/INCR_AFTER_CHECK.script";

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private BoardDetailRepository boardDetailRepository;

    @Autowired
    private BoardWithLikesRepository boardWithLikesRepository;


    /**
     * 랭킹 타입에 따라 시작지점부터 사이즈 만큼 인기 게시글 탐색
     * @param type 랭킹 타입
     * @param start 탐색 시작 지점
     * @param page_size 탐색 사이즈
     * @return 게시글 id 리스트
     */
    public List<Long> getBoardRanking(RankingType type, Long start, Long page_size) throws AssertionError{
        String key = type.name()+":"+RANKING_KEY;
        ZSetOperations<String, String> zSetOperations = stringRedisTemplate.opsForZSet();
        return Objects.requireNonNull(zSetOperations.reverseRange(key, start, start + page_size))
                .stream().map(Long::parseLong).collect(Collectors.toList());
    }

    /**
     * 게시글에 인기 댓글 N개 탐색
     * @param board_id 게시글 id
     * @param start 검색 범위 시작
     * @param page_size 검색 크기
     * @return 댓글 id 리스트
     */
    public List<Long> getCommentRanking(Long board_id, Long start, Long page_size) throws AssertionError{
        String key = "cmt:"+board_id.toString()+":"+RANKING_KEY;
        ZSetOperations<String, String> zSetOperations = stringRedisTemplate.opsForZSet();
        return Objects.requireNonNull(zSetOperations.reverseRange(key, start, start + page_size))
                .stream().map(Long::parseLong).collect(Collectors.toList());
    }

    /**
     * 랭킹 타입에 따라 레디스에 업데이트
     * 이전 랭킹 삭제 및 새로운 랭킹 글 등록
     * @param type 랭킹 타입
     */
    public void refreshBoard(RankingType type) {
        String key = type.name()+":"+RANKING_KEY;
        LocalDateTime now = LocalDateTime.now().with(LocalTime.of(0,0));
        LocalDateTime created = now.minusDays(type.getValue());
        List<BoardWithLikes> boardWithLikesList = boardWithLikesRepository.findByCreatedGreaterThan(created);
        stringRedisTemplate.executePipelined(
            (RedisCallback<Object>) redisConnection -> {
                StringRedisConnection stringRedisConnection = (StringRedisConnection) redisConnection;
                stringRedisConnection.del(key);
                boardWithLikesList.forEach(boardWithLikes -> {
                    stringRedisConnection.zAdd(key,boardWithLikes.getLikes(),boardWithLikes.getId().toString());
                });
                return null;
            }
        );
    }

    /**
     * 작성 시간 확인 후 랭킹 타입에 게시글 좋아요 점수 반영
     * @param delta 점수 변화 값
     * @param created 게시글 작성 시간
     */
    public void incrementBoardScore(Long id, int delta, LocalDateTime created) {
        LocalDateTime now = LocalDateTime.now().with(LocalTime.of(0,0));
        String v = id.toString();
        for(RankingType type : RankingType.values()){
            if(created.isAfter(now.minusDays(type.getValue()))){
                String script = ScriptLoader.getScript(INCR_AFTER_CHECK_PATH);
                List<String> keys = new ArrayList<>(Arrays.asList(BOARD_SET_KEY,type.name()+":"+RANKING_KEY));
                stringRedisTemplate.execute(RedisScript.of(script),keys,v,delta);
            }
        }
    }

    /**
     * 댓글(depth=0) 좋아요 점수 반영
     * 댓글 삭제와 동시성을 가질 수 있기에 트랜잭션화
     * 삭제된 글에 대해서는 트랜잭션 discard
     * @param delta 점수 변화 값
     */
    public void incrementCommentScore(Long board_id, Long comment_id, int delta){
        List<String> keys = new ArrayList<>(Arrays.asList(
                BOARD_CMT_SET_KEY(board_id),
                "cmt:"+board_id.toString()+":"+RANKING_KEY
        ));
        String script = ScriptLoader.getScript(INCR_AFTER_CHECK_PATH);
        stringRedisTemplate.execute(RedisScript.of(script),keys,comment_id,delta);
    }

    /**
     * 게시글 스코어 삭제 및 댓글 스코어 삭제
     */
    public void deleteBoardScore(Board board){
        ZSetOperations<String, String> zSetOperations = stringRedisTemplate.opsForZSet();
        for(RankingType type : RankingType.values()){
            String key = type.name()+":"+RANKING_KEY;
            zSetOperations.remove(key,board.getId().toString());
        }
        String key = "cmt:"+board.getId().toString()+":"+RANKING_KEY;
        stringRedisTemplate.delete(key);
    }

    /**
     * 댓글 스코어 삭제
     */
    public void deleteCommentScore(Comment comment){
        ZSetOperations<String, String> zSetOperations = stringRedisTemplate.opsForZSet();
        String key = "cmt:"+comment.getBoardId().toString()+":"+RANKING_KEY;
        zSetOperations.remove(key,comment.getId().toString());
    }
}
