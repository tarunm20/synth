package com.synth.flashcard.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_sessions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class StudySession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"decks", "studySessions", "hibernateLazyInitializer", "handler"})
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    @JsonIgnoreProperties({"deck", "studySessions", "hibernateLazyInitializer", "handler"})
    private Card card;
    
    @Column(columnDefinition = "TEXT")
    private String response;
    
    private Double score;
    
    private Double confidence;
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    @Column(name = "studied_at")
    private LocalDateTime studiedAt;
    
    @PrePersist
    protected void onCreate() {
        studiedAt = LocalDateTime.now();
    }
    
    public StudySession() {}
    
    public StudySession(User user, Card card, String response, Double score, Double confidence, String feedback) {
        this.user = user;
        this.card = card;
        this.response = response;
        this.score = score;
        this.confidence = confidence;
        this.feedback = feedback;
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Card getCard() {
        return card;
    }
    
    public void setCard(Card card) {
        this.card = card;
    }
    
    public String getResponse() {
        return response;
    }
    
    public void setResponse(String response) {
        this.response = response;
    }
    
    public Double getScore() {
        return score;
    }
    
    public void setScore(Double score) {
        this.score = score;
    }
    
    public Double getConfidence() {
        return confidence;
    }
    
    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }
    
    public LocalDateTime getStudiedAt() {
        return studiedAt;
    }
    
    public void setStudiedAt(LocalDateTime studiedAt) {
        this.studiedAt = studiedAt;
    }
    
    public String getFeedback() {
        return feedback;
    }
    
    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}