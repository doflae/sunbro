package com.humorpage.sunbro.service;

import com.humorpage.sunbro.utils.RandomGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thymeleaf.util.StringUtils;

import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class AssignDirectoryService {

    private final SimpleDateFormat dirFormat = new SimpleDateFormat("yyyyMMdd:");

    @Autowired
    private RedisTokenService redisTokenService;

    public String assignDirectory(){
        Date today = new Date(System.currentTimeMillis());
        String todayKey = "dir:"+dirFormat.format(today);
        String key = RandomGenerator.RandomnameGenerate(10);
        String tmp = redisTokenService.getData(todayKey+key);
        while(!StringUtils.isEmpty(tmp)){
            key = RandomGenerator.RandomnameGenerate(10);
            tmp = redisTokenService.getData(todayKey+key);
        }
        redisTokenService.setDataExpire(todayKey+key,"0",JwtTokenService.OneDayValidSecond);
        return key;
    }
}
