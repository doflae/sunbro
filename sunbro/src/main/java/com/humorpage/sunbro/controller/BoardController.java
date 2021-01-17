package com.humorpage.sunbro.controller;

import com.humorpage.sunbro.model.Board;
import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.service.BoardService;
import com.humorpage.sunbro.service.ResponseService;
import com.humorpage.sunbro.vaildator.BoardVaildator;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.validation.Valid;
import java.util.List;

@Controller
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

    @GetMapping("/list")
    public String list(Model model){
      List<Board> boards = boardRepository.findAll();
      model.addAttribute("boards", boards);
    return "board/list";

    }

    @GetMapping("/form")
    public String form(Model model, @RequestParam(required = false)Long id){
        if (id == null){
            model.addAttribute("board", new Board());


        }else {
            Board board = boardRepository.findById(id).orElse(null);
            model.addAttribute("board", board);
        }

        return "board/form";
    }
    @ApiOperation(value = "업로드", notes="html코드를 받아 최종적으로 업로드한다.")
    @PostMapping(value = "/form")
    public CommonResult postForm(@Valid Board board, BindingResult bindingResult, Authentication authentication){
        boardVaildator.validate(board, bindingResult);
        if (bindingResult.hasErrors()){
            return responseService.getFailResult();
        }
        String username = authentication.getName();
        boardService.save(username, board);
        return responseService.getSuccessResult();
    }
}
