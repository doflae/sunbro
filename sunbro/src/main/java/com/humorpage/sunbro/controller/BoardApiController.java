package com.humorpage.sunbro.controller;

import com.humorpage.sunbro.model.Board;
import com.humorpage.sunbro.respository.BoardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.thymeleaf.util.StringUtils;

import java.util.List;

@RestController
@RequestMapping("/api")
class BoardApiController {

    @Autowired
    private BoardRepository repository;

    //rest api로 제목 내용으로 검색
    //id=1&id=2 같이 리스트 형태도 받아와야함
    //따라서 기존에 단일 데이터를 리스트 형태로 변경
    @GetMapping("/boards")
    List<Board> all(@RequestParam(required = false, defaultValue = "") String title,
                    @RequestParam(required = false, defaultValue = "") List<Long> id,
                    @RequestParam(required = false, defaultValue = "") String content) {
        if (StringUtils.isEmpty(title) && StringUtils.isEmpty(content) && id.size()==0) {
            return repository.findAll();
        }
        else if(StringUtils.isEmpty(title) && StringUtils.isEmpty(content)){
            return repository.findAllById(id);
        }
        else {

            return repository.findByTitleOrContent(title, content);

        }

    }

    @PostMapping("/boards")
    Board newBoard(@RequestBody Board newBoard) {

        return repository.save(newBoard);
    }

    // Single item

    @GetMapping("/boards/{id}")
    Board one(@PathVariable Long id) {

        return repository.findById(id).orElse(null);

    }

    @PutMapping("/boards/{id}")
    Board replaceBoard(@RequestBody Board newBoard, @PathVariable Long id) {

        return repository.findById(id)
                .map(Board -> {
                    Board.setTitle(newBoard.getTitle());
                    Board.setContent(newBoard.getContent());
                    return repository.save(Board);
                })
                .orElseGet(() -> {
                    newBoard.setId(id);
                    return repository.save(newBoard);
                });
    }

    @DeleteMapping("/boards/{id}")
    void deleteBoard(@PathVariable Long id) {
        repository.deleteById(id);
    }
}