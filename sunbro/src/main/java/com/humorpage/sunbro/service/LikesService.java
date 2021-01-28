package com.humorpage.sunbro.service;

import com.humorpage.sunbro.advice.exception.CIdSigninFailedException;
import com.humorpage.sunbro.model.Board;
import com.humorpage.sunbro.model.Likes;
import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.respository.LikesRepository;
import com.humorpage.sunbro.respository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LikesService {

    @Autowired
    private LikesRepository likesRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BoardRepository boardRepository;

    public Likes save(String uid, Long board_id){
        Likes likes = new Likes();
        User user = userRepository.findByUid(uid).orElseThrow(CIdSigninFailedException::new);
        Board board = boardRepository.findById(board_id).orElseThrow(CIdSigninFailedException::new);
        likes.setBoard(board);
        likes.setUser(user);
        return likesRepository.save(likes);
    }
}
