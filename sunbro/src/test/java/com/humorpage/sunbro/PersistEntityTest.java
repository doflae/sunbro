package com.humorpage.sunbro;

import com.humorpage.sunbro.model.BoardDetail;
import com.humorpage.sunbro.model.Comment;
import com.humorpage.sunbro.respository.BoardDetailRepository;
import com.humorpage.sunbro.respository.CommentRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@DataJpaTest
@RunWith(SpringRunner.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class PersistEntityTest {

    @Autowired
    private BoardDetailRepository boardDetailRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Test
    public void JPATest(){
        cacheTest();
    }

    public void cacheTest(){
        List<Long> ids = new ArrayList<>();
        for (int i = 0; i<5;i++){
            ids.add(putData());
        }
        idInQueryCached(ids);
    }

    public void lazyWriteTest(){
        Comment comment = new Comment();
        comment.setBoardId(276L);
        comment.setContent("test");
        comment.setAuthorNum(91L);
        comment.setAuthorImg("test");
        comment.setAuthorName("test");
        comment.setMedia("");
        comment.setMediaDir("");
        commentRepository.save(comment);
        log.info("식별자 id가 주어지지 않고 IDENTITY 전략을 사용하기에 insert 쿼리 전송됨");
        hasLazyWrite(comment.getId());
    }

    public Long putData(){
        Comment comment = new Comment();
        comment.setBoardId(276L);
        comment.setContent("test");
        comment.setAuthorNum(91L);
        comment.setAuthorImg("test");
        comment.setAuthorName("test");
        comment.setMedia("");
        comment.setMediaDir("");
        commentRepository.save(comment);
        return comment.getId();
    }

    public void isReallyCached(){
        for(int i = 0;i<10;i++){
            BoardDetail boardDetail = boardDetailRepository.findById(253L).orElseThrow();
        }
    }

    @Transactional
    public void hasLazyWrite(Long id){
        Comment comment = commentRepository.findById(id).orElse(null);
        comment.setMedia("updated");
        comment.setMediaDir("updated");
        commentRepository.save(comment);
        log.info("save이후 식별자가 주어졌기에 update쿼리는 쓰기 지연될 것이다");
    }

    public void idInQueryCached(List<Long> ids){
        for(int i = 0 ;i<5;i++){
            List<Comment> commentList = commentRepository.findByIdIn(ids);
        }
    }
}
