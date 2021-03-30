package com.humorpage.sunbro.advice.exception;

public class CommentNotFoundException  extends RuntimeException{
    public CommentNotFoundException(String key, Throwable t) {super("Comment Not Found by "+key, t);}

    public CommentNotFoundException(String key) {super("Comment Not Found by "+key);}

    public CommentNotFoundException(){super();}
}
