package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;


@Component
public class JwtTokenService {

    @Value("${spring.jwt.secret}")
    private String SECRET_KEY;

    public final static long AccesstokenValidMilisecond = 1000L * 10; // 10초만 토큰 유효

    public final static long RefreshtokenValidMilisecond = 1000L * 60 * 24 * 2; // 2일 유효

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
    public String getUsername(String token) {
        return extractAllClaims(token).get("uid", String.class);
    }

    public Boolean isTokenExpired(String token) {
        final Date expiration = extractAllClaims(token).getExpiration();
        return expiration.before(new Date());
    }

    public String generateToken(User user) {
        return doGenerateToken(user.getUsername(), AccesstokenValidMilisecond);
    }

    public String generateRefreshToken(User user) {
        return doGenerateToken(user.getUsername(), RefreshtokenValidMilisecond);
    }

    public String doGenerateToken(String uid, long expireTime) {

        Claims claims = Jwts.claims();
        claims.put("uid", uid);

        String jwt = Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expireTime))
                .signWith(getSigningKey(SECRET_KEY), SignatureAlgorithm.HS256)
                .compact();

        return jwt;
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsername(token);

        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
