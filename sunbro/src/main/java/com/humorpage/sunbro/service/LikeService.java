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
