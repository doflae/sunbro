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
import com.humorpage.sunbro.utils.RandomGenerator;
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

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private UserRepository userRepository;

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
    private ChangeProfileService changeProfileService;

    @Autowired
    private EmailAuthService emailAuthService;

    @Autowired
    private CheckDuplicateService checkDuplicateService;

    @GetMapping(value = "/check/auth")
    CommonResult checkAuth(Authentication authentication){
        if(authentication!=null && authentication.isAuthenticated()){
            return responseService.getSuccessResult();
        }else{
            return responseService.getFailResult();
        }
    }

    @ApiOperation(value ="id중복 체크 후 이메일 전송")
    @GetMapping(value="/checkdup/id")
    CommonResult checkId(String id){
        switch (checkDuplicateService.checkEmail(id)){
            case 1->{
                return responseService.getDetailResult(true,1,"해당 메일로 인증코드를 전송하였습니다. 메일을 확인해주세요.");
            }
            case 2->{
                return responseService.getDetailResult(false, 0, "이미 사용중인 계정입니다.");
            }
            case 3->{
                return responseService.getDetailResult(true, 1, "메일 전송이 완료되었습니다. 메일을 확인해주세요.");
            }
            default -> {
                return responseService.getDetailResult(false,0,"메일 전송에 실패하였습니다. 다시 시도해주시기 바랍니다.");
            }
        }
    }

    @ApiOperation(value = "이메일 인증 코드 확인")
    @PostMapping(value="/checkcode")
    CommonResult checkCode(String email, String code){
        if(email!=null && code!=null){
            if(code.equals(redisTokenService.getData(email))){
                return responseService.getSuccessResult();
            }
        }
        return responseService.getFailResult();
    }



    @ApiOperation(value = "name중복 체크")
    @GetMapping(value="/checkdup/name")
    CommonResult checkName(String name, HttpServletRequest request){
        if(checkDuplicateService.checkName(name, request.getRemoteAddr())){
            return responseService.getSuccessResult();
        }
        return responseService.getFailResult();
    }

    @ApiOperation(value = "프로필 이미지 수정")
    @PostMapping(value="/update/img")
    CommonResult updateImg(String path, Authentication authentication){
        UserSimple userSimple;
        try{
            userSimple = (UserSimple) authentication.getPrincipal();
            changeProfileService.ChangeImage(userSimple,path);
            return responseService.getSuccessResult();
        }catch (Exception e){
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
            return responseService.getDetailResult(false,-1,"Need to Login");
        }
        changeProfileService.ChangeProfile(userSimple,user);
        return responseService.getSuccessResult();
    }



    @ApiOperation(value = "타 플랫폼 로그인")
    @PostMapping(value = "/anologin")
    CommonResult anologin(@ApiParam(value = "user", required = true) @ModelAttribute UserSimple user,
                          HttpServletResponse res,
                          HttpServletRequest req){

        UserSimple userSimple=null;
        try{
            userSimple = userSimpleRepository.findByUid(user.getUid()).orElseThrow(RuntimeException::new);
            /**
            1. {platform}+uid값으로 조회
            2. 조회 성공 ? => token생성
            */
        }catch (RuntimeException e){
            /**
             * 조회 실패 => 플랫폼 회원가입 페이지로 이동
             */
            return responseService.getFailResult();
        }
        if(userSimple!=null) {
            final String token = jwtTokenService.generateToken(userSimple);
            final String refreshjwt = jwtTokenService.generateRefreshToken(userSimple);
            Cookie accessToken = cookieService.createCookie(JwtTokenService.ACCESS_TOKEN_NAME, token, JwtTokenService.AccessTokenValidSecond);
            Cookie refreshToken = cookieService.createCookie(JwtTokenService.REFRESH_TOKEN_NAME, refreshjwt, JwtTokenService.RefreshTokenValidSecond);
            redisTokenService.setDataExpire(refreshjwt, String.valueOf(userSimple.getUsernum()), JwtTokenService.RefreshTokenValidSecond);
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
            Cookie accessToken = cookieService.createCookie(JwtTokenService.ACCESS_TOKEN_NAME, token,JwtTokenService.AccessTokenValidSecond);
            Cookie refreshToken = cookieService.createCookie(JwtTokenService.REFRESH_TOKEN_NAME, refreshjwt,JwtTokenService.RefreshTokenValidSecond);
            redisTokenService.setDataExpire(refreshjwt,String.valueOf(userSimple.getUsernum()), JwtTokenService.RefreshTokenValidSecond);
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


    /**
     * 회원가입
     * @param user 유저 폼, Valid 검사는 프론트에서 진행
     * @param isPlatForm 타 플랫폼 통해 가입한 경우 비밀번호는 무작위 부여
     * @return 성공 여부,
     * 실패하는 경우가 있나? column 조건에 안맞는 경우?
     */
    @PostMapping(value = "/signup")
    CommonResult signup(@ModelAttribute User user,
                        @RequestParam(required = false, defaultValue = "false") boolean isPlatForm) {
        user.setRole("USER");
        if(!isPlatForm) user.setPassword(passwordEncoder.encode(user.getPassword()));
        else user.setPassword(passwordEncoder.encode(RandomGenerator.RandomnameGenerate(26)));
        userRepository.save(user);
        return responseService.getSuccessResult();
    }


    @ApiOperation(value = "회원 탈퇴", notes = "authentication의 정보, 입력받은 id, pw 대조하여 확인 후 유저 삭제")
    @PostMapping(value = "/withdrawal")
    CommonResult withdrawal(@ApiParam(value = "id",required = true)@RequestParam String uid,
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
            redisTokenService.deleteData(jwtRefreshToken.getValue());
            jwtRefreshToken.setMaxAge(0);
            res.addCookie(jwtRefreshToken);
        }catch (ExpressionException ignored){

        }
        return responseService.getSuccessResult();
    }
}