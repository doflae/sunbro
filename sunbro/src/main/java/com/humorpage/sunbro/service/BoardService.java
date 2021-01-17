package com.humorpage.sunbro.service;

import com.humorpage.sunbro.advice.exception.CIdSigninFailedException;
import com.humorpage.sunbro.model.Board;
import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.respository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class BoardService {

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private UserRepository userRepository;


    public Board save(String uid, Board board) {
        User user = userRepository.findByUid(uid).orElseThrow(CIdSigninFailedException::new);
        board.setUser(user);
        return boardRepository.save(board);
    }



}
