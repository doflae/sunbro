package com.humorpage.sunbro.service;

import com.humorpage.sunbro.advice.exception.CIdSigninFailedException;
import com.humorpage.sunbro.model.Board;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.respository.UserSimpleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BoardService {

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private UserSimpleRepository userSimpleRepository;


    public Board save(String uid, Board board) {
        UserSimple userSimple = userSimpleRepository.findByUid(uid).orElseThrow(CIdSigninFailedException::new);
        board.setAuthor(userSimple);
        return boardRepository.save(board);
    }
}
