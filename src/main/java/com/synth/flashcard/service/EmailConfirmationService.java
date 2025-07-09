package com.synth.flashcard.service;

import com.synth.flashcard.entity.EmailConfirmationToken;
import com.synth.flashcard.entity.User;
import com.synth.flashcard.repository.EmailConfirmationTokenRepository;
import com.synth.flashcard.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
public class EmailConfirmationService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailConfirmationService.class);
    
    @Autowired
    private EmailConfirmationTokenRepository tokenRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    private final SecureRandom secureRandom = new SecureRandom();
    
    @Async
    @Transactional
    public void sendEmailConfirmation(User user) {
        if (user.isEmailVerified()) {
            logger.info("Email already verified for user: {}", user.getEmail());
            return;
        }
        
        // Invalidate existing tokens for this user
        tokenRepository.invalidateAllUserTokens(user);
        
        // Generate new token
        String token = generateSecureToken();
        
        // Save token to database
        EmailConfirmationToken confirmationToken = new EmailConfirmationToken(token, user);
        tokenRepository.save(confirmationToken);
        
        // Send email
        emailService.sendEmailConfirmation(user.getEmail(), token);
        
        logger.info("Email confirmation sent to: {}", user.getEmail());
    }
    
    @Transactional
    public boolean confirmEmail(String token) {
        Optional<EmailConfirmationToken> tokenOpt = tokenRepository.findByToken(token);
        
        if (tokenOpt.isEmpty()) {
            logger.warn("Invalid email confirmation token: {}", token);
            return false;
        }
        
        EmailConfirmationToken confirmationToken = tokenOpt.get();
        
        if (!confirmationToken.isValid()) {
            logger.warn("Expired or used email confirmation token: {}", token);
            return false;
        }
        
        // Mark token as used
        confirmationToken.setUsed(true);
        tokenRepository.save(confirmationToken);
        
        // Mark user as verified
        User user = confirmationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        
        logger.info("Email confirmed successfully for user: {}", user.getEmail());
        return true;
    }
    
    @Transactional
    public boolean resendEmailConfirmation(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            logger.warn("User not found for email confirmation resend: {}", email);
            return false;
        }
        
        User user = userOpt.get();
        
        if (user.isEmailVerified()) {
            logger.info("Email already verified for user: {}", email);
            return false;
        }
        
        // Check if there's already a pending token (rate limiting)
        if (tokenRepository.existsByUserAndUsedFalse(user)) {
            logger.warn("Email confirmation already pending for user: {}", email);
            return false;
        }
        
        sendEmailConfirmation(user);
        return true;
    }
    
    private String generateSecureToken() {
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }
    
    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void cleanupExpiredTokens() {
        try {
            tokenRepository.deleteExpiredAndUsedTokens(LocalDateTime.now());
            logger.debug("Cleaned up expired email confirmation tokens");
        } catch (Exception e) {
            logger.error("Error cleaning up expired tokens: {}", e.getMessage());
        }
    }
}