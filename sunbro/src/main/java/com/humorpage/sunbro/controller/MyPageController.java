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
    ListResult<BoardThumbnail> myboard(@RequestParam(required = false, defaultValue = "0") Long board_id,
                                       Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            HashSet<Long> boardlikesList = new HashSet<>(boardLikesRepository.findAllByUsercustom(userSimple.getUsernum()));
            List<BoardThumbnail> boardThumbnailList = boardThumbnailRepository.findByAuthorAndIdGreaterThan(userSimple.getUsernum(), board_id, PageRequest.of(0,10));
            boardThumbnailList.forEach(boardThumbnail -> {
                boardThumbnail.setLike((boardlikesList.contains(boardThumbnail.getId())));
            });
            return responseService.getListResult(boardThumbnailList);
        }catch (NullPointerException e){
            return responseService.getFailedListResult();
        }
    }
}
