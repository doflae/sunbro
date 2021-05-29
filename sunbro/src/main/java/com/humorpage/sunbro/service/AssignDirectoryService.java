package com.humorpage.sunbro.service;

import com.humorpage.sunbro.utils.RandomGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class AssignDirectoryService {

    private final SimpleDateFormat dirFormat = new SimpleDateFormat("/yyyy/MM/dd/");

    @Autowired
    private RedisTokenService redisTokenService;

    public String assignDirectory(){
        Date today = new Date(System.currentTimeMillis());
        String todayDir = dirFormat.format(today);
        String key = RandomGenerator.randomNameGenerate(10);
        File file = new File(FileService.baseDir+todayDir+key);
        while(file.exists()){
            key = RandomGenerator.randomNameGenerate(10);
            file = new File(FileService.baseDir+todayDir+key);
        }
        return todayDir+key;
    }
}
