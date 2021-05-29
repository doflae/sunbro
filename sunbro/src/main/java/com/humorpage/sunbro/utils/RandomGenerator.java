package com.humorpage.sunbro.utils;

import java.security.SecureRandom;

public class RandomGenerator {

    private static final SecureRandom random = new SecureRandom();
    public static String randomNameGenerate(int len){
        StringBuilder sb = new StringBuilder(26);
        for(int i = 0; i<len;i++){
            String randChar = "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
            sb.append(randChar.charAt(random.nextInt(randChar.length())));
        }
        return sb.toString();
    }
}
