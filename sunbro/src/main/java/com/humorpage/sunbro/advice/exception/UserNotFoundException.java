package com.humorpage.sunbro.advice.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String key, String value, Throwable t) {
        super(String.format("User %s:%s was not found",key,value), t);
    }

    public UserNotFoundException(String key, String value) {
        super(String.format("User %s:%s was not found",key,value));
    }

    public UserNotFoundException() {
        super();
    }
}