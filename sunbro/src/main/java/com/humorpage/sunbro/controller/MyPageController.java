package com.humorpage.sunbro.controller;

import com.humorpage.sunbro.model.*;
import com.humorpage.sunbro.respository.BoardLikesRepository;
import com.humorpage.sunbro.respository.BoardThumbnailRepository;
import com.humorpage.sunbro.respository.UserLogRepository;
import com.humorpage.sunbro.result.ListResult;
import com.humorpage.sunbro.result.SingleResult;
import com.humorpage.sunbro.service.ResponseService;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashSet;
import java.util.List;

@RestController
@RequestMapping("/mypage")
public class MyPageController {

    @Autowired
    private ResponseService responseService;

    @Autowired
    private BoardLikesRepository boardLikesRepository;

    @Autowired
    private BoardThumbnailRepository boardThumbnailRepository;

    @Autowired
    private UserLogRepository userLogRepository;

    @ApiOperation(
            value = "유저 정보",
            notes = "유저 활동 로그"
    )
    @GetMapping("/log")
    SingleResult<UserLog> myLog(Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            UserLog userLog = userLogRepository.findByUsernum(userSimple.getUsernum());
            return responseService.getSingleResult(userLog);
        }catch (Exception e){
            return responseService.getFailSingleResult();
        }
    }


    @ApiOperation(
            value = "유저가 쓴 글",
            notes = "token에 저장되어있는 로그인 정보를 사용"
    )
    @GetMapping("/board")
    ListResult<BoardThumbnail> myboard(@RequestParam(required = false, defaultValue = "10") int size,
                                       @RequestParam int num,
                                       Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            List<BoardThumbnail> boardThumbnailList = boardThumbnailRepository.findByAuthorOrderByIdDesc(userSimple, PageRequest.of(num,size));
            return responseService.getListResult(boardThumbnailList);
        }catch (NullPointerException e){
            return responseService.getFailedListResult();
        }
    }

    @ApiOperation(
            value = "유저가 좋아요 누른 글",
            notes = "token에 저장되어있는 로그인 정보를 사용"
    )
    @GetMapping("/likes")
    ListResult<BoardThumbnail> myLikes(@RequestParam(required = false, defaultValue = "10") int size,
                                       @RequestParam int num,
                                       Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            List<Long> boardlikesList = boardLikesRepository.findAllByUsercustom(userSimple.getUsernum());
            List<BoardThumbnail> boardThumbnailList = boardThumbnailRepository.findByIdInOrderByIdDesc(boardlikesList,PageRequest.of(num,size));
            return responseService.getListResult(boardThumbnailList);
        }catch (NullPointerException e){
            return responseService.getFailedListResult();
        }
    }
}
