package com.synth.flashcard.service;

import com.synth.flashcard.entity.PasswordResetToken;
import com.synth.flashcard.entity.User;
import com.synth.flashcard.repository.PasswordResetTokenRepository;
import com.synth.flashcard.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@Transactional
public class PasswordResetService {
    
    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);
    private static final int TOKEN_LENGTH = 32;
    
    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private final SecureRandom secureRandom = new SecureRandom();
    
    public String createPasswordResetToken(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            logger.warn("Password reset requested for non-existent email: {}", email);
            // Return success to prevent email enumeration attacks
            return "Password reset link sent if email exists";
        }
        
        User user = userOpt.get();
        
        // Invalidate any existing tokens for this user
        tokenRepository.invalidateAllUserTokens(user);
        
        // Generate secure token
        byte[] tokenBytes = new byte[TOKEN_LENGTH];
        secureRandom.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        
        // Create and save token
        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        tokenRepository.save(resetToken);
        
        logger.info("Password reset token created for user: {}", email);
        
        // In a real implementation, you would send an email here
        // For MVP, we'll log the token (remove in production!)
        if (logger.isDebugEnabled()) {
            logger.debug("Password reset token (DEBUG ONLY): {}", token);
        }
        
        return "Password reset link sent to your email";
    }
    
    public String resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        
        if (tokenOpt.isEmpty()) {
            logger.warn("Invalid password reset token used: {}", token);
            throw new IllegalArgumentException("Invalid or expired reset token");
        }
        
        PasswordResetToken resetToken = tokenOpt.get();
        
        if (!resetToken.isValid()) {
            logger.warn("Expired or used password reset token: {}", token);
            throw new IllegalArgumentException("Invalid or expired reset token");
        }
        
        // Update user password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
        
        logger.info("Password reset completed for user: {}", user.getEmail());
        
        return "Password reset successfully";
    }
    
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteExpiredAndUsedTokens(LocalDateTime.now());
        logger.debug("Cleaned up expired password reset tokens");
    }
}