package com.humorpage.sunbro.service;

import com.humorpage.sunbro.advice.exception.CIdSigninFailedException;
import com.humorpage.sunbro.model.Board;
import com.humorpage.sunbro.model.Comment;
import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.respository.CommentRepository;
import com.humorpage.sunbro.respository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BoardRepository boardRepository;

    public Comment save(String uid, Long board_id, Comment comment){
        User user = userRepository.findByUid(uid).orElseThrow(CIdSigninFailedException::new);
        Board board = boardRepository.findById(board_id).orElseThrow(CIdSigninFailedException::new);
        comment.setAuthor(user);
        comment.setBoard(board);
        return commentRepository.save(comment);
    }
}
