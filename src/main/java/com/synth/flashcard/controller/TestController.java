package com.synth.flashcard.controller;

import com.synth.flashcard.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestController {
    
    private static final Logger logger = LoggerFactory.getLogger(TestController.class);
    
    @Autowired
    private EmailService emailService;
    
    @PostMapping("/send-email")
    public ResponseEntity<?> testEmail(@RequestParam String email) {
        try {
            logger.info("Testing email service with: {}", email);
            emailService.sendPasswordResetEmail(email, "test-token-123");
            logger.info("Email service call completed for: {}", email);
            return ResponseEntity.ok("Email test completed");
        } catch (Exception e) {
            logger.error("Email test failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Email test failed: " + e.getMessage());
        }
    }
}