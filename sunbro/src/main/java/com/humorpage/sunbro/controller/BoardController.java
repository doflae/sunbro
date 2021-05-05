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
import org.springframework.web.bind.annotation.*;
import org.thymeleaf.util.StringUtils;

import java.io.IOException;
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
    private LikesService likesService;

    @Autowired
    private UserSimpleRepository userSimpleRepository;

    @Autowired
    private CacheRankingService cacheRankingService;

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
        if(authentication!=null && authentication.isAuthenticated()){
            Board board = boardRepository
                    .findById(bid).orElseThrow(()-> new BoardNotFoundException("ID",String.valueOf(bid)));
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            if(board.getAuthorNum().equals(userSimple.getUserNum())){
                return responseService.getSingleResult(board);
            }
        }
        return responseService.getFailSingleResult();
    }

    @GetMapping(value = "/dir")
    SingleResult<String> getDirectory(Authentication authentication){
        if(authentication!=null && authentication.isAuthenticated()){
            return responseService.getSingleResult(assignDirectoryService.assignDirectory());
        }
        return responseService.getFailSingleResult();
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

    @PostMapping(value="/delete")
    CommonResult deleteBoard(@RequestParam List<Long> boardList, Authentication authentication){
        if(authentication!=null && authentication.isAuthenticated()){
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            boardList.forEach(bid->{
                try{
                    boardService.delete(bid,userSimple);
                }catch (Exception ignored){

                }
            });
            return responseService.getSuccessResult();
        }
        return responseService.getFailResult();
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
    CommonResult postForm(@ModelAttribute Board board,
                          Authentication authentication){
        if(authentication!=null && authentication.isAuthenticated()){
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            board.setAuthorNum(userSimple.getUserNum());
            if(board.getId()!=null){
                try{
                    fileDeleteService.refreshDir(board.getContent(),board.getThumbnail());
                }catch (IOException ignored){

                }
            }
            boardRepository.save(board);
            return responseService.getSuccessResult();
        }
        return responseService.getDetailResult(false,-1,"Need to Login");
    }

    @ApiOperation(value = "좋아요", notes="board_id를 받아 좋아요 on")
    @GetMapping(value = "/likeon")
    CommonResult likeBoard(@RequestParam(value = "id") Long board_id, Authentication authentication){
        UserSimple userSimple;
        try{
            userSimple = (UserSimple)authentication.getPrincipal();
        }catch (NullPointerException e){
            return responseService.getDetailResult(false, -1, "Token Expired");
        }
        likesService.saveLikeBoard(userSimple.getUserNum(),board_id);
        return responseService.getSuccessResult();
    }

    @ApiOperation(value="좋아요 취소",notes = "board_id를 받아 좋아요 off")
    @GetMapping(value = "likeoff")
    CommonResult likeCancelBoard(@RequestParam(value = "id") Long board_id, Authentication authentication){
        UserSimple userSimple;
        try{
            userSimple = (UserSimple) authentication.getPrincipal();
        }catch (NullPointerException e){
            return responseService.getDetailResult(false, -1, "Token Expired");
        }
        likesService.deletelikeBoard(userSimple.getUserNum(),board_id);
        return responseService.getSuccessResult();
    }

    @GetMapping("/recently")
    ListResult<BoardDetail> recently(@RequestParam(value = "board_id",required = false) Long board_id, Authentication authentication){
        List<BoardDetail> boardDetailList;
        if(board_id==null){
            boardDetailList = boardDetailRepository.findByOrderByIdDesc(PageRequest.of(0,5));
            System.out.println(boardDetailList);
        }else{
            boardDetailList = boardDetailRepository.findByIdLessThanOrderByIdDesc(board_id, PageRequest.of(0,5));
        }
        return responseService.getListResult(boardService.setTransientBoard(boardDetailList,authentication));
    }

    @GetMapping("/rank")
    ListResult<BoardDetail> ranked(@RequestParam(required = false, defaultValue = "DAILY") RankingType rankType, Authentication authentication){
        List<BoardDetail> boardDetailList = cacheRankingService.getRanking(rankType);
        return responseService.getListResult(boardService.setTransientBoard(boardDetailList,authentication));
    }

    @GetMapping("/content/{board_id}")
    SingleResult<String> detail(@PathVariable("board_id") Long id){
        return responseService.getSingleResult(boardRepository.findByIdOnlyContent(id));
    }

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
        if (StringUtils.isEmpty(title) && StringUtils.isEmpty(content) && StringUtils.isEmpty(uid)) {
            return responseService.getFailedListResult();
        }

        if(StringUtils.isEmpty(title) && StringUtils.isEmpty(content)){
            try{
                UserSimple target = userSimpleRepository
                        .findByUid(uid).orElseThrow(()-> new UserNotFoundException("ID",uid));
                boardDetailList = boardDetailRepository.findAllByAuthorNum(target.getUserNum());
            }
            catch (UserNotFoundException ignored){

            }
        }
        else if(StringUtils.isEmpty(title) && StringUtils.isEmpty(uid)){
            boardDetailList = boardDetailRepository.findByContentContaining(content);
        }
        else if (StringUtils.isEmpty(content) && StringUtils.isEmpty(uid)){
            boardDetailList = boardDetailRepository.findByTitleContaining(title);
        }else if (StringUtils.isEmpty(uid)){
            boardDetailList = boardDetailRepository.findByTitleContainingOrContentContaining(title,content);
        }

        if (boardDetailList ==null)
            return responseService.getListResult(null);
        return responseService.getListResult(boardService.setTransientBoard(boardDetailList,authentication));
    }
}
