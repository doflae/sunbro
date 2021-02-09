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
    private BoardLikesRepository boardLikesRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private CommentLikesRepository commentLikesRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void savelikeBoard(Long usernum, Long board_id){
        jdbcTemplate.update("INSERT INTO boardlikes (board_id, user_num) select id,? from board where id=?", usernum, board_id);
    }

    public void deletelikeBoard(Long usernum, Long board_id){
        jdbcTemplate.update("delete from boardlikes where board_id=? and user_num=?",board_id,usernum);
    }

    public void savelikeComment(Long usernum, Long comment_id){
        jdbcTemplate.update("INSERT INTO commentlikes (comment_id, user_num) select id,? from comment where id=?", usernum, comment_id);
    }

    public void deletelikeComment(Long usernum, Long comment_id){
        jdbcTemplate.update("delete from commentlikes where comment_id=? and user_num=?",comment_id, usernum);
    }
}
