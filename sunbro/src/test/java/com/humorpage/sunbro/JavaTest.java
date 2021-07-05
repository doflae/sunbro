package com.humorpage.sunbro;

import lombok.extern.slf4j.Slf4j;
import org.junit.Test;

import java.io.File;

@Slf4j
public class JavaTest {

    @Test
    public void test(){
        String test = "/2021/123/cmt/sdinosv";
        File f = new File(test);
        log.info(f.getParentFile().getParent());
    }
}
