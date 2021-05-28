package com.humorpage.sunbro;

import com.humorpage.sunbro.model.BoardDetail;
import com.humorpage.sunbro.respository.BoardDetailRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.junit4.SpringRunner;

@Slf4j
@DataJpaTest
@RunWith(SpringRunner.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class PersistEntityTest {

    @Autowired
    private BoardDetailRepository boardDetailRepository;

    @Test
    public void isReallyCached(){
        for(int i = 0;i<10;i++){
            BoardDetail boardDetail = boardDetailRepository.findById(253L).orElseThrow();
        }
    }

    @Test
    public void hasLazyWrite(){

    }
}
