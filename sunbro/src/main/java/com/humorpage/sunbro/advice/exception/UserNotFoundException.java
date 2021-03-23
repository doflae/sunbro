package com.humorpage.sunbro.advice.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String key, Throwable t) {
        super("User Not Found by "+key, t);
    }

    public UserNotFoundException(String key) {
        super("User Not Found by "+key);
    }

    public UserNotFoundException() {
        super();
    }
}