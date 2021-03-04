package com.humorpage.sunbro.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.humorpage.sunbro.advice.exception.CIdSigninFailedException;
import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.UserRepository;
import com.humorpage.sunbro.respository.UserSimpleRepository;
import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.service.*;
import io.jsonwebtoken.ExpiredJwtException;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.expression.ExpressionException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/account")
public class AccountController {

    @Autowired
    private UserRepository userrepository;

    @Autowired
    private UserSimpleRepository userSimpleRepository;

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private ResponseService responseService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CookieService cookieService;

    @Autowired
    private RedisTokenService redisTokenService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FileMoveService fileMoveService;

    @ApiOperation(value ="id중복 체크")
    @GetMapping(value="/checkiddup")
    CommonResult checkiddup(String id){
        try{
            userSimpleRepository.findByUid(id).orElseThrow(CIdSigninFailedException::new);
            return responseService.getSuccessResult();
        }catch (CIdSigninFailedException e){
            return responseService.getFailResult();
        }
    }

    @ApiOperation(value = "name중복 체크")
    @GetMapping(value="/checknamedup")
    CommonResult checknamedup(String name){
        try{
            userSimpleRepository.findByName(name).orElseThrow(CIdSigninFailedException::new);
            return responseService.getSuccessResult();
        }catch (CIdSigninFailedException e){
            return responseService.getFailResult();
        }
    }

    @ApiOperation(value = "회원 정보 수정")
    @PostMapping(value="/update")
    CommonResult update(@Valid @ModelAttribute UserSimple user, Authentication authentication){
        UserSimple userSimple;
        try{
            userSimple = (UserSimple) authentication.getPrincipal();
        }catch (Exception e){
            return responseService.setDetailResult(false,-1,"Need to Login");
        }
        try{
            Long userNum = userSimple.getUsernum();
            UserSimple userBefore = userSimpleRepository.findByUsernum(userNum);
            userBefore.setAge(user.getAge());
            userBefore.setSex(user.getSex());
            userBefore.setName(user.getName());
            userBefore.setUserImg(fileMoveService.moveProfileImage(userBefore.getUserImg(),user.getUserImg(),userNum));
            userSimpleRepository.save(userBefore);
            return responseService.getSuccessResult();
        }catch (Exception e){
            return responseService.getFailResult();
        }
    }

    @ApiOperation(value = "타 플랫폼 로그인")
    @PostMapping(value = "/anologin")
    CommonResult anologin(@ApiParam(value = "user", required = true) @ModelAttribute UserSimple user,
                          @ApiParam(value = "access token expires time", defaultValue = "0") @RequestParam long accessTime,
                          @ApiParam(value = "refresh token expires time", defaultValue = "0") @RequestParam long refreshTime,
                          HttpServletResponse res){

        UserSimple userSimple=null;
        try{
            userSimple = userSimpleRepository.findByUid(user.getUid()).orElseThrow(RuntimeException::new);
            /*
            1. {platform}+uid값으로 조회
            2. 조회 성공 ? => token생성
            */
        }catch (RuntimeException e){
            /*
            조회 실패
            유저 생성
            */
            user.setRole("USER");
            user.setPassword(passwordEncoder.encode(FileUploadService.RandomnameGenerate(23)));
            userSimpleRepository.save(user);
            userSimple = user;
            return responseService.setDetailResult(true,38,"login again");
        }
        if(userSimple!=null) {
            final String token = jwtTokenService.generateToken(userSimple);
            final String refreshjwt = jwtTokenService.generateRefreshToken(userSimple);
            accessTime = accessTime == 0 ? JwtTokenService.AccesstokenValidMilisecond : accessTime;
            refreshTime = refreshTime == 0 ? JwtTokenService.RefreshtokenValidMilisecond : refreshTime;
            Cookie accessToken = cookieService.createCookie(JwtTokenService.ACCESS_TOKEN_NAME, token, accessTime);
            Cookie refreshToken = cookieService.createCookie(JwtTokenService.REFRESH_TOKEN_NAME, refreshjwt, refreshTime);
            redisTokenService.setDataExpire(refreshjwt, String.valueOf(userSimple.getUsernum()), JwtTokenService.RefreshtokenValidMilisecond);
            if (res.getHeader("user") == null) {
                try{
                    res.addHeader("user", objectMapper.writeValueAsString(userSimple));
                }catch (JsonProcessingException ignored){

                }
            }
            res.addCookie(accessToken);
            res.addCookie(refreshToken);
            return responseService.getSuccessResult();
        }
        return responseService.getFailResult();
    }

    @ApiOperation(value = "로그인", notes = "UserSimple 엔티티로 로그인 이후 access/refresh token 생성")
    @PostMapping(value = "/login")
    CommonResult login(@ApiParam(value = "회원ID ", required = true) @RequestParam String uid,
                               @ApiParam(value = "비밀번호", required = true) @RequestParam String password,
                               HttpServletResponse res) {
        UserSimple userSimple;
        try{
            userSimple = userSimpleRepository.findByUid(uid).orElseThrow(CIdSigninFailedException::new);
            if (!passwordEncoder.matches(password, userSimple.getPassword()))
                throw new CIdSigninFailedException();
            final String token = jwtTokenService.generateToken(userSimple);
            final String refreshjwt = jwtTokenService.generateRefreshToken(userSimple);
            Cookie accessToken = cookieService.createCookie(JwtTokenService.ACCESS_TOKEN_NAME, token,JwtTokenService.AccesstokenValidMilisecond);
            Cookie refreshToken = cookieService.createCookie(JwtTokenService.REFRESH_TOKEN_NAME, refreshjwt,JwtTokenService.RefreshtokenValidMilisecond);
            redisTokenService.setDataExpire(refreshjwt,String.valueOf(userSimple.getUsernum()), JwtTokenService.RefreshtokenValidMilisecond);
            if (res.getHeader("user")==null){
                res.addHeader("user",objectMapper.writeValueAsString(userSimple));
            }
            res.addCookie(accessToken);
            res.addCookie(refreshToken);
            return responseService.getSuccessResult();
        }catch (Exception e){
            return responseService.getFailResult();
        }
    }

    @ApiOperation(value = "로그아웃", notes = "refresh token access token 세션 삭제 및 cookie 만료기간 0")
    @GetMapping(value = "/logout")
    public CommonResult logout(HttpServletRequest req, HttpServletResponse res){
        try{
            Cookie jwtAccessToken = cookieService.getCookie(req, JwtTokenService.ACCESS_TOKEN_NAME);
            Cookie delcookie = new Cookie(jwtAccessToken.getName(),null);
            delcookie.setMaxAge(0);
            delcookie.setPath("/");
            res.addCookie(delcookie);
        }catch (ExpiredJwtException ignored){

        }
        try {
            Cookie jwtRefreshToken = cookieService.getCookie(req, JwtTokenService.REFRESH_TOKEN_NAME);
            Cookie delcookie = new Cookie(jwtRefreshToken.getName(),null);
            delcookie.setPath("/");
            delcookie.setMaxAge(0);
            res.addCookie(delcookie);
        }catch (ExpiredJwtException ignored){

        }
        return responseService.getSuccessResult();
    }


    @ApiOperation(value = "가입", notes = "회원가입을 한다.")
    @PostMapping(value = "/signup")
    public CommonResult signup(@Valid @ModelAttribute User user) {
        user.setRole("USER");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userrepository.save(user);
        return responseService.getSuccessResult();
    }

    @ApiOperation(value = "회원 탈퇴", notes = "authentication의 정보, 입력받은 id, pw 대조하여 확인 후 유저 삭제")
    @PostMapping(value = "/withdrawal")
    public CommonResult withdrawal(@ApiParam(value = "id",required = true)@RequestParam String uid,
                               @ApiParam(value = "pw", required = true)@RequestParam String password,
                               Authentication authentication, HttpServletResponse res, HttpServletRequest req) {
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            if (!userSimple.getUid().equals(uid)){
                return responseService.getFailResult();
            }
            if (!passwordEncoder.matches(password,userSimple.getPassword())){
                return responseService.getFailResult();
            }
            userSimpleRepository.delete(userSimple);
        }catch (Exception e){
            return responseService.getFailResult();
        }
        try{
            Cookie jwtAccessToken = cookieService.getCookie(req, JwtTokenService.ACCESS_TOKEN_NAME);
            jwtAccessToken.setMaxAge(0);
            res.addCookie(jwtAccessToken);
        }catch (ExpiredJwtException ignored){

        }
        try{
            Cookie jwtRefreshToken = cookieService.getCookie(req, JwtTokenService.REFRESH_TOKEN_NAME);
            redisTokenService.setDataExpire(jwtRefreshToken.getValue(),"-1",1);
            jwtRefreshToken.setMaxAge(0);
            res.addCookie(jwtRefreshToken);
        }catch (ExpressionException ignored){

        }
        return responseService.getSuccessResult();
    }
}