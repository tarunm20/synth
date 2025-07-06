package com.synth.flashcard.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
    int limit() default 10; // Number of requests
    int window() default 60; // Time window in seconds
    String key() default ""; // Custom key, defaults to method + IP
}