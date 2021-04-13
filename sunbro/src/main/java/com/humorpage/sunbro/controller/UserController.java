package com.humorpage.sunbro.controller;

import com.humorpage.sunbro.model.*;
import com.humorpage.sunbro.respository.BoardForTableRepository;
import com.humorpage.sunbro.respository.BoardLikesRepository;
import com.humorpage.sunbro.respository.BoardThumbnailRepository;
import com.humorpage.sunbro.respository.UserRepository;
import com.humorpage.sunbro.result.ListResult;
import com.humorpage.sunbro.result.SingleResult;
import com.humorpage.sunbro.service.ResponseService;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(value = "http://localhost:3000", allowCredentials = "true")
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private ResponseService responseService;

    @Autowired
    private BoardLikesRepository boardLikesRepository;

    @Autowired
    private BoardForTableRepository boardForTableRepository;

    @Autowired
    private UserRepository userRepository;

    @ApiOperation(
            value = "유저 정보",
            notes = "유저 활동 로그 및 프로필"
    )
    @GetMapping("/log")
    SingleResult<User> myUser(Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            User user = userRepository.findByUserNum(userSimple.getUserNum());
            return responseService.getSingleResult(user);
        }catch (Exception e){
            return responseService.getFailSingleResult();
        }
    }


    @ApiOperation(
            value = "유저가 쓴 글",
            notes = "token에 저장되어있는 로그인 정보를 사용"
    )
    @GetMapping("/board")
    ListResult<BoardForTable> myboard(@RequestParam(required = false, defaultValue = "10") int size,
                                       @RequestParam int num,
                                       Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            List<BoardForTable> boardList = boardForTableRepository.findByAuthorNumOrderByIdDesc(userSimple.getUserNum(), PageRequest.of(num,size));
            return responseService.getListResult(boardList);
        }catch (NullPointerException e){
            return responseService.getFailedListResult();
        }
    }

    @ApiOperation(
            value = "유저가 좋아요 누른 글",
            notes = "token에 저장되어있는 로그인 정보를 사용"
    )
    @GetMapping("/likes")
    ListResult<BoardForTable> myLikes(@RequestParam(required = false, defaultValue = "10") int size,
                                       @RequestParam int num,
                                       Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            List<Long> boardLikesList = boardLikesRepository.findAllByUsercustom(userSimple.getUserNum());
            List<BoardForTable> boardList = boardForTableRepository.findByIdInOrderByIdDesc(boardLikesList,PageRequest.of(num,size));
            return responseService.getListResult(boardList);
        }catch (NullPointerException e){
            return responseService.getFailedListResult();
        }
    }
}
