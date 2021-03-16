package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.UserSimple;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;


@Component
public class JwtTokenService {

    @Value("${spring.jwt.secret}")
    private String SECRET_KEY;

    public final static long AccessTokenValidMilisecond = 1000L * 1800; // 30분 토큰 유효
    public final static long EmailAuthValidMilisecond = 1000L * 7200; // 2시간 토큰 유효
    public final static long RefreshTokenValidMilisecond = 1000L * 172800; // 2일 유효

    public final static long TempNameForDuplicateSecond = 60*5; // 10분 유효
    public final static long EmailAuthValidSecond = 7200; // 2시간 토큰 유효
    public final static long AccessTokenValidSecond = 1800;
    public final static long RefreshTokenValidSecond = 172800; // 2일 유효
    public final static long OneDayValidSecond = 86400;

    final static public String ACCESS_TOKEN_NAME = "accessToken";
    final static public String REFRESH_TOKEN_NAME = "refreshToken";


    private Key getSigningKey(String secretKey){
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public Claims extractAllClaims(String token) throws ExpiredJwtException{
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey(SECRET_KEY))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    public Long getUsernum(String token) {
        return extractAllClaims(token).get("usernum", Long.class);
    }

    public Boolean isTokenExpired(String token) {
        final Date expiration = extractAllClaims(token).getExpiration();
        return expiration.before(new Date());
    }

    public String generateToken(UserSimple userSimple) {
        return doGenerateToken(userSimple.getUsernum(), AccessTokenValidMilisecond);
    }

    public String generateRefreshToken(UserSimple userSimple) {
        return doGenerateToken(userSimple.getUsernum(), RefreshTokenValidMilisecond);
    }

    public String doGenerateToken(Long usernum, long expireTime) {

        Claims claims = Jwts.claims();
        claims.put("usernum", usernum);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expireTime))
                .signWith(getSigningKey(SECRET_KEY), SignatureAlgorithm.HS256)
                .compact();
    }

    public Boolean validateToken(String token, UserSimple userSimple) {
        Long tokenNum = getUsernum(token);
        Long userNum = userSimple.getUsernum();
        return (userNum!=null && userNum.equals(tokenNum) && !isTokenExpired(token));
    }
}
