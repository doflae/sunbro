package com.humorpage.sunbro.controller;

import com.humorpage.sunbro.advice.exception.CIdSigninFailedException;
import com.humorpage.sunbro.model.Board;
import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.service.BoardService;
import com.humorpage.sunbro.service.CacheRankingService;
import com.humorpage.sunbro.service.LikesService;
import com.humorpage.sunbro.service.ResponseService;
import com.humorpage.sunbro.vaildator.BoardVaildator;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/board")
public class BoardController {

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private BoardService boardService;

    @Autowired
    private BoardVaildator boardVaildator;

    @Autowired
    private ResponseService responseService;

    @Autowired
    private LikesService likesService;

    @Autowired
    private CacheRankingService cacheRankingService;


    @ApiOperation(value = "업로드", notes="html코드를 받아 최종적으로 업로드한다.")
    @PostMapping(value = "/form")
    public CommonResult postForm(@Valid Board board, BindingResult bindingResult, Authentication authentication){
        boardVaildator.validate(board, bindingResult);
        if (bindingResult.hasErrors()){
            //bindingResult에 오류 내역있으니 뽑아서 응답에 넣고 프론트에서 처리하는 걸로
            return responseService.getFailResult();
        }
        String username = authentication.getName();
        boardService.save(username, board);
        return responseService.getSuccessResult();
    }
    @ApiOperation(value = "좋아요", notes="board_id를 받아 좋아요 on/off")
    @PostMapping(value = "/like")
    public CommonResult likeBoard(@RequestParam("board_id") Long board_id, Authentication authentication){
        String uid = authentication.getName();
        try{
            likesService.save(uid,board_id);
            return responseService.getSuccessResult();
        }catch (CIdSigninFailedException e){
            return responseService.getFailResult();
        }
    }

    @GetMapping("/recently")
    List<Board> recently(@RequestParam(required = false, value="board_key") Long board_id){
        if(board_id==null){
            return boardRepository.findRecentlyWithoutId();
        }else{
            return boardRepository.findRecentlyWithId(board_id);
        }
    }

}
