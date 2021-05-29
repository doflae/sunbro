package com.humorpage.sunbro.service;

import com.humorpage.sunbro.SunbroApplication;
import com.humorpage.sunbro.config.RedisConfig;
import com.humorpage.sunbro.model.BoardWithLikes;
import com.humorpage.sunbro.respository.BoardDetailRepository;
import com.humorpage.sunbro.respository.BoardWithLikesRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.connection.StringRedisConnection;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
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

    final static String RANKING_KEY = "ranking";
    final static String BOARD_SET_KEY = "board:set";
    static String CMT_SET_KEY(Long boardId){
        return String.format("board%d:cmt:set",boardId);
    }
    static String CMT_Z_SET_KEY(Long boardId) {return String.format("cmt:%d:ranking",boardId);}

    final static String SET_KEY_AFTER_CHECK_BOARD =
            "if redis.call('SISMEMBER',KEYS[1],ARGV[1])>0 then" +
                    " redis.call('SADD',KEYS[2],ARGV[2]) redis.call('ZADD', KEYS[3], 0, ARGV[2]) end";


    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private BoardDetailRepository boardDetailRepository;

    @Autowired
    private BoardWithLikesRepository boardWithLikesRepository;


    /**
     * 레디스 랭킹 check and set
     * TODO 레디스 랭킹 초기화
     */
    @EventListener(RedisConfig.class)
    public void initialRankService(){
        log.info("Check AND Set Redis");
    }

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

    @Scheduled(zone = "Asia/Seoul",cron = "0 0 5 * * *")
    public void scheduledDayRefresh(){
        LocalDateTime now = LocalDateTime.now().with(LocalTime.of(0,0));
        LocalDateTime created = now.minusDays(1);
        refreshBoard(RankingType.DAY,created);
    }

    @Scheduled(zone = "Asia/Seoul",cron = "0 0 5 * * 1")
    public void scheduledWeeklyRefresh(){
        LocalDateTime now = LocalDateTime.now().with(LocalTime.of(0,0));
        LocalDateTime created = now.minusDays(7);
        refreshBoard(RankingType.WEEK,created);
    }

    @Scheduled(zone = "Asia/Seoul", cron = "0 0 5 1 * *")
    public void scheduledMonthlyRefresh(){
        LocalDateTime now = LocalDateTime.now().with(LocalTime.of(0,0));
        LocalDateTime created = now.minusMonths(1);
        refreshBoard(RankingType.MONTH,created);
    }


    /**
     * 랭킹 타입에 따라 레디스에 업데이트
     * 이전 랭킹 삭제 및 새로운 랭킹 글 등록
     * 업데이트 기준 시각이 지난 뒤 시작
     * 이미 increment like board
     * @param type 랭킹 타입
     */
    private void refreshBoard(RankingType type, LocalDateTime created) {
        String key = type.name()+":"+RANKING_KEY;
        List<BoardWithLikes> boardWithLikesList = boardWithLikesRepository.findByCreatedGreaterThan(created);
        stringRedisTemplate.executePipelined(
            (RedisCallback<Object>) redisConnection -> {
                StringRedisConnection stringRedisConnection = (StringRedisConnection) redisConnection;
                stringRedisConnection.multi();
                stringRedisConnection.del(key);
                boardWithLikesList.forEach(boardWithLikes -> {
                    stringRedisConnection.zIncrBy(key,boardWithLikes.getLikes(),boardWithLikes.getId().toString());
                });
                return stringRedisConnection.exec();
            }
        );
    }

    /**
     * 키 값 및 스코어 관리를 위해 게시글 작성시 call
     */
    public void addBoard(Long id){
        stringRedisTemplate.executePipelined(
            (RedisCallback<?>) redisConnection->{
                StringRedisConnection stringRedisConnection = (StringRedisConnection) redisConnection;
                for(RankingType type : RankingType.values()){
                    stringRedisConnection.zAdd(type.name()+":"+RANKING_KEY,0,id.toString());
                }
                stringRedisConnection.sAdd(BOARD_SET_KEY,id.toString());
                return null;
            }
        );
    }

    /**
     * 대댓글은 랭킹 서비스에서 제외.
     * 댓글 작성시 call boardId 확인 후 추가 트랜잭션
     * 게시글 삭제와 동시성, 트랜잭션 처리
     */
    public void addComment(Long board_id, Long id){
        List<String> keys = new ArrayList<>(
                Arrays.asList(BOARD_SET_KEY,
                        CMT_SET_KEY(board_id),
                        CMT_Z_SET_KEY(board_id)));
        stringRedisTemplate.execute(RedisScript.of(SET_KEY_AFTER_CHECK_BOARD),keys,board_id.toString(),id.toString());
    }

    /**
     * 작성 시간 확인 후 랭킹 타입에 게시글 좋아요 점수 반영
     * 게시글 삭제와 동시성, 트랜잭션 처리
     * @param delta 점수 변화 값
     * @param created 게시글 작성 시간
     */
    @Async("redisExecutor")
    public void incrementBoardScore(Long id, int delta, LocalDateTime created) {
        LocalDateTime now = LocalDateTime.now().with(LocalTime.of(0,0));
        String v = id.toString();
        stringRedisTemplate.executePipelined(
            (RedisCallback<?>) redisConnection->{
                StringRedisConnection stringRedisConnection = (StringRedisConnection) redisConnection;
                for(RankingType type : RankingType.values()){
                    if(created.isAfter(now.minusDays(type.getValue()))){
                        stringRedisConnection.execute("ZADD",type.name()+":"+RANKING_KEY,
                                "XX","INCR",String.valueOf(delta),v);
                    }
                }
                return null;
            }
        );
    }

    /**
     * 댓글(depth=0) 좋아요 점수 반영
     * 댓글 삭제와 동시성을 가질 수 있기에 트랜잭션 처리
     * 삭제된 글에 대해서는 트랜잭션 discard
     * @param delta 점수 변화 값
     */
    @Async("redisExecutor")
    public void incrementCommentScore(Long board_id, Long comment_id, int delta){
        stringRedisTemplate.execute(
            (RedisCallback<?>) redisConnection->{
                StringRedisConnection stringRedisConnection = (StringRedisConnection) redisConnection;
                stringRedisConnection.execute("ZADD", CMT_Z_SET_KEY(board_id),
                        "XX","INCR",String.valueOf(delta),comment_id.toString());
                return null;
            }
        );
    }

    /**
     * 게시글 키 값 삭제, 댓글 멤버 삭제, 댓글 스코어 멤버 삭제, 게시글 스코어 삭제
     */
    public void deleteBoard(Long board_id){
        stringRedisTemplate.executePipelined(
            (RedisCallback<Object>) redisConnection->{
                StringRedisConnection stringRedisConnection = (StringRedisConnection) redisConnection;
                stringRedisConnection.sRem(BOARD_SET_KEY,board_id.toString());
                stringRedisConnection.del(CMT_SET_KEY(board_id));
                stringRedisConnection.del(CMT_Z_SET_KEY(board_id));
                for(RankingType type : RankingType.values()){
                    stringRedisConnection.zRem(type.name()+":"+RANKING_KEY);
                }
                return null;
            }
        );
    }

    /**
     * 댓글 키 삭제, 댓글 스코어 삭제
     */
    public void deleteComment(Long board_id, Long id){
        stringRedisTemplate.executePipelined(
            (RedisCallback<Object>) redisConnection->{
                StringRedisConnection stringRedisConnection = (StringRedisConnection) redisConnection;
                stringRedisConnection.sRem(CMT_SET_KEY(board_id),id.toString());
                stringRedisConnection.zRem(CMT_Z_SET_KEY(board_id),id.toString());
                return null;
            }
        );
    }
}
