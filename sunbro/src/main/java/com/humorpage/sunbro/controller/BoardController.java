package com.humorpage.sunbro.controller;

import com.humorpage.sunbro.advice.exception.CIdSigninFailedException;
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

@RestController
@RequestMapping("/board")
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
    private BoardLikesRepository boardLikesRepository;

    @Autowired
    private CacheRankingService cacheRankingService;

    @Autowired
    private FileUploadService fileUploadService;

    @Autowired
    private BoardDetailRepository boardDetailRepository;

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
            BoardSimple boardSimple = boardSimpleRepository.findById(bid).orElseThrow(CIdSigninFailedException::new);
            if(boardSimple.getAuthor().equals(authentication.getPrincipal())){
                return responseService.getSingleResult(boardSimple);
            }
        }catch (Exception e){
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
            BoardDetail boardDetail = boardDetailRepository.findById(bid).orElseThrow(CIdSigninFailedException::new);
            return responseService.getSingleResult(boardDetail);
        }catch (CIdSigninFailedException e){
            return responseService.getFailSingleResult();
        }
    }

    @PostMapping(value="/delete")
    CommonResult deleteBoard(@RequestParam List<Long> boardList, Authentication authentication){
        if(authentication==null) return responseService.getFailResult();
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();

            boardList.forEach(bid->{
                try{
                    Board board = boardRepository.findById(bid).orElseThrow(CIdSigninFailedException::new);
                    if(board.getAuthor().getUsernum().equals(userSimple.getUsernum())){
                        fileDeleteService.deleteDir(board.getMediaDir(), board.getId());
                        boardRepository.delete(board);
                    }
                }catch (CIdSigninFailedException ignored){

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
     */
    @PostMapping(value = "/upload")
    CommonResult postForm(@ModelAttribute Board board,
                          Authentication authentication){
        UserSimple userSimple;
        try{
            userSimple = (UserSimple) authentication.getPrincipal();

        }catch (NullPointerException e){
            return responseService.getDetailResult(false,-1,"Need to Login");
        }
        board.setAuthor(userSimple);
        if(board.getId()!=null){
            try{

            }catch (IOException ignored){

            }
        }
        boardRepository.save(board);
        return responseService.getSuccessResult();
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
        likesService.savelikeBoard(userSimple.getUsernum(),board_id);
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
        likesService.deletelikeBoard(userSimple.getUsernum(),board_id);
        return responseService.getSuccessResult();
    }

    @GetMapping("/recently")
    ListResult<BoardThumbnail> recently(@RequestParam(value = "board_id",required = false) Long board_id, Authentication authentication){
        List<BoardThumbnail> boardThumbnailList;
        if(board_id==null){
            boardThumbnailList = boardThumbnailRepository.findByOrderByIdDesc(PageRequest.of(0,10));
        }else{
            boardThumbnailList = boardThumbnailRepository.findByIdLessThanOrderByIdDesc(board_id, PageRequest.of(0,10));
        }
        try {
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            HashSet<Long> boardlikesList = new HashSet<>(boardLikesRepository.findAllByUsercustom(userSimple.getUsernum()));
            boardThumbnailList.forEach(boardThumbnail -> {
                boardThumbnail.setLike(boardlikesList.contains(boardThumbnail.getId()));
            });
        }catch (NullPointerException ignored){

        }

        return responseService.getListResult(boardThumbnailList);
    }

    @GetMapping("/rank")
    ListResult<BoardThumbnail> ranked(@RequestParam(required = false, defaultValue = "DAILY") RankingType rankType, Authentication authentication){
        List<BoardThumbnail> boardThumbnailList = cacheRankingService.getRanking(rankType);
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            HashSet<Long> boardlikesList = new HashSet<>(boardLikesRepository.findAllByUsercustom(userSimple.getUsernum()));
            boardThumbnailList.forEach(boardThumbnail -> {
                boardThumbnail.setLike(boardlikesList.contains(boardThumbnail.getId()));
            });
        }catch (NullPointerException ignored){

        }
        return responseService.getListResult(boardThumbnailList);
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
        List<BoardThumbnail> boardThumbnailList;
        if (StringUtils.isEmpty(title) && StringUtils.isEmpty(content) && StringUtils.isEmpty(uid)) {
            boardThumbnailList=null;
        }
        else if(StringUtils.isEmpty(title) && StringUtils.isEmpty(content)){
            try{
                UserSimple target = userSimpleRepository.findByUid(uid).orElseThrow(CIdSigninFailedException::new);
                boardThumbnailList = boardThumbnailRepository.findAllByAuthor(target.getUsernum());
            }
            catch (CIdSigninFailedException e){
                boardThumbnailList = null;
            }
        }
        else if(StringUtils.isEmpty(title) && StringUtils.isEmpty(uid)){
            boardThumbnailList = boardThumbnailRepository.findByContentContaining(content);
        }
        else if (StringUtils.isEmpty(content) && StringUtils.isEmpty(uid)){
            boardThumbnailList = boardThumbnailRepository.findByTitleContaining(title);
        }else if (StringUtils.isEmpty(uid)){
            boardThumbnailList = boardThumbnailRepository.findByTitleContainingOrContentContaining(title,content);
        }else{
            boardThumbnailList = null;
        }
        if (boardThumbnailList==null)
            return responseService.getListResult(null);
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            HashSet<Long> boardlikesList = new HashSet<>(boardLikesRepository.findAllByUsercustom(userSimple.getUsernum()));
            boardThumbnailList.forEach(boardThumbnail -> {
                boardThumbnail.setLike(boardlikesList.contains(boardThumbnail.getId()));
            });
        }catch (NullPointerException ignored){

        }
        return responseService.getListResult(boardThumbnailList);
    }
}
