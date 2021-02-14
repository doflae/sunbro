package com.humorpage.sunbro.service;

import com.humorpage.sunbro.advice.exception.CIdSigninFailedException;
import com.humorpage.sunbro.model.Board;
import com.humorpage.sunbro.model.Comment;
import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.respository.CommentRepository;
import com.humorpage.sunbro.respository.UserRepository;
import com.humorpage.sunbro.respository.UserSimpleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserSimpleRepository userSimpleRepository;

    @Autowired
    private BoardRepository boardRepository;

    public Comment save(UserSimple userSimple, Long board_id, Comment comment){
        Board board = boardRepository.findById(board_id).orElseThrow(CIdSigninFailedException::new);
        comment.setAuthor(userSimple);
        comment.setBoard(board);
        return commentRepository.save(comment);
    }
}
