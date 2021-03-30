package com.humorpage.sunbro.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.humorpage.sunbro.advice.exception.UserNotFoundException;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.service.CookieService;
import com.humorpage.sunbro.service.JwtTokenService;
import com.humorpage.sunbro.service.RedisTokenService;
import com.humorpage.sunbro.service.UserService;
import io.jsonwebtoken.ExpiredJwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.thymeleaf.util.StringUtils;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

// import 생략
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private final UserService userService;

    @Autowired
    private final JwtTokenService jwtTokenService;

    @Autowired
    private final CookieService cookieService;

    @Autowired
    private final RedisTokenService redisTokenService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    //Provider 주입
    public JwtAuthenticationFilter(JwtTokenService jwtTokenService, CookieService cookieService, RedisTokenService redisTokenService, UserService userService) {
        this.cookieService = cookieService;
        this.redisTokenService = redisTokenService;
        this.jwtTokenService = jwtTokenService;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, FilterChain filterChain) throws ServletException, IOException {

        if(StringUtils.equals(httpServletRequest.getMethod(),"OPTIONS")){
            System.out.println(httpServletRequest.toString());
            httpServletResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        final Cookie jwtToken = cookieService.getCookie(httpServletRequest, JwtTokenService.ACCESS_TOKEN_NAME);

        Long userNum = null;
        String jwt = null;
        String refreshJwt = null;
        Long refreshUserNum;

        try{
            if(jwtToken != null){
                jwt = jwtToken.getValue();
                userNum = jwtTokenService.getUserNum(jwt);
            }
            if(userNum!=null){
                UserSimple userSimple = userService.findUserSimpleByUserNum(userNum);
                if(userSimple!=null){
                    if(httpServletResponse.getHeader("user")==null){
                        httpServletResponse.addHeader("user",objectMapper.writeValueAsString(userSimple));
                    }
                    if(jwtTokenService.validateToken(jwt,userSimple)) {
                        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(userSimple, null, userSimple.getAuthorities());
                        usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(httpServletRequest));
                        SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                    }
                }
            }else{
                Cookie refreshToken = cookieService.getCookie(httpServletRequest, JwtTokenService.REFRESH_TOKEN_NAME);
                if(refreshToken!=null){
                    refreshJwt = refreshToken.getValue();
                }
            }
        }catch (ExpiredJwtException e){
            Cookie refreshToken = cookieService.getCookie(httpServletRequest, JwtTokenService.REFRESH_TOKEN_NAME);
            if(refreshToken!=null){
                refreshJwt = refreshToken.getValue();
            }
        }catch(UserNotFoundException ignored){

        }
        try {
            if (refreshJwt != null) {
                refreshUserNum = Long.parseLong(redisTokenService.getData(refreshJwt));
                if (refreshUserNum.equals(jwtTokenService.getUserNum(refreshJwt))) {
                    UserSimple userSimple = userService.findUserSimpleByUserNum(refreshUserNum);
                    if(userSimple!=null){
                        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(userSimple, null, userSimple.getAuthorities());
                        usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(httpServletRequest));
                        SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                        String newToken = jwtTokenService.generateToken(userSimple);
                        if (httpServletResponse.getHeader("user")==null){
                            httpServletResponse.addHeader("user",objectMapper.writeValueAsString(userSimple));
                        }
                        Cookie newAccessToken = cookieService.createCookie(JwtTokenService.ACCESS_TOKEN_NAME, newToken, JwtTokenService.AccessTokenValidSecond);
                        httpServletResponse.addCookie(newAccessToken);
                    }
                }
            }
        }
        catch (ExpiredJwtException |NumberFormatException ignored){

        }
        filterChain.doFilter(httpServletRequest,httpServletResponse);
    }
}
