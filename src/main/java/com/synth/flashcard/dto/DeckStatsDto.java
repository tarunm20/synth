package com.synth.flashcard.dto;

import java.time.LocalDateTime;

public class DeckStatsDto {
    private Long id;
    private String name;
    private String description;
    private int cardCount;
    private double masteryScore;
    private LocalDateTime lastStudied;
    private LocalDateTime createdAt;

    public DeckStatsDto() {}

    public DeckStatsDto(Long id, String name, String description, int cardCount, 
                       double masteryScore, LocalDateTime lastStudied, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.cardCount = cardCount;
        this.masteryScore = masteryScore;
        this.lastStudied = lastStudied;
        this.createdAt = createdAt;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getCardCount() {
        return cardCount;
    }

    public void setCardCount(int cardCount) {
        this.cardCount = cardCount;
    }

    public double getMasteryScore() {
        return masteryScore;
    }

    public void setMasteryScore(double masteryScore) {
        this.masteryScore = masteryScore;
    }

    public LocalDateTime getLastStudied() {
        return lastStudied;
    }

    public void setLastStudied(LocalDateTime lastStudied) {
        this.lastStudied = lastStudied;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}