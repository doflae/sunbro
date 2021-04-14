package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.Comment;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.respository.CommentRepository;
import com.humorpage.sunbro.respository.UserSimpleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserSimpleRepository userSimpleRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private FileDeleteService fileDeleteService;

    public void save(UserSimple userSimple, Long board_id, Long comment_id, Comment comment){
        comment.setAuthor(userSimple);
        comment.setBoard(board_id);
        comment.setPid(comment_id);
        commentRepository.save(comment);
    }
    public void delete(Comment comment){
        fileDeleteService.deleteFiles(comment.getMedia(),MediaType.COMMENT);
        List<Comment> commentList = commentRepository.findAllByPid(comment.getId());
        commentList.forEach(cmt -> {
            fileDeleteService.deleteFiles(comment.getMedia(),MediaType.COMMENT);
            commentRepository.delete(cmt);
        });
        commentRepository.delete(comment);
    }
}
