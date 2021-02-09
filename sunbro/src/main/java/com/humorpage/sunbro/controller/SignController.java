package com.humorpage.sunbro.controller;

import com.humorpage.sunbro.advice.exception.CIdSigninFailedException;
import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.UserRepository;
import com.humorpage.sunbro.respository.UserSimpleRepository;
import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.service.CookieService;
import com.humorpage.sunbro.service.JwtTokenService;
import com.humorpage.sunbro.service.RedisTokenService;
import com.humorpage.sunbro.service.ResponseService;
import io.jsonwebtoken.ExpiredJwtException;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Api(tags = {"1. Sign"})
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/account")
public class SignController {

    @Autowired
    private UserRepository repository;

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

    @ApiOperation(value = "로그인", notes = "UserSimple 엔티티로 로그인 이후 access/refresh token 생성")
    @PostMapping(value = "/login")
    public CommonResult login(@ApiParam(value = "회원ID ", required = true) @RequestParam String uid,
                               @ApiParam(value = "비밀번호", required = true) @RequestParam String password,
                               HttpServletResponse res) {
        try{
            final UserSimple userSimple = userSimpleRepository.findByUid(uid).orElseThrow(CIdSigninFailedException::new);
            if (!passwordEncoder.matches(password, userSimple.getPassword()))
                throw new CIdSigninFailedException();
            final String token = jwtTokenService.generateToken(userSimple);
            final String refreshjwt = jwtTokenService.generateRefreshToken(userSimple);
            Cookie accessToken = cookieService.createCookie(JwtTokenService.ACCESS_TOKEN_NAME, token);
            Cookie refreshToken = cookieService.createCookie(JwtTokenService.REFRESH_TOKEN_NAME, refreshjwt);
            redisTokenService.setDataExpire(refreshjwt,String.valueOf(userSimple.getUsernum()), JwtTokenService.RefreshtokenValidMilisecond);
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
            jwtAccessToken.setMaxAge(0);
            res.addCookie(jwtAccessToken);
        }catch (ExpiredJwtException ignored){

        }
        try {
            Cookie jwtRefreshToken = cookieService.getCookie(req, JwtTokenService.REFRESH_TOKEN_NAME);
            jwtRefreshToken.setMaxAge(0);
            redisTokenService.deleteData(jwtRefreshToken.getValue());
            res.addCookie(jwtRefreshToken);
        }catch (ExpiredJwtException ignored){

        }
        return responseService.getSuccessResult();
    }


    @ApiOperation(value = "가입", notes = "회원가입을 한다.")
    @PostMapping(value = "/signup")
    public CommonResult signup(@ApiParam(value = "회원ID ", required = true) @RequestParam String uid,
                               @ApiParam(value = "비밀번호", required = true) @RequestParam String password,
                               @ApiParam(value = "이름") @RequestParam String name) {

        repository.save(User.builder()
                .uid(uid)
                .password(passwordEncoder.encode(password))
                .role("USER")
                .name(name)
                .build());
        return responseService.getSuccessResult();
    }
}