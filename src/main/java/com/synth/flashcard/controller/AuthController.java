package com.synth.flashcard.controller;

import com.synth.flashcard.annotation.RateLimit;
import com.synth.flashcard.dto.AuthRequest;
import com.synth.flashcard.dto.AuthResponse;
import com.synth.flashcard.dto.PasswordChangeRequest;
import com.synth.flashcard.dto.PasswordResetRequest;
import com.synth.flashcard.entity.User;
import com.synth.flashcard.repository.UserRepository;
import com.synth.flashcard.service.PasswordResetService;
import com.synth.flashcard.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/register")
    @RateLimit(limit = 5, window = 300) // 5 registrations per 5 minutes
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        user = userRepository.save(user);
        
        String token = jwtUtil.generateToken(user);
        
        return ResponseEntity.ok(new AuthResponse(token, new AuthResponse.UserDto(user.getId(), user.getEmail())));
    }

    @PostMapping("/login")
    @RateLimit(limit = 10, window = 60) // 10 login attempts per minute
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = (User) authentication.getPrincipal();
            String token = jwtUtil.generateToken(user);

            return ResponseEntity.ok(new AuthResponse(token, new AuthResponse.UserDto(user.getId(), user.getEmail())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
    }

    @PostMapping("/forgot-password")
    @RateLimit(limit = 3, window = 300) // 3 attempts per 5 minutes
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody PasswordResetRequest request) {
        try {
            String message = passwordResetService.createPasswordResetToken(request.getEmail());
            return ResponseEntity.ok().body(message);
        } catch (Exception e) {
            return ResponseEntity.ok().body("Password reset link sent if email exists");
        }
    }

    @PostMapping("/reset-password")
    @RateLimit(limit = 5, window = 300) // 5 attempts per 5 minutes
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordChangeRequest request) {
        try {
            String message = passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok().body(message);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to reset password");
        }
    }

    @PostMapping("/create-test-users")
    public ResponseEntity<?> createTestUsers() {
        try {
            // Create FREE tier user
            if (!userRepository.existsByEmail("free@test.com")) {
                User freeUser = new User();
                freeUser.setEmail("free@test.com");
                freeUser.setPassword(passwordEncoder.encode("password123"));
                freeUser.setSubscriptionTier(User.SubscriptionTier.FREE);
                userRepository.save(freeUser);
            }

            // Create BASIC tier user
            if (!userRepository.existsByEmail("basic@test.com")) {
                User basicUser = new User();
                basicUser.setEmail("basic@test.com");
                basicUser.setPassword(passwordEncoder.encode("password123"));
                basicUser.setSubscriptionTier(User.SubscriptionTier.BASIC);
                userRepository.save(basicUser);
            }

            // Create PRO tier user
            if (!userRepository.existsByEmail("pro@test.com")) {
                User proUser = new User();
                proUser.setEmail("pro@test.com");
                proUser.setPassword(passwordEncoder.encode("password123"));
                proUser.setSubscriptionTier(User.SubscriptionTier.PRO);
                userRepository.save(proUser);
            }

            return ResponseEntity.ok().body("Test users created successfully:\n" +
                "FREE tier: free@test.com / password123 (3 decks, 50 cards per deck)\n" +
                "BASIC tier: basic@test.com / password123 (10 decks, unlimited cards)\n" +
                "PRO tier: pro@test.com / password123 (unlimited decks and cards)");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create test users: " + e.getMessage());
        }
    }
}