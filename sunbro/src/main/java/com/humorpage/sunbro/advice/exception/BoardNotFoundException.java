package com.humorpage.sunbro.advice.exception;

public class BoardNotFoundException extends RuntimeException {
    public BoardNotFoundException(String key,String value, Throwable t) {
        super(String.format("Board %s:%s was not found",key,value), t);
    }

    public BoardNotFoundException(String key,String value) {
        super(String.format("Board %s:%s was not found",key,value));
    }

    public BoardNotFoundException() {
        super();
    }
}