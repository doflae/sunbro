package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.Boardlikes;
import com.humorpage.sunbro.model.Commentlikes;
import com.humorpage.sunbro.respository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

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
            Long msrl = jdbcTemplate.queryForObject("SELECT msrl FROM user where uid=?", Long.class, uid);
            Boardlikes boardlikes = boardLikesRepository.findByBoardIdAndUserMsrl(board_id,msrl);
            if(boardlikes!=null){
                boardLikesRepository.delete(boardlikes);
            }else{
                jdbcTemplate.update("INSERT INTO boardlikes (board_id, user_id) VALUES(?,?)",board_id,msrl);
            }
        }catch (DataAccessException ignored){

        }
    }

    public void saveComment(String uid, Long comment_id){
        try{
            Long msrl = jdbcTemplate.queryForObject("SELECT msrl FROM user where uid=?",Long.class,uid);
            Commentlikes commentlikes = commentLikesRepository.findByCommentIdAndUserMsrl(comment_id,msrl);
            if(commentlikes!=null){
                commentLikesRepository.delete(commentlikes);
            }else{
                jdbcTemplate.update("INSERT INTO commentlikes (comment_id, user_id) VALUES(?,?)",comment_id,msrl);
            }
        }catch (NullPointerException ignored){

        }
    }
}
