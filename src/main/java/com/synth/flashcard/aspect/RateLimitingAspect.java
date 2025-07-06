package com.synth.flashcard.aspect;

import com.synth.flashcard.annotation.RateLimit;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;

@Aspect
@Component
public class RateLimitingAspect {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitingAspect.class);

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Around("@annotation(rateLimit)")
    public Object rateLimit(ProceedingJoinPoint joinPoint, RateLimit rateLimit) throws Throwable {
        String key = generateKey(joinPoint, rateLimit);
        
        try {
            String currentValue = redisTemplate.opsForValue().get(key);
            int currentRequests = currentValue != null ? Integer.parseInt(currentValue) : 0;

            if (currentRequests >= rateLimit.limit()) {
                logger.warn("Rate limit exceeded for key: {}", key);
                throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS, 
                    "Rate limit exceeded. Please try again later."
                );
            }

            // Increment the counter
            redisTemplate.opsForValue().increment(key);
            
            // Set expiration only if this is the first request
            if (currentRequests == 0) {
                redisTemplate.expire(key, Duration.ofSeconds(rateLimit.window()));
            }

            return joinPoint.proceed();
            
        } catch (Exception e) {
            // If Redis is down, log error but allow request to proceed
            logger.error("Rate limiting check failed, allowing request: {}", e.getMessage());
            return joinPoint.proceed();
        }
    }

    private String generateKey(ProceedingJoinPoint joinPoint, RateLimit rateLimit) {
        String methodName = joinPoint.getSignature().getName();
        String clientIp = getClientIp();
        
        if (!rateLimit.key().isEmpty()) {
            return String.format("rate_limit:%s:%s", rateLimit.key(), clientIp);
        }
        
        return String.format("rate_limit:%s:%s", methodName, clientIp);
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest request = attributes.getRequest();
            
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }
            
            String xRealIp = request.getHeader("X-Real-IP");
            if (xRealIp != null && !xRealIp.isEmpty()) {
                return xRealIp;
            }
            
            return request.getRemoteAddr();
        } catch (Exception e) {
            logger.warn("Could not determine client IP: {}", e.getMessage());
            return "unknown";
        }
    }
}