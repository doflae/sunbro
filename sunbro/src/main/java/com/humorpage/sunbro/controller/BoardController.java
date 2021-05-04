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
import java.util.HashSet;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/board")
@CrossOrigin(value = "http://localhost:3000", allowCredentials = "true")
public class BoardController {

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BoardThumbnailRepository boardThumbnailRepository;

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
    private BoardDetailRepository boardDetailRepository;

    @Autowired
    private BoardService boardService;

    @Autowired
    private AssignDirectoryService assignDirectoryService;

    @Autowired
    private BoardSimpleRepository boardSimpleRepository;

    @Autowired
    private FileDeleteService fileDeleteService;

    @GetMapping(value = "/simple/{bid}")
    SingleResult<BoardSimple> getBoardSimple(@PathVariable Long bid,
                                             Authentication authentication){
        try {
            BoardSimple boardSimple = boardSimpleRepository
                    .findById(bid).orElseThrow(()-> new BoardNotFoundException("BoardID"));
            if(boardSimple.getAuthor().equals(authentication.getPrincipal())){
                return responseService.getSingleResult(boardSimple);
            }
        }catch (BoardNotFoundException e){
            return responseService.getFailSingleResult();
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
            BoardDetail boardDetail = boardDetailRepository.findById(bid).orElseThrow(()->new BoardNotFoundException("BoardID"));
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
                    fileDeleteService.refreshDir(board.getContent(),board.getThumbnailImg());
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
    ListResult<BoardThumbnail> recently(@RequestParam(value = "board_id",required = false) Long board_id, Authentication authentication){
        List<BoardThumbnail> boardThumbnailList;
        if(board_id==null){
            boardThumbnailList = boardThumbnailRepository.findByOrderByIdDesc(PageRequest.of(0,5));
        }else{
            boardThumbnailList = boardThumbnailRepository.findByIdLessThanOrderByIdDesc(board_id, PageRequest.of(0,5));
        }
        return responseService.getListResult(boardService.setTransientBoard(boardThumbnailList,authentication));
    }

    @GetMapping("/rank")
    ListResult<BoardThumbnail> ranked(@RequestParam(required = false, defaultValue = "DAILY") RankingType rankType, Authentication authentication){
        List<BoardThumbnail> boardThumbnailList = cacheRankingService.getRanking(rankType);
        return responseService.getListResult(boardService.setTransientBoard(boardThumbnailList,authentication));
    }

    @GetMapping("/content/{board_id}")
    SingleResult<String> detail(@PathVariable("board_id") Long id){
        return responseService.getSingleResult(boardRepository.findByIdOnlyContent(id));
    }

    @GetMapping("/user")
    @ApiOperation(value = "유저 key값", notes="유저 key값을 받아 조회 last_id는 가장 최근 조회 게시물")
    ListResult<BoardThumbnail> user(Long usernum,
                                    @RequestParam(required = false) Long last_id){
        if(usernum>0){
            if(last_id==null||last_id==0) return responseService.getListResult(boardThumbnailRepository.findByAuthorNumOrderByIdDesc(usernum,PageRequest.of(0,10)));
            else return responseService.getListResult(boardThumbnailRepository.findByAuthorNumAndIdLessThanOrderByIdDesc(usernum,last_id,PageRequest.of(0,10)));
        }
        return responseService.getFailedListResult();
    }

    @GetMapping("/search")
    ListResult<BoardThumbnail> Search(@RequestParam(required = false, defaultValue = "") String title,
                   @RequestParam(required = false, defaultValue = "") String uid,
                   @RequestParam(required = false, defaultValue = "") String content,Authentication authentication) {
        List<BoardThumbnail> boardThumbnailList=null;
        if (StringUtils.isEmpty(title) && StringUtils.isEmpty(content) && StringUtils.isEmpty(uid)) {
            return responseService.getFailedListResult();
        }

        if(StringUtils.isEmpty(title) && StringUtils.isEmpty(content)){
            try{
                UserSimple target = userSimpleRepository
                        .findByUid(uid).orElseThrow(()-> new UserNotFoundException("ID",uid));
                boardThumbnailList = boardThumbnailRepository.findAllByAuthor(target.getUserNum());
            }
            catch (UserNotFoundException ignored){

            }
        }
        else if(StringUtils.isEmpty(title) && StringUtils.isEmpty(uid)){
            boardThumbnailList = boardThumbnailRepository.findByContentContaining(content);
        }
        else if (StringUtils.isEmpty(content) && StringUtils.isEmpty(uid)){
            boardThumbnailList = boardThumbnailRepository.findByTitleContaining(title);
        }else if (StringUtils.isEmpty(uid)){
            boardThumbnailList = boardThumbnailRepository.findByTitleContainingOrContentContaining(title,content);
        }

        if (boardThumbnailList==null)
            return responseService.getListResult(null);
        return responseService.getListResult(boardService.setTransientBoard(boardThumbnailList,authentication));
    }
}
