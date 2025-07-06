package com.synth.flashcard.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_progress")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class StudyProgress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"decks", "studySessions", "hibernateLazyInitializer", "handler"})
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id", nullable = false)
    @JsonIgnoreProperties({"cards", "user", "hibernateLazyInitializer", "handler"})
    private Deck deck;
    
    @Column(name = "current_card_index")
    private Integer currentCardIndex;
    
    @Column(name = "total_cards")
    private Integer totalCards;
    
    @Column(name = "cards_completed")
    private Integer cardsCompleted;
    
    @Column(name = "last_studied_at")
    private LocalDateTime lastStudiedAt;
    
    @Column(name = "is_completed")
    private Boolean isCompleted;
    
    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastStudiedAt = LocalDateTime.now();
    }
    
    public StudyProgress() {}
    
    public StudyProgress(User user, Deck deck, Integer totalCards) {
        this.user = user;
        this.deck = deck;
        this.currentCardIndex = 0;
        this.totalCards = totalCards;
        this.cardsCompleted = 0;
        this.isCompleted = false;
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
    
    public Deck getDeck() {
        return deck;
    }
    
    public void setDeck(Deck deck) {
        this.deck = deck;
    }
    
    public Integer getCurrentCardIndex() {
        return currentCardIndex;
    }
    
    public void setCurrentCardIndex(Integer currentCardIndex) {
        this.currentCardIndex = currentCardIndex;
    }
    
    public Integer getTotalCards() {
        return totalCards;
    }
    
    public void setTotalCards(Integer totalCards) {
        this.totalCards = totalCards;
    }
    
    public Integer getCardsCompleted() {
        return cardsCompleted;
    }
    
    public void setCardsCompleted(Integer cardsCompleted) {
        this.cardsCompleted = cardsCompleted;
    }
    
    public LocalDateTime getLastStudiedAt() {
        return lastStudiedAt;
    }
    
    public void setLastStudiedAt(LocalDateTime lastStudiedAt) {
        this.lastStudiedAt = lastStudiedAt;
    }
    
    public Boolean getIsCompleted() {
        return isCompleted;
    }
    
    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }
}