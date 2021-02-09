package com.humorpage.sunbro.filter;

import com.humorpage.sunbro.advice.exception.CIdSigninFailedException;
import com.humorpage.sunbro.advice.exception.JwtRefreshTokenExpiredException;
import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.service.CookieService;
import com.humorpage.sunbro.service.JwtTokenService;
import com.humorpage.sunbro.service.RedisTokenService;
import com.humorpage.sunbro.service.UserService;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

// import 생략
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private final UserService userService;

    @Autowired
    private final JwtTokenService jwtTokenService;

    @Autowired
    private CookieService cookieService;

    @Autowired
    private final RedisTokenService redisTokenService;

    //Provier 주입
    public JwtAuthenticationFilter(JwtTokenService jwtTokenService, CookieService cookieService, RedisTokenService redisTokenService, UserService userService) {
        this.cookieService = cookieService;
        this.redisTokenService = redisTokenService;
        this.jwtTokenService = jwtTokenService;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, FilterChain filterChain) throws ServletException, IOException, JwtRefreshTokenExpiredException {

        final Cookie jwtToken = cookieService.getCookie(httpServletRequest, JwtTokenService.ACCESS_TOKEN_NAME);

        Long usernum = null;
        String jwt = null;
        String refreshJwt = null;
        Long refreshUnum;

        try{
            if(jwtToken != null){
                jwt = jwtToken.getValue();
                usernum = jwtTokenService.getUsernum(jwt);
            }
            if(usernum!=null){
                UserSimple userSimple = userService.loadUserSimpleByUsernum(usernum).orElseThrow(CIdSigninFailedException::new);

                if(jwtTokenService.validateToken(jwt,userSimple)){
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(userSimple,null,userSimple.getAuthorities());
                    usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(httpServletRequest));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                }
            }
        }catch (ExpiredJwtException e){
            Cookie refreshToken = cookieService.getCookie(httpServletRequest, JwtTokenService.REFRESH_TOKEN_NAME);
            if(refreshToken!=null){
                refreshJwt = refreshToken.getValue();
            }
        }catch(CIdSigninFailedException ignored){

        }
        try {
            if (refreshJwt != null) {
                refreshUnum = Long.parseLong(redisTokenService.getData(refreshJwt));
                if (refreshUnum.equals(jwtTokenService.getUsernum(refreshJwt))) {
                    UserSimple userSimple = userService.loadUserSimpleByUsernum(refreshUnum).orElseThrow(CIdSigninFailedException::new);
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(userSimple, null, userSimple.getAuthorities());
                    usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(httpServletRequest));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                    UserSimple n_user = new UserSimple();
                    n_user.setUsernum(refreshUnum);
                    String newToken = jwtTokenService.generateToken(n_user);

                    Cookie newAccessToken = cookieService.createCookie(JwtTokenService.ACCESS_TOKEN_NAME, newToken);
                    httpServletResponse.addCookie(newAccessToken);
                }
            }
        }
        catch (ExpiredJwtException ignored){

        }

        filterChain.doFilter(httpServletRequest,httpServletResponse);
    }
}
