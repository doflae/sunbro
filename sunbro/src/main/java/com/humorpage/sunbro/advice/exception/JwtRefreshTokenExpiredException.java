package com.humorpage.sunbro.advice.exception;

public class JwtRefreshTokenExpiredException extends RuntimeException{
    public JwtRefreshTokenExpiredException(String msg, Throwable t){super(msg,t);}

    public JwtRefreshTokenExpiredException(String msg){super(msg);}

    public JwtRefreshTokenExpiredException(){super();}
}
