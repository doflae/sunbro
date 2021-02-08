package com.humorpage.sunbro.controller;

import com.humorpage.sunbro.advice.exception.CIdSigninFailedException;
import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.respository.UserRepository;
import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.service.CookieService;
import com.humorpage.sunbro.service.JwtTokenService;
import com.humorpage.sunbro.service.RedisTokenService;
import com.humorpage.sunbro.service.ResponseService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

@Api(tags = {"1. Sign"})
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/account")
public class SignController {

    @Autowired
    private UserRepository repository;

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private ResponseService responseService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RedisTokenService redisTokenService;

    @ApiOperation(value = "로그인", notes = "이메일 회원 로그인을 한다.")
    @PostMapping(value = "/signin")
    public CommonResult signin(@ApiParam(value = "회원ID ", required = true) @RequestParam String uid,
                               @ApiParam(value = "비밀번호", required = true) @RequestParam String password,
                               HttpServletResponse res) {
        try{
            final User user = repository.findByUid(uid).orElseThrow(CIdSigninFailedException::new);
            if (!passwordEncoder.matches(password, user.getPassword()))
                throw new CIdSigninFailedException();
            final String token = jwtTokenService.generateToken(user);
            final String refreshjwt = jwtTokenService.generateRefreshToken(user);
            Cookie accessToken = CookieService.createCookie(JwtTokenService.ACCESS_TOKEN_NAME, token);
            Cookie refreshToken = CookieService.createCookie(JwtTokenService.REFRESH_TOKEN_NAME, refreshjwt);
            redisTokenService.setDataExpire(refreshjwt,String.valueOf(user.getUsernum()), JwtTokenService.RefreshtokenValidMilisecond);
            res.addCookie(accessToken);
            res.addCookie(refreshToken);
            return responseService.getSuccessResult();
        }catch (Exception e){
            return responseService.getFailResult();
        }
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