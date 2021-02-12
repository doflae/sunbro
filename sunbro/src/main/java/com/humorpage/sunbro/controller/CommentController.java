package com.humorpage.sunbro.controller;


import com.humorpage.sunbro.advice.exception.CIdSigninFailedException;
import com.humorpage.sunbro.model.Comment;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.CommentRepository;
import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.result.ListResult;
import com.humorpage.sunbro.service.CommentService;
import com.humorpage.sunbro.service.LikesService;
import com.humorpage.sunbro.service.ResponseService;
import com.humorpage.sunbro.vaildator.CommentValidator;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RequestMapping("/comment")
@RestController
public class CommentController {

    @Autowired
    private CommentValidator commentValidator;

    @Autowired
    private ResponseService responseService;

    @Autowired
    private CommentService commentService;

    @Autowired
    private LikesService likesService;

    @Autowired
    private CommentRepository commentRepository;

    @ApiOperation(value = "댓글 열람",notes = "게시글의 id를 받아 해당 글의 댓글 열람")
    @GetMapping(value = "/list")
    public List<Comment> getComment(@RequestParam(value = "content_id",required = true) Long board_id){
        return commentRepository.findAllByBoardId(board_id);
    }

    @ApiOperation(value = "댓글 달기", notes = "html코드를 받아 댓글 작성")
    @PostMapping(value = "/form")
    public CommonResult postForm(@Valid Comment comment, @RequestParam("board_id") Long board_id, BindingResult bindingResult, Authentication authentication){
        commentValidator.validate(comment,bindingResult);
        if(bindingResult.hasErrors()){
            //bindingResult에 오류 내역잇으니 뽑아서 응답에 넣고 프론트에서 처리하는 걸로
            return responseService.getFailResult();
        }
        String uid = authentication.getName();
        try{
            commentService.save(uid,board_id,comment);
            return responseService.getSuccessResult();
        }
        catch (CIdSigninFailedException e){
            return responseService.getFailResult();
        }
    }

    @ApiOperation(value = "댓글좋아요", notes = "comment_id를 받아 좋아요 on/off")
    @PostMapping(value = "/like")
    public CommonResult likeComment(@RequestParam("id") Long comment_id, @RequestParam("onoff") boolean on, Authentication authentication){
        Long usernum;
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            usernum = userSimple.getUsernum();
        }catch (NullPointerException e){
            return responseService.setDetailResult(false, -1, "Token Expired");
        }
        if(on){
            likesService.savelikeComment(usernum,comment_id);
        }else{
            likesService.deletelikeComment(usernum,comment_id);
        }
        return responseService.getSuccessResult();
    }
}
