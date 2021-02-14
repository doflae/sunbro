package com.humorpage.sunbro.controller;

import com.humorpage.sunbro.advice.exception.CIdSigninFailedException;
import com.humorpage.sunbro.model.Board;
import com.humorpage.sunbro.model.BoardThumbnail;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.respository.BoardThumbnailRepository;
import com.humorpage.sunbro.respository.UserRepository;
import com.humorpage.sunbro.respository.UserSimpleRepository;
import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.result.ListResult;
import com.humorpage.sunbro.result.SingleResult;
import com.humorpage.sunbro.service.*;
import com.humorpage.sunbro.vaildator.BoardVaildator;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.thymeleaf.util.StringUtils;

import javax.validation.Valid;

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
    private BoardService boardService;

    @Autowired
    private BoardVaildator boardVaildator;

    @Autowired
    private ResponseService responseService;

    @Autowired
    private LikesService likesService;

    @Autowired
    private UserSimpleRepository userSimpleRepository;

    @Autowired
    private CacheRankingService cacheRankingService;


    @ApiOperation(value = "업로드", notes="html코드를 받아 최종적으로 업로드한다.")
    @PostMapping(value = "/form")
    public CommonResult postForm(@Valid Board board, BindingResult bindingResult, Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            boardVaildator.validate(board, bindingResult);
            if (bindingResult.hasErrors()){
                //bindingResult에 오류 내역있으니 뽑아서 응답에 넣고 프론트에서 처리하는 걸로
                return responseService.getFailResult();
            }
            boardService.save(userSimple,board);
            return responseService.getSuccessResult();
        }catch (NullPointerException e){
            return responseService.setDetailResult(false,-1,"Need to Login");
        }
    }
    @ApiOperation(value = "좋아요", notes="board_id를 받아 좋아요 on/off")
    @PostMapping(value = "/like")
    public CommonResult likeBoard(@RequestParam("id") Long board_id,@RequestParam("onoff") boolean on, Authentication authentication){
        UserSimple userSimple;
        try{
            userSimple = (UserSimple)authentication.getPrincipal();
        }catch (NullPointerException e){
            return responseService.setDetailResult(false, -1, "Token Expired");
        }
        if(on){
            likesService.savelikeBoard(userSimple.getUsernum(),board_id);
        }
        else{
            likesService.deletelikeBoard(userSimple.getUsernum(), board_id);
        }
        return responseService.getSuccessResult();
    }

    @GetMapping("/recently")
    ListResult<BoardThumbnail> recently(@RequestParam(value = "board_id",required = false) Long board_id){
        if(board_id==null){
            return responseService.getListResult(boardThumbnailRepository.findByOrderByIdDesc(PageRequest.of(0,10)));
        }else{
            return responseService.getListResult(boardThumbnailRepository.findByIdLessThanOrderByIdDesc(board_id, PageRequest.of(0,10)));
        }
    }

    @GetMapping("/rank")
    ListResult<BoardThumbnail> ranked(@RequestParam(required = false, defaultValue = "DAILY") RankingType rankType){
        return responseService.getListResult(cacheRankingService.getRanking(rankType));
    }

    @GetMapping("/detail/{board_id}")
    SingleResult<Board> detail(@PathVariable("board_id") Long id){
        try {
            Board board = boardRepository.findById(id).orElseThrow(CIdSigninFailedException::new);
            return responseService.getSingleResult(board);
        }
        catch (CIdSigninFailedException e){
            return responseService.getFailSingleResult();
        }
    }

    @GetMapping("/search")
    ListResult<BoardThumbnail> all(@RequestParam(required = false, defaultValue = "") String title,
                   @RequestParam(required = false, defaultValue = "") String uid,
                   @RequestParam(required = false, defaultValue = "") String content) {

        if (StringUtils.isEmpty(title) && StringUtils.isEmpty(content) && StringUtils.isEmpty(uid)) {
            return responseService.getNullListResult();
        }
        else if(StringUtils.isEmpty(title) && StringUtils.isEmpty(content)){
            try{
                UserSimple target = userSimpleRepository.findByUid(uid).orElseThrow(CIdSigninFailedException::new);
                return responseService.getListResult(boardThumbnailRepository.findAllByAuthor(target.getUsernum()));
            }
            catch (CIdSigninFailedException e){
                return responseService.getNullListResult();
            }
        }
        else if(StringUtils.isEmpty(title) && StringUtils.isEmpty(uid)){
            return responseService.getListResult(boardThumbnailRepository.findByContentContaining(content));
        }
        else if (StringUtils.isEmpty(content) && StringUtils.isEmpty(uid)){
            return responseService.getListResult(boardThumbnailRepository.findByTitleContaining(title));
        }else if (StringUtils.isEmpty(uid)){
            return responseService.getListResult(boardThumbnailRepository.findByTitleContainingOrContentContaining(title,content));
        }else{
            return responseService.getNullListResult();
        }
    }
}
