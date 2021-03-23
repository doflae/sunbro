package com.humorpage.sunbro.advice.exception;

public class BoardNotFoundException extends RuntimeException {
    public BoardNotFoundException(String key, Throwable t) {
        super("Board Not Found by "+key, t);
    }

    public BoardNotFoundException(String key) {
        super("Board Not Found by "+key);
    }

    public BoardNotFoundException() {
        super();
    }
}