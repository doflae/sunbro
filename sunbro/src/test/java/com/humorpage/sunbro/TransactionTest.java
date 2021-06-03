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
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@DataJpaTest
@RunWith(SpringRunner.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class TransactionTest {

    private static final ExecutorService service =
            Executors.newFixedThreadPool(10);

    @Autowired
    private BoardDetailRepository boardDetailRepository;

    @Test
    public void test() throws InterruptedException{
        BoardDetail boardDetail = boardDetailRepository.getOne(276L);
        int first = boardDetail.getLikes();
        CountDownLatch latch = new CountDownLatch(2);
        service.execute(()->{
            for(int i = 0; i < 10000;i++){
                increment(276L);
            }
            latch.countDown();
        });
        service.execute(()->{
            for(int i = 0; i < 10000;i++){
                decrement(276L);
            }
            latch.countDown();
        });
        latch.await();
        log.info("update done");
        Assert.assertEquals(boardDetail.getLikes(),first);
    }

    @Transactional(isolation = Isolation.READ_UNCOMMITTED)
    public void increment(Long boardId){
        boardDetailRepository.incrementBoardLikes(boardId);
    }

    @Transactional(isolation = Isolation.READ_UNCOMMITTED)
    public void decrement(Long boardId) {
        boardDetailRepository.decrementBoardLikes(boardId);
    }
}