package com.humorpage.sunbro;

import com.humorpage.sunbro.config.RedisConfig;
import com.humorpage.sunbro.utils.ScriptLoader;
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import io.lettuce.core.ScriptOutputType;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RunWith(SpringRunner.class)
@ContextConfiguration(classes = {RedisConfig.class})
public class LuaScirptTest {

    static String INCR = "classpath:luascripts/INCR_AFTER_CHECK.script";

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Test
    public void test(){
        List<String> keys = new ArrayList<>(Arrays.asList("myset","myzset"));
        Long result = stringRedisTemplate.execute(RedisScript.of(ScriptLoader.getScript(INCR))
                , keys, "one","1");
        System.out.println(result);
    }
}
