package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.Boardlikes;
import com.humorpage.sunbro.model.Commentlikes;
import com.humorpage.sunbro.respository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLIntegrityConstraintViolationException;

@Service
public class LikeService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private BoardLikesRepository boardLikesRepository;

    @Autowired
    private CommentLikesRepository commentLikesRepository;


    public void saveLikeBoard(Long userNum, Long boardId){
        Boardlikes boardlikes = boardLikesRepository.findByBoardIdAndUserNum(boardId,userNum);
        if(boardlikes==null){
            boardlikes = new Boardlikes(boardId,userNum);
            try{
                boardLikesRepository.save(boardlikes);
            }catch (DataIntegrityViolationException ignored){

            }
            jdbcTemplate.update("UPDATE board SET likes=likes+1 where id=?",boardId);
        }
    }

    public void deleteLikeBoard(Long userNum, Long boardId){
        Boardlikes boardlikes = boardLikesRepository.findByBoardIdAndUserNum(boardId,userNum);
        if(boardlikes!=null){
            boardLikesRepository.delete(boardlikes);
            jdbcTemplate.update("UPDATE board set likes=likes-1 where id=?",boardId);
        }
    }

    public void saveLikeComment(Long userNum, Long commentId){
        Commentlikes commentlikes = commentLikesRepository.findByCommentIdAndUserNum(commentId,userNum);
        if(commentlikes==null) {
            commentlikes = new Commentlikes(commentId, userNum);
            try{
                commentLikesRepository.save(commentlikes);
            }catch (DataIntegrityViolationException ignored){

            }
            jdbcTemplate.update("UPDATE comment SET likes=likes+1 where id=?", commentId);
        }
    }

    public void deleteLikeComment(Long userNum, Long commentId){
        Commentlikes commentlikes = commentLikesRepository.findByCommentIdAndUserNum(commentId,userNum);
        if(commentlikes!=null){
            commentLikesRepository.delete(commentlikes);
            jdbcTemplate.update("UPDATE comment set likes=likes-1 where id=?",commentId);
        }
    }
}
