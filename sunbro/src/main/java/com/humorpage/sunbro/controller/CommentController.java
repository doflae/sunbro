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
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashSet;
import java.util.List;

@RequestMapping("/api/comment")
@RestController
@CrossOrigin(value = "http://localhost:3000", allowCredentials = "true")
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
        List<Comment> commentList=null;
        int more = 0;
        int page_size = 10;
        //depth가 0인 댓글
        if(board_id!=null) {
            if (comment_id == 0) {
                page_size = 3;
            }
            commentList = commentRepository.findByBoardIdAndIdGreaterThanAndParentIdIsNullOrderByIdAsc(board_id, comment_id, PageRequest.of(0, page_size+1));
        }
        //대댓글 -> board id 대신 parent comment id가 주어짐
        else if(parent_id!=null){
            if (comment_id == null){
                commentList = commentRepository.findByParentIdIsOrderByIdAsc(parent_id, PageRequest.of(0,page_size+1));
            }else{
                commentList = commentRepository.findByParentIdIsAndIdGreaterThanOrderByIdAsc(parent_id, comment_id, PageRequest.of(0,page_size+1));
            }
        }
        try{
            assert commentList != null;
            if(commentList.size()==page_size+1){
                more = 1;
                commentList.remove(page_size);
            }
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            HashSet<Long> commentlikesList= new HashSet<>(commentLikesRepository.findByUserCustom(userSimple.getUserNum()));
            commentList.forEach(comment -> {
                comment.setLike(commentlikesList.contains(comment.getId()));
            });
        }catch (NullPointerException|AssertionError ignored){

        }
        return responseService.getDetailListResult(true,more,"",commentList);
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

    @ApiOperation(value = "댓글 좋아요", notes = "comment_id를 받아 좋아요 on")
    @GetMapping(value = "/like/on")
    public CommonResult likeComment(@RequestParam("comment-id") Long commentId,
                                    @RequestParam("board-id") Long boardId,
                                    Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            likeService.saveLikeComment(userSimple.getUserNum(),commentId,boardId);
            return responseService.getSuccessResult();
        }catch (NullPointerException e){
            return responseService.getDetailResult(false, -1, "Token Expired");
        }
    }

    @ApiOperation(value = "댓글 좋아요 취소", notes = "comment_id를 받아 좋아요 off")
    @GetMapping(value = "/like/off")
    public CommonResult likeCancelComment(@RequestParam("comment-id") Long commentId,
                                          @RequestParam("board-id") Long boardId,
                                          Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            likeService.deleteLikeComment(userSimple.getUserNum(),commentId,boardId);
            return responseService.getSuccessResult();
        }catch(NullPointerException e){
            return responseService.getDetailResult(false, -1, "Token expired");
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
