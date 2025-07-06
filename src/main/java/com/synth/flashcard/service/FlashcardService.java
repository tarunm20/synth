package com.synth.flashcard.service;

import com.synth.flashcard.dto.DeckStatsDto;
import com.synth.flashcard.entity.Card;
import com.synth.flashcard.entity.Deck;
import com.synth.flashcard.entity.StudySession;
import com.synth.flashcard.entity.User;
import com.synth.flashcard.repository.CardRepository;
import com.synth.flashcard.repository.DeckRepository;
import com.synth.flashcard.repository.StudySessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class FlashcardService {

    @Autowired
    private FileProcessingService fileProcessingService;

    @Autowired
    private ClaudeService claudeService;

    @Autowired
    private DeckRepository deckRepository;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private StudySessionRepository studySessionRepository;

    public Deck createDeckFromFile(User user, String deckName, String description, MultipartFile file) throws IOException {
        // Validate file
        if (!fileProcessingService.isValidFileType(file)) {
            throw new IllegalArgumentException("Invalid file type. Only PDF and TXT files are supported.");
        }
        
        if (!fileProcessingService.isFileSizeValid(file)) {
            throw new IllegalArgumentException("File size exceeds 10MB limit.");
        }

        // Extract text from file
        String content = fileProcessingService.extractTextFromFile(file);
        
        if (content.trim().isEmpty()) {
            throw new IllegalArgumentException("No text content found in the file.");
        }

        // Generate flashcards using Claude
        List<ClaudeService.FlashcardData> flashcardData = claudeService.generateFlashcards(content);
        
        if (flashcardData.isEmpty()) {
            throw new RuntimeException("Failed to generate flashcards from the content.");
        }

        // Create deck
        Deck deck = new Deck(user, deckName, description);
        deck = deckRepository.save(deck);

        // Create cards
        for (ClaudeService.FlashcardData data : flashcardData) {
            Card card = new Card(deck, data.getQuestion(), data.getAnswer(), Card.Difficulty.MEDIUM);
            cardRepository.save(card);
        }

        return deckRepository.findById(deck.getId()).orElse(deck);
    }

    public Deck createDeckFromText(User user, String deckName, String description, String content) {
        if (content.trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be empty.");
        }

        // Generate flashcards using Claude
        List<ClaudeService.FlashcardData> flashcardData = claudeService.generateFlashcards(content);
        
        if (flashcardData.isEmpty()) {
            throw new RuntimeException("Failed to generate flashcards from the content.");
        }

        // Create deck
        Deck deck = new Deck(user, deckName, description);
        deck = deckRepository.save(deck);

        // Create cards
        for (ClaudeService.FlashcardData data : flashcardData) {
            Card card = new Card(deck, data.getQuestion(), data.getAnswer(), Card.Difficulty.MEDIUM);
            cardRepository.save(card);
        }

        return deckRepository.findById(deck.getId()).orElse(deck);
    }

    public List<Deck> getUserDecks(Long userId) {
        return deckRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Deck getDeck(Long deckId, Long userId) {
        Deck deck = deckRepository.findById(deckId)
            .orElseThrow(() -> new RuntimeException("Deck not found"));
        
        if (!deck.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        
        return deck;
    }

    public void deleteDeck(Long deckId, Long userId) {
        Deck deck = getDeck(deckId, userId); // This checks ownership
        deckRepository.delete(deck);
    }

    public List<DeckStatsDto> getUserDeckStats(Long userId) {
        List<Deck> decks = deckRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<DeckStatsDto> deckStats = new ArrayList<>();

        for (Deck deck : decks) {
            int cardCount = deck.getCards() != null ? deck.getCards().size() : 0;
            
            // Calculate mastery score based on recent study sessions
            double masteryScore = 0.0;
            LocalDateTime lastStudied = null;
            
            if (cardCount > 0) {
                List<StudySession> recentSessions = studySessionRepository.findRecentSessionsForDeck(deck.getId(), userId);
                
                if (!recentSessions.isEmpty()) {
                    // Calculate average score from recent sessions (last 10 sessions per card)
                    double totalScore = recentSessions.stream()
                        .mapToDouble(StudySession::getScore)
                        .average()
                        .orElse(0.0);
                    
                    masteryScore = Math.round(totalScore * 100.0);
                    
                    // Get the most recent study date
                    lastStudied = recentSessions.stream()
                        .map(StudySession::getStudiedAt)
                        .max(LocalDateTime::compareTo)
                        .orElse(null);
                }
            }

            DeckStatsDto statsDto = new DeckStatsDto(
                deck.getId(),
                deck.getName(),
                deck.getDescription(),
                cardCount,
                masteryScore,
                lastStudied,
                deck.getCreatedAt()
            );
            
            deckStats.add(statsDto);
        }

        return deckStats;
    }
}