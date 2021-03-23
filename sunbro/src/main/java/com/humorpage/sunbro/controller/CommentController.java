package com.humorpage.sunbro.controller;


import com.humorpage.sunbro.model.Comment;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.CommentLikesRepository;
import com.humorpage.sunbro.respository.CommentRepository;
import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.result.ListResult;
import com.humorpage.sunbro.result.SingleResult;
import com.humorpage.sunbro.service.CommentService;
import com.humorpage.sunbro.service.LikesService;
import com.humorpage.sunbro.service.ResponseService;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashSet;
import java.util.List;

@RequestMapping("/comment")
@RestController
public class CommentController {


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


    @ApiOperation(value = "댓글 열람",notes = "게시글의 id또는 댓글의 id를 받아 해당 글의 댓글 열람")
    @GetMapping("/list")
    public ListResult<Comment> getComment(@RequestParam(value = "board_id", required = false) Long board_id,
                                          @RequestParam(value = "parent_id", required = false) Long parent_id,
                                          @RequestParam(value = "comment_id", required = false) Long comment_id,
                                          Authentication authentication){
        List<Comment> commentList=null;
        //depth가 0인 댓글
        if(board_id!=null) {
            if (comment_id == null) {
                commentList = commentRepository.findTop3ByBoardAndPidIsOrderByLikesDesc(board_id, 0L);
            } else {
                commentList = commentRepository.findByBoardAndIdGreaterThanAndPidIsOrderByIdAsc(board_id, comment_id, 0L, PageRequest.of(0, 10));
            }
        }
        //대댓글 -> board id 대신 parent comment id가 주어짐
        else if(parent_id!=null){
            if (comment_id == null){
                commentList = commentRepository.findByPidIsOrderByIdAsc(parent_id, PageRequest.of(0,10));
            }else{
                commentList = commentRepository.findByPidIsAndIdGreaterThanOrderByIdAsc(parent_id, comment_id, PageRequest.of(0,10));
            }
        }
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            HashSet<Long> commentlikesList= new HashSet<>(commentLikesRepository.findAllByUsercustom(userSimple.getUserNum()));
            assert commentList != null;
            commentList.forEach(comment -> {
                comment.setLike(commentlikesList.contains(comment.getId()));
            });
        }catch (NullPointerException|AssertionError ignored){

        }
        return responseService.getListResult(commentList);
    }

    @ApiOperation(value = "댓글 달기", notes = "html코드를 받아 댓글 작성")
    @PostMapping(value = "/upload")
    public SingleResult<Comment> uploadComment(@Valid Comment comment,
                                            @RequestParam(required = false,defaultValue = "0") Long board_id,
                                            @RequestParam(required = false,defaultValue = "0") Long comment_id,
                                            Authentication authentication) {
        UserSimple userSimple;
        try{
            userSimple = (UserSimple) authentication.getPrincipal();
        }catch (NullPointerException ignored){
            return responseService.getFailSingleResult();
        }
        commentService.save(userSimple,board_id, comment_id,comment);
        return responseService.getSingleResult(comment);

    }

    @ApiOperation(value = "댓글 좋아요", notes = "comment_id를 받아 좋아요 on")
    @GetMapping(value = "/likeon")
    public CommonResult likeComment(@RequestParam("id") Long comment_id, Authentication authentication){
        UserSimple userSimple;
        try{
            userSimple = (UserSimple) authentication.getPrincipal();
        }catch (NullPointerException e){
            return responseService.getDetailResult(false, -1, "Token Expired");
        }
        likesService.savelikeComment(userSimple.getUserNum(),comment_id);
        return responseService.getSuccessResult();
    }

    @ApiOperation(value = "댓글 좋아요 취소", notes = "comment_id를 받아 좋아요 off")
    @GetMapping(value = "/likeoff")
    public CommonResult likeCancelComment(@RequestParam(value = "id") Long comment_id, Authentication authentication){
        UserSimple userSimple;
        try{
            userSimple = (UserSimple) authentication.getPrincipal();
        }catch (NullPointerException e){
            return responseService.getDetailResult(false, -1, "Token expired");
        }
        likesService.deletelikeComment(userSimple.getUserNum(),comment_id);
        return responseService.getSuccessResult();
    }
}
