package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.BoardThumbnail;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.BoardLikesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class BoardService {

    @Autowired
    private BoardLikesRepository boardLikesRepository;

    public List<BoardThumbnail> setTransientBoard(
            List<BoardThumbnail> boardThumbnailList,
            Authentication authentication){
        if(authentication!=null && authentication.isAuthenticated()){
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            HashSet<Long> boardlikesList = new HashSet<>(boardLikesRepository.findAllByUsercustom(userSimple.getUserNum()));
            boardThumbnailList.forEach(boardThumbnail -> {
                boardThumbnail.setLike(boardlikesList.contains(boardThumbnail.getId()));
            });
        }
        return boardThumbnailList;
    }
}
