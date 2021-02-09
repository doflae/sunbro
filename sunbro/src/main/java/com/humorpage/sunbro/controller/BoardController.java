package com.humorpage.sunbro.controller;

import com.humorpage.sunbro.advice.exception.CIdSigninFailedException;
import com.humorpage.sunbro.model.Board;
import com.humorpage.sunbro.model.BoardThumbnail;
import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.respository.BoardThumbnailRepository;
import com.humorpage.sunbro.respository.UserRepository;
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
    public CommonResult likeBoard(@RequestParam("id") Long board_id,@RequestParam("onoff") boolean on, Authentication authentication){
        Long usernum;
        try{
            UserSimple userSimple = (UserSimple)authentication.getPrincipal();
            usernum = userSimple.getUsernum();
        }catch (NullPointerException e){
            return responseService.setDetailResult(false, -1, "Token Expired");
        }
        if(on){
            likesService.savelikeBoard(usernum,board_id);
        }
        else{
            likesService.deletelikeBoard(usernum, board_id);
        }
        return responseService.getSuccessResult();
    }

    @GetMapping("/recently")
    List<BoardThumbnail> recently(@RequestParam(value = "board_id",required = false) Long board_id){
        if(board_id==null){
            return boardThumbnailRepository.findByOrderByIdDesc(PageRequest.of(0,10));
        }else{
            return boardThumbnailRepository.findByIdLessThanOrderByIdDesc(board_id, PageRequest.of(0,10));
        }
    }

    @GetMapping("/rank")
    List<BoardThumbnail> ranked(@RequestParam(required = false, defaultValue = "DAILY") RankingType rankType){
        return cacheRankingService.getRanking(rankType);
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
            return (ListResult<BoardThumbnail>) responseService.getFailResult();
        }
        else if(StringUtils.isEmpty(title) && StringUtils.isEmpty(content)){
            try{
                User user = userRepository.findByUid(uid).orElseThrow(CIdSigninFailedException::new);
                return responseService.getListResult(user.getBoards());
            }
            catch (CIdSigninFailedException e){
                return (ListResult<BoardThumbnail>) responseService.getFailResult();
            }
        }
        else if(StringUtils.isEmpty(title) && StringUtils.isEmpty(uid)){
            return responseService.getListResult(boardThumbnailRepository.findByContent(content));
        }
        else {
            return responseService.getListResult(boardThumbnailRepository.findByTitle(title));
        }
    }
}
