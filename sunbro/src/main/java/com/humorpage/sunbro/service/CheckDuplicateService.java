package com.humorpage.sunbro.service;

import com.humorpage.sunbro.advice.exception.UserNotFoundException;
import com.humorpage.sunbro.respository.UserSimpleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import static java.lang.String.format;

@Service
public class CheckDuplicateService {

    String DUPLICATE_CHECK_KEY = "check:duplicate";

    @Autowired
    private RedisTokenService redisTokenService;

    @Autowired
    private UserSimpleRepository userSimpleRepository;

    @Autowired
    private EmailAuthService emailAuthService;

    /**
     * 이후 Enum이든 뭐든 status code 정리해서 케이스 별로 프론트에서 코드->메세지
     * 1. 해당 메일로 인증코드를 전송하였습니다. 메일을 확인해주세요.
     * 2. 이미 사용중인 계정입니다.
     * 3. 메일 전송이 완료되었습니다. 메일을 확인해주세요.
     * default 메일 전송에 실패하였습니다. 다시 시도해주시기 바랍니다.
     * @return status code
     */
    public int checkEmail(String value){
        final String key = format("%s:email:%s",DUPLICATE_CHECK_KEY,value);
        String tmp = redisTokenService.getData(key);
        if(tmp==null){
            try{
                userSimpleRepository.findByUid(value).orElseThrow(()-> new UserNotFoundException("ID"));
                return 2;
            }catch (UserNotFoundException e){
                try{
                    emailAuthService.sendMailwithKey(value);
                    return 3;
                }catch (Exception EmailErr){
                    return -1;
                }
            }

        }
        return 1;
    }

    public boolean checkName(String value, String ipaddr){
        final String ipKey = format("%s:name:%s",DUPLICATE_CHECK_KEY,ipaddr);
        final String key = format("%s:name:%s", DUPLICATE_CHECK_KEY,value);
        String temp = redisTokenService.getData(key);
        String beforeTemp = redisTokenService.getData(ipKey);
        //이전에 중복 검사한 닉네임와 동일한 닉네임를 검사하였다면 true
        if(beforeTemp!=null && beforeTemp.equals(value)){
            return true;
        }
        //중복 검사한 것이 없거나 다른 닉네임으로 중복 검사한다면
        if(temp==null){
            try {
                userSimpleRepository.findByName(value).orElseThrow(()-> new UserNotFoundException("Name"));
                return false;
            } catch (UserNotFoundException e) {
                if(beforeTemp!=null){
                    final String beforeKey = format("%s:name:%s",DUPLICATE_CHECK_KEY,beforeTemp);
                    redisTokenService.deleteData(beforeKey);
                }
                redisTokenService.setDataExpire(key, "0", JwtTokenService.TempNameForDuplicateSecond);
                //이전에 중복검사했던 닉네임 값 변경
                redisTokenService.setDataExpire(ipKey,value,JwtTokenService.TempNameForDuplicateSecond);
                return true;
            }
        }
        return false;
    }
}
