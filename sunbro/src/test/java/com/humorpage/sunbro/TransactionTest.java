package com.humorpage.sunbro;

import com.humorpage.sunbro.model.BoardDetail;
import com.humorpage.sunbro.respository.BoardDetailRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@DataJpaTest
@RunWith(SpringRunner.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class TransactionTest {

    private static final ExecutorService service =
            Executors.newFixedThreadPool(100);

    @Autowired
    private BoardDetailRepository boardDetailRepository;

    @Test
    public void test() throws InterruptedException{
        BoardDetail boardDetail = boardDetailRepository.getOne(253L);
        int first = boardDetail.getLikes();
        CountDownLatch latch = new CountDownLatch(2);
        service.execute(()->{
            for(int i = 0; i < 10000;i++){
                increment(253L);
            }
            log.info("increment done");
            latch.countDown();
        });
        service.execute(()->{
            for(int i = 0; i < 10000;i++){
                decrement(253L);
            }
            log.info("decrement done");
            latch.countDown();
        });
        latch.await();
        log.info("update done");
        Assert.assertEquals(boardDetail.getLikes(),first);
    }

    public void increment(Long boardId){
        boardDetailRepository.incrementBoardLikes(boardId);
    }

    public void decrement(Long boardId) {
        boardDetailRepository.decrementBoardLikes(boardId);
    }
}