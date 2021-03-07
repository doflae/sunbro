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

    public void savelikeBoard(Long usernum, Long board_id){
        jdbcTemplate.update("insert into boardlikes(board_id,user_num) SELECT * FROM (SELECT ?,?) as tmp \n" +
                "WHERE not EXISTS (SELECT * FROM boardlikes WHERE board_id=? AND user_num=?)\n" +
                "AND EXISTS(SELECT * FROM board WHERE id=?);", board_id,usernum,board_id,usernum,board_id);
    }

    public void deletelikeBoard(Long usernum, Long board_id){
        jdbcTemplate.update("delete from boardlikes where board_id=? and user_num=?",board_id,usernum);
    }

    public void savelikeComment(Long usernum, Long comment_id){
        jdbcTemplate.update("insert into commentlikes(comment_id,user_num) SELECT * FROM (SELECT ?,?) as tmp \n" +
                "WHERE not EXISTS (SELECT * FROM commentlikes WHERE comment_id=? AND user_num=?)\n" +
                "AND EXISTS(SELECT * FROM comment WHERE id=?);", comment_id,usernum,comment_id,usernum,comment_id);
    }

    public void deletelikeComment(Long usernum, Long comment_id){
        jdbcTemplate.update("delete from commentlikes where comment_id=? and user_num=?",comment_id, usernum);
    }
}
