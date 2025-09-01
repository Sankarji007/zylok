package com.zylo.authservice.exception;

public class InsufficientInfoException extends RuntimeException {
    public InsufficientInfoException(String message) {
        super(message);
    }
}
