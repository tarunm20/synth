package com.synth.flashcard.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "decks")
public class Deck {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"decks", "studySessions", "hibernateLazyInitializer", "handler"})
    private User user;
    
    @NotBlank
    private String name;
    
    private String description;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "deck", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("deck")
    private List<Card> cards;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public Deck() {}
    
    public Deck(User user, String name, String description) {
        this.user = user;
        this.name = name;
        this.description = description;
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<Card> getCards() {
        return cards;
    }
    
    public void setCards(List<Card> cards) {
        this.cards = cards;
    }
}