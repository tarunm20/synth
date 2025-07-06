package com.synth.flashcard.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

@Entity
@Table(name = "cards")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Card {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id", nullable = false)
    @JsonIgnoreProperties({"cards", "user", "hibernateLazyInitializer", "handler"})
    private Deck deck;
    
    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String question;
    
    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String answer;
    
    @Enumerated(EnumType.STRING)
    private Difficulty difficulty = Difficulty.MEDIUM;
    
    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"card", "user", "hibernateLazyInitializer", "handler"})
    private List<StudySession> studySessions;
    
    public Card() {}
    
    public Card(Deck deck, String question, String answer, Difficulty difficulty) {
        this.deck = deck;
        this.question = question;
        this.answer = answer;
        this.difficulty = difficulty;
    }
    
    public enum Difficulty {
        EASY, MEDIUM, HARD
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Deck getDeck() {
        return deck;
    }
    
    public void setDeck(Deck deck) {
        this.deck = deck;
    }
    
    public String getQuestion() {
        return question;
    }
    
    public void setQuestion(String question) {
        this.question = question;
    }
    
    public String getAnswer() {
        return answer;
    }
    
    public void setAnswer(String answer) {
        this.answer = answer;
    }
    
    public Difficulty getDifficulty() {
        return difficulty;
    }
    
    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }
    
    public List<StudySession> getStudySessions() {
        return studySessions;
    }
    
    public void setStudySessions(List<StudySession> studySessions) {
        this.studySessions = studySessions;
    }
}