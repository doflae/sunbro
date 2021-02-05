package com.humorpage.sunbro.service;

import com.humorpage.sunbro.advice.exception.CIdSigninFailedException;
import com.humorpage.sunbro.model.Board;
import com.humorpage.sunbro.model.Boardlikes;
import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.respository.BoardLikesRepository;
import com.humorpage.sunbro.respository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LikesService {

    @Autowired
    private BoardLikesRepository boardLikesRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BoardRepository boardRepository;

    public Boardlikes save(String uid, Long board_id){
        Boardlikes likes = new Boardlikes();
        User user = userRepository.findByUid(uid).orElseThrow(CIdSigninFailedException::new);
        Board board = boardRepository.findById(board_id).orElseThrow(CIdSigninFailedException::new);
        likes.setBoard(board);
        likes.setUser(user);
        return boardLikesRepository.save(likes);
    }
}
