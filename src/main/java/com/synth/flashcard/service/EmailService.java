package com.synth.flashcard.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Value("${app.resend.api-key:}")
    private String resendApiKey;
    
    @Value("${app.resend.from-email:noreply@yourdomain.com}")
    private String fromEmail;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    public EmailService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .baseUrl("https://api.resend.com")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
    
    public void sendPasswordResetEmail(String email, String token) {
        if (resendApiKey == null || resendApiKey.isEmpty()) {
            logger.warn("Resend API key not configured. Password reset email not sent to: {}", email);
            return;
        }
        
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        
        Map<String, Object> emailData = Map.of(
            "from", fromEmail,
            "to", new String[]{email},
            "subject", "Reset Your Synth Password",
            "html", buildPasswordResetEmail(resetUrl)
        );
        
        sendEmail(emailData, "password reset");
    }
    
    public void sendEmailConfirmation(String email, String token) {
        if (resendApiKey == null || resendApiKey.isEmpty()) {
            logger.warn("Resend API key not configured. Email confirmation not sent to: {}", email);
            return;
        }
        
        String confirmUrl = frontendUrl + "/confirm-email?token=" + token;
        
        Map<String, Object> emailData = Map.of(
            "from", fromEmail,
            "to", new String[]{email},
            "subject", "Confirm Your Synth Account",
            "html", buildEmailConfirmationEmail(confirmUrl)
        );
        
        sendEmail(emailData, "email confirmation");
    }
    
    private void sendEmail(Map<String, Object> emailData, String type) {
        try {
            webClient.post()
                    .uri("/emails")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + resendApiKey)
                    .bodyValue(emailData)
                    .retrieve()
                    .bodyToMono(String.class)
                    .doOnSuccess(response -> logger.info("Successfully sent {} email", type))
                    .doOnError(error -> logger.error("Failed to send {} email: {}", type, error.getMessage()))
                    .onErrorResume(error -> Mono.empty())
                    .subscribe();
                    
        } catch (Exception e) {
            logger.error("Error sending {} email: {}", type, e.getMessage());
        }
    }
    
    private String buildPasswordResetEmail(String resetUrl) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Reset Your Password</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🧠 Synth</h1>
                    </div>
                    <div class="content">
                        <h2>Reset Your Password</h2>
                        <p>You requested to reset your password for your Synth account.</p>
                        <p>Click the button below to reset your password:</p>
                        <p><a href="%s" class="button">Reset Password</a></p>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p><a href="%s">%s</a></p>
                        <p>This link will expire in 1 hour for security reasons.</p>
                        <p>If you didn't request this password reset, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Synth. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, resetUrl, resetUrl, resetUrl);
    }
    
    private String buildEmailConfirmationEmail(String confirmUrl) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Confirm Your Email</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🧠 Synth</h1>
                    </div>
                    <div class="content">
                        <h2>Welcome to Synth!</h2>
                        <p>Thank you for creating an account with Synth.</p>
                        <p>To complete your registration, please confirm your email address:</p>
                        <p><a href="%s" class="button">Confirm Email</a></p>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p><a href="%s">%s</a></p>
                        <p>This link will expire in 24 hours for security reasons.</p>
                        <p>If you didn't create this account, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Synth. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, confirmUrl, confirmUrl, confirmUrl);
    }
}