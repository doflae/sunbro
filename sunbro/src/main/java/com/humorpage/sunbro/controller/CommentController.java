package com.humorpage.sunbro.controller;


import com.humorpage.sunbro.advice.exception.CIdSigninFailedException;
import com.humorpage.sunbro.model.Comment;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.CommentLikesRepository;
import com.humorpage.sunbro.respository.CommentRepository;
import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.result.ListResult;
import com.humorpage.sunbro.service.CommentService;
import com.humorpage.sunbro.service.LikesService;
import com.humorpage.sunbro.service.ResponseService;
import com.humorpage.sunbro.vaildator.CommentValidator;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashSet;
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
    private CommentLikesRepository commentLikesRepository;

    @Autowired
    private CommentRepository commentRepository;

    @ApiOperation(value = "댓글 열람",notes = "게시글의 id를 받아 해당 글의 댓글 열람")
    @GetMapping(value = "/list")
    public ListResult<Comment> getComment(@RequestParam(value = "board_id") Long board_id, @RequestParam(value="last_id", required = false)Long comment_id, Authentication authentication){
        List<Comment> commentList;
        if(comment_id==null){
            commentList=commentRepository.findTop3ByBoardIdOrderByLikesAsc(board_id);
        }else{
            commentList=commentRepository.findByBoardIdGreaterThanOrderByIdAsc(board_id,comment_id, PageRequest.of(0,10));
        }
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            HashSet<Long> commentlikesList= new HashSet<>(commentLikesRepository.findAllByUsercustom(userSimple.getUsernum()));
            commentList.forEach(comment -> {
                comment.setLike(commentlikesList.contains(comment.getId()));
            });
        }catch (NullPointerException ignored){

        }
        return responseService.getListResult(commentList);
    }

    @ApiOperation(value = "댓글 달기", notes = "html코드를 받아 댓글 작성")
    @PostMapping(value = "/upload")
    public CommonResult uploadComment(@Valid Comment comment, @RequestParam("board_id") Long board_id, BindingResult bindingResult, Authentication authentication){
        commentValidator.validate(comment,bindingResult);
        UserSimple userSimple = null;
        try{
            userSimple = (UserSimple) authentication.getPrincipal();
        }catch (NullPointerException ignored){

        }
        if(bindingResult.hasErrors()){
            //bindingResult에 오류 내역잇으니 뽑아서 응답에 넣고 프론트에서 처리하는 걸로
            return responseService.getFailResult();
        }
        try{
            commentService.save(userSimple,board_id,comment);
            return responseService.getSuccessResult();
        }
        catch (CIdSigninFailedException e){
            return responseService.getFailResult();
        }
    }

    @ApiOperation(value = "댓글좋아요", notes = "comment_id를 받아 좋아요 on/off")
    @PostMapping(value = "/like")
    public CommonResult likeComment(@RequestParam("id") Long comment_id, @RequestParam("onoff") boolean on, Authentication authentication){
        UserSimple userSimple;
        try{
            userSimple = (UserSimple) authentication.getPrincipal();
        }catch (NullPointerException e){
            return responseService.setDetailResult(false, -1, "Token Expired");
        }
        if(on){
            likesService.savelikeComment(userSimple.getUsernum(),comment_id);
        }else{
            likesService.deletelikeComment(userSimple.getUsernum(),comment_id);
        }
        return responseService.getSuccessResult();
    }
}
