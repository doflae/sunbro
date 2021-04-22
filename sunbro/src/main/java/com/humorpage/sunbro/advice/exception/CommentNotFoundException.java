package com.humorpage.sunbro.advice.exception;

public class CommentNotFoundException  extends RuntimeException{
    public CommentNotFoundException(String key, String value,Throwable t) {
        super(String.format("Comment %s:%s was not found",key,value), t);
    }

    public CommentNotFoundException(String key, String value) {
        super(String.format("Comment %s:%s was not found",key,value));
    }

    public CommentNotFoundException(){super();}
}
