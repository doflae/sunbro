package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.Boardlikes;
import com.humorpage.sunbro.model.Commentlikes;
import com.humorpage.sunbro.respository.BoardDetailRepository;
import com.humorpage.sunbro.respository.BoardLikesRepository;
import com.humorpage.sunbro.respository.CommentLikesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class LikeService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private BoardLikesRepository boardLikesRepository;

    @Autowired
    private CommentLikesRepository commentLikesRepository;

    @Autowired
    private BoardDetailRepository boardDetailRepository;

    @Autowired
    private RedisRankingService redisRankingService;

    /**
     * 좋아요 수에 대한 Update 쿼리는 single query이기 때문에 사실상 트랜잭션은 필요 없다.
     * 하지만 like에 대한 입력과 board의 likes increment(BII)를 하나로 묶기 위해 필요한가?
     * like가 저장되면서 user와 board에 대한 C(R)UD 중 Read를 제외한 나머지에 대해 lock (InnoDB 기본 암시적 잠금)
     * -> like save와 BII 중간에 글 삭제 명령을 수행할 수 없음
     * like 저장 전에 삭제했다면? DataIntegrityViolationException 발생 return
     * 트랜잭션처리했다는 가정하에
     * JPA의 쓰기지연? -> ID 생성전략이 IDENTITY면 create시 바로 쿼리 전송
     * like에서 userNum, boardId로 식별하면? (id를 삭제)
     * board.setLikes(board.getLikes+1)로 BII를 변경 후 BII를 먼저 수행하도록 하면(쓰기지연)
     * getLike이후 해당 row에 대해 lock을 걸어야 하기 때문에 더 많은 비용 발생할 것으로 보인다.
     * 낙관적 lock을 걸면? -> 낙관적 락은 해당 row에 대해 경합이 발생할 확률이 적을 것(거의 0)이라고 보고 락을 거는 것이라
     * 비관적 lock을 걸어야 한다.
     * 그냥 어떤 이유로 like save와 BII 사이에 오류가 발생하면 ?
     * 어차피 트랜잭션이 기본적으로 걸려있기 때문에 고립 레벨을 낮추어서 생성하자
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void saveLikeBoard(Long userNum, Long boardId, LocalDateTime created){
        Boardlikes boardlikes = boardLikesRepository.findByBoardIdAndUserNum(boardId,userNum);
        if(boardlikes==null){
            boardlikes = new Boardlikes();
            boardlikes.setBoardId(boardId);
            boardlikes.setUserNum(userNum);
            try{
                boardLikesRepository.save(boardlikes);
                boardDetailRepository.incrementBoardLikes(boardId);
            }catch (Exception e){
                return;
            }
            redisRankingService.incrementBoardScore(boardId,1,created);
        }
    }

    /**
     * 위와 마찬가지
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void deleteLikeBoard(Long userNum, Long boardId, LocalDateTime created){
        Boardlikes boardlikes = boardLikesRepository.findByBoardIdAndUserNum(boardId,userNum);
        if(boardlikes!=null){
            boardLikesRepository.delete(boardlikes);
            boardDetailRepository.decrementBoardLikes(boardId);
            redisRankingService.incrementBoardScore(boardId,-1,created);
        }
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void saveLikeComment(Long userNum, Long commentId, Long boardId){
        Commentlikes commentlikes = commentLikesRepository.findByCommentIdAndUserNum(commentId,userNum);
        if(commentlikes==null) {
            commentlikes = new Commentlikes(commentId, userNum);
            try{
                commentLikesRepository.save(commentlikes);
            }catch (DataIntegrityViolationException e){
                return;
            }
            jdbcTemplate.update("UPDATE comment SET likes=likes+1 where id=?", commentId);
            redisRankingService.incrementCommentScore(boardId,commentId,1);
        }
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void deleteLikeComment(Long userNum, Long commentId, Long boardId){
        Commentlikes commentlikes = commentLikesRepository.findByCommentIdAndUserNum(commentId,userNum);
        if(commentlikes!=null){
            commentLikesRepository.delete(commentlikes);
            jdbcTemplate.update("UPDATE comment set likes=likes-1 where id=?",commentId);
            redisRankingService.incrementCommentScore(boardId,commentId,-1);
        }
    }
}
