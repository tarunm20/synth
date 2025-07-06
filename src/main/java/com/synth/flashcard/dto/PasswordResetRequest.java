package com.synth.flashcard.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class PasswordResetRequest {
    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    private String email;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}