package com.humorpage.sunbro.controller;

import com.humorpage.sunbro.advice.exception.BoardNotFoundException;
import com.humorpage.sunbro.advice.exception.UserNotFoundException;
import com.humorpage.sunbro.model.*;
import com.humorpage.sunbro.respository.*;
import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.result.ListResult;
import com.humorpage.sunbro.result.SingleResult;
import com.humorpage.sunbro.service.*;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/board")
@CrossOrigin(value = "http://localhost:3000", allowCredentials = "true")
public class BoardController {

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BoardDetailRepository boardDetailRepository;

    @Autowired
    private ResponseService responseService;

    @Autowired
    private LikeService likeService;

    @Autowired
    private UserSimpleRepository userSimpleRepository;

    @Autowired
    private RedisRankingService redisRankingService;

    @Autowired
    private FileUploadService fileUploadService;

    @Autowired
    private BoardService boardService;

    @Autowired
    private AssignDirectoryService assignDirectoryService;

    @Autowired
    private FileDeleteService fileDeleteService;

    @GetMapping(value = "/get/{bid}")
    SingleResult<Board> getBoard(@PathVariable Long bid,
                                             Authentication authentication){
        try{
            Board board = boardRepository
                    .findById(bid).orElseThrow(()-> new BoardNotFoundException("ID",String.valueOf(bid)));
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            if(board.getAuthorNum().equals(userSimple.getUserNum())){
                return responseService.getSingleResult(board);
            }
        }catch (Exception ignored){}
        return responseService.getFailSingleResult();
    }

    @GetMapping(value = "/dir")
    SingleResult<String> getDirectory(){
        return responseService.getSingleResult(assignDirectoryService.assignDirectory());
    }

    @GetMapping(value = "/detail/{bid}")
    SingleResult<BoardDetail> getBoardDetail(@PathVariable Long bid){
        try {
            BoardDetail boardDetail = boardDetailRepository.findById(bid).orElseThrow(()->new BoardNotFoundException("ID",String.valueOf(bid)));
            return responseService.getSingleResult(boardDetail);
        }catch (BoardNotFoundException e){
            return responseService.getFailSingleResult();
        }
    }

    //TODO: 삭제 쿼리 하나로
    //TODO: cascade에 의해 부모 댓글 삭제 시 자식 댓글 삭제되는데 쿼리 확인
    @PostMapping(value="/delete")
    CommonResult deleteBoard(@RequestParam List<Long> boardList, Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            boardList.forEach(bid->{
                try{
                    boardService.delete(bid,userSimple);
                }catch (Exception ignored){

                }
            });
            return responseService.getSuccessResult();
        }catch (NullPointerException e){
            return responseService.getFailResult();
        }
    }


    /**
     * @param board
     *                title 제목
     *                content 내용
     *                thumbnail 썸네일에 들어갈 텍스트
     *                board의 id가 존재 할 경우 해당 글 수정
     */
    /*TODO 업로드 트랜잭션화
     */
    @PostMapping(value = "/upload")
    CommonResult upload(@ModelAttribute Board board,
                          Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            board.setAuthorNum(userSimple.getUserNum());
            try{
                boardService.save(board);
            }catch (IOException ignored){
                //TODO 미디어 파일 쓰기 실패 처리
            }
            return responseService.getSuccessResult();
        }catch (NullPointerException e){
            return responseService.getDetailResult(false,-1,"Need to Login");
        }
    }

    @ApiOperation(value = "좋아요", notes="board_id를 받아 좋아요 on")
    @GetMapping(value = "/like/on")
    CommonResult likeBoard(@RequestParam(value = "id") Long board_id,
                           LocalDateTime created,
                           Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple)authentication.getPrincipal();
            likeService.saveLikeBoard(userSimple.getUserNum(),board_id,created);
            return responseService.getSuccessResult();
        }catch (NullPointerException e){
            return responseService.getDetailResult(false, -1, "Token Expired");
        }
    }

    @ApiOperation(value="좋아요 취소",notes = "board_id를 받아 좋아요 off")
    @GetMapping(value = "/like/off")
    CommonResult likeCancelBoard(@RequestParam(value = "id") Long board_id,
                                 LocalDateTime created,
                                 Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            likeService.deleteLikeBoard(userSimple.getUserNum(),board_id,created);
            return responseService.getSuccessResult();
        }catch (NullPointerException e){
            return responseService.getDetailResult(false, -1, "Token Expired");
        }
    }

    @GetMapping("/recently")
    ListResult<BoardDetail> recently(@RequestParam(value = "board_id",required = false) Long board_id, Authentication authentication){
        List<BoardDetail> boardDetailList;
        if(board_id==null){
            boardDetailList = boardDetailRepository.findByOrderByIdDesc(PageRequest.of(0,5));
        }else{
            boardDetailList = boardDetailRepository.findByIdLessThanOrderByIdDesc(board_id, PageRequest.of(0,5));
        }
        boardService.setTransientBoard(boardDetailList,authentication);
        return responseService.getListResult(boardDetailList);
    }

    @GetMapping("/rank")
    ListResult<BoardDetail> ranked(
            RankingType rankType,
            Long last_id,
            Authentication authentication){
        List<Long> boardIdList =
                redisRankingService.getBoardRanking(rankType,last_id,5L);
        List<BoardDetail> boardDetailList = boardDetailRepository.findByIdIn(boardIdList);
        boardService.setTransientBoard(boardDetailList,authentication);
        boardService.getTopNComment(boardDetailList,3L,authentication);
        return responseService.getListResult(boardDetailList);
    }

    @GetMapping("/content/{board_id}")
    SingleResult<String> detail(@PathVariable("board_id") Long id){
        return responseService.getSingleResult(
                boardRepository.findById(id).orElse(new Board()).getContent());
    }

    //TODO: 유저 페이지 구현
    @GetMapping("/user")
    @ApiOperation(value = "유저 key값", notes="유저 key값을 받아 조회 last_id는 가장 최근 조회 게시물")
    ListResult<BoardDetail> user(Long usernum,
                                 @RequestParam(required = false) Long last_id){
        if(usernum>0){
            if(last_id==null||last_id==0) return responseService.getListResult(boardDetailRepository.findByAuthorNumOrderByIdDesc(usernum,PageRequest.of(0,10)));
            else return responseService.getListResult(boardDetailRepository.findByAuthorNumAndIdLessThanOrderByIdDesc(usernum,last_id,PageRequest.of(0,10)));
        }
        return responseService.getFailedListResult();
    }

    @GetMapping("/search")
    ListResult<BoardDetail> Search(@RequestParam(required = false, defaultValue = "") String title,
                                   @RequestParam(required = false, defaultValue = "") String uid,
                                   @RequestParam(required = false, defaultValue = "") String content, Authentication authentication) {
        List<BoardDetail> boardDetailList =null;
        if (!StringUtils.hasText(title) && !StringUtils.hasText(content) && !StringUtils.hasText(uid)) {
            return responseService.getFailedListResult();
        }

        if(!StringUtils.hasText(title) && !StringUtils.hasText(content)){
            try{
                UserSimple target = userSimpleRepository
                        .findByUid(uid).orElseThrow(()-> new UserNotFoundException("ID",uid));
                boardDetailList = boardDetailRepository.findAllByAuthorNum(target.getUserNum());
            }
            catch (UserNotFoundException ignored){

            }
        }
        else if(!StringUtils.hasText(title) && !StringUtils.hasText(uid)){
            boardDetailList = boardDetailRepository.findByContentContaining(content);
        }
        else if (!StringUtils.hasText(content) && !StringUtils.hasText(uid)){
            boardDetailList = boardDetailRepository.findByTitleContaining(title);
        }else if (!StringUtils.hasText(uid)){
            boardDetailList = boardDetailRepository.findByTitleContainingOrContentContaining(title,content);
        }

        if (boardDetailList ==null)
            return responseService.getListResult(null);
        boardService.setTransientBoard(boardDetailList,authentication);
        return responseService.getListResult(boardDetailList);
    }
}
