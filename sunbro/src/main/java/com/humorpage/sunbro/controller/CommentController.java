package com.humorpage.sunbro.controller;


import com.humorpage.sunbro.advice.exception.CommentNotFoundException;
import com.humorpage.sunbro.model.Comment;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.CommentLikesRepository;
import com.humorpage.sunbro.respository.CommentRepository;
import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.result.ListResult;
import com.humorpage.sunbro.result.SingleResult;
import com.humorpage.sunbro.service.*;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashSet;
import java.util.List;

@RequestMapping("/api/comment")
@RestController
public class CommentController {


    @Autowired
    private ResponseService responseService;

    @Autowired
    private CommentService commentService;

    @Autowired
    private LikeService likeService;

    @Autowired
    private CommentLikesRepository commentLikesRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private FileService fileService;


    @ApiOperation(value = "댓글 열람",notes = "게시글의 id또는 댓글의 id를 받아 해당 글의 댓글 열람")
    @GetMapping("/list")
    public ListResult<Comment> getComment(@RequestParam(value = "board_id", required = false) Long board_id,
                                          @RequestParam(value = "parent_id", required = false) Long parent_id,
                                          @RequestParam(value = "comment_id", required = false, defaultValue = "0") Long comment_id,
                                          Authentication authentication){
        Page<Comment> commentPage=null;
        List<Comment> commentList=null;
        int page_size = 10;
        //depth가 0인 댓글
        if(board_id!=null) {
            if (comment_id == 0) {
                page_size = 3;
            }
            commentPage = commentRepository.findByBoardIdAndIdGreaterThanAndParentIdIsNullOrderByIdAsc(board_id, comment_id, PageRequest.of(0, page_size));
        }
        //대댓글 -> board id 대신 parent comment id가 주어짐
        else if(parent_id!=null){
            if (comment_id == null){
                commentPage = commentRepository.findByParentIdIsOrderByIdAsc(parent_id, PageRequest.of(0,page_size));
            }else{
                commentPage = commentRepository.findByParentIdIsAndIdGreaterThanOrderByIdAsc(parent_id, comment_id, PageRequest.of(0,page_size));
            }
        }
        try{
            assert commentPage != null;
            commentList = commentPage.getContent();
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            HashSet<Long> commentLikesList= new HashSet<>(commentLikesRepository.findByUserCustom(userSimple.getUserNum()));
            commentList.forEach(comment -> {
                comment.setLike(commentLikesList.contains(comment.getId()));
            });
            return responseService.getDetailListResult(true,commentPage.hasNext() ? 1 : 0,"",commentList);
        }catch (NullPointerException | AssertionError ignored){

        }
        return responseService.getDetailListResult(true, 0,"",commentList);
    }

    //삭제된 글, 댓글에 대한 삽입 시 글이 삭제되었는지, 댓글이 삭제되었는지는 구별하지 않는다.
    @ApiOperation(value = "댓글 달기", notes = "html코드를 받아 댓글 작성")
    @PostMapping(value = "/upload")
    public SingleResult<Comment> uploadComment(@Valid Comment comment,
                                            Authentication authentication) {
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            if(userSimple.getUserNum().equals(comment.getAuthorNum())){
                commentService.save(comment);
            }
            return responseService.getSingleResult(comment);
        }catch (Exception e){
            e.printStackTrace();
            return responseService.getDetailSingleResult(false,1,e.getMessage(),null);
        }
    }

    @PostMapping(value = "/like")
    public CommonResult likeComment(Long id, Long boardId, Boolean onOff,
                                    Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            if(onOff){
                likeService.saveLikeComment(userSimple.getUserNum(),id,boardId);
            }else{
                likeService.deleteLikeComment(userSimple.getUserNum(),id,boardId);
            }
            return responseService.getSuccessResult();
        }catch (NullPointerException e){
            return responseService.getDetailResult(false, -1, "Token Expired");
        }
    }

    @PostMapping(value = "/delete")
    CommonResult deleteComment(@RequestParam Long comment_id, Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();

            Comment comment = commentRepository
                    .findById(comment_id).orElseThrow(()->
                            new CommentNotFoundException("ID",String.valueOf(comment_id)));
            if(comment.getAuthorNum().equals(userSimple.getUserNum())){
                commentService.delete(comment);
            }else{
                return responseService.getFailResult();
            }
            return responseService.getSuccessResult();
        }catch (Exception e){
            return responseService.getFailResult();
        }
    }
}
