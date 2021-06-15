package com.humorpage.sunbro.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.humorpage.sunbro.advice.exception.UserNotFoundException;
import com.humorpage.sunbro.model.PlatformUser;
import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.UserRepository;
import com.humorpage.sunbro.respository.UserSimpleRepository;
import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.utils.RandomGenerator;
import io.jsonwebtoken.ExpiredJwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.expression.ExpressionException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Service
public class AccountService {

    @Autowired
    private UserSimpleRepository userSimpleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private CookieService cookieService;

    @Autowired
    private RedisTokenService redisTokenService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ResponseService responseService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConnectSocialService connectSocialService;

    /**
     * keepLogin 시 access(30m), refresh(2d)
     * no keep access(6h)
     */
    public CommonResult login(String uid,
                              String password,
                              Boolean keepLogin,
                              HttpServletResponse res){
        UserSimple userSimple;
        try{
            userSimple = userSimpleRepository
                    .findByUid(uid).orElseThrow(()->new UserNotFoundException("ID",uid));
            if (passwordEncoder.matches(password, userSimple.getPassword())){

                if(keepLogin) {
                    //add access token
                    final String accessToken = jwtTokenService.generateToken(userSimple);
                    Cookie accessCookie = cookieService.createCookie(JwtTokenService.ACCESS_TOKEN_NAME, accessToken,JwtTokenService.AccessTokenValidSecond);
                    res.addCookie(accessCookie);
                    //add refresh token
                    final String refreshToken = jwtTokenService.generateRefreshToken(userSimple);
                    redisTokenService.setDataExpire(refreshToken, String.valueOf(userSimple.getUserNum()), JwtTokenService.RefreshTokenValidSecond);
                    Cookie refreshCookie = cookieService.createCookie(JwtTokenService.REFRESH_TOKEN_NAME, refreshToken, JwtTokenService.RefreshTokenValidSecond);
                    res.addCookie(refreshCookie);
                }else{
                    final String accessToken = jwtTokenService.generateToken(userSimple);
                    Cookie accessCookie = cookieService.createCookie(JwtTokenService.ACCESS_TOKEN_NAME, accessToken, JwtTokenService.WithOutValidSecond);
                    res.addCookie(accessCookie);
                }
                //add user data in response header
                if (res.getHeader("user")==null){
                    res.addHeader("user",objectMapper.writeValueAsString(userSimple));
                }

                return responseService.getSuccessResult();
            }
        }catch (Exception ignored){

        }
        return responseService.getFailResult();
    }

    public CommonResult logout(HttpServletRequest req, HttpServletResponse res){
        Cookie jwtAccessToken = cookieService.getCookie(req, JwtTokenService.ACCESS_TOKEN_NAME);
        if(jwtAccessToken!=null){
            Cookie delcookie = new Cookie(jwtAccessToken.getName(),null);
            delcookie.setMaxAge(0);
            delcookie.setPath("/");
            res.addCookie(delcookie);
        }
        Cookie jwtRefreshToken = cookieService.getCookie(req, JwtTokenService.REFRESH_TOKEN_NAME);
        if(jwtRefreshToken!=null){
            Cookie delcookie = new Cookie(jwtRefreshToken.getName(),null);
            delcookie.setPath("/");
            delcookie.setMaxAge(0);
            res.addCookie(delcookie);
        }
        return responseService.getSuccessResult();
    }

    public CommonResult signup(User user, Boolean isPlatForm){
        user.setRole("USER");
        if(!isPlatForm) user.setPassword(passwordEncoder.encode(user.getPassword()));
        else user.setPassword(passwordEncoder.encode(RandomGenerator.randomNameGenerate(26)));
        userRepository.save(user);
        return responseService.getSuccessResult();
    }

    public CommonResult deleteAccount(String uid,
                                      String password,
                                      Authentication authentication,
                                      HttpServletResponse res,
                                      HttpServletRequest req){
        UserSimple userSimple = (UserSimple) authentication.getPrincipal();
        if (userSimple.getUid().equals(uid) &&
                passwordEncoder.matches(password,userSimple.getPassword())){
            userSimpleRepository.delete(userSimple);
        }
        try{
            Cookie jwtAccessToken = cookieService.getCookie(req, JwtTokenService.ACCESS_TOKEN_NAME);
            jwtAccessToken.setMaxAge(0);
            res.addCookie(jwtAccessToken);

            Cookie jwtRefreshToken = cookieService.getCookie(req, JwtTokenService.REFRESH_TOKEN_NAME);
            redisTokenService.deleteData(jwtRefreshToken.getValue());
            jwtRefreshToken.setMaxAge(0);
            res.addCookie(jwtRefreshToken);
        }catch (Exception ignored){

        }
        return responseService.getSuccessResult();
    }


    public CommonResult pfLogin(PlatformUser platformUser,
                                HttpServletResponse res){
        try{
            if(connectSocialService.AuthBySocial(platformUser)){
                String userId = platformUser.getPlatForm().name()+ platformUser.getUid();
                UserSimple userSimple = userSimpleRepository.findByUid(userId)
                        .orElseThrow(()->
                                new UserNotFoundException("ID",userId));

                final String accessToken = jwtTokenService.generateToken(userSimple);
                Cookie accessCookie = cookieService.createCookie(JwtTokenService.ACCESS_TOKEN_NAME, accessToken, JwtTokenService.AccessTokenValidSecond);
                res.addCookie(accessCookie);

                final String refreshToken = jwtTokenService.generateRefreshToken(userSimple);
                redisTokenService.setDataExpire(refreshToken, String.valueOf(userSimple.getUserNum()), JwtTokenService.RefreshTokenValidSecond);
                Cookie refreshCookie = cookieService.createCookie(JwtTokenService.REFRESH_TOKEN_NAME, refreshToken, JwtTokenService.RefreshTokenValidSecond);
                res.addCookie(refreshCookie);

                if (res.getHeader("user") == null) {
                    try{
                        res.addHeader("user", objectMapper.writeValueAsString(userSimple));
                    }catch (JsonProcessingException e){
                        return responseService.getFailResult();
                    }
                }
                return responseService.getSuccessResult();
            }else{
                responseService.getDetailResult(false,-1, platformUser.getPlatForm().name()+" Token error");
            }
        }catch (UserNotFoundException e){
            /**
             * 조회 실패 => 플랫폼 회원가입 페이지로 이동
             */
            return responseService.getDetailResult(false,-1,e.getMessage());
        }
        return responseService.getFailResult();
    }
}
