package com.humorpage.sunbro.controller;

import com.humorpage.sunbro.model.BoardSimple;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.result.ListResult;
import com.humorpage.sunbro.service.ResponseService;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/mypage")
public class MyPageController {

    @Autowired
    private ResponseService responseService;

    @ApiOperation(
            value = "유저가 쓴 글",
            notes = "token에 저장되어있는 로그인 정보를 사용"
    )
    @GetMapping(value = "/myboard")
    ListResult<BoardSimple> myboard(@RequestParam(value="board_id", required = false) Long board_id,
                                    Authentication authentication){
        List<BoardSimple> boardSimples;
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            return responseService.getListResult(null);
        }catch (NullPointerException e){
            return responseService.getListResult(null);
        }
    }
}
