package com.synth.flashcard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateDeckRequest {
    @NotBlank(message = "Deck name is required")
    @Size(min = 1, max = 100, message = "Deck name must be between 1 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotBlank(message = "Content is required")
    @Size(min = 10, max = 50000, message = "Content must be between 10 and 50,000 characters")
    private String content;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}