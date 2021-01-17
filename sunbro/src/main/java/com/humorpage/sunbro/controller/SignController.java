package com.humorpage.sunbro.controller;

import com.humorpage.sunbro.advice.exception.CIdSigninFailedException;
import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.provider.CookieProvider;
import com.humorpage.sunbro.provider.JwtTokenProvider;
import com.humorpage.sunbro.provider.RedisProvider;
import com.humorpage.sunbro.respository.UserRepository;
import com.humorpage.sunbro.result.CommonResult;
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
import java.util.Collections;

@Api(tags = {"1. Sign"})
@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/account")
public class SignController {

    @Autowired
    private UserRepository repository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ResponseService responseService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RedisProvider redisProvider;

    @ApiOperation(value = "로그인", notes = "이메일 회원 로그인을 한다.")
    @PostMapping(value = "/signin")
    public CommonResult signin(@ApiParam(value = "회원ID ", required = true) @RequestParam String uid,
                               @ApiParam(value = "비밀번호", required = true) @RequestParam String password,
                               HttpServletResponse res) {
        try{
            final User user = repository.findByUid(uid).orElseThrow(CIdSigninFailedException::new);
            if (!passwordEncoder.matches(password, user.getPassword()))
                throw new CIdSigninFailedException();
            final String token = jwtTokenProvider.generateToken(user);
            final String refreshjwt = jwtTokenProvider.generateRefreshToken(user);
            Cookie accessToken = CookieProvider.createCookie(JwtTokenProvider.ACCESS_TOKEN_NAME, token);
            Cookie refreshToken = CookieProvider.createCookie(JwtTokenProvider.REFRESH_TOKEN_NAME, refreshjwt);
            redisProvider.setDataExpire(refreshjwt,user.getUid(),JwtTokenProvider.RefreshtokenValidMilisecond);
            res.addCookie(accessToken);
            res.addCookie(refreshToken);
            return responseService.getSuccessResult();
        }catch (Exception e){
            System.out.print(e);
            return responseService.getFailResult();
        }
    }

    @ApiOperation(value = "가입", notes = "회원가입을 한다.")
    @PostMapping(value = "/signup")
    public CommonResult signup(@ApiParam(value = "회원ID ", required = true) @RequestParam String uid,
                               @ApiParam(value = "비밀번호", required = true) @RequestParam String password,
                               @ApiParam(value = "이름",required = false) @RequestParam String name) {

        repository.save(User.builder()
                .uid(uid)
                .password(passwordEncoder.encode(password))
                .roles(Collections.singletonList("ROLE_USER"))
                .name(name)
                .build());
        return responseService.getSuccessResult();
    }
}