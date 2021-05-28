package com.humorpage.sunbro.service;

import com.humorpage.sunbro.advice.exception.BoardNotFoundException;
import com.humorpage.sunbro.model.Board;
import com.humorpage.sunbro.model.BoardDetail;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.BoardLikesRepository;
import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.respository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;

@Service
public class BoardService {

    @Autowired
    private BoardLikesRepository boardLikesRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private FileDeleteService fileDeleteService;

    @Autowired
    private RedisRankingService redisRankingService;

    @Autowired
    private CommentRepository commentRepository;

    public void save(Board board) throws IOException {
        if(board.getId()==null){
            boardRepository.save(board);
            redisRankingService.addBoard(board.getId());
        }else{
            fileDeleteService.refreshDir(board.getContent(),board.getThumbnail());
            boardRepository.save(board);
        }
    }

    public void setTransientBoard(
            List<BoardDetail> boardDetailList,
            Authentication authentication)
    {
        if(authentication!=null && authentication.isAuthenticated()){
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            HashSet<Long> boardlikesList = new HashSet<>(boardLikesRepository.findAllByUserCustom(userSimple.getUserNum()));
            boardDetailList.forEach(boardThumbnail -> {
                boardThumbnail.setLike(boardlikesList.contains(boardThumbnail.getId()));
            });
        }
    }


    public void getTopNComment(
            List<BoardDetail> boardDetailList,
            Long page_size,
            Authentication authentication)
    {
            boardDetailList.forEach(boardDetail -> {
                boardDetail.setComments(
                        commentRepository.findByIdIn(
                                redisRankingService.getCommentRanking(
                                    boardDetail.getId(),0L,page_size)));
            });
    }

    //TODO IOException 처리
    //IOException 발생 시 log를 남기든, 예외 처리 필요
    @Transactional(rollbackFor = BoardNotFoundException.class, noRollbackFor = IOException.class)
    public void delete(Long bid, UserSimple userSimple)
            throws IOException, BoardNotFoundException{
        Board board = boardRepository.findById(bid).orElseThrow(()->new BoardNotFoundException("ID",String.valueOf(bid)));
        if(board.getAuthorNum().equals(userSimple.getUserNum())){
            try {
                boardRepository.delete(board);
                redisRankingService.deleteBoard(bid);
                fileDeleteService.deleteDir(board.getMediaDir(), board);
            }catch (Exception e){
                e.printStackTrace();
            }
        }
    }
}
