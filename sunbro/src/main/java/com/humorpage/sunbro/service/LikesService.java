package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.Boardlikes;
import com.humorpage.sunbro.model.Commentlikes;
import com.humorpage.sunbro.respository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.SQLSyntaxErrorException;

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

    public void saveBoard(String uid, Long board_id){
        try{
            Long usernum = jdbcTemplate.queryForObject("SELECT usernum FROM user where uid=?", Long.class, uid);
            if(jdbcTemplate.queryForObject("select id from boardlikes where board_id=? and user_num=?",Long.class,board_id,usernum)!=null){
                jdbcTemplate.update("DELETE from boardlikes where board_id=? and user_num=?",board_id,usernum);
            }else{
                if(jdbcTemplate.queryForObject("select id from board where id=?",Long.class,board_id)!=null) {
                    jdbcTemplate.update("INSERT INTO boardlikes (board_id, user_num) VALUES(?,?)", board_id, usernum);
                }
            }
        }catch (DataAccessException ignored){

        }
    }

    public void saveComment(String uid, Long comment_id){
        try{
            Long usernum = jdbcTemplate.queryForObject("SELECT usernum FROM user where uid=?",Long.class,uid);
            if(jdbcTemplate.queryForObject("select id from commentlikes where comment_id=? and user_num=?",Long.class,comment_id,usernum)!=null){
                jdbcTemplate.update("delete from commentlikes where comment_id=? and user_num=?",comment_id,usernum);
            }else{
                if(jdbcTemplate.queryForObject("select id from comment where id=?",Long.class,comment_id)!=null) {
                    jdbcTemplate.update("INSERT INTO commentlikes (comment_id, user_num) VALUES(?,?)", comment_id, usernum);
                }
            }
        }catch (NullPointerException ignored){

        }
    }
}
