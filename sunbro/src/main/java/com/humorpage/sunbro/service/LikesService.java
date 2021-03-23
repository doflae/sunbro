package com.humorpage.sunbro.service;

import com.humorpage.sunbro.respository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.SQLIntegrityConstraintViolationException;

@Service
public class LikesService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void saveLikeBoard(Long userNum, Long board_id){
        jdbcTemplate.update("insert into boardlikes(board_id,user_num) SELECT * FROM (SELECT ?,?) as tmp \n" +
                "WHERE not EXISTS (SELECT * FROM boardlikes WHERE board_id=? AND user_num=?)\n" +
                "AND EXISTS(SELECT * FROM board WHERE id=?);", board_id,userNum,board_id,userNum,board_id);
    }

    public void deletelikeBoard(Long userNum, Long board_id){
        jdbcTemplate.update("delete from boardlikes where board_id=? and user_num=?",board_id,userNum);
    }

    public void savelikeComment(Long userNum, Long comment_id){
        jdbcTemplate.update("insert into commentlikes(comment_id,user_num) SELECT * FROM (SELECT ?,?) as tmp \n" +
                "WHERE not EXISTS (SELECT * FROM commentlikes WHERE comment_id=? AND user_num=?)\n" +
                "AND EXISTS(SELECT * FROM comment WHERE id=?);", comment_id,userNum,comment_id,userNum,comment_id);
    }

    public void deletelikeComment(Long userNum, Long comment_id){
        jdbcTemplate.update("delete from commentlikes where comment_id=? and user_num=?",comment_id, userNum);
    }
}
