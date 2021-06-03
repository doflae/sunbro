package com.humorpage.sunbro;

import com.humorpage.sunbro.config.RedisConfig;
import lombok.extern.slf4j.Slf4j;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.StringRedisConnection;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Objects;
import java.util.stream.Stream;

@Slf4j
@RunWith(SpringRunner.class)
@ContextConfiguration(classes = {RedisConfig.class})
public class RedisTest {

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Test
    public void test(){
        ValueOperations<String,String> valueOperations = stringRedisTemplate.opsForValue();
        valueOperations.set("test","isThere?");
        log.info(valueOperations.get("test"));
        Objects.requireNonNull(stringRedisTemplate.execute(
                (RedisCallback<Stream<String>>) redisConnection -> {
                    StringRedisConnection stringRedisConnection = (StringRedisConnection) redisConnection;
                    stringRedisConnection.multi();
                    log.info(stringRedisConnection.get("test"));
                    return stringRedisConnection.exec().stream().map(Object::toString);
                }
        )).forEach(log::info);
    }
}
