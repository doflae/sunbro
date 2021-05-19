package com.humorpage.sunbro.service;

import com.humorpage.sunbro.advice.exception.BoardNotFoundException;
import com.humorpage.sunbro.advice.exception.CommentNotFoundException;
import com.humorpage.sunbro.model.Comment;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.respository.CommentRepository;
import com.humorpage.sunbro.respository.UserSimpleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserSimpleRepository userSimpleRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private FileDeleteService fileDeleteService;

    public void save(Comment comment) throws DataIntegrityViolationException {
        if(comment.getId()==null){
            jdbcTemplate.update("UPDATE board set comments_cnt=comments_cnt+1 where id=?",comment.getBoardId());
            if(comment.getParentId()!=null){
                jdbcTemplate.update("UPDATE comment set children_cnt=children_cnt+1 where id=?",comment.getParentId());
            }
        }
        //대댓글 입력 및 수정 시 이미 삭제된 댓글의 대댓글이라면 Exception 발생
        commentRepository.save(comment);
    }

    //TODO: 미디어 컬럼 파싱 후 삭제
    //TODO: 대댓글 미디어 경로 부모 댓글에 종속
    public void delete(Comment comment){
        if(comment.getParentId()!=null){
            jdbcTemplate.update("UPDATE comment set children_cnt=children_cnt-1 where id=?",comment.getBoardId());
        }else{
            jdbcTemplate.update("UPDATE board set comments_cnt=comments_cnt-? where id=?",
                    comment.getChildren_cnt()+1,comment.getBoardId());
        }
        fileDeleteService.deleteFiles(comment.getMedia(),MediaType.COMMENT);
        commentRepository.delete(comment);
    }
}
