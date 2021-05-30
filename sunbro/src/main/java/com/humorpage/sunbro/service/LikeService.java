package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.Boardlikes;
import com.humorpage.sunbro.model.Commentlikes;
import com.humorpage.sunbro.respository.BoardLikesRepository;
import com.humorpage.sunbro.respository.CommentLikesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 좋아요에 대해 save와 delete를 동시에 할 경우에 대해 READ_COMMITTED
 * like 조회에 대해서는 update for select 처리를 할 필요가 없다.
 */
@Service
public class LikeService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private BoardLikesRepository boardLikesRepository;

    @Autowired
    private CommentLikesRepository commentLikesRepository;

    @Autowired
    private RedisRankingService redisRankingService;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void saveLikeBoard(Long userNum, Long boardId, LocalDateTime created){
        Boardlikes boardlikes = boardLikesRepository.findByBoardIdAndUserNum(boardId,userNum);
        if(boardlikes==null){
            boardlikes = new Boardlikes();
            boardlikes.setBoardId(boardId);
            boardlikes.setUserNum(userNum);
            try{
                boardLikesRepository.save(boardlikes);
            }catch (DataIntegrityViolationException e){
                return;
            }
            jdbcTemplate.update("UPDATE board SET likes=likes+1 where id=?",boardId);
            redisRankingService.incrementBoardScore(boardId,1,created);
        }
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void deleteLikeBoard(Long userNum, Long boardId, LocalDateTime created){
        Boardlikes boardlikes = boardLikesRepository.findByBoardIdAndUserNum(boardId,userNum);
        if(boardlikes!=null){
            boardLikesRepository.delete(boardlikes);
            jdbcTemplate.update("UPDATE board set likes=likes-1 where id=?",boardId);
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
