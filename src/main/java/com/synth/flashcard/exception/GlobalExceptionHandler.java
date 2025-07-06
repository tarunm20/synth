package com.synth.flashcard.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .message("Validation failed")
            .errors(errors)
            .correlationId(UUID.randomUUID().toString())
            .build();
            
        return ResponseEntity.badRequest().body(errorResponse);
    }
    
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        logger.warn("Authentication failed: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.UNAUTHORIZED.value())
            .message("Invalid email or password")
            .correlationId(UUID.randomUUID().toString())
            .build();
            
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }
    
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        logger.warn("File upload size exceeded: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.PAYLOAD_TOO_LARGE.value())
            .message("File size exceeds maximum allowed limit of 10MB")
            .correlationId(UUID.randomUUID().toString())
            .build();
            
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(errorResponse);
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        logger.warn("Invalid argument: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .message("Invalid request: " + ex.getMessage())
            .correlationId(UUID.randomUUID().toString())
            .build();
            
        return ResponseEntity.badRequest().body(errorResponse);
    }
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        String correlationId = UUID.randomUUID().toString();
        logger.error("Runtime exception occurred [{}]: {}", correlationId, ex.getMessage(), ex);
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .message("An unexpected error occurred. Please try again later.")
            .correlationId(correlationId)
            .build();
            
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
        String correlationId = UUID.randomUUID().toString();
        logger.error("Unexpected error occurred [{}]: {}", correlationId, ex.getMessage(), ex);
        
        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .message("An unexpected error occurred. Please contact support if the problem persists.")
            .correlationId(correlationId)
            .build();
            
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}

class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String message;
    private Map<String, String> errors;
    private String correlationId;
    
    public static ErrorResponseBuilder builder() {
        return new ErrorResponseBuilder();
    }
    
    // Getters and setters
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Map<String, String> getErrors() { return errors; }
    public void setErrors(Map<String, String> errors) { this.errors = errors; }
    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }
    
    public static class ErrorResponseBuilder {
        private LocalDateTime timestamp;
        private int status;
        private String message;
        private Map<String, String> errors;
        private String correlationId;
        
        public ErrorResponseBuilder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }
        
        public ErrorResponseBuilder status(int status) {
            this.status = status;
            return this;
        }
        
        public ErrorResponseBuilder message(String message) {
            this.message = message;
            return this;
        }
        
        public ErrorResponseBuilder errors(Map<String, String> errors) {
            this.errors = errors;
            return this;
        }
        
        public ErrorResponseBuilder correlationId(String correlationId) {
            this.correlationId = correlationId;
            return this;
        }
        
        public ErrorResponse build() {
            ErrorResponse response = new ErrorResponse();
            response.setTimestamp(this.timestamp);
            response.setStatus(this.status);
            response.setMessage(this.message);
            response.setErrors(this.errors);
            response.setCorrelationId(this.correlationId);
            return response;
        }
    }
}