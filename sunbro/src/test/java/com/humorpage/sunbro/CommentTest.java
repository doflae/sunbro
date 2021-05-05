package com.humorpage.sunbro;

import com.humorpage.sunbro.model.Comment;
import com.humorpage.sunbro.model.Gender;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.CommentRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.junit4.SpringRunner;

@DataJpaTest
@RunWith(SpringRunner.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class CommentTest {
    @Autowired
    private CommentRepository commentRepository;

    @Test
    public void test(){
        try{
            test2();
        }catch (DataIntegrityViolationException e){
            System.out.println("hihihihiihi");
        }
    }

    void test2() throws DataIntegrityViolationException{
        Comment comment = new Comment();
        comment.setPid(12412L);
        comment.setContent("asdasdasd");
        UserSimple user = new UserSimple();
        user.setAge(20);
        user.setGender(Gender.Male);
        user.setPassword("123123");
        user.setRole("USER");
        user.setName("seeeeeeeeeeeee");
        user.setUid("seeeeeeeee");
        commentRepository.save(comment);
    }
}
