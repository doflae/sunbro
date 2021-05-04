package com.humorpage.sunbro.service;

import com.humorpage.sunbro.advice.exception.BoardNotFoundException;
import com.humorpage.sunbro.model.Board;
import com.humorpage.sunbro.model.BoardThumbnail;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.BoardLikesRepository;
import com.humorpage.sunbro.respository.BoardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class BoardService {

    @Autowired
    private BoardLikesRepository boardLikesRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private FileDeleteService fileDeleteService;

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

    //TODO IOException 처리
    @Transactional(rollbackFor = BoardNotFoundException.class, noRollbackFor = IOException.class)
    public void delete(Long bid, UserSimple userSimple)
            throws IOException, BoardNotFoundException{
        Board board = boardRepository.findById(bid).orElseThrow(()->new BoardNotFoundException("BoardID"));
        if(board.getAuthorNum().equals(userSimple.getUserNum())){
            try {
                boardRepository.delete(board);
                fileDeleteService.deleteDir(board.getMediaDir(), board);
            }catch (Exception e){
                e.printStackTrace();
            }
        }
    }
}
