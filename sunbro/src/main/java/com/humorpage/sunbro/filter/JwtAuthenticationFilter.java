package com.humorpage.sunbro.filter;

import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.service.CookieService;
import com.humorpage.sunbro.service.JwtTokenService;
import com.humorpage.sunbro.service.RedisTokenService;
import com.humorpage.sunbro.service.UserService;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
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
    private UserService userService;

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private CookieService cookieService;

    @Autowired
    private RedisTokenService redisTokenService;

    //Provier 주입
    public JwtAuthenticationFilter(JwtTokenService jwtTokenService, CookieService cookieService, RedisTokenService redisTokenService, UserService userService) {
        this.cookieService = cookieService;
        this.redisTokenService = redisTokenService;
        this.jwtTokenService = jwtTokenService;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, FilterChain filterChain) throws ServletException, IOException {

        final Cookie jwtToken = CookieService.getCookie(httpServletRequest, JwtTokenService.ACCESS_TOKEN_NAME);

        String username = null;
        String jwt = null;
        String refreshJwt = null;
        String refreshUname = null;

        try{
            if(jwtToken != null){
                jwt = jwtToken.getValue();
                username = jwtTokenService.getUsername(jwt);
            }
            if(username!=null){
                UserDetails userDetails = userService.loadUserByUsername(username);

                if(jwtTokenService.validateToken(jwt,userDetails)){
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
                    usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(httpServletRequest));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                }
            }
        }catch (ExpiredJwtException e){
            Cookie refreshToken = CookieService.getCookie(httpServletRequest, JwtTokenService.REFRESH_TOKEN_NAME);
            if(refreshToken!=null){
                refreshJwt = refreshToken.getValue();
            }
        }catch(Exception e){

        }

        try{
            if(refreshJwt != null){
                refreshUname = redisTokenService.getData(refreshJwt);

                if(refreshUname.equals(jwtTokenService.getUsername(refreshJwt))){
                    UserDetails userDetails = userService.loadUserByUsername(refreshUname);
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
                    usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(httpServletRequest));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);

                    User user = new User();
                    user.setUid(refreshUname);
                    String newToken = jwtTokenService.generateToken(user);

                    Cookie newAccessToken = cookieService.createCookie(JwtTokenService.ACCESS_TOKEN_NAME,newToken);
                    httpServletResponse.addCookie(newAccessToken);
                }
            }
        }catch(ExpiredJwtException e){

        }

        filterChain.doFilter(httpServletRequest,httpServletResponse);
    }
}
